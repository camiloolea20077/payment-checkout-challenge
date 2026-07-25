/**
 * Configuración de la aplicación leída desde las variables `VITE_*`.
 *
 * Solo variables con prefijo `VITE_` quedan expuestas al navegador; nunca se
 * incluyen llaves privadas ni secretos de la pasarela.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
  currency: import.meta.env.VITE_CURRENCY,
} as const;
