import { StockMovement } from '../../entities/stock-movement';

/**
 * Token de inyección para el repositorio de movimientos de inventario.
 */
export const STOCK_MOVEMENT_REPOSITORY = Symbol('StockMovementRepositoryPort');

/**
 * Puerto de salida para registrar movimientos de inventario.
 *
 * El historial es append-only: solo se crean registros, nunca se modifican.
 */
export interface StockMovementRepositoryPort {
  /**
   * Persiste un movimiento de inventario para trazabilidad.
   */
  create(movement: StockMovement): Promise<StockMovement>;
}
