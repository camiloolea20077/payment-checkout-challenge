import type { CheckoutInput } from "../../application/dto/checkout-input";
import type { Product, ProductStock } from "../entities/product";
import type { Transaction } from "../entities/transaction";

/**
 * Puerto de salida para todas las operaciones del checkout contra el backend.
 *
 * La capa de presentación (hooks/casos de uso) depende de esta abstracción, no
 * de Axios (DIP). La implementación concreta vive en `infrastructure/http`.
 */
export interface CheckoutRepositoryPort {
  /** Lista los productos activos del catálogo. */
  getProducts(): Promise<Product[]>;

  /** Obtiene un producto por id. */
  getProduct(productId: string): Promise<Product>;

  /** Obtiene el stock actualizado de un producto. */
  getProductStock(productId: string): Promise<ProductStock>;

  /**
   * Ejecuta el checkout completo (cliente + entrega + transacción + pago).
   *
   * @param input - Datos del checkout.
   * @param idempotencyKey - Clave para evitar cobros duplicados ante reintentos.
   */
  checkout(input: CheckoutInput, idempotencyKey: string): Promise<Transaction>;

  /** Consulta una transacción por id. */
  getTransaction(transactionId: string): Promise<Transaction>;
}
