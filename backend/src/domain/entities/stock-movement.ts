import { MovementType } from '../enums/movement-type.enum';

/**
 * Propiedades necesarias para construir un {@link StockMovement}.
 */
export interface StockMovementProps {
  id: string;
  productId: string;
  transactionId: string | null;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  createdAt: Date;
}

/**
 * Entidad de dominio que registra un cambio de inventario para trazabilidad.
 *
 * Es un registro inmutable (append-only): guarda el stock previo y el nuevo, la
 * cantidad y el motivo, de modo que el historial permita auditar cada variación.
 */
export class StockMovement {
  readonly id: string;
  readonly productId: string;
  readonly transactionId: string | null;
  readonly movementType: MovementType;
  readonly quantity: number;
  readonly previousStock: number;
  readonly newStock: number;
  readonly createdAt: Date;

  constructor(props: StockMovementProps) {
    this.id = props.id;
    this.productId = props.productId;
    this.transactionId = props.transactionId;
    this.movementType = props.movementType;
    this.quantity = props.quantity;
    this.previousStock = props.previousStock;
    this.newStock = props.newStock;
    this.createdAt = props.createdAt;
  }
}
