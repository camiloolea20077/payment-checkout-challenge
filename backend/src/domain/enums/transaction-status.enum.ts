/**
 * Estados posibles de una transacción de pago.
 *
 * El ciclo de vida arranca en `PENDING` y avanza a un estado terminal según el
 * resultado del cobro. Solo `APPROVED` habilita el descuento de stock.
 */
export enum TransactionStatus {
  /** Transacción creada localmente, aún sin resultado del cobro. */
  Pending = 'PENDING',
  /** El cobro fue aprobado por la pasarela. */
  Approved = 'APPROVED',
  /** El cobro fue rechazado por la pasarela. */
  Declined = 'DECLINED',
  /** Ocurrió un error controlado (p. ej. timeout o fallo de red). */
  Error = 'ERROR',
  /** La transacción fue anulada. */
  Voided = 'VOIDED',
}
