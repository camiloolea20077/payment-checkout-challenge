/**
 * Error base del dominio del checkout en el frontend.
 *
 * Permite distinguir errores esperados (de negocio o red) para mostrar mensajes
 * comprensibles al usuario, sin exponer stack traces ni respuestas crudas.
 */
export abstract class CheckoutError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Fallo de red o servidor no disponible. */
export class NetworkError extends CheckoutError {
  readonly code = "NETWORK_ERROR";
  constructor(message = "No pudimos conectarnos. Revisa tu conexión.") {
    super(message);
  }
}

/** El producto solicitado no existe. */
export class ProductNotFoundError extends CheckoutError {
  readonly code = "PRODUCT_NOT_FOUND";
  constructor(message = "El producto no está disponible.") {
    super(message);
  }
}

/** No hay unidades suficientes para la cantidad solicitada. */
export class InsufficientStockError extends CheckoutError {
  readonly code = "INSUFFICIENT_STOCK";
  constructor(message = "No hay stock suficiente para esa cantidad.") {
    super(message);
  }
}

/** El pago fue rechazado por la pasarela. */
export class PaymentDeclinedError extends CheckoutError {
  readonly code = "PAYMENT_DECLINED";
  constructor(message = "El pago fue rechazado.") {
    super(message);
  }
}

/** Error no previsto. */
export class UnexpectedError extends CheckoutError {
  readonly code = "UNEXPECTED_ERROR";
  constructor(message = "Ocurrió un error inesperado. Intenta de nuevo.") {
    super(message);
  }
}
