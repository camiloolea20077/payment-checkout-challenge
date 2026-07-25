import { Injectable } from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain-error';
import { CardPaymentData } from '../../domain/ports/outbound/payment-gateway.port';
import { Result, ok } from '../../shared/types/result';
import { TransactionView } from '../dto/transaction-view';
import { CreateCustomerUseCase } from './create-customer.use-case';
import { CreateDeliveryUseCase } from './create-delivery.use-case';
import { CreatePendingTransactionUseCase } from './create-pending-transaction.use-case';
import { ProcessPaymentUseCase } from './process-payment.use-case';

/**
 * Datos de entrada del checkout completo.
 */
export interface CheckoutInput {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    documentType: string;
    documentNumber: string;
  };
  delivery: {
    address: string;
    city: string;
    department: string;
    postalCode: string;
  };
  productId: string;
  quantity: number;
  card: CardPaymentData;
  idempotencyKey?: string;
}

/**
 * Caso de uso orquestador del checkout de punta a punta.
 *
 * Compone los casos de uso existentes en el orden del flujo de negocio:
 * crea/reutiliza el cliente, crea la entrega, crea la transacción `PENDING`
 * (con total recalculado) y procesa el pago. Cada paso devuelve un `Result`;
 * si alguno falla, se corta el flujo (railway-oriented) sin continuar.
 *
 * Es idempotente: si la `idempotencyKey` corresponde a una transacción ya
 * procesada, se devuelve sin volver a cobrar.
 */
@Injectable()
export class CheckoutUseCase {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly createDelivery: CreateDeliveryUseCase,
    private readonly createPendingTransaction: CreatePendingTransactionUseCase,
    private readonly processPayment: ProcessPaymentUseCase,
  ) {}

  /**
   * Ejecuta el flujo completo de compra.
   *
   * @returns La transacción con su estado final, o el primer error de negocio.
   */
  async execute(
    input: CheckoutInput,
  ): Promise<Result<TransactionView, DomainError>> {
    const customer = await this.createCustomer.execute(input.customer);

    const deliveryResult = await this.createDelivery.execute({
      customerId: customer.id,
      ...input.delivery,
    });
    if (!deliveryResult.ok) {
      return deliveryResult;
    }

    const transactionResult = await this.createPendingTransaction.execute({
      customerId: customer.id,
      productId: input.productId,
      deliveryId: deliveryResult.value.id,
      quantity: input.quantity,
      idempotencyKey: input.idempotencyKey,
    });
    if (!transactionResult.ok) {
      return transactionResult;
    }

    // Idempotencia: una transacción ya resuelta no se vuelve a cobrar.
    if (transactionResult.value.status !== 'PENDING') {
      return ok(transactionResult.value);
    }

    return this.processPayment.execute({
      transactionId: transactionResult.value.id,
      card: input.card,
    });
  }
}
