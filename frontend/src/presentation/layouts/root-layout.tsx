import { Outlet } from "react-router-dom";
import { env } from "../../infrastructure/configuration/env";

/**
 * Layout raíz: cabecera consistente y contenedor centrado y adaptativo para
 * todas las páginas del flujo.
 */
export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          <span
            className="inline-block h-6 w-6 rounded bg-blue-600"
            aria-hidden
          />
          <span className="text-lg font-semibold tracking-tight">
            {env.appName}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
