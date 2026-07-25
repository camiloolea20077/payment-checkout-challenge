import { Product } from '../../entities/product';

/**
 * Token de inyección para resolver la implementación del repositorio de
 * productos sin acoplar el dominio/aplicación a la infraestructura (DIP).
 */
export const PRODUCT_REPOSITORY = Symbol('ProductRepositoryPort');

/**
 * Puerto de salida para la persistencia de productos.
 *
 * La capa de aplicación depende de esta abstracción; la infraestructura provee
 * la implementación concreta (Prisma). Así se puede sustituir el motor de
 * persistencia sin tocar los casos de uso.
 */
export interface ProductRepositoryPort {
  /**
   * Busca un producto por su identificador.
   *
   * @returns El producto, o `null` si no existe.
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Lista los productos activos disponibles para el catálogo público.
   */
  findAllActive(): Promise<Product[]>;
}
