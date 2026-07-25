import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/root-layout";
import { PaymentAndDeliveryPage } from "../pages/payment-and-delivery-page";
import { ProductPage } from "../pages/product-page";
import { ResultPage } from "../pages/result-page";
import { SummaryPage } from "../pages/summary-page";

/**
 * Definición de rutas del flujo de checkout.
 *
 * `/` redirige a `/product`; el resultado se identifica por `:transactionId`
 * para poder recargar o compartir esa vista.
 */
export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/product" replace /> },
      { path: "product", element: <ProductPage /> },
      { path: "checkout/payment", element: <PaymentAndDeliveryPage /> },
      { path: "checkout/summary", element: <SummaryPage /> },
      {
        path: "checkout/result/:transactionId",
        element: <ResultPage />,
      },
      { path: "*", element: <Navigate to="/product" replace /> },
    ],
  },
]);
