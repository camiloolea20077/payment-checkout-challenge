/**
 * Token de inyección para el generador de identificadores.
 */
export const ID_GENERATOR = Symbol('IdGeneratorPort');

/**
 * Puerto de salida para generar identificadores únicos.
 *
 * Se abstrae para que los casos de uso no dependan de una implementación
 * concreta (crypto, uuid, etc.) y puedan probarse con un generador determinista.
 */
export interface IdGeneratorPort {
  /**
   * Genera un identificador único (UUID).
   */
  generate(): string;
}
