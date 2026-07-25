/**
 * Vista de lectura de una entrega. Los valores monetarios van en centavos.
 */
export interface DeliveryView {
  id: string;
  customerId: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
  deliveryFeeInCents: number;
  currency: string;
  status: string;
}
