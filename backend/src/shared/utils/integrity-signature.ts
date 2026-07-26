import { createHash } from 'node:crypto';

/**
 * Calcula la firma de integridad SHA-256 exigida por la pasarela de pagos.
 *
 * La firma es el hash hexadecimal de la concatenación, en este orden exacto:
 * `reference + amountInCents + currency + integritySecret`. El orden importa:
 * cualquier cambio produce una firma inválida y la pasarela rechaza el cobro.
 *
 * Es una función pura para poder probarla de forma determinista.
 *
 * @param reference - Referencia única de la transacción.
 * @param amountInCents - Monto total en centavos.
 * @param currency - Código de moneda (p. ej. `COP`).
 * @param integritySecret - Secreto de integridad del comercio (nunca se expone).
 * @returns La firma en hexadecimal (64 caracteres).
 */
export function buildIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string,
): string {
  const payload = `${reference}${amountInCents}${currency}${integritySecret}`;
  return createHash('sha256').update(payload).digest('hex');
}
