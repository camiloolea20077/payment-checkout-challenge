/**
 * Datos del cliente capturados en el formulario de entrega.
 */
export interface CustomerInput {
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

/**
 * Datos de la dirección de entrega. Todos los campos son obligatorios: el
 * backend los exige para poder registrar la entrega.
 */
export interface DeliveryInput {
  address: string;
  city: string;
  department: string;
  postalCode: string;
}

/**
 * Datos de tarjeta. Son transitorios: se envían al backend para el cobro y
 * NUNCA se persisten (ni en Redux persistido ni en localStorage).
 */
export interface CardInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
  installments: number;
}

/**
 * Cuerpo del checkout que se envía al backend.
 */
export interface CheckoutInput {
  customer: CustomerInput;
  delivery: DeliveryInput;
  productId: string;
  quantity: number;
  card: CardInput;
}
