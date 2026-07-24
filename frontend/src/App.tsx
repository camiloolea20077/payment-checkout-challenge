import './App.css'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Payment checkout
        </span>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Proyecto configurado
        </h1>

        <p className="mt-3 text-slate-600">
          React, TypeScript, Vite y Tailwind CSS están funcionando
          correctamente.
        </p>

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Comenzar
        </button>
      </section>
    </main>
  );
}

export default App;
