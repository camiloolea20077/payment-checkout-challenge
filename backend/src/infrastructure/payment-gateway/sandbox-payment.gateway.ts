import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayError } from '../../domain/errors/payment-gateway.error';
import {
  ChargeCommand,
  GatewayPaymentStatus,
  PaymentGatewayPort,
  PaymentResult,
} from '../../domain/ports/outbound/payment-gateway.port';
import { buildIntegritySignature } from '../../shared/utils/integrity-signature';
import { EnvironmentVariables } from '../configuration/environment.config';

/** Estados terminales: ya no cambian, no hace falta seguir consultando. */
const TERMINAL_STATUSES: ReadonlySet<string> = new Set([
  'APPROVED',
  'DECLINED',
  'VOIDED',
  'ERROR',
]);

const MAX_POLL_ATTEMPTS = 5;
const POLL_DELAY_MS = 1500;

/** Forma mínima de las respuestas de la pasarela que consumimos. */
interface GatewayAcceptanceResponse {
  data: { presigned_acceptance: { acceptance_token: string } };
}
interface GatewayTokenResponse {
  data: { id: string };
}
interface GatewayTransactionResponse {
  data: { id: string; status: string; status_message?: string | null };
}

/**
 * Implementación del puerto {@link PaymentGatewayPort} contra la API Sandbox de
 * la pasarela.
 *
 * Orquesta el flujo de la pasarela: token de aceptación, tokenización de la tarjeta,
 * firma de integridad, creación de la transacción y consulta del resultado.
 * Nunca registra datos sensibles de tarjeta en logs.
 */
@Injectable()
export class SandboxPaymentGateway implements PaymentGatewayPort {
  private readonly logger = new Logger(SandboxPaymentGateway.name);
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.apiUrl = config.get('PAYMENT_API_URL', { infer: true });
    this.publicKey = config.get('PAYMENT_PUBLIC_KEY', { infer: true });
    this.privateKey = config.get('PAYMENT_PRIVATE_KEY', { infer: true });
    this.integritySecret = config.get('PAYMENT_INTEGRITY_SECRET', {
      infer: true,
    });
  }

  async charge(command: ChargeCommand): Promise<PaymentResult> {
    try {
      const acceptanceToken = await this.fetchAcceptanceToken();
      const cardToken = await this.tokenizeCard(command);
      const signature = this.buildSignature(command);

      const created = await this.createTransaction(
        command,
        acceptanceToken,
        cardToken,
        signature,
      );
      const finalStatus = await this.pollUntilTerminal(created.data.id);

      return this.toResult(finalStatus);
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      // No se filtra el detalle de la tarjeta ni la excepción cruda al cliente.
      this.logger.error('Fallo al procesar el pago con la pasarela.');
      throw new PaymentGatewayError(
        'No fue posible comunicarse con la pasarela de pagos.',
      );
    }
  }

  /** Obtiene el token de aceptación requerido para crear la transacción. */
  private async fetchAcceptanceToken(): Promise<string> {
    const response = await firstValueFrom(
      this.http.get<GatewayAcceptanceResponse>(
        `${this.apiUrl}/merchants/${this.publicKey}`,
      ),
    );
    return response.data.data.presigned_acceptance.acceptance_token;
  }

  /** Tokeniza la tarjeta con la llave pública; el token es de un solo uso. */
  private async tokenizeCard(command: ChargeCommand): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<GatewayTokenResponse>(
        `${this.apiUrl}/tokens/cards`,
        {
          number: command.card.number,
          cvc: command.card.cvc,
          exp_month: command.card.expMonth,
          exp_year: command.card.expYear,
          card_holder: command.card.cardHolder,
        },
        { headers: { Authorization: `Bearer ${this.publicKey}` } },
      ),
    );
    return response.data.data.id;
  }

  /**
   * Firma de integridad SHA-256 exigida por la pasarela:
   * `SHA256(reference + amount_in_cents + currency + integritySecret)`.
   */
  private buildSignature(command: ChargeCommand): string {
    return buildIntegritySignature(
      command.reference,
      command.amountInCents,
      command.currency,
      this.integritySecret,
    );
  }

  /** Crea la transacción en la pasarela con la llave privada. */
  private async createTransaction(
    command: ChargeCommand,
    acceptanceToken: string,
    cardToken: string,
    signature: string,
  ): Promise<GatewayTransactionResponse> {
    const response = await firstValueFrom(
      this.http.post<GatewayTransactionResponse>(
        `${this.apiUrl}/transactions`,
        {
          amount_in_cents: command.amountInCents,
          currency: command.currency,
          customer_email: command.customerEmail,
          reference: command.reference,
          acceptance_token: acceptanceToken,
          signature,
          payment_method: {
            type: 'CARD',
            installments: command.card.installments,
            token: cardToken,
          },
        },
        { headers: { Authorization: `Bearer ${this.privateKey}` } },
      ),
    );
    return response.data;
  }

  /**
   * Consulta el estado de la transacción hasta que sea terminal o se agoten los
   * intentos, para no dejar el resultado como `PENDING` innecesariamente.
   */
  private async pollUntilTerminal(
    transactionId: string,
  ): Promise<GatewayTransactionResponse['data']> {
    let last: GatewayTransactionResponse['data'] | null = null;

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      const response = await firstValueFrom(
        this.http.get<GatewayTransactionResponse>(
          `${this.apiUrl}/transactions/${transactionId}`,
        ),
      );
      last = response.data.data;
      if (TERMINAL_STATUSES.has(last.status)) {
        return last;
      }
      await this.delay(POLL_DELAY_MS);
    }

    return last as GatewayTransactionResponse['data'];
  }

  /** Normaliza la respuesta de la pasarela al resultado del dominio. */
  private toResult(data: GatewayTransactionResponse['data']): PaymentResult {
    const status: GatewayPaymentStatus = TERMINAL_STATUSES.has(data.status)
      ? (data.status as GatewayPaymentStatus)
      : 'PENDING';

    return {
      providerTransactionId: data.id,
      status,
      providerStatus: data.status,
      failureReason:
        status === 'APPROVED' ? null : (data.status_message ?? null),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
