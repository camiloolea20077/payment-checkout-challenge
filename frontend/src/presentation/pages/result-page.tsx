import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import type { TransactionStatus } from '../../domain/enums/transaction-status';
import { CHECKOUT_STEPS } from '../../shared/constants/checkout-steps';
import { Button } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Divider } from '../../shared/ui/divider';
import { ErrorState } from '../../shared/ui/error-state';
import { Spinner } from '../../shared/ui/spinner';
import { Stepper } from '../../shared/ui/stepper';
import { AmountBreakdown } from '../components/checkout/amount-breakdown';
import { OrderItem } from '../components/checkout/order-item';
import { useSelectedProduct } from '../hooks/use-selected-product';
import { useTransactionStatus } from '../hooks/use-transaction-status';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetCheckout } from '../store/slices/checkout-slice';
import { clearCard } from '../store/slices/payment-slice';
import { clearTransaction } from '../store/slices/transaction-slice';

interface StatusView {
  circle: string;
  icon: string;
  title: string;
  message: string;
}

const STATUS_VIEW: Record<TransactionStatus, StatusView> = {
  APPROVED: {
    circle: 'bg-emerald-100 text-emerald-700',
    icon: '✓',
    title: '¡Pago aprobado!',
    message: 'Tu compra se realizó con éxito. Recibirás la confirmación pronto.',
  },
  DECLINED: {
    circle: 'bg-red-100 text-red-700',
    icon: '✕',
    title: 'Pago rechazado',
    message: 'Tu pago no pudo ser procesado. No se realizó ningún cobro.',
  },
  ERROR: {
    circle: 'bg-red-100 text-red-700',
    icon: '!',
    title: 'Ocurrió un error',
    message: 'Hubo un problema al procesar el pago. Intenta de nuevo.',
  },
  VOIDED: {
    circle: 'bg-amber-100 text-amber-700',
    icon: '!',
    title: 'Pago anulado',
    message: 'La transacción fue anulada.',
  },
  PENDING: {
    circle: 'bg-amber-100 text-amber-700',
    icon: '…',
    title: 'Pago en proceso',
    message: 'Tu pago está siendo procesado.',
  },
};

/**
 * Página de resultado (paso 4): muestra el desenlace del pago con el detalle
 * completo de lo comprado, y permite volver a la tienda (con el stock
 * actualizado) o reintentar.
 */
export function ResultPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { transaction, status, error, reload } =
    useTransactionStatus(transactionId);
  const product = useSelectedProduct();
  const delivery = useAppSelector((state) => state.checkout.delivery);

  // La tarjeta ya cumplió su función: se limpia de memoria al llegar al
  // resultado (no antes, para no interferir con la navegación del pago).
  useEffect(() => {
    dispatch(clearCard());
  }, [dispatch]);

  if (transactionId === undefined) {
    return <Navigate to="/product" replace />;
  }

  const backToStore = () => {
    dispatch(resetCheckout());
    dispatch(clearTransaction());
    navigate('/product');
  };

  if (status === 'loading' && transaction === null) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (transaction === null) {
    return (
      <ErrorState
        message={error ?? 'No se pudo obtener el estado de la transacción.'}
        onRetry={reload}
      />
    );
  }

  const view = STATUS_VIEW[transaction.status];
  const isApproved = transaction.status === 'APPROVED';
  const itemLabel = product
    ? `${product.name} × ${transaction.quantity}`
    : `Subtotal (${transaction.quantity})`;

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <Stepper steps={[...CHECKOUT_STEPS]} current={3} />

      <Card className="p-6 text-center sm:p-8">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold ${view.circle}`}
          aria-hidden
        >
          {view.icon}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{view.title}</h1>
        <p className="mt-1 text-slate-600">{view.message}</p>
        {transaction.failureReason && !isApproved && (
          <p className="mt-2 text-sm text-red-600">{transaction.failureReason}</p>
        )}
      </Card>

      <Card className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Detalle de la compra
          </h2>
          <span className="text-xs text-slate-500">{transaction.reference}</span>
        </div>

        {product && (
          <>
            <OrderItem
              name={product.name}
              imageUrl={product.imageUrl}
              quantity={transaction.quantity}
              priceInCents={product.priceInCents}
              currency={product.currency}
            />
            <Divider />
          </>
        )}

        <AmountBreakdown
          itemLabel={itemLabel}
          productAmountInCents={transaction.productAmountInCents}
          baseFeeInCents={transaction.baseFeeInCents}
          deliveryFeeInCents={transaction.deliveryFeeInCents}
          totalAmountInCents={transaction.totalAmountInCents}
          currency={transaction.currency}
        />

        {delivery && (
          <>
            <Divider />
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">Entrega:</span>{' '}
              {delivery.address}, {delivery.city}, {delivery.department}
            </div>
          </>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <Button fullWidth onClick={backToStore}>
          Volver a la tienda
        </Button>
        {!isApproved && (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/checkout/payment')}
          >
            Intentar de nuevo
          </Button>
        )}
      </div>
    </section>
  );
}
