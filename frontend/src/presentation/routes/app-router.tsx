import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/root-layout';

// Carga diferida por ruta (code-splitting): cada página se descarga solo cuando
// se necesita, reduciendo el tamaño del bundle inicial.
const ProductPage = lazy(() =>
  import('../pages/product-page').then((m) => ({ default: m.ProductPage })),
);
const PaymentAndDeliveryPage = lazy(() =>
  import('../pages/payment-and-delivery-page').then((m) => ({
    default: m.PaymentAndDeliveryPage,
  })),
);
const SummaryPage = lazy(() =>
  import('../pages/summary-page').then((m) => ({ default: m.SummaryPage })),
);
const ResultPage = lazy(() =>
  import('../pages/result-page').then((m) => ({ default: m.ResultPage })),
);

/**
 * Definición de rutas del flujo de checkout.
 *
 * `/` redirige a `/product`; el resultado se identifica por `:transactionId`
 * para poder recargar o compartir esa vista.
 */
export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/product" replace /> },
      { path: 'product', element: <ProductPage /> },
      { path: 'checkout/payment', element: <PaymentAndDeliveryPage /> },
      { path: 'checkout/summary', element: <SummaryPage /> },
      { path: 'checkout/result/:transactionId', element: <ResultPage /> },
      { path: '*', element: <Navigate to="/product" replace /> },
    ],
  },
]);
