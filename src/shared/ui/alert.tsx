import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

const TONES: Record<AlertTone, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
};

/**
 * Mensaje contextual (info/éxito/advertencia/error). Usa `role="alert"` para
 * los tonos de error/advertencia, de modo que sea anunciado por lectores de
 * pantalla.
 */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const assertive = tone === 'danger' || tone === 'warning';
  return (
    <div
      role={assertive ? 'alert' : 'status'}
      className={cn('rounded-lg border p-4 text-sm', TONES[tone], className)}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={cn(title && 'mt-1')}>{children}</div>}
    </div>
  );
}
