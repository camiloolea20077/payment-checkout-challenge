import { useCallback, useEffect, useState } from "react";
import type { Product } from "../../domain/entities/product";
import { errorMessage } from "../../shared/utils/error-message";
import { useCheckoutRepository } from "../providers/repository-context";

type DetailStatus = "idle" | "loading" | "ready" | "error";

/**
 * Carga el detalle de un producto desde el backend (`GET /products/:id`).
 *
 * El estado es local y no va al store: solo lo consume el diálogo de detalle,
 * y el catálogo ya vive en `product`. Al cerrarse y reabrirse vuelve a pedirlo,
 * de modo que el stock mostrado esté siempre fresco.
 *
 * @param productId - Id del producto, o `null` si el diálogo está cerrado.
 * @returns El producto, el estado de la consulta, el error y `reload`.
 */
export function useProductDetail(productId: string | null) {
  const repository = useCheckoutRepository();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<DetailStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (productId === null) {
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const fetched = await repository.getProduct(productId);
      setProduct(fetched);
      setStatus("ready");
    } catch (caught) {
      setError(errorMessage(caught));
      setStatus("error");
    }
  }, [productId, repository]);

  useEffect(() => {
    if (productId === null) {
      setProduct(null);
      setStatus("idle");
      setError(null);
      return;
    }
    void load();
  }, [productId, load]);

  return { product, status, error, reload: load };
}
