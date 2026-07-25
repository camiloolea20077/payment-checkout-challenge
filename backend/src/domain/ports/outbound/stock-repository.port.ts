import { Stock } from '../../entities/stock';

/**
 * Token de inyección para el repositorio de stock.
 */
export const STOCK_REPOSITORY = Symbol('StockRepositoryPort');

/**
 * Puerto de salida para la persistencia del inventario.
 *
 * La actualización usa bloqueo optimista basado en `version`: la implementación
 * debe rechazar el guardado si la versión en base de datos cambió, evitando
 * descuentos concurrentes (doble descuento).
 */
export interface StockRepositoryPort {
  /**
   * Obtiene el stock de un producto.
   *
   * @returns El stock, o `null` si no existe.
   */
  findByProductId(productId: string): Promise<Stock | null>;

  /**
   * Obtiene el stock de varios productos en una sola consulta.
   *
   * Evita el problema N+1 al listar el catálogo con sus unidades disponibles.
   *
   * @param productIds - Identificadores de producto a consultar.
   * @returns Los registros de stock encontrados (puede omitir los inexistentes).
   */
  findByProductIds(productIds: string[]): Promise<Stock[]>;

  /**
   * Persiste el nuevo estado del stock aplicando bloqueo optimista.
   *
   * @param stock - Stock con la versión esperada y las unidades actualizadas.
   * @returns El stock persistido.
   */
  update(stock: Stock): Promise<Stock>;
}
