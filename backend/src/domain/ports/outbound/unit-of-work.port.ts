/**
 * Token de inyección para la unidad de trabajo.
 */
export const UNIT_OF_WORK = Symbol('UnitOfWorkPort');

/**
 * Puerto de salida para ejecutar varias operaciones de persistencia de forma
 * atómica (todo o nada).
 *
 * Lo usa el flujo de aprobación para descontar stock, registrar el movimiento,
 * asignar la entrega y confirmar la transacción dentro de una sola transacción
 * de base de datos.
 */
export interface UnitOfWorkPort {
  /**
   * Ejecuta `work` dentro de una transacción; si algo falla, se revierte todo.
   *
   * @param work - Operaciones a ejecutar atómicamente.
   * @returns El resultado de `work`.
   */
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
