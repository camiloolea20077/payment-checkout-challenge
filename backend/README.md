# Backend — Prueba FullStack de Checkout

API REST para un flujo de compra de un producto con pago mediante tarjeta en el
ambiente **Sandbox de Wompi**. Construida con **NestJS + TypeScript + Prisma 7 +
PostgreSQL**, aplicando **Arquitectura Hexagonal**, **Clean Architecture**,
principios **SOLID** y **Railway Oriented Programming**.

---

## 1. Objetivo

Permitir que un cliente:

1. Consulte un producto y sus unidades disponibles.
2. Registre sus datos y los de entrega.
3. Cree una transacción local en estado `PENDING`.
4. Pague con tarjeta a través de la pasarela Sandbox.
5. Vea el resultado y, si el pago fue aprobado, el stock actualizado.

El backend **recalcula siempre el total** (el frontend nunca define el importe),
**solo descuenta stock cuando el pago se aprueba**, garantiza que **no haya doble
cobro** ni **stock negativo**, y **nunca persiste datos sensibles de tarjeta**.

---

## 2. Stack

- Node.js · TypeScript · **NestJS 11**
- **Prisma 7** (`@prisma/client`, `@prisma/adapter-pg`, `pg`) · **PostgreSQL**
- `@nestjs/config`, `@nestjs/swagger`, `@nestjs/throttler`, `@nestjs/axios`, `axios`
- `class-validator`, `class-transformer`, `helmet`
- **Jest** (unitarias + e2e)

---

## 3. Arquitectura

Arquitectura hexagonal por capas, con dependencias apuntando hacia el dominio:

```
src/
├── domain/                 # Núcleo puro (sin framework)
│   ├── entities/           # Product, Stock, Customer, Delivery, Transaction, StockMovement
│   ├── value-objects/      # Money (centavos, inmutable)
│   ├── enums/              # TransactionStatus, DeliveryStatus, MovementType
│   ├── errors/             # DomainError y errores de negocio (con `code`)
│   └── ports/outbound/     # Interfaces de repositorios, pasarela, unidad de trabajo
│
├── application/            # Casos de uso (orquestación)
│   ├── use-cases/          # checkout, process-payment, create-*, get-*
│   ├── services/           # ConfirmSaleService (venta atómica)
│   ├── mappers/ · dto/     # Vistas de lectura
│
├── infrastructure/         # Implementaciones concretas
│   ├── database/prisma/    # PrismaService (+ unidad de trabajo con AsyncLocalStorage)
│   ├── repositories/       # Repos Prisma + mappers dominio↔persistencia
│   ├── payment-gateway/    # WompiPaymentGateway (adapter)
│   ├── configuration/      # Validación de variables de entorno
│   └── services/           # UuidGenerator
│
├── interfaces/http/        # Capa HTTP (sin lógica de negocio)
│   ├── controllers/ · request-dto/ · response-dto/
│   ├── filters/ · interceptors/ · errors/
│
└── shared/                 # Result<T,E>, utils (firma de integridad)
```

### Diagrama de dependencias

```
interfaces ─▶ application ─▶ domain ◀─ infrastructure
                              ▲
        (todas dependen de abstracciones del dominio; DIP)
```

- El **dominio** no depende de NestJS, Prisma, Axios ni PostgreSQL.
- La **aplicación** depende de puertos (interfaces), no de implementaciones.
- La **infraestructura** implementa los puertos (Prisma, Wompi).
- Los **controladores** no contienen lógica de negocio.

---

## 4. Modelo de datos

| Tabla | Campos clave |
|-------|--------------|
| `products` | id, name, description, price_in_cents, image_url, is_active |
| `stock` | id, product_id, available_units, reserved_units, **version** (lock optimista) |
| `customers` | id, full_name, email (único), phone, document_type, document_number |
| `deliveries` | id, customer_id, address, city, department, postal_code, delivery_fee_in_cents, status |
| `transactions` | id, reference (único), customer_id, product_id, delivery_id, quantity, *_in_cents, currency, status, provider_transaction_id, provider_status, failure_reason, **idempotency_key** (único) |
| `stock_movements` | id, product_id, transaction_id, movement_type, quantity, previous_stock, new_stock |

