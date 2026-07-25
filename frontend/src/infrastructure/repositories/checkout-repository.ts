import type { CheckoutRepositoryPort } from "../../domain/ports/checkout-repository.port";
import { AxiosCheckoutRepository } from "./axios-checkout.repository";

/**
 * Instancia única del repositorio de checkout usada en la aplicación real.
 * En pruebas se sustituye por un doble mediante el contexto de repositorio.
 */
export const checkoutRepository: CheckoutRepositoryPort =
  new AxiosCheckoutRepository();
