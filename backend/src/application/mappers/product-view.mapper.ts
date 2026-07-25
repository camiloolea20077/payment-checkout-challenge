import { Product } from '../../domain/entities/product';
import { Stock } from '../../domain/entities/stock';
import { ProductView } from '../dto/product-view';

/**
 * Construye vistas de lectura de producto a partir de entidades de dominio.
 */
export class ProductViewMapper {
  /**
   * Combina un producto con su stock para producir la vista pública.
   *
   * @param product - Entidad de dominio del producto.
   * @param stock - Stock asociado, o `null` si no existe (se reporta 0).
   * @returns La vista de lectura con las unidades disponibles.
   */
  static toView(product: Product, stock: Stock | null): ProductView {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.price.amountInCents,
      currency: product.price.currency,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      availableUnits: stock?.availableUnits ?? 0,
    };
  }
}
