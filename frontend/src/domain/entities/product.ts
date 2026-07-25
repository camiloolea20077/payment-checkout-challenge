/**
 * Producto del catálogo tal como lo consume la interfaz.
 *
 * Los montos van en centavos; el formateo a moneda ocurre en presentación.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  imageUrl: string;
  availableUnits: number;
}

/**
 * Stock de un producto (para refrescar las unidades tras la compra).
 */
export interface ProductStock {
  productId: string;
  availableUnits: number;
  reservedUnits: number;
}
