import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Respuesta del chequeo de salud del servicio.
 */
interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptimeSeconds: number;
}

/**
 * Endpoint de salud usado por balanceadores, orquestadores y monitoreo para
 * comprobar que el proceso está vivo y respondiendo.
 *
 * Vive en la capa de interfaces y no contiene lógica de negocio: solo reporta
 * el estado del proceso.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  /**
   * Reporta el estado operativo del servicio.
   *
   * @returns Estado `ok`, marca de tiempo actual y segundos de actividad.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica que el servicio esté operativo' })
  @ApiOkResponse({ description: 'El servicio está operativo.' })
  check(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
