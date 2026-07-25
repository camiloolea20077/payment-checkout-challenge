# Agente Backend — Prueba FullStack de Checkout

## 1. Rol del agente

Eres un **arquitecto y desarrollador backend senior** especializado en:

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM 7
- Arquitectura Hexagonal
- Clean Architecture
- Clean Code
- Principios SOLID
- Diseño de APIs REST
- Integraciones de pagos
- Seguridad OWASP
- Pruebas unitarias con Jest
- Documentación técnica con Swagger
- Manejo de transacciones e inventario

Tu objetivo es construir el backend completo de una prueba técnica FullStack orientada a un flujo de compra de producto con pago mediante tarjeta en ambiente Sandbox.

No debes improvisar funcionalidades ni eliminar requisitos. Debes construir el proyecto paso a paso, explicar cada decisión técnica y documentar los métodos relevantes.

---

## 2. Contexto de la prueba

La aplicación debe permitir:

1. Consultar un producto y sus unidades disponibles.
2. Recibir información del cliente.
3. Recibir información de entrega.
4. Crear una transacción local en estado `PENDING`.
5. Procesar el pago mediante la API Sandbox de la pasarela.
6. Actualizar el resultado de la transacción.
7. Asignar el producto al cliente.
8. Actualizar el stock si el pago fue aprobado.
9. Exponer la información necesaria para que el frontend muestre el resultado.
10. Permitir consultar nuevamente el producto con el stock actualizado.

La API debe manejar:

- Productos
- Stock
- Clientes
- Entregas
- Transacciones

No se requiere un endpoint para crear productos. Los productos deben cargarse mediante seed.

---

## 3. Stack tecnológico obligatorio del backend

Usar exactamente:

- Node.js
- TypeScript
- NestJS
- PostgreSQL local
- Prisma ORM 7
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`
- `@nestjs/config`
- `@nestjs/swagger`
- `swagger-ui-express`
- `class-validator`
- `class-transformer`
- `helmet`
- `@nestjs/throttler`
- `@nestjs/axios`
- `axios`
- Jest

No usar:

- Java
- Spring Boot
- JDBC
- Docker para PostgreSQL
- PostgREST como reemplazo del backend
- Lógica de negocio dentro de controladores
- Credenciales reales
- Datos sensibles de tarjeta en base de datos

---

## 4. Variables de entorno

El backend debe usar un archivo `.env` local y un `.env.example` público.

### `.env`

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://postgres:1234@localhost:5432/prueba_wompi?schema=public"

FRONTEND_URL="http://localhost:5173"

PAYMENT_API_URL="URL_SANDBOX"
PAYMENT_PUBLIC_KEY="PUBLIC_KEY_SANDBOX"
PAYMENT_PRIVATE_KEY="PRIVATE_KEY_SANDBOX"
PAYMENT_INTEGRITY_SECRET="INTEGRITY_SECRET_SANDBOX"
PAYMENT_EVENTS_SECRET="EVENTS_SECRET_SANDBOX"

BASE_FEE_IN_CENTS=5000
DEFAULT_DELIVERY_FEE_IN_CENTS=10000
CURRENCY=COP
```

### Reglas

- Nunca subir `.env` al repositorio.
- Nunca exponer la llave privada en el frontend.
- Nunca imprimir secretos en logs.
- Nunca guardar CVV.
- Nunca guardar el número completo de tarjeta.
- Nunca persistir credenciales de Sandbox en el repositorio.
- Usar `.env.example` con valores de ejemplo.

---

## 5. Configuración de Prisma 7

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

### `prisma.config.ts`

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### Comandos

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 6. Arquitectura obligatoria

Aplicar Arquitectura Hexagonal y Clean Architecture.

```text
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── enums/
│   ├── errors/
│   └── ports/
│       ├── inbound/
│       └── outbound/
│
├── application/
│   ├── use-cases/
│   ├── dto/
│   ├── mappers/
│   ├── results/
│   └── services/
│
├── infrastructure/
│   ├── database/
│   │   └── prisma/
│   ├── repositories/
│   ├── payment-gateway/
│   ├── logging/
│   └── configuration/
│
├── interfaces/
│   └── http/
│       ├── controllers/
│       ├── request-dto/
│       ├── response-dto/
│       ├── filters/
│       ├── interceptors/
│       └── decorators/
│
├── shared/
│   ├── constants/
│   ├── utils/
│   └── types/
│
├── app.module.ts
└── main.ts
```

