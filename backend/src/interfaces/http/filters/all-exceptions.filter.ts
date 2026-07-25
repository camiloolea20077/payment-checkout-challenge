import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Forma estable del cuerpo de error que expone la API.
 *
 * Mantener un contrato uniforme permite que el frontend maneje todos los
 * errores de la misma manera, sin depender del origen de la falla.
 */
interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
}

/**
 * Filtro que captura cualquier excepción no controlada y la traduce a una
 * respuesta HTTP con formato uniforme.
 *
 * Existe en la capa de interfaces porque su responsabilidad es exclusivamente
 * de transporte: no contiene lógica de negocio, solo adapta errores a HTTP.
 * Además evita filtrar detalles internos (stack traces, mensajes de infra)
 * hacia el cliente y registra el fallo en el log del servidor.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Procesa la excepción y escribe la respuesta de error.
   *
   * @param exception - Excepción capturada (HttpException o error inesperado).
   * @param host - Contexto de ejecución del que se obtiene req/res.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.resolveMessage(exception, status);

    // Se registra método, ruta y estado; nunca el cuerpo de la petición para
    // no exponer datos sensibles (p. ej. información de tarjeta) en los logs.
    this.logger.error(
      `${request.method} ${request.url} -> ${status}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: ErrorResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    response.status(status).json(body);
  }

  /**
   * Extrae un mensaje seguro para el cliente.
   *
   * Para errores 500 se devuelve un texto genérico y así no se filtran
   * detalles internos; para el resto se respeta el mensaje de la HttpException.
   */
  private resolveMessage(
    exception: unknown,
    status: number,
  ): string | string[] {
    if (status === Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      return 'Error interno del servidor';
    }

    if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'string') {
        return responseBody;
      }
      const maybeMessage = (responseBody as { message?: string | string[] })
        .message;
      return maybeMessage ?? exception.message;
    }

    return 'Error inesperado';
  }
}
