import { Inject, Injectable } from '@nestjs/common';
import { StockMovement } from '../../domain/entities/stock-movement';
import { Transaction } from '../../domain/entities/transaction';
import { MovementType } from '../../domain/enums/movement-type.enum';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from '../../domain/ports/outbound/delivery-repository.port';
import {
  ID_GENERATOR,
  type IdGeneratorPort,
} from '../../domain/ports/outbound/id-generator.port';
import {
  STOCK_MOVEMENT_REPOSITORY,
  type StockMovementRepositoryPort,
} from '../../domain/ports/outbound/stock-movement-repository.port';
import {
  STOCK_REPOSITORY,
  type StockRepositoryPort,
} from '../../domain/ports/outbound/stock-repository.port';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../domain/ports/outbound/transaction-repository.port';
import {
  UNIT_OF_WORK,
  type UnitOfWorkPort,
} from '../../domain/ports/outbound/unit-of-work.port';

/**
 * Servicio de aplicación que confirma una venta aprobada de forma atómica.
 *
 * Ejecuta dentro de una única transacción de base de datos (unidad de trabajo)
 * todas las operaciones que deben ocurrir juntas cuando un pago se aprueba:
 * 1. Revalida el stock (pudo cambiar entre la creación y la aprobación).
 * 2. Descuenta el stock con bloqueo optimista (nunca queda negativo).
 * 3. Registra el movimiento de inventario para trazabilidad.
 * 4. Asigna la entrega al cliente.
 * 5. Marca la transacción como `APPROVED`.
 *
 * Si algo falla, la transacción de base de datos se revierte por completo, de
 * modo que no hay descuentos parciales ni doble descuento.
 */
@Injectable()
export class ConfirmSaleService {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: StockMovementRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(ID_GENERATOR)
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  /**
   * Confirma la venta de una transacción recién aprobada.
   *
   * @param transaction - Transacción en estado `PENDING` a aprobar.
   * @param providerTransactionId - Id del cobro en la pasarela.
   * @param providerStatus - Estado reportado por la pasarela.
   * @returns La transacción persistida en estado `APPROVED`.
   * @throws InsufficientStockError si al aprobar ya no hay stock suficiente
   *         (la transacción de base de datos se revierte).
   */
  async confirm(
    transaction: Transaction,
    providerTransactionId: string,
    providerStatus: string,
  ): Promise<Transaction> {
    return this.unitOfWork.runInTransaction(async () => {
      const stock = await this.stockRepository.findByProductId(
        transaction.productId,
      );
      if (stock === null || !stock.canFulfill(transaction.quantity)) {
        throw new InsufficientStockError(
          transaction.quantity,
          stock?.availableUnits ?? 0,
        );
      }

      const updatedStock = stock.decrease(transaction.quantity);
      await this.stockRepository.update(updatedStock);

      await this.stockMovementRepository.create(
        new StockMovement({
          id: this.idGenerator.generate(),
          productId: transaction.productId,
          transactionId: transaction.id,
          movementType: MovementType.Sale,
          quantity: transaction.quantity,
          previousStock: stock.availableUnits,
          newStock: updatedStock.availableUnits,
          createdAt: new Date(),
        }),
      );

      const delivery = await this.deliveryRepository.findById(
        transaction.deliveryId,
      );
      if (delivery !== null) {
        await this.deliveryRepository.update(delivery.assign());
      }

      const approved = transaction.approve(
        providerTransactionId,
        providerStatus,
      );
      return this.transactionRepository.update(approved);
    });
  }
}
