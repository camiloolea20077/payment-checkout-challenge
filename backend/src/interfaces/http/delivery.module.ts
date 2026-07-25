import { Module } from '@nestjs/common';
import { CreateDeliveryUseCase } from '../../application/use-cases/create-delivery.use-case';
import { GetDeliveryUseCase } from '../../application/use-cases/get-delivery.use-case';
import { UpdateDeliveryStatusUseCase } from '../../application/use-cases/update-delivery-status.use-case';
import { RepositoriesModule } from '../../infrastructure/repositories/repositories.module';
import { DeliveryController } from './controllers/delivery.controller';

/**
 * Módulo de entregas.
 */
@Module({
  imports: [RepositoriesModule],
  controllers: [DeliveryController],
  providers: [
    CreateDeliveryUseCase,
    GetDeliveryUseCase,
    UpdateDeliveryStatusUseCase,
  ],
})
export class DeliveryModule {}
