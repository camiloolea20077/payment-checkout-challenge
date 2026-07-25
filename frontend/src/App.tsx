import { RouterProvider } from "react-router-dom";
import { appRouter } from "./presentation/routes/app-router";

/**
 * Componente raíz: monta el enrutador del flujo de checkout.
 */
function App() {
  return <RouterProvider router={appRouter} />;
}

export default App;
