import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { env } from "../../infrastructure/configuration/env";
import { Spinner } from "../../shared/ui/spinner";

/**
 * Layout raíz: cabecera consistente y contenedor centrado y adaptativo para
 * todas las páginas del flujo. Incluye un enlace para saltar al contenido y un
 * `Suspense` para las páginas cargadas de forma diferida (code-splitting).
 */
export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="flex w-full items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          <span
            className="inline-block h-6 w-6 rounded bg-blue-600"
            aria-hidden
          />
          <span className="text-lg font-semibold tracking-tight">
            {env.appName}
          </span>
        </div>
      </header>

      <main id="main" className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
