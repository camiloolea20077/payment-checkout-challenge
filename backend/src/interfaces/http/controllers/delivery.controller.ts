import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DeliveryView } from '../../../application/dto/delivery-view';
import { CreateDeliveryUseCase } from '../../../application/use-cases/create-delivery.use-case';
import { GetDeliveryUseCase } from '../../../application/use-cases/get-delivery.use-case';
import { UpdateDeliveryStatusUseCase } from '../../../application/use-cases/update-delivery-status.use-case';
import { domainErrorToHttp } from '../errors/domain-error.mapper';
import { CreateDeliveryDto } from '../request-dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from '../request-dto/update-delivery-status.dto';
import { DeliveryResponseDto } from '../response-dto/delivery-response.dto';

/**
 * Controlador HTTP de entregas.
 */
@ApiTags('Deliveries')
@Controller('deliveries')
export class DeliveryController {
  constructor(
    private readonly createDelivery: CreateDeliveryUseCase,
    private readonly getDelivery: GetDeliveryUseCase,
    private readonly updateDeliveryStatus: UpdateDeliveryStatusUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crea una entrega para un cliente' })
  @ApiCreatedResponse({ type: DeliveryResponseDto })
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  async create(@Body() dto: CreateDeliveryDto): Promise<DeliveryView> {
    const result = await this.createDelivery.execute(dto);
    if (!result.ok) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta una entrega por su id' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  @ApiNotFoundResponse({ description: 'La entrega no existe.' })
  async detail(@Param('id', ParseUUIDPipe) id: string): Promise<DeliveryView> {
    const result = await this.getDelivery.execute(id);
    if (!result.ok) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualiza el estado de una entrega' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  @ApiNotFoundResponse({ description: 'La entrega no existe.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ): Promise<DeliveryView> {
    const result = await this.updateDeliveryStatus.execute(id, dto.status);
    if (!result.ok) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }
}
