import { useCallback, useEffect } from "react";
import { errorMessage } from "../../shared/utils/error-message";
import { useCheckoutRepository } from "../providers/repository-context";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  transactionFailed,
  transactionResolved,
  transactionStarted,
} from "../store/slices/transaction-slice";

/**
 * Obtiene el estado de una transacción por id.
 *
 * Reutiliza la transacción del store si ya corresponde al id; en caso contrario
 * (p. ej. al recargar o abrir el enlace del resultado directamente) la consulta
 * al backend. Expone `reload` para reintentar si la consulta falla.
 *
 * @param transactionId - Id de la transacción (desde la URL).
 */
export function useTransactionStatus(transactionId: string | undefined) {
  const repository = useCheckoutRepository();
  const dispatch = useAppDispatch();
  const current = useAppSelector((state) => state.transaction.current);
  const status = useAppSelector((state) => state.transaction.status);
  const error = useAppSelector((state) => state.transaction.error);

  const alreadyLoaded = current !== null && current.id === transactionId;

  const load = useCallback(async () => {
    if (transactionId === undefined) {
      return;
    }
    dispatch(transactionStarted());
    try {
      const transaction = await repository.getTransaction(transactionId);
      dispatch(transactionResolved(transaction));
    } catch (caught) {
      dispatch(transactionFailed(errorMessage(caught)));
    }
  }, [transactionId, repository, dispatch]);

  useEffect(() => {
    if (!alreadyLoaded) {
      void load();
    }
  }, [alreadyLoaded, load]);

  return {
    transaction: alreadyLoaded ? current : null,
    status,
    error,
    reload: load,
  };
}
