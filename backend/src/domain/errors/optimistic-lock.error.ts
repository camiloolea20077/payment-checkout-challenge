import { DomainError } from './domain-error';

/**
 * Se lanza cuando una actualización con bloqueo optimista falla porque otro
 * proceso modificó el registro primero (la versión esperada ya no coincide).
 *
 * Es clave para evitar el doble descuento de stock ante peticiones concurrentes.
 */
export class OptimisticLockError extends DomainError {
  readonly code = 'OPTIMISTIC_LOCK_CONFLICT';

  constructor(entity: string, id: string) {
    super(
      `Conflicto de concurrencia al actualizar ${entity} (${id}); vuelve a intentarlo.`,
    );
  }
}
