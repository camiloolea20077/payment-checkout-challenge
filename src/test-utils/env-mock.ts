/** Doble del módulo de configuración para las pruebas (sin `import.meta`). */
export const env = {
  apiBaseUrl: 'http://localhost:3000/api/v1',
  appName: 'Payment Checkout',
  currency: 'COP',
  baseFeeInCents: 5000,
  deliveryFeeInCents: 10000,
} as const;
