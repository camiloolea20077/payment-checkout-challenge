/**
 * Vista de lectura del inventario de un producto.
 */
export interface StockView {
  productId: string;
  availableUnits: number;
  reservedUnits: number;
}
