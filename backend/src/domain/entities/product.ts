import { Money } from '../value-objects/money';

/**
 * Propiedades necesarias para construir un {@link Product}.
 */
export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de dominio que representa un producto del catálogo.
 *
 * Encapsula la regla de disponibilidad (solo los productos activos pueden
 * comprarse) y el cálculo del subtotal en función de la cantidad, evitando que
 * esa lógica se disperse por la capa de aplicación.
 */
export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: Money;
  readonly imageUrl: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.imageUrl = props.imageUrl;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Indica si el producto puede adquirirse.
   *
   * @returns `true` solo si el producto está activo.
   */
  isAvailableForPurchase(): boolean {
    return this.isActive;
  }

  /**
   * Calcula el subtotal del producto para una cantidad dada.
   *
   * @param quantity - Número de unidades (entero no negativo).
   * @returns El precio unitario multiplicado por la cantidad.
   */
  priceFor(quantity: number): Money {
    return this.price.multiply(quantity);
  }
}
