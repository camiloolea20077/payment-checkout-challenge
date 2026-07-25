/**
 * Error base de la capa de dominio.
 *
 * Todos los errores de negocio heredan de esta clase para poder distinguirlos
 * de errores técnicos (infraestructura, red) y mapearlos a códigos HTTP en la
 * capa de interfaces. El `code` es un identificador estable e independiente del
 * idioma del mensaje, pensado para ese mapeo.
 */
export abstract class DomainError extends Error {
  /** Identificador estable del tipo de error (p. ej. `PRODUCT_NOT_FOUND`). */
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    // Conserva el nombre real de la subclase en la traza de error.
    this.name = new.target.name;
  }
}
