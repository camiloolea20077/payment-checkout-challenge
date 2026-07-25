import { Module } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/outbound/customer-repository.port';
import { DELIVERY_REPOSITORY } from '../../domain/ports/outbound/delivery-repository.port';
import { ID_GENERATOR } from '../../domain/ports/outbound/id-generator.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product-repository.port';
import { STOCK_REPOSITORY } from '../../domain/ports/outbound/stock-repository.port';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/outbound/transaction-repository.port';
import { UuidGenerator } from '../services/uuid-generator';
import { PrismaCustomerRepository } from './prisma-customer.repository';
import { PrismaDeliveryRepository } from './prisma-delivery.repository';
import { PrismaProductRepository } from './prisma-product.repository';
import { PrismaStockRepository } from './prisma-stock.repository';
import { PrismaTransactionRepository } from './prisma-transaction.repository';

/**
 * Módulo que enlaza cada puerto de salida (repositorios, generador de ids) con
 * su implementación concreta y las exporta.
 *
 * Centraliza el cableado de la inversión de dependencias (DIP): los módulos de
 * feature solo importan este módulo y resuelven las abstracciones por token,
 * sin conocer Prisma.
 */
@Module({
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: STOCK_REPOSITORY, useClass: PrismaStockRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
    { provide: DELIVERY_REPOSITORY, useClass: PrismaDeliveryRepository },
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: ID_GENERATOR, useClass: UuidGenerator },
  ],
  exports: [
    PRODUCT_REPOSITORY,
    STOCK_REPOSITORY,
    CUSTOMER_REPOSITORY,
    DELIVERY_REPOSITORY,
    TRANSACTION_REPOSITORY,
    ID_GENERATOR,
  ],
})
export class RepositoriesModule {}
