import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { CheckoutInput } from "../../application/dto/checkout-input";
import { errorMessage } from "../../shared/utils/error-message";
import { useCheckoutRepository } from "../providers/repository-context";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setStep, setTransactionId } from "../store/slices/checkout-slice";
import { clearCard } from "../store/slices/payment-slice";
import {
  transactionFailed,
  transactionResolved,
  transactionStarted,
} from "../store/slices/transaction-slice";
import { setProcessingPayment } from "../store/slices/ui-slice";

/**
 * Orquesta el pago desde el resumen.
 *
 * Genera una `Idempotency-Key` estable por montaje y bloquea reenvíos mientras
 * procesa, de modo que el doble clic no genere doble cobro. Tras el resultado,
 * limpia la tarjeta de memoria y navega a la pantalla de resultado.
 *
 * @returns `pay` para disparar el cobro, `isProcessing` y el `error`.
 */
export function useCheckout() {
  const repository = useCheckoutRepository();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isProcessing = useAppSelector((state) => state.ui.isProcessingPayment);
  const error = useAppSelector((state) => state.transaction.error);
  const { productId, quantity, customer, delivery } = useAppSelector(
    (state) => state.checkout,
  );
  const card = useAppSelector((state) => state.payment.card);

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const pay = useCallback(async () => {
    if (isProcessing) {
      return;
    }
    if (!productId || !customer || !delivery || !card) {
      return;
    }

    dispatch(setProcessingPayment(true));
    dispatch(transactionStarted());
    try {
      const input: CheckoutInput = {
        customer,
        delivery,
        productId,
        quantity,
        card,
      };
      const transaction = await repository.checkout(
        input,
        idempotencyKeyRef.current,
      );
      dispatch(transactionResolved(transaction));
      dispatch(setTransactionId(transaction.id));
      dispatch(clearCard());
      dispatch(setStep(4));
      navigate(`/checkout/result/${transaction.id}`);
    } catch (caught) {
      dispatch(transactionFailed(errorMessage(caught)));
    } finally {
      dispatch(setProcessingPayment(false));
    }
  }, [
    isProcessing,
    productId,
    quantity,
    customer,
    delivery,
    card,
    repository,
    dispatch,
    navigate,
  ]);

  return { pay, isProcessing, error };
}
