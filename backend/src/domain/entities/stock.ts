import { InsufficientStockError } from '../errors/insufficient-stock.error';
import { InvalidQuantityError } from '../errors/invalid-quantity.error';

/**
 * Propiedades necesarias para construir un {@link Stock}.
 */
export interface StockProps {
  id: string;
  productId: string;
  availableUnits: number;
  reservedUnits: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de dominio que representa el inventario de un producto.
 *
 * Concentra las invariantes de stock: la cantidad debe ser válida, no se puede
 * descontar más de lo disponible y el stock nunca queda negativo. El campo
 * `version` soporta el bloqueo optimista que aplica la infraestructura para
 * evitar descuentos concurrentes (doble descuento).
 *
 * Las operaciones son inmutables: devuelven un nuevo `Stock` en lugar de mutar
 * el actual, lo que facilita el razonamiento y las pruebas.
 */
export class Stock {
  readonly id: string;
  readonly productId: string;
  readonly availableUnits: number;
  readonly reservedUnits: number;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: StockProps) {
    this.id = props.id;
    this.productId = props.productId;
    this.availableUnits = props.availableUnits;
    this.reservedUnits = props.reservedUnits;
    this.version = props.version;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Indica si hay unidades suficientes para cubrir una cantidad.
   *
   * @param quantity - Unidades solicitadas.
   * @returns `true` si `availableUnits >= quantity`.
   */
  canFulfill(quantity: number): boolean {
    return this.availableUnits >= quantity;
  }

  /**
   * Descuenta unidades del stock disponible tras una venta aprobada.
   *
   * @param quantity - Unidades a descontar (entero >= 1).
   * @returns Un nuevo `Stock` con las unidades descontadas y la versión
   *          incrementada.
   * @throws InvalidQuantityError si la cantidad no es un entero >= 1.
   * @throws InsufficientStockError si no hay unidades suficientes.
   */
  decrease(quantity: number): Stock {
    this.assertValidQuantity(quantity);
    if (!this.canFulfill(quantity)) {
      throw new InsufficientStockError(quantity, this.availableUnits);
    }
    return new Stock({
      ...this.toProps(),
      availableUnits: this.availableUnits - quantity,
      version: this.version + 1,
      updatedAt: new Date(),
    });
  }

  /**
   * Incrementa las unidades disponibles (reposición o reverso de una venta).
   *
   * @param quantity - Unidades a agregar (entero >= 1).
   * @returns Un nuevo `Stock` con las unidades sumadas y la versión incrementada.
   * @throws InvalidQuantityError si la cantidad no es un entero >= 1.
   */
  increase(quantity: number): Stock {
    this.assertValidQuantity(quantity);
    return new Stock({
      ...this.toProps(),
      availableUnits: this.availableUnits + quantity,
      version: this.version + 1,
      updatedAt: new Date(),
    });
  }

  private assertValidQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new InvalidQuantityError();
    }
  }

  private toProps(): StockProps {
    return {
      id: this.id,
      productId: this.productId,
      availableUnits: this.availableUnits,
      reservedUnits: this.reservedUnits,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
