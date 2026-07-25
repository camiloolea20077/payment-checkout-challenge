/**
 * Vista de lectura de un cliente para exponer al exterior.
 */
export interface CustomerView {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}