Estados de transacción: `PENDING · APPROVED · DECLINED · ERROR · VOIDED`
Estados de entrega: `PENDING · ASSIGNED · IN_PROGRESS · DELIVERED · CANCELLED`

Todos los valores monetarios se manejan como **enteros de centavos** (nunca
`float`), encapsulados en el value object `Money`.

---

## 5. Decisiones técnicas

- **Prisma 7 con driver adapter** (`@prisma/adapter-pg`); generador `prisma-client`
  configurado en `moduleFormat = "cjs"` e `importFileExtension = ""` para
  compatibilidad con NestJS (CommonJS) y `ts-node`.
- **Unidad de trabajo** con `AsyncLocalStorage`: los repositorios usan
  `prisma.client`, que resuelve automáticamente al cliente transaccional cuando
  hay una transacción activa. `PrismaService` **compone** el cliente (no lo
  extiende) para evitar el Proxy del cliente generado.
- **Result<T,E>** para errores de negocio (sin excepciones), encadenando los
  pasos del checkout (Railway Oriented Programming).
- **Idempotencia** vía header `Idempotency-Key` persistido en la transacción.
- **Errores de dominio con `code`** mapeados a HTTP en un único lugar.

---

## 6. Instalación

Requisitos: Node.js 20+, PostgreSQL local con una base `prueba_wompi`.

```bash
cd backend
npm install
cp .env.example .env    # y completa los valores (ver sección 7)
```

---

## 7. Variables de entorno

Ver `.env.example`. Nunca se sube `.env` al repositorio.

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/prueba_wompi?schema=public"
FRONTEND_URL="http://localhost:5173"

PAYMENT_API_URL="https://api-sandbox.co.uat.wompi.dev/v1"
PAYMENT_PUBLIC_KEY="pub_stagtest_..."
PAYMENT_PRIVATE_KEY="prv_stagtest_..."
PAYMENT_INTEGRITY_SECRET="stagtest_integrity_..."
PAYMENT_EVENTS_SECRET="stagtest_events_..."

BASE_FEE_IN_CENTS=5000
DEFAULT_DELIVERY_FEE_IN_CENTS=10000
CURRENCY=COP
```

Las variables se validan al arranque (`fail-fast`); si falta o es inválida
alguna, la aplicación no inicia.

---

## 8. Migraciones y seed

```bash
npm run prisma:generate    # genera el cliente
npm run prisma:migrate     # aplica migraciones (crea tablas)
npm run prisma:seed        # carga 4 productos con stock (idempotente)
```

No existe endpoint para crear productos: se cargan por seed.

---

## 9. Ejecutar

```bash
npm run start:dev          # desarrollo con hot reload
npm run build && npm run start:prod   # producción
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

---

## 10. Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | `/api/v1/health` | Estado del servicio |
| GET  | `/api/v1/products` | Catálogo activo con stock |
| GET  | `/api/v1/products/:id` | Detalle de producto |
| GET  | `/api/v1/products/:id/stock` | Stock disponible |
| POST | `/api/v1/customers` | Crea/reutiliza cliente |
| GET  | `/api/v1/customers/:id` | Consulta cliente |
| POST | `/api/v1/deliveries` | Crea entrega (tarifa calculada por backend) |
| GET  | `/api/v1/deliveries/:id` | Consulta entrega |
| PATCH| `/api/v1/deliveries/:id/status` | Actualiza estado de entrega |
| POST | `/api/v1/transactions` | Crea transacción `PENDING` (`Idempotency-Key`) |
| GET  | `/api/v1/transactions/:id` | Consulta transacción |
| POST | `/api/v1/transactions/:id/process` | Procesa el pago |
| POST | `/api/v1/checkout` | Flujo completo (`Idempotency-Key`) |

