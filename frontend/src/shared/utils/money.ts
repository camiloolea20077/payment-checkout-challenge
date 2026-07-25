/**
 * Formatea un monto en centavos a una cadena de moneda legible.
 *
 * Todo el dinero viaja en centavos (enteros) para evitar errores de redondeo;
 * aquí se divide entre 100 solo para presentación.
 *
 * @param amountInCents - Monto en centavos (entero).
 * @param currency - Código de moneda ISO (p. ej. `COP`).
 * @returns El monto formateado según la configuración regional de Colombia.
 */
export function formatMoney(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100);
}
