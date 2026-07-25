/**
 * Vista de lectura de una transacción. Los valores monetarios van en centavos.
 *
 * No expone datos sensibles de pago (número de tarjeta, CVV): solo el estado y
 * el desglose de importes.
 */
export interface TransactionView {
  id: string;
  reference: string;
  customerId: string;
  productId: string;
  deliveryId: string;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalAmountInCents: number;
  currency: string;
  status: string;
  providerStatus: string | null;
  failureReason: string | null;
  createdAt: string;
}
