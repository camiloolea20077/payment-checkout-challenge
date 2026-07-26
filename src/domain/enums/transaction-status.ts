/**
 * Estados posibles de una transacción, alineados con el backend.
 */
export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "ERROR"
  | "VOIDED";
