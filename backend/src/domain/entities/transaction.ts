import { TransactionStatus } from '../enums/transaction-status.enum';
import { InvalidQuantityError } from '../errors/invalid-quantity.error';
import { InvalidTransactionStateError } from '../errors/invalid-transaction-state.error';
import { Money } from '../value-objects/money';

/**
 * Propiedades necesarias para reconstruir una {@link Transaction} existente
 * (p. ej. al mapear desde la base de datos).
 */
export interface TransactionProps {
  id: string;
  reference: string;
  customerId: string;
  productId: string;
  deliveryId: string;
  quantity: number;
  productAmount: Money;
  baseFee: Money;
  deliveryFee: Money;
  totalAmount: Money;
  currency: string;
  status: TransactionStatus;
  providerTransactionId: string | null;
  providerStatus: string | null;
  failureReason: string | null;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parámetros para crear una transacción nueva en estado `PENDING`.
 */
export interface CreatePendingParams {
  id: string;
  reference: string;
  customerId: string;
  productId: string;
  deliveryId: string;
  quantity: number;
  productAmount: Money;
  baseFee: Money;
  deliveryFee: Money;
  idempotencyKey: string;
  createdAt?: Date;
}

/**
 * Entidad de dominio (agregado) que representa una transacción de pago.
 *
 * Es la pieza central del flujo de checkout y concentra dos responsabilidades
 * de negocio críticas:
 * 1. Recalcular el total en el dominio (producto + tarifa base + envío), para
 *    que el frontend nunca defina el valor final.
 * 2. Custodiar el ciclo de vida del estado con transiciones válidas, evitando
 *    efectos como aprobar dos veces o descontar stock sin aprobación.
 *
 * Es inmutable: cada transición devuelve una nueva instancia.
 */
export class Transaction {
  readonly id: string;
  readonly reference: string;
  readonly customerId: string;
  readonly productId: string;
  readonly deliveryId: string;
  readonly quantity: number;
  readonly productAmount: Money;
  readonly baseFee: Money;
  readonly deliveryFee: Money;
  readonly totalAmount: Money;
  readonly currency: string;
  readonly status: TransactionStatus;
  readonly providerTransactionId: string | null;
  readonly providerStatus: string | null;
  readonly failureReason: string | null;
  readonly idempotencyKey: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.reference = props.reference;
    this.customerId = props.customerId;
    this.productId = props.productId;
    this.deliveryId = props.deliveryId;
    this.quantity = props.quantity;
    this.productAmount = props.productAmount;
    this.baseFee = props.baseFee;
    this.deliveryFee = props.deliveryFee;
    this.totalAmount = props.totalAmount;
    this.currency = props.currency;
    this.status = props.status;
    this.providerTransactionId = props.providerTransactionId;
    this.providerStatus = props.providerStatus;
    this.failureReason = props.failureReason;
    this.idempotencyKey = props.idempotencyKey;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Crea una transacción nueva en estado `PENDING`, recalculando el total.
   *
   * El total se computa en el dominio como
   * `productAmount + baseFee + deliveryFee`, garantizando que el importe
   * cobrado no dependa de datos enviados por el cliente.
   *
   * @throws InvalidQuantityError si la cantidad no es un entero >= 1.
   * @throws InvalidMoneyError si las monedas de los importes no coinciden.
   */
  static createPending(params: CreatePendingParams): Transaction {
    if (!Number.isInteger(params.quantity) || params.quantity < 1) {
      throw new InvalidQuantityError();
    }

    const totalAmount = params.productAmount
      .add(params.baseFee)
      .add(params.deliveryFee);
    const now = params.createdAt ?? new Date();

    return new Transaction({
      id: params.id,
      reference: params.reference,
      customerId: params.customerId,
      productId: params.productId,
      deliveryId: params.deliveryId,
      quantity: params.quantity,
      productAmount: params.productAmount,
      baseFee: params.baseFee,
      deliveryFee: params.deliveryFee,
      totalAmount,
      currency: params.productAmount.currency,
      status: TransactionStatus.Pending,
      providerTransactionId: null,
      providerStatus: null,
      failureReason: null,
      idempotencyKey: params.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Indica si la transacción sigue pendiente de resultado. */
  isPending(): boolean {
    return this.status === TransactionStatus.Pending;
  }

  /** Indica si la transacción fue aprobada. */
  isApproved(): boolean {
    return this.status === TransactionStatus.Approved;
  }

  /**
   * Marca la transacción como aprobada tras un cobro exitoso.
   *
   * @param providerTransactionId - Id de la transacción en la pasarela.
   * @param providerStatus - Estado reportado por la pasarela.
   * @returns Una nueva `Transaction` en estado `APPROVED`.
   * @throws InvalidTransactionStateError si no está en `PENDING`.
   */
  approve(providerTransactionId: string, providerStatus: string): Transaction {
    this.assertPending(TransactionStatus.Approved);
    return this.copyWith({
      status: TransactionStatus.Approved,
      providerTransactionId,
      providerStatus,
      failureReason: null,
    });
  }

  /**
   * Marca la transacción como rechazada; no modifica el inventario.
   *
   * @throws InvalidTransactionStateError si no está en `PENDING`.
   */
  decline(providerStatus: string, failureReason: string): Transaction {
    this.assertPending(TransactionStatus.Declined);
    return this.copyWith({
      status: TransactionStatus.Declined,
      providerStatus,
      failureReason,
    });
  }

  /**
   * Marca la transacción con un error controlado (p. ej. timeout o fallo de
   * red). Un error nunca implica aprobación ni descuento de stock.
   *
   * @throws InvalidTransactionStateError si no está en `PENDING`.
   */
  markError(
    failureReason: string,
    providerStatus: string | null = null,
  ): Transaction {
    this.assertPending(TransactionStatus.Error);
    return this.copyWith({
      status: TransactionStatus.Error,
      providerStatus,
      failureReason,
    });
  }

  private assertPending(target: TransactionStatus): void {
    if (!this.isPending()) {
      throw new InvalidTransactionStateError(this.status, target);
    }
  }

  private copyWith(changes: Partial<TransactionProps>): Transaction {
    return new Transaction({
      id: this.id,
      reference: this.reference,
      customerId: this.customerId,
      productId: this.productId,
      deliveryId: this.deliveryId,
      quantity: this.quantity,
      productAmount: this.productAmount,
      baseFee: this.baseFee,
      deliveryFee: this.deliveryFee,
      totalAmount: this.totalAmount,
      currency: this.currency,
      status: this.status,
      providerTransactionId: this.providerTransactionId,
      providerStatus: this.providerStatus,
      failureReason: this.failureReason,
      idempotencyKey: this.idempotencyKey,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      ...changes,
    });
  }
}
