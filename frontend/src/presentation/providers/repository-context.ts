import { createContext, useContext } from "react";
import type { CheckoutRepositoryPort } from "../../domain/ports/checkout-repository.port";
import { checkoutRepository } from "../../infrastructure/repositories/checkout-repository";

/**
 * Contexto que provee el repositorio de checkout. Por defecto usa la
 * implementación con Axios; las pruebas inyectan un doble.
 */
export const RepositoryContext =
  createContext<CheckoutRepositoryPort>(checkoutRepository);

/**
 * Hook para obtener el repositorio de checkout desde el contexto (DIP: la
 * presentación depende del puerto, no de Axios).
 */
export function useCheckoutRepository(): CheckoutRepositoryPort {
  return useContext(RepositoryContext);
}