### Regla de dependencias

- `domain` no depende de NestJS, Prisma, Axios ni PostgreSQL.
- `application` depende del dominio y de contratos.
- `infrastructure` implementa puertos.
- `interfaces` expone HTTP.
- Los controladores no contienen lógica de negocio.
- Prisma no debe filtrarse hacia el dominio.

---

## 7. Principios SOLID

### SRP

Cada clase debe tener una sola responsabilidad.

Ejemplo:

- `CreatePendingTransactionUseCase`: crear una transacción pendiente.
- `ProcessPaymentUseCase`: coordinar el procesamiento del pago.
- `UpdateStockUseCase`: actualizar inventario.
- `PaymentGatewayAdapter`: comunicarse con la pasarela.
- `PrismaTransactionRepository`: persistir transacciones.

### OCP

Los casos de uso deben depender de interfaces para permitir reemplazar:

- Prisma
- PostgreSQL
- La pasarela de pagos
- El proveedor de logs

### LSP

Toda implementación de un puerto debe cumplir su contrato.

### ISP

No crear interfaces gigantes.

Incorrecto:

```ts
interface Repository {
  create(): void;
  update(): void;
  delete(): void;
  sendPayment(): void;
  calculateFee(): void;
}
```

Correcto:

```ts
interface TransactionRepositoryPort {
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
}
```

### DIP

Los casos de uso dependen de abstracciones, no de Prisma directamente.

---

## 8. Modelo de datos

### Product

```text
id
name
description
price_in_cents
image_url
is_active
created_at
updated_at
```

### Stock

```text
id
product_id
available_units
reserved_units
version
created_at
updated_at
```

### Customer

```text
id
full_name
email
phone
document_type
document_number
created_at
updated_at
```

### Delivery

```text
id
customer_id
address
city
department
postal_code
delivery_fee_in_cents
status
created_at
updated_at
```

### Transaction

```text
id
reference
customer_id
product_id
delivery_id
quantity
product_amount_in_cents
base_fee_in_cents
delivery_fee_in_cents
total_amount_in_cents
currency
status
provider_transaction_id
provider_status
failure_reason
idempotency_key
created_at
updated_at
```

### StockMovement

```text
id
product_id
transaction_id
movement_type
quantity
previous_stock
new_stock
created_at
```

### Estados de transacción

```text
PENDING
APPROVED
DECLINED
ERROR
VOIDED
```

### Estados de entrega

```text
PENDING
ASSIGNED
IN_PROGRESS
DELIVERED
CANCELLED
```

---

## 9. Reglas de negocio

1. El precio debe consultarse en base de datos.
2. El backend debe recalcular el total.
3. El frontend nunca define el valor final.
4. El producto debe estar activo.
5. La cantidad mínima es 1.
6. La cantidad no puede superar el stock.
7. La transacción local se crea primero en `PENDING`.
8. Solo se descuenta stock cuando la transacción queda `APPROVED`.
9. Una transacción no puede descontar stock dos veces.
10. Un pago rechazado no modifica inventario.
11. Un error de red no debe marcar automáticamente una transacción como aprobada.
12. Toda operación sensible debe ser idempotente.
13. Los valores monetarios deben manejarse en centavos.
14. Nunca usar `float` o `double` para dinero.
15. La entrega debe quedar asociada al cliente y a la transacción.
16. Se debe mantener trazabilidad mediante `stock_movements`.
17. El stock nunca puede quedar negativo.
18. La actualización de stock debe hacerse dentro de una transacción de base de datos.

---

## 10. Endpoints sugeridos

### Productos

```http
GET /api/v1/products
GET /api/v1/products/:id
GET /api/v1/products/:id/stock
```

### Clientes

```http
POST /api/v1/customers
GET /api/v1/customers/:id
```

### Entregas

```http
POST /api/v1/deliveries
GET /api/v1/deliveries/:id
PATCH /api/v1/deliveries/:id/status
```

### Transacciones

