/** Marcas de tarjeta detectadas. */
export type CardBrand = "visa" | "mastercard" | "unknown";

/** Quita todo lo que no sea dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Detecta la marca a partir del prefijo del número.
 *
 * Visa empieza por 4; Mastercard por 51–55 o el rango 2221–2720.
 */
export function detectCardBrand(value: string): CardBrand {
  const digits = onlyDigits(value);
  if (/^4/.test(digits)) {
    return "visa";
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) {
    return "mastercard";
  }
  return "unknown";
}

/**
 * Valida el número con el algoritmo de Luhn.
 *
 * @returns `true` si la suma ponderada de dígitos es múltiplo de 10.
 */
export function luhnCheck(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length < 13) {
    return false;
  }
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Formatea el número en grupos de 4 (máximo 19 dígitos). */
export function formatCardNumber(value: string): string {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

/**
 * Verifica que la fecha de vencimiento (MM, YY) sea el mes actual o posterior.
 */
export function isValidExpiry(month: string, year: string): boolean {
  const mm = Number(month);
  const yy = Number(year);
  if (!Number.isInteger(mm) || mm < 1 || mm > 12 || year.length !== 2) {
    return false;
  }
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear) {
    return false;
  }
  return !(yy === currentYear && mm < currentMonth);
}

/** Enmascara el número dejando visibles solo los últimos 4 dígitos. */
export function maskCardNumber(value: string): string {
  const last4 = onlyDigits(value).slice(-4);
  return `•••• •••• •••• ${last4}`;
}
