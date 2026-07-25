import { Module } from '@nestjs/common';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from '../../application/use-cases/get-customer.use-case';
import { RepositoriesModule } from '../../infrastructure/repositories/repositories.module';
import { CustomerController } from './controllers/customer.controller';

/**
 * Módulo de clientes.
 */
@Module({
  imports: [RepositoriesModule],
  controllers: [CustomerController],
  providers: [CreateCustomerUseCase, GetCustomerUseCase],
})
export class CustomerModule {}
