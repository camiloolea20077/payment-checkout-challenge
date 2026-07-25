import { useParams } from "react-router-dom";

/**
 * Página de resultado de la transacción (paso 4). Se implementa en la Fase 5.
 */
export function ResultPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight">Resultado</h1>
      <p className="mt-2 text-slate-600">Transacción: {transactionId}</p>
    </section>
  );
}
