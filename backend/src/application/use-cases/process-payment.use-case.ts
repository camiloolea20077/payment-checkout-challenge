import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error';
import { DomainError } from '../../domain/errors/domain-error';
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
} from '../../domain/ports/outbound/payment-gateway.port';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../domain/ports/outbound/transaction-repository.port';
import { Result, err, ok } from '../../shared/types/result';
import { TransactionView } from '../dto/transaction-view';
import { TransactionViewMapper } from '../mappers/transaction-view.mapper';

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
 * - No descuenta stock (eso ocurre de forma transaccional al aprobarse, en la
 *   fase de inventario).
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

    const updated = await this.chargeAndResolve(
      transaction,
      customer.email,
      input.card,
    );
    const persisted = await this.transactionRepository.update(updated);
    return ok(TransactionViewMapper.toView(persisted));
  }

  /**
   * Cobra en la pasarela y aplica la transición de estado correspondiente.
   * Aísla el manejo de fallos técnicos para garantizar que nunca aprueban.
   */
  private async chargeAndResolve(
    transaction: Transaction,
    customerEmail: string,
    card: CardPaymentData,
  ): Promise<Transaction> {
    try {
      const result = await this.paymentGateway.charge({
        reference: transaction.reference,
        amountInCents: transaction.totalAmount.amountInCents,
        currency: transaction.currency,
        customerEmail,
        card,
      });

      switch (result.status) {
        case 'APPROVED':
          return transaction.approve(
            result.providerTransactionId,
            result.providerStatus,
          );
        case 'DECLINED':
          return transaction.decline(
            result.providerStatus,
            result.failureReason ?? 'Pago rechazado por la pasarela.',
          );
        case 'VOIDED':
        case 'ERROR':
          return transaction.markError(
            result.failureReason ?? 'La pasarela reportó un error.',
            result.providerStatus,
          );
        default:
          // PENDING: sin resultado terminal; se conserva el estado actual.
          return transaction;
      }
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        return transaction.markError(error.message);
      }
      throw error;
    }
  }
}
