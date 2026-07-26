/**
 * Token de inyección para la pasarela de pagos.
 */
export const PAYMENT_GATEWAY = Symbol('PaymentGatewayPort');

/**
 * Datos de tarjeta necesarios para procesar un pago.
 *
 * Son transitorios: se usan para tokenizar y NUNCA se persisten ni se registran
 * en logs (no se guarda número completo ni CVV).
 */
export interface CardPaymentData {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
  installments: number;
}

/**
 * Orden de cobro que la aplicación envía a la pasarela.
 */
export interface ChargeCommand {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  card: CardPaymentData;
}

/**
 * Estado del cobro reportado por la pasarela, normalizado al dominio.
 */
export type GatewayPaymentStatus =
  'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';

/**
 * Resultado del cobro devuelto por la pasarela.
 */
export interface PaymentResult {
  providerTransactionId: string;
  status: GatewayPaymentStatus;
  providerStatus: string;
  failureReason: string | null;
}

/**
 * Puerto de salida para procesar pagos con una pasarela externa.
 *
 * La aplicación depende de esta abstracción; la implementación concreta (la pasarela)
 * vive en infraestructura y puede sustituirse o mockearse en pruebas (OCP/DIP).
 */
export interface PaymentGatewayPort {
  /**
   * Procesa un cobro con tarjeta y devuelve su resultado.
   *
   * @param command - Datos del cobro (referencia, monto, moneda, tarjeta).
   * @returns El resultado del cobro con el estado normalizado.
   * @throws PaymentGatewayError ante fallos técnicos (red, timeout, respuesta
   *         inesperada); nunca debe interpretarse como aprobación.
   */
  charge(command: ChargeCommand): Promise<PaymentResult>;
}
