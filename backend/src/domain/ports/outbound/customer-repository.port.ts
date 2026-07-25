import { Customer } from '../../entities/customer';

/**
 * Token de inyección para el repositorio de clientes.
 */
export const CUSTOMER_REPOSITORY = Symbol('CustomerRepositoryPort');

/**
 * Puerto de salida para la persistencia de clientes.
 */
export interface CustomerRepositoryPort {
  /**
   * Persiste un cliente nuevo.
   */
  create(customer: Customer): Promise<Customer>;

  /**
   * Busca un cliente por su identificador.
   *
   * @returns El cliente, o `null` si no existe.
   */
  findById(id: string): Promise<Customer | null>;

  /**
   * Busca un cliente por su correo, para reutilizarlo en lugar de duplicarlo.
   *
   * @returns El cliente, o `null` si no existe.
   */
  findByEmail(email: string): Promise<Customer | null>;
}
