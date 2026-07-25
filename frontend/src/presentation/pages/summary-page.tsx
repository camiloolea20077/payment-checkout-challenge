import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { env } from "../../infrastructure/configuration/env";
import { CHECKOUT_STEPS } from "../../shared/constants/checkout-steps";
import { Alert } from "../../shared/ui/alert";
import { Backdrop } from "../../shared/ui/backdrop";
import { Button } from "../../shared/ui/button";
import { Card } from "../../shared/ui/card";
import { Spinner } from "../../shared/ui/spinner";
import { Stepper } from "../../shared/ui/stepper";
import { maskCardNumber } from "../../shared/utils/card";
import { PaymentSummary } from "../components/checkout/payment-summary";
import { useCheckout } from "../hooks/use-checkout";
import { useCheckoutRepository } from "../providers/repository-context";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { productSelected } from "../store/slices/product-slice";

/**
 * Página de resumen (paso 3): muestra el desglose, la entrega y la tarjeta
 * enmascarada, y dispara el pago con bloqueo de doble cobro.
 */
export function SummaryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const repository = useCheckoutRepository();

  const { productId, quantity, delivery } = useAppSelector(
    (state) => state.checkout,
  );
  const product = useAppSelector((state) => state.product.selected);
  const card = useAppSelector((state) => state.payment.card);
  const { pay, isProcessing, error } = useCheckout();

  // Tras recargar, el producto seleccionado no está en memoria: se recupera.
  useEffect(() => {
    if (productId !== null && (product === null || product.id !== productId)) {
      void repository
        .getProduct(productId)
        .then((fetched) => dispatch(productSelected(fetched)))
        .catch(() => undefined);
    }
  }, [productId, product, repository, dispatch]);

  // Guardas de flujo.
  if (productId === null) {
    return <Navigate to="/product" replace />;
  }
  // La tarjeta no se persiste: si falta (p. ej. tras recargar), se re-captura.
  if (card === null || delivery === null) {
    return <Navigate to="/checkout/payment" replace />;
  }
  if (product === null) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl">
      <Stepper steps={[...CHECKOUT_STEPS]} current={2} />

      <div className="mt-6 space-y-6">
        <Card className="space-y-4 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Resumen</h2>
          <PaymentSummary
            productName={product.name}
            quantity={quantity}
            priceInCents={product.priceInCents}
            baseFeeInCents={env.baseFeeInCents}
            deliveryFeeInCents={env.deliveryFeeInCents}
            currency={product.currency}
          />
        </Card>

        <Card className="space-y-2 p-4 text-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Entrega</h2>
          <p className="text-slate-600">
            {delivery.address}, {delivery.city}, {delivery.department}
          </p>
          <p className="text-slate-600">
            Método de pago:{" "}
            <span className="font-medium text-slate-900">
              {maskCardNumber(card.number)}
            </span>
          </p>
        </Card>

        {error && (
          <Alert tone="danger" title="No se pudo procesar el pago">
            {error}
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            disabled={isProcessing}
            onClick={() => navigate("/checkout/payment")}
          >
            Volver
          </Button>
          <Button type="button" onClick={pay} isLoading={isProcessing}>
            Pagar ahora
          </Button>
        </div>
      </div>

      {isProcessing && <Backdrop message="Procesando tu pago…" />}
    </section>
  );
}
