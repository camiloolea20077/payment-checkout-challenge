import { Alert } from "./alert";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * Estado de error con mensaje comprensible y acción de reintento.
 */
export function ErrorState({
  title = "Algo salió mal",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <Alert tone="danger" title={title}>
        {message}
      </Alert>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
