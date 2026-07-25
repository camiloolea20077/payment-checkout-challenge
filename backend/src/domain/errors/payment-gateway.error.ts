import { DomainError } from './domain-error';

/**
 * Se lanza ante un fallo técnico al comunicarse con la pasarela de pagos
 * (error de red, timeout o respuesta inesperada).
 *
 * Regla crítica: un error de este tipo NUNCA implica que el pago fue aprobado;
 * la transacción debe quedar en estado `ERROR` y el stock intacto.
 */
export class PaymentGatewayError extends DomainError {
  readonly code = 'PAYMENT_GATEWAY_ERROR';

  constructor(message: string) {
    super(message);
  }
}
