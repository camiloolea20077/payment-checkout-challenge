import { Transaction } from '../../entities/transaction';

/**
 * Token de inyección para el repositorio de transacciones.
 */
export const TRANSACTION_REPOSITORY = Symbol('TransactionRepositoryPort');

/**
 * Puerto de salida para la persistencia de transacciones.
 *
 * Incluye búsquedas por `reference` e `idempotencyKey` para soportar la
 * idempotencia del checkout: una misma solicitud no debe generar dos cobros.
 */
export interface TransactionRepositoryPort {
  /**
   * Persiste una transacción nueva (normalmente en estado `PENDING`).
   */
  create(transaction: Transaction): Promise<Transaction>;

  /**
   * Actualiza una transacción existente (p. ej. tras el resultado del cobro).
   */
  update(transaction: Transaction): Promise<Transaction>;

  /**
   * Busca una transacción por su identificador.
   *
   * @returns La transacción, o `null` si no existe.
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Busca una transacción por su referencia única de negocio.
   *
   * @returns La transacción, o `null` si no existe.
   */
  findByReference(reference: string): Promise<Transaction | null>;

  /**
   * Busca una transacción por su clave de idempotencia.
   *
   * @returns La transacción previa asociada a esa clave, o `null` si es la
   *          primera vez que se recibe.
   */
  findByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null>;
}
