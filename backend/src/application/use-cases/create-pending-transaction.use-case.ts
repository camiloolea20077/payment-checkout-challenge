import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error';
import { DeliveryNotFoundError } from '../../domain/errors/delivery-not-found.error';
import { DomainError } from '../../domain/errors/domain-error';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { ProductInactiveError } from '../../domain/errors/product-inactive.error';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../../domain/ports/outbound/customer-repository.port';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from '../../domain/ports/outbound/delivery-repository.port';
import {
  ID_GENERATOR,
  type IdGeneratorPort,
} from '../../domain/ports/outbound/id-generator.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../../domain/ports/outbound/product-repository.port';
import {
  STOCK_REPOSITORY,
  type StockRepositoryPort,
} from '../../domain/ports/outbound/stock-repository.port';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../domain/ports/outbound/transaction-repository.port';
import { ConfigService } from '@nestjs/config';
import { Money } from '../../domain/value-objects/money';
import { EnvironmentVariables } from '../../infrastructure/configuration/environment.config';
import { Result, err, ok } from '../../shared/types/result';
import { TransactionView } from '../dto/transaction-view';
import { TransactionViewMapper } from '../mappers/transaction-view.mapper';

/**
 * Datos de entrada para crear una transacción pendiente.
 */
export interface CreatePendingTransactionInput {
  customerId: string;
  productId: string;
  deliveryId: string;
  quantity: number;
  /** Clave de idempotencia opcional (normalmente el header `Idempotency-Key`). */
  idempotencyKey?: string;
}

/**
 * Caso de uso: crear una transacción local en estado `PENDING`.
 *
 * Orquesta las validaciones del flujo de checkout de forma railway-oriented y
 * **recalcula el total en el backend** (producto + tarifa base + envío), de modo
 * que el cliente nunca fija el importe. No descuenta stock: eso solo ocurre si
 * el pago se aprueba (fase posterior).
 *
 * Es idempotente: si se repite la misma `idempotencyKey`, devuelve la
 * transacción ya creada en lugar de generar otra.
 */
@Injectable()
export class CreatePendingTransactionUseCase {
  private readonly currency: string;
  private readonly baseFeeInCents: number;

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(ID_GENERATOR)
    private readonly idGenerator: IdGeneratorPort,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.currency = config.get('CURRENCY', { infer: true });
    this.baseFeeInCents = config.get('BASE_FEE_IN_CENTS', { infer: true });
  }

  /**
   * Crea la transacción pendiente validando cliente, producto, entrega y stock.
   *
   * @returns La vista de la transacción creada (o la existente por
   *          idempotencia), o un `DomainError` de negocio.
   */
  async execute(
    input: CreatePendingTransactionInput,
  ): Promise<Result<TransactionView, DomainError>> {
    if (input.idempotencyKey !== undefined) {
      const existing = await this.transactionRepository.findByIdempotencyKey(
        input.idempotencyKey,
      );
      if (existing !== null) {
        return ok(TransactionViewMapper.toView(existing));
      }
    }

    const customer = await this.customerRepository.findById(input.customerId);
    if (customer === null) {
      return err(new CustomerNotFoundError(input.customerId));
    }

    const product = await this.productRepository.findById(input.productId);
    if (product === null) {
      return err(new ProductNotFoundError(input.productId));
    }
    if (!product.isAvailableForPurchase()) {
      return err(new ProductInactiveError(input.productId));
    }

    const delivery = await this.deliveryRepository.findById(input.deliveryId);
    if (delivery === null) {
      return err(new DeliveryNotFoundError(input.deliveryId));
    }

    const stock = await this.stockRepository.findByProductId(input.productId);
    const availableUnits = stock?.availableUnits ?? 0;
    if (!stock || !stock.canFulfill(input.quantity)) {
      return err(new InsufficientStockError(input.quantity, availableUnits));
    }

    const transaction = Transaction.createPending({
      id: this.idGenerator.generate(),
      reference: `TXN-${this.idGenerator.generate()}`,
      customerId: customer.id,
      productId: product.id,
      deliveryId: delivery.id,
      quantity: input.quantity,
      productAmount: product.priceFor(input.quantity),
      baseFee: Money.fromCents(this.baseFeeInCents, this.currency),
      deliveryFee: delivery.deliveryFee,
      idempotencyKey: input.idempotencyKey ?? this.idGenerator.generate(),
    });

    const created = await this.transactionRepository.create(transaction);
    return ok(TransactionViewMapper.toView(created));
  }
}
