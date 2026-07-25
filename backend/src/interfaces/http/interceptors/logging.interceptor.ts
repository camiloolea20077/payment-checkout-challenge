import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor que registra cada petición HTTP con su método, ruta y duración.
 *
 * Deliberadamente NO registra el cuerpo, los headers ni los query params para
 * evitar que datos sensibles (información de tarjeta, secretos, PII) terminen
 * en los logs. Su único propósito es trazabilidad y observabilidad.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  /**
   * Envuelve la ejecución del handler para medir su tiempo de respuesta.
   *
   * @param context - Contexto de ejecución de la petición actual.
   * @param next - Manejador que continúa la cadena de la petición.
   * @returns Un `Observable` que emite la respuesta del handler.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsedMs = Date.now() - startedAt;
        this.logger.log(`${method} ${url} - ${elapsedMs}ms`);
      }),
    );
  }
}
