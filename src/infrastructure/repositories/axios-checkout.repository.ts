import axios from "axios";
import type { CheckoutInput } from "../../application/dto/checkout-input";
import type { Product, ProductStock } from "../../domain/entities/product";
import type { Transaction } from "../../domain/entities/transaction";
import {
  NetworkError,
  ProductNotFoundError,
  UnexpectedError,
} from "../../domain/errors/checkout-errors";
import type { CheckoutRepositoryPort } from "../../domain/ports/checkout-repository.port";
import { httpClient } from "../http/http-client";

/** Forma de las respuestas del backend que consumimos. */
interface ProductResponse {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  imageUrl: string;
  availableUnits: number;
}

interface TransactionResponse {
  id: string;
  reference: string;
  status: Transaction["status"];
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalAmountInCents: number;
  currency: string;
  failureReason: string | null;
}

const toProduct = (data: ProductResponse): Product => ({
  id: data.id,
  name: data.name,
  description: data.description,
  priceInCents: data.priceInCents,
  currency: data.currency,
  imageUrl: data.imageUrl,
  availableUnits: data.availableUnits,
});

const toTransaction = (data: TransactionResponse): Transaction => ({
  id: data.id,
  reference: data.reference,
  status: data.status,
  quantity: data.quantity,
  productAmountInCents: data.productAmountInCents,
  baseFeeInCents: data.baseFeeInCents,
  deliveryFeeInCents: data.deliveryFeeInCents,
  totalAmountInCents: data.totalAmountInCents,
  currency: data.currency,
  failureReason: data.failureReason,
});

/**
 * Traduce un error de Axios a un error de dominio comprensible.
 *
 * Nunca propaga la respuesta cruda ni el stack: distingue fallo de red (sin
 * respuesta), recurso inexistente (404) y el resto como error inesperado.
 */
function mapError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    if (error.response === undefined) {
      return new NetworkError();
    }
    if (error.response.status === 404) {
      return new ProductNotFoundError();
    }
  }
  return new UnexpectedError();
}

/**
 * Implementación con Axios del puerto {@link CheckoutRepositoryPort}.
 */
export class AxiosCheckoutRepository implements CheckoutRepositoryPort {
  async getProducts(): Promise<Product[]> {
    try {
      const { data } = await httpClient.get<ProductResponse[]>("/products");
      return data.map(toProduct);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getProduct(productId: string): Promise<Product> {
    try {
      const { data } = await httpClient.get<ProductResponse>(
        `/products/${productId}`,
      );
      return toProduct(data);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getProductStock(productId: string): Promise<ProductStock> {
    try {
      const { data } = await httpClient.get<ProductStock>(
        `/products/${productId}/stock`,
      );
      return data;
    } catch (error) {
      throw mapError(error);
    }
  }

  async checkout(
    input: CheckoutInput,
    idempotencyKey: string,
  ): Promise<Transaction> {
    try {
      const { data } = await httpClient.post<TransactionResponse>(
        "/checkout",
        input,
        { headers: { "Idempotency-Key": idempotencyKey } },
      );
      return toTransaction(data);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const { data } = await httpClient.get<TransactionResponse>(
        `/transactions/${transactionId}`,
      );
      return toTransaction(data);
    } catch (error) {
      throw mapError(error);
    }
  }
}
