# Payment Checkout Challenge

Aplicación **FullStack** para comprar un producto y pagarlo con tarjeta en el
ambiente **Sandbox de la pasarela de pagos**: consulta de producto y stock, captura de datos de
cliente y entrega, procesamiento del pago, actualización transaccional del
inventario y confirmación del resultado.

Monorepo con **backend (NestJS + Prisma 7 + PostgreSQL)** y **frontend
(React + Vite + Redux Toolkit + Tailwind)**, ambos con **arquitectura
hexagonal**, Clean Code y principios SOLID.

---

## Estructura

```text
payment-checkout-challenge/
├── backend/     API REST (NestJS, Prisma 7, PostgreSQL, pasarela de pagos)
├── frontend/    SPA de checkout (React, Vite, Redux Toolkit, Tailwind)
├── docs/        Especificaciones de los agentes usados (uso de IA)
└── README.md    Este archivo
```

Cada carpeta tiene su propio README con el detalle:
- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

---

## Stack

| | Backend | Frontend |
|---|---|---|
| Lenguaje | TypeScript | TypeScript |
| Framework | NestJS 11 | React 19 + Vite |
| Estado / datos | Prisma 7 + PostgreSQL | Redux Toolkit |
| Formularios | class-validator | React Hook Form + Zod |
| Estilos | — | Tailwind CSS |
| HTTP | @nestjs/axios | Axios |
| Pruebas | Jest | Jest + React Testing Library |
| Docs API | Swagger (`/api/docs`) | — |

> **Sin Docker**: PostgreSQL corre de forma **local** (así lo exige la prueba).

---

## Flujo de la aplicación

```text
1. Producto        → ver producto, stock y elegir cantidad
2. Pago y entrega  → tarjeta (Luhn, Visa/Mastercard) + datos de entrega
3. Resumen         → desglose (subtotal + tarifa base + envío = total)
4. Resultado       → APPROVED / DECLINED / ERROR con referencia y total
5. Producto        → regreso a la tienda con el stock actualizado
```

Reglas clave del negocio (aplicadas en el backend):
- El **total se recalcula en el backend**; el frontend nunca fija el importe.
- El **stock solo se descuenta si el pago es APPROVED**, dentro de una
  transacción de base de datos, con bloqueo optimista (sin doble descuento ni
  stock negativo).
- Operaciones **idempotentes** (`Idempotency-Key`) para evitar el doble cobro.
- **Nunca** se persiste el número completo de tarjeta ni el CVV.

---

## Requisitos

- Node.js 20+
- PostgreSQL local con una base de datos `payment_checkout`
- Llaves de la **pasarela de pagos** en modo Sandbox (pública, privada e integridad)

---

## Puesta en marcha

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # completa DATABASE_URL y las llaves de la pasarela de pagos
npm run prisma:generate
npm run prisma:migrate        # crea las tablas
npm run prisma:seed           # carga los productos
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_BASE_URL apunta al backend
npm run dev
```

- App: `http://localhost:5173`

---

## Probar el flujo (Sandbox)

Con backend + frontend corriendo y el seed cargado, usa la tarjeta de prueba:

| Campo | Valor |
|---|---|
| Número | `4242 4242 4242 4242` |
| Fecha | cualquiera futura (MM/YY, p. ej. `08/28`) |
| CVV | `123` |
| Nombre | cualquiera |

El pago queda **APPROVED**, se descuenta una unidad de stock y la pantalla de
resultado muestra el detalle completo de la compra.

---

## Pruebas

```bash
# Backend (unitarias + e2e + cobertura)
cd backend && npm test && npm run test:e2e && npm run test:cov

# Frontend
cd frontend && npm test
```

- Backend: ~135 pruebas, cobertura ≈95%.

---

## Seguridad

Helmet, CORS restringido, ValidationPipe estricto, rate limiting, firma de
integridad, idempotencia, bloqueo optimista de inventario, secretos solo en
`.env`, sin datos sensibles de tarjeta en base de datos ni en `localStorage`, y
logs sin información sensible. Detalle en los READMEs de cada carpeta.

---

## Uso de IA

El proyecto se construyó de forma asistida por IA (Claude Code) de manera
progresiva y por fases, con las especificaciones de los agentes versionadas en
[`docs/`](./docs). Todo el código fue revisado, ejecutado y verificado (build,
pruebas y lint) antes de integrarse.
