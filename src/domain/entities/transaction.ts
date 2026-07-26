import type { TransactionStatus } from "../enums/transaction-status";

/**
 * Transacción tal como la consume la interfaz, con el desglose de importes
 * para el resumen y la pantalla de resultado. No incluye datos de tarjeta.
 */
export interface Transaction {
  id: string;
  reference: string;
  status: TransactionStatus;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalAmountInCents: number;
  currency: string;
  failureReason: string | null;
}
