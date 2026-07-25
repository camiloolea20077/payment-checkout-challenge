import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Semilla de datos: carga los productos del catálogo con su stock inicial.
 *
 * Usa identificadores fijos y `upsert` para que ejecutarla varias veces sea
 * idempotente (no duplica productos ni reinicia el inventario existente al
 * recrearlo). No existe endpoint para crear productos: este es el único punto
 * de carga, tal como pide la prueba.
 */
interface SeedProduct {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
  availableUnits: number;
}

const products: SeedProduct[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Teclado mecánico RGB',
    description: 'Switches azules, retroiluminado, layout en español.',
    priceInCents: 30_000_00,
    imageUrl: 'https://picsum.photos/seed/keyboard/600/400',
    availableUnits: 25,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Mouse inalámbrico',
    description: 'Sensor óptico de 16000 DPI, batería recargable.',
    priceInCents: 15_000_00,
    imageUrl: 'https://picsum.photos/seed/mouse/600/400',
    availableUnits: 40,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Monitor 27" QHD',
    description: 'Panel IPS 165Hz, 2560x1440, 1ms.',
    priceInCents: 120_000_00,
    imageUrl: 'https://picsum.photos/seed/monitor/600/400',
    availableUnits: 10,
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Audífonos over-ear',
    description: 'Cancelación de ruido activa, Bluetooth 5.3.',
    priceInCents: 45_000_00,
    imageUrl: 'https://picsum.photos/seed/headphones/600/400',
    availableUnits: 5,
  },
];

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString === undefined) {
    throw new Error('DATABASE_URL no está definida.');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const product of products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          description: product.description,
          priceInCents: product.priceInCents,
          imageUrl: product.imageUrl,
          isActive: true,
        },
        create: {
          id: product.id,
          name: product.name,
          description: product.description,
          priceInCents: product.priceInCents,
          imageUrl: product.imageUrl,
          isActive: true,
          stock: {
            create: {
              availableUnits: product.availableUnits,
              reservedUnits: 0,
              version: 0,
            },
          },
        },
      });
    }
    console.log(`Seed completado: ${products.length} productos.`);
    await prisma.$disconnect();
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
}

void main();