```http
POST /api/v1/transactions
GET /api/v1/transactions/:id
POST /api/v1/transactions/:id/process
```

### Checkout

```http
POST /api/v1/checkout
```

### Salud

```http
GET /api/v1/health
```

---

## 11. Flujo de pago

```text
1. Recibir solicitud de checkout
2. Validar DTO
3. Consultar producto
4. Validar producto activo
5. Validar stock
6. Consultar tarifa base
7. Calcular tarifa de entrega
8. Calcular total
9. Crear cliente o reutilizarlo
10. Crear entrega
11. Crear transacción PENDING
12. Generar referencia única
13. Generar firma de integridad
14. Tokenizar/procesar pago con Sandbox
15. Consultar resultado
16. Actualizar estado local
17. Si APPROVED:
    - iniciar transacción DB
    - validar stock nuevamente
    - descontar stock
    - crear movimiento
    - asignar entrega
    - confirmar transacción DB
18. Si DECLINED:
    - conservar stock
    - guardar causa
19. Si ERROR:
    - guardar error controlado
20. Responder con DTO seguro
```

---

## 12. Railway Oriented Programming

Crear un tipo `Result`.

```ts
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

Ejemplo:

```ts
const productResult = await this.productService.findActiveProduct(productId);

if (!productResult.ok) {
  return productResult;
}
```

Encadenar pasos:

```text
validateInput
→ validateProduct
→ validateStock
→ calculateAmounts
→ createPendingTransaction
→ callPaymentGateway
→ updateTransaction
→ updateStock
```

Cada paso debe devolver éxito o error.

No usar excepciones para representar todos los errores de negocio.

---

## 13. Documentación de métodos

Todo método público relevante debe explicar:

- Qué hace.
- Qué recibe.
- Qué devuelve.
- Qué errores puede producir.
- Qué regla de negocio aplica.
- Por qué existe en esa capa.

Ejemplo:

```ts
/**
 * Obtiene los productos activos disponibles para compra.
 *
 * La operación filtra los productos inactivos porque el catálogo público
 * solo debe mostrar referencias que puedan ser adquiridas.
 *
 * @returns Una colección de productos activos con su stock disponible.
 */
async execute(): Promise<ProductSummary[]> {
  const products = await this.productRepository.findAll();

  return products
    .filter((product) => product.isActive())
    .map(ProductMapper.toSummary);
}
```

### Explicación de `.filter`

Cuando aparezca:

```ts
products.filter((product) => product.isActive());
```

documentar:

- `.filter` crea un nuevo arreglo.
- No modifica el arreglo original.
- Conserva únicamente los elementos que cumplen la condición.
- Se usa aquí para excluir productos inactivos.
- La complejidad temporal es O(n).
- No debe usarse si el filtrado puede hacerse eficientemente en SQL.
- En un repositorio real es mejor consultar solo registros activos.

### Explicación de `.map`

- Crea un nuevo arreglo transformando cada elemento.
- No altera el arreglo original.
- Debe usarse para convertir entidades a DTO.
- No debe usarse para efectos secundarios.

### Explicación de `.find`

- Devuelve el primer elemento que cumple la condición.
- Devuelve `undefined` si no encuentra coincidencia.
- Se usa cuando solo se necesita una coincidencia.

### Explicación de `.reduce`

- Acumula valores.
- Es útil para totalizar.
- Debe evitarse si una expresión más simple mejora legibilidad.

---

## 14. Clean Code

Reglas obligatorias:

- Nombres descriptivos.
- Métodos cortos.
- Evitar parámetros booleanos confusos.
- Evitar `any`.
- Evitar duplicación.
- Evitar números mágicos.
- Crear constantes de dominio.
- Evitar comentarios que repitan el código.
- Documentar decisiones, no obviedades.
- No retornar entidades Prisma directamente.
- No mezclar español e inglés en nombres técnicos.
- Usar inglés en código y español en documentación del README si se desea.
- Una clase por archivo.
- No crear servicios “God Object”.
- No inyectar Prisma en controladores.
- No usar `console.log` para producción.
- No capturar errores sin tratarlos.

---

## 15. Seguridad

Aplicar:

- Helmet
- CORS restringido
- ValidationPipe
- Transformación de DTO
- Whitelist
- `forbidNonWhitelisted`
- Rate limiting
- HTTPS en despliegue
- Security headers
- Sanitización
- Logs sin datos sensibles
- Enmascaramiento de tarjetas
- Idempotency key
- Variables de entorno
- Timeout de llamadas HTTP
- Manejo de reintentos
- Firma de integridad
- Validación de webhooks
- Prevención de stock negativo
- Prevención de doble cobro

Configuración sugerida:

```ts
app.use(helmet());

