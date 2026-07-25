/**
 * Tipos de movimiento de inventario registrados para trazabilidad.
 *
 * Cada cambio en el stock deja un registro inmutable que permite auditar por
 * qué varió la cantidad disponible de un producto.
 */
export enum MovementType {
  /** Salida de stock por una venta aprobada. */
  Sale = 'SALE',
  /** Entrada de stock por reposición. */
  Restock = 'RESTOCK',
  /** Ajuste manual de inventario. */
  Adjustment = 'ADJUSTMENT',
}
