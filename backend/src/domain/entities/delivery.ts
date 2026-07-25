import { DeliveryStatus } from '../enums/delivery-status.enum';
import { Money } from '../value-objects/money';

/**
 * Propiedades necesarias para construir una {@link Delivery}.
 */
export interface DeliveryProps {
  id: string;
  customerId: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
  deliveryFee: Money;
  status: DeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de dominio que representa la entrega asociada a una compra.
 *
 * Modela la transición a `ASSIGNED`, que ocurre únicamente cuando el pago de su
 * transacción queda aprobado y el producto se asigna al cliente.
 */
export class Delivery {
  readonly id: string;
  readonly customerId: string;
  readonly address: string;
  readonly city: string;
  readonly department: string;
  readonly postalCode: string;
  readonly deliveryFee: Money;
  readonly status: DeliveryStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: DeliveryProps) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.address = props.address;
    this.city = props.city;
    this.department = props.department;
    this.postalCode = props.postalCode;
    this.deliveryFee = props.deliveryFee;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Marca la entrega como asignada tras un pago aprobado.
   *
   * Es idempotente respecto al resultado: si ya está asignada, devuelve una
   * entrega equivalente sin alterar la transición.
   *
   * @returns Una nueva `Delivery` en estado `ASSIGNED`.
   */
  assign(): Delivery {
    return new Delivery({
      ...this.toProps(),
      status: DeliveryStatus.Assigned,
      updatedAt: new Date(),
    });
  }

  private toProps(): DeliveryProps {
    return {
      id: this.id,
      customerId: this.customerId,
      address: this.address,
      city: this.city,
      department: this.department,
      postalCode: this.postalCode,
      deliveryFee: this.deliveryFee,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