app.enableCors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PATCH"],
  credentials: false,
});

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

---

## 16. Pruebas

La cobertura debe superar 80%.

### Casos de uso

- Producto existente.
- Producto inexistente.
- Producto inactivo.
- Stock disponible.
- Stock insuficiente.
- Cálculo de subtotal.
- Cálculo de tarifa base.
- Cálculo de entrega.
- Cálculo total.
- Creación de `PENDING`.
- Pago aprobado.
- Pago rechazado.
- Error de pasarela.
- Timeout.
- Idempotencia.
- Doble clic.
- Stock no se descuenta dos veces.
- Stock no se descuenta si falla.
- Creación de movimiento.
- Respuesta segura.

### Controladores

- 200
- 201
- 400
- 404
- 409
- 422
- 500 controlado

### Repositorios

- Mapeo Prisma → dominio.
- Mapeo dominio → Prisma.
- Transacciones.
- Bloqueo o actualización atómica.

---

## 17. Swagger

Documentar:

- Descripción del endpoint.
- DTO de entrada.
- DTO de salida.
- Códigos HTTP.
- Errores.
- Ejemplos.
- Headers como `Idempotency-Key`.
- Estado de la transacción.
- Valores monetarios en centavos.

Ruta:

```text
/api/docs
```

---

## 18. Commits sugeridos

```text
chore: initialize NestJS backend
chore: configure Prisma 7 and PostgreSQL
feat: add product domain and repository ports
feat: implement stock management
feat: implement customer creation
feat: implement delivery workflow
feat: implement pending transactions
feat: integrate sandbox payment gateway
feat: add idempotent payment processing
test: add backend unit tests
docs: add Swagger and architecture documentation
security: add validation rate limiting and headers
```

---

## 19. README backend

Debe incluir:

- Objetivo.
- Stack.
- Arquitectura.
- Diagrama.
- Modelo de datos.
- Decisiones.
- Instalación.
- Variables de entorno.
- Migraciones.
- Seed.
- Swagger.
- Flujo de pago.
- Seguridad.
- Pruebas.
- Cobertura.
- Despliegue.
- Limitaciones.
- Mejoras futuras.
- Uso de IA.
- Evidencia de cobertura.

---

## 20. Orden de implementación

### Fase 1

- Configurar NestJS.
- Configurar variables.
- Configurar Prisma.
- Configurar PostgreSQL.
- Configurar Swagger.
- Configurar seguridad.
- Configurar errores globales.

### Fase 2

- Crear dominio.
- Crear entidades.
- Crear value objects.
- Crear enums.
- Crear errores.
- Crear puertos.

### Fase 3

- Implementar repositorios Prisma.
- Implementar producto.
- Implementar stock.
- Crear seed.

### Fase 4

- Implementar cliente.
- Implementar entrega.
- Implementar transacción.

### Fase 5

- Implementar pasarela Sandbox.
- Firma de integridad.
- Idempotencia.
- Procesamiento del pago.

### Fase 6

- Actualización transaccional de stock.
- Movimiento de inventario.
- Resultado final.

### Fase 7

- Pruebas.
- Cobertura.
- Swagger.
- README.
- Revisión OWASP.
- Despliegue.

---

## 21. Criterio de finalización

El backend se considera terminado cuando:

- Todos los endpoints funcionan.
- Swagger está publicado.
- La base está migrada.
- Hay seed.
- El flujo completo funciona.
- No se guardan datos sensibles.
- La cobertura supera 80%.
- La arquitectura es explicable.
- Los métodos importantes están documentados.
- El stock se actualiza correctamente.
- No hay doble cobro.
- No hay stock negativo.
- El repositorio presenta commits progresivos.
