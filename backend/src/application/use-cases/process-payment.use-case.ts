import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error';
import { DomainError } from '../../domain/errors/domain-error';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { PaymentGatewayError } from '../../domain/errors/payment-gateway.error';
import { TransactionNotFoundError } from '../../domain/errors/transaction-not-found.error';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../../domain/ports/outbound/customer-repository.port';
import {
  CardPaymentData,
  PAYMENT_GATEWAY,
  type PaymentGatewayPort,
  type PaymentResult,
} from '../../domain/ports/outbound/payment-gateway.port';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../domain/ports/outbound/transaction-repository.port';
import { Result, err, ok } from '../../shared/types/result';
import { TransactionView } from '../dto/transaction-view';
import { TransactionViewMapper } from '../mappers/transaction-view.mapper';
import { ConfirmSaleService } from '../services/confirm-sale.service';

/**
 * Datos de entrada para procesar el pago de una transacción.
 */
export interface ProcessPaymentInput {
  transactionId: string;
  card: CardPaymentData;
}

/**
 * Caso de uso: procesar el pago de una transacción pendiente.
 *
 * Coordina el cobro con la pasarela y actualiza el estado local según el
 * resultado, respetando reglas críticas:
 * - Solo procesa transacciones en `PENDING` (idempotencia: si ya tiene un
 *   resultado, lo devuelve sin volver a cobrar → evita doble cobro).
 * - Un fallo técnico de la pasarela deja la transacción en `ERROR`, nunca la
 *   aprueba.
 * - Si se aprueba, delega en {@link ConfirmSaleService} el descuento de stock,
 *   el movimiento de inventario y la asignación de la entrega, todo dentro de
 *   una única transacción de base de datos.
 */
@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly confirmSale: ConfirmSaleService,
  ) {}

  /**
   * @returns La vista de la transacción con su estado final (APPROVED /
   *          DECLINED / ERROR), o un error de negocio (no encontrada).
   */
  async execute(
    input: ProcessPaymentInput,
  ): Promise<Result<TransactionView, DomainError>> {
    const transaction = await this.transactionRepository.findById(
      input.transactionId,
    );
    if (transaction === null) {
      return err(new TransactionNotFoundError(input.transactionId));
    }

    // Idempotencia: si ya no está pendiente, no se vuelve a cobrar.
    if (!transaction.isPending()) {
      return ok(TransactionViewMapper.toView(transaction));
    }

    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );
    if (customer === null) {
      return err(new CustomerNotFoundError(transaction.customerId));
    }

    const resolved = await this.resolvePayment(
      transaction,
      customer.email,
      input.card,
    );
    return ok(TransactionViewMapper.toView(resolved));
  }

  /**
   * Cobra en la pasarela y persiste el desenlace, garantizando que un fallo
   * técnico nunca aprueba y que la aprobación es atómica con el inventario.
   */
  private async resolvePayment(
    transaction: Transaction,
    customerEmail: string,
    card: CardPaymentData,
  ): Promise<Transaction> {
    let result: PaymentResult;
    try {
      result = await this.paymentGateway.charge({
        reference: transaction.reference,
        amountInCents: transaction.totalAmount.amountInCents,
        currency: transaction.currency,
        customerEmail,
        card,
      });
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        return this.transactionRepository.update(
          transaction.markError(error.message),
        );
      }
      throw error;
    }

    switch (result.status) {
      case 'APPROVED':
        return this.confirmApproved(
          transaction,
          result.providerTransactionId,
          result.providerStatus,
        );
      case 'DECLINED':
        return this.transactionRepository.update(
          transaction.decline(
            result.providerStatus,
            result.failureReason ?? 'Pago rechazado por la pasarela.',
          ),
        );
      case 'VOIDED':
      case 'ERROR':
        return this.transactionRepository.update(
          transaction.markError(
            result.failureReason ?? 'La pasarela reportó un error.',
            result.providerStatus,
          ),
        );
      default:
        // PENDING: sin resultado terminal; se conserva el estado actual.
        return transaction;
    }
  }

  /**
   * Confirma la venta de forma atómica. Si al aprobar ya no hay stock, marca la
   * transacción como `ERROR` y no toca el inventario (la transacción de base de
   * datos se revierte).
   */
  private async confirmApproved(
    transaction: Transaction,
    providerTransactionId: string,
    providerStatus: string,
  ): Promise<Transaction> {
    try {
      return await this.confirmSale.confirm(
        transaction,
        providerTransactionId,
        providerStatus,
      );
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        return this.transactionRepository.update(
          transaction.markError(
            'Stock agotado tras la aprobación del pago.',
            providerStatus,
          ),
        );
      }
      throw error;
    }
  }
}
