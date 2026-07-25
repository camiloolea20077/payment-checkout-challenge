/**
 * Estados posibles de una entrega.
 *
 * Arranca en `PENDING` y solo pasa a `ASSIGNED` cuando su transacción asociada
 * queda aprobada, momento en que el producto se asigna al cliente.
 */
export enum DeliveryStatus {
  /** Entrega creada, aún sin asignar (pago no aprobado). */
  Pending = 'PENDING',
  /** Producto asignado al cliente tras un pago aprobado. */
  Assigned = 'ASSIGNED',
  /** Entrega en curso. */
  InProgress = 'IN_PROGRESS',
  /** Entrega completada. */
  Delivered = 'DELIVERED',
  /** Entrega cancelada. */
  Cancelled = 'CANCELLED',
}
