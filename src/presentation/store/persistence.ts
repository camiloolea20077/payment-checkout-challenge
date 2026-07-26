import type { CheckoutState } from "./slices/checkout-slice";

const STORAGE_KEY = "checkout-progress";

/**
 * Persistencia del progreso del checkout en `localStorage`.
 *
 * Solo se guarda el slice `checkout`, que contiene datos **no sensibles**
 * (paso, producto, cantidad, cliente, entrega, id de transacción). La tarjeta
 * vive en el slice `payment`, que nunca pasa por aquí.
 */
export function loadCheckoutState(): CheckoutState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return undefined;
    }
    return JSON.parse(raw) as CheckoutState;
  } catch {
    return undefined;
  }
}

/**
 * Guarda el progreso no sensible del checkout.
 */
export function saveCheckoutState(state: CheckoutState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignorar errores de almacenamiento (p. ej. modo privado sin cuota).
  }
}