---

## 11. Flujo de pago

1. Validar DTO de checkout.
2. Crear/reutilizar cliente y crear entrega.
3. Consultar producto (activo) y validar stock.
4. Calcular importes y crear transacción `PENDING` (**total recalculado**).
5. Generar referencia y **firma de integridad SHA-256**.
6. Tokenizar la tarjeta y crear la transacción en Wompi; consultar el resultado.
7. Según el resultado:
   - **APPROVED** → en una **única transacción de base de datos**: revalidar y
     **descontar stock** (lock optimista), registrar `StockMovement`, **asignar
     la entrega** y marcar `APPROVED`.
   - **DECLINED** → guardar la causa; el inventario no se toca.
   - **ERROR / red / timeout** → estado `ERROR`; **nunca** se aprueba ni se
     descuenta stock.
8. Responder con un DTO seguro (sin datos de tarjeta).

---

## 12. Seguridad (OWASP)

- **Helmet** (cabeceras de seguridad) y **CORS** restringido a `FRONTEND_URL`.
- **ValidationPipe** global: `whitelist`, `forbidNonWhitelisted`, `transform`.
- **Rate limiting** con `@nestjs/throttler`.
- **Secretos solo en `.env`** (validados al arranque); nunca en el repositorio.
- **Nunca se persiste** número completo de tarjeta ni CVV; los datos de tarjeta
  son transitorios (solo para tokenizar).
- **Logs sin datos sensibles** (el interceptor no registra cuerpos ni headers).
- **Firma de integridad** en cada cobro.
- **Idempotencia** para prevenir doble cobro; **lock optimista** y transacción de
  DB para prevenir stock negativo y doble descuento.
- **Timeout** en las llamadas HTTP a la pasarela.
- Errores 500 no filtran detalles internos al cliente.

---

## 13. Pruebas y cobertura

```bash
npm test          # unitarias
npm run test:e2e  # end-to-end (requiere Postgres + seed)
npm run test:cov  # cobertura
```

- **135 pruebas** (unitarias + e2e), todas en verde.
- **Cobertura global ≈ 95%** de sentencias (umbral objetivo: 80%).

```
File            | % Stmts | % Branch | % Funcs | % Lines
All files       |   95.3  |  75.06   |  92.72  |  95.12
```

> Nota Prisma 7 + Jest: los scripts de test usan `--experimental-vm-modules`
> porque el cliente carga su compilador WASM con `import()` dinámico.

Los e2e cubren el flujo real contra la base de datos (catálogo, checkout,
descuento de stock, idempotencia) usando un stub de la pasarela para no depender
de la red.

---

## 14. Despliegue

1. Provisionar PostgreSQL y definir las variables de entorno del proveedor.
2. `npm ci && npm run build`
3. `npx prisma migrate deploy` (aplica migraciones en producción).
4. (Opcional) `npm run prisma:seed`.
5. `npm run start:prod` detrás de HTTPS.

---

## 15. Limitaciones y mejoras futuras

- Si el pago se aprueba pero el stock se agotó entre la creación y la aprobación,
  la transacción se marca `ERROR`; una mejora sería **reversar/anular** el cobro
  automáticamente (VOID) y notificar.
- No hay **webhook** de Wompi implementado (se usa polling); el `PAYMENT_EVENTS_SECRET`
  queda listo para validarlo como mejora.
- Reintentos de la pasarela con backoff configurable.
- Reserva temporal de stock (`reserved_units`) durante el `PENDING`.
- Autenticación/autorización para las operaciones administrativas (PATCH entrega).

---

## 16. Uso de IA

El proyecto se construyó de forma asistida por IA (Claude Code) de manera
progresiva y guiada, con prompts y decisiones documentadas por fase. Todo el
código fue revisado, ejecutado y verificado (build, pruebas y lint) antes de
integrarse. Las especificaciones de los agentes usados están en `docs/`.
```
