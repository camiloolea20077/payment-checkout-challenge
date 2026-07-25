import { Delivery } from '../../entities/delivery';

/**
 * Token de inyección para el repositorio de entregas.
 */
export const DELIVERY_REPOSITORY = Symbol('DeliveryRepositoryPort');

/**
 * Puerto de salida para la persistencia de entregas.
 */
export interface DeliveryRepositoryPort {
  /**
   * Persiste una entrega nueva.
   */
  create(delivery: Delivery): Promise<Delivery>;

  /**
   * Busca una entrega por su identificador.
   *
   * @returns La entrega, o `null` si no existe.
   */
  findById(id: string): Promise<Delivery | null>;

  /**
   * Actualiza el estado de una entrega (p. ej. al asignarla).
   */
  update(delivery: Delivery): Promise<Delivery>;
}
