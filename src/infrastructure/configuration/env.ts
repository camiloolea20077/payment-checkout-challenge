/**
 * Configuración de la aplicación leída desde las variables `VITE_*`.
 *
 * Solo variables con prefijo `VITE_` quedan expuestas al navegador; nunca se
 * incluyen llaves privadas ni secretos de la pasarela.
 *
 * Las tarifas son solo para previsualizar el desglose en el resumen; el backend
 * recalcula el total de forma autoritativa al cobrar.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
  currency: import.meta.env.VITE_CURRENCY,
  baseFeeInCents: Number(import.meta.env.VITE_BASE_FEE_IN_CENTS),
  deliveryFeeInCents: Number(import.meta.env.VITE_DELIVERY_FEE_IN_CENTS),
} as const;
