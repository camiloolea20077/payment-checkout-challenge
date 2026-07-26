# Payment Checkout — Frontend

Frontend de una prueba técnica de checkout con pago mediante tarjeta. Implementa
el flujo completo de cinco pasos: ver producto → capturar tarjeta y datos de
entrega → revisar el resumen → procesar el pago → ver el resultado y volver al
producto con el stock actualizado.

El backend vive en un repositorio aparte; esta aplicación lo consume vía HTTP
(`VITE_API_BASE_URL`).

---

## 1. Objetivo

- Mostrar el catálogo de productos con precio, descripción y stock.
- Permitir elegir cantidad (limitada por el inventario disponible).
- Capturar tarjeta (con validación Luhn y detección de marca) y datos de entrega.
- Mostrar el desglose de montos: subtotal, tarifa base, tarifa de entrega y total.
- Procesar el pago de forma idempotente, evitando dobles cobros.
- Mostrar el resultado de la transacción y refrescar el stock al regresar.
- Recuperar el progreso tras recargar la página **sin persistir datos sensibles**.

---

## 2. Stack

| Área | Herramienta |
| --- | --- |
| UI | React 19, TypeScript, Vite 8 |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`), `clsx`, `tailwind-merge` |
| Estado | Redux Toolkit, React Redux |
| Ruteo | React Router DOM 7 |
| Formularios | React Hook Form + Zod (`@hookform/resolvers`) |
| HTTP | Axios |
| Pruebas | Jest, jest-environment-jsdom, ts-jest, React Testing Library, user-event |
| Lint | Oxlint |

---

## 3. Arquitectura

Arquitectura hexagonal (puertos y adaptadores) aplicada al frontend, con la
regla de dependencias apuntando siempre hacia el dominio:

```text
presentation ──▶ application ──▶ domain ◀── infrastructure
```

- **`domain`** — entidades, enums, errores y **puertos**. No conoce React ni Axios.
- **`application`** — DTOs del caso de uso (entrada del checkout). No conoce Axios.
- **`infrastructure`** — implementa los puertos: cliente Axios, repositorio HTTP
  y lectura de configuración (`import.meta.env`).
- **`presentation`** — páginas, componentes, formularios, hooks, store y rutas.
  Consume el puerto a través de un contexto de React, nunca Axios directamente.
- **`shared`** — sistema de diseño (`ui`), utilidades puras y constantes.

### Inversión de dependencias

`CheckoutRepositoryPort` (en `domain/ports`) define el contrato:

```ts
getProducts(): Promise<Product[]>;
getProduct(productId: string): Promise<Product>;
getProductStock(productId: string): Promise<ProductStock>;
checkout(input: CheckoutInput, idempotencyKey: string): Promise<Transaction>;
getTransaction(transactionId: string): Promise<Transaction>;
```

`AxiosCheckoutRepository` lo implementa en `infrastructure/repositories`, y los
hooks lo reciben por `repository-context`. Eso permite sustituir la
implementación en las pruebas con un doble en memoria, sin mockear Axios.

### Principios SOLID aplicados

- **SRP** — cada componente hace una cosa: `ProductCard` muestra el producto,
  `StockBadge` el inventario, `QuantitySelector` la cantidad, `PaymentCardForm`
  la tarjeta, `AmountBreakdown` los totales.
- **OCP** — los componentes del sistema de diseño se extienden por props y
  composición (variantes de `Button`, `Alert`, `Badge`).
- **LSP** — los componentes reutilizables respetan los atributos nativos del
  elemento que envuelven (`input`, `select`, `button`).
- **ISP** — se pasan props mínimas y específicas, no objetos de estado completos.
- **DIP** — hooks y páginas dependen del puerto, no del adaptador HTTP.

---

## 4. Estructura del proyecto

```text
src/
├── domain/
│   ├── entities/            # Product, ProductStock, Transaction
│   ├── enums/               # TransactionStatus
│   ├── errors/              # NetworkError, ProductNotFoundError, ...
│   └── ports/               # CheckoutRepositoryPort
│
├── application/
│   └── dto/                 # CheckoutInput, CustomerInput, DeliveryInput, CardInput
│
├── infrastructure/
│   ├── configuration/       # env.ts (variables VITE_*)
│   ├── http/                # httpClient (Axios preconfigurado)
│   └── repositories/        # AxiosCheckoutRepository
│
├── presentation/
│   ├── pages/               # product, payment-and-delivery, summary, result
│   ├── components/          # checkout/ y product/
│   ├── forms/               # delivery-form, payment-card-form, esquema Zod
│   ├── hooks/               # use-products, use-selected-product, use-checkout, use-transaction-status
│   ├── layouts/             # root-layout (header + stepper + Suspense)
│   ├── providers/           # repository-context
│   ├── routes/              # app-router (lazy por ruta)
│   └── store/               # store, slices y persistencia
│
├── shared/
│   ├── ui/                  # Button, Input, Select, FormField, Card, Badge, Alert,
│   │                        # Backdrop, Skeleton, Spinner, Stepper, Price, Divider,
│   │                        # EmptyState, ErrorState
│   ├── utils/               # card (Luhn, marca, máscara), money, cn, error-message
│   └── constants/           # checkout-steps, product
│
├── test-utils/              # render con providers, mock de env, setup de Jest
├── App.tsx
└── main.tsx
```

---

## 5. Rutas

| Ruta | Página | Descripción |
| --- | --- | --- |
| `/` | — | Redirige a `/product` |
| `/product` | `ProductPage` | Catálogo, stock, selector de cantidad y CTA de pago |
| `/checkout/payment` | `PaymentAndDeliveryPage` | Formulario de tarjeta y de entrega |
| `/checkout/summary` | `SummaryPage` | Desglose de montos y confirmación del pago |
| `/checkout/result/:transactionId` | `ResultPage` | Estado final de la transacción |
| `*` | — | Redirige a `/product` |

El resultado se identifica por `:transactionId` en la URL, de modo que la vista
puede recargarse o compartirse: si el store no tiene esa transacción, se
consulta al backend.

Cada página se carga con `React.lazy` (code-splitting por ruta) bajo un
`Suspense` del layout raíz.

---

## 6. Estado global

Redux Toolkit con cinco slices:

| Slice | Contenido |
| --- | --- |
| `product` | catálogo, producto seleccionado, estado de carga y error |
| `checkout` | paso actual, `productId`, cantidad, cliente, entrega, `transactionId` |
| `payment` | datos de la tarjeta — **solo en memoria** |
| `transaction` | transacción actual, estado de la consulta y error |
| `ui` | banderas de UI (p. ej. `isProcessingPayment`) |

---

## 7. Persistencia

`presentation/store/persistence.ts` guarda en `localStorage` (clave
`checkout-progress`) **únicamente el slice `checkout`**, que contiene datos no
sensibles: paso, producto, cantidad, cliente, entrega e id de transacción.

- El store se precarga con ese estado al arrancar (`preloadedState`).
- Un `store.subscribe` lo reescribe en cada cambio.
- Las escrituras y lecturas están protegidas con `try/catch` (modo privado, cuota).

El slice `payment` queda deliberadamente **fuera** de la persistencia.

---

## 8. Seguridad

- **La tarjeta nunca se persiste.** Número, CVC, vencimiento y titular viven solo
  en memoria (slice `payment`) y se limpian al llegar a la pantalla de resultado.
- **Nada de secretos en el cliente.** Solo se exponen variables `VITE_*`: URL de
  la API, nombre de la app, moneda y las tarifas de previsualización. No hay
  llaves privadas ni secretos de integridad/eventos.
- **Idempotencia.** `useCheckout` genera una `Idempotency-Key` (UUID) estable por
  montaje y la envía como header; además bloquea reenvíos mientras procesa, de
  modo que el doble clic no genera doble cobro.
- **El total es autoritativo del backend.** Las tarifas del `.env` sirven solo
  para previsualizar el desglose; el backend recalcula el total al cobrar.
- **Errores traducidos.** `AxiosCheckoutRepository` mapea los fallos a errores de
  dominio (`NetworkError`, `ProductNotFoundError`, `UnexpectedError`); la UI
  nunca muestra stack traces ni respuestas crudas.
- **Enmascaramiento.** En el resumen la tarjeta se muestra como
  `•••• •••• •••• 1234`.

---

## 9. Diseño adaptativo

Mobile-first, verificado desde 320 px hasta 1440 px.

- Sin anchos fijos: contenedores con `mx-auto w-full max-w-* px-4 sm:px-6 lg:px-8`.
- `grid` y `flex` para los layouts; sin scroll horizontal.
- Formularios de una columna en móvil y dos columnas en escritorio cuando aporta.
- Estados de carga (skeletons), vacío y error en todas las vistas con datos.
- Áreas táctiles cercanas a 44 px y foco visible en todos los controles.
- Backdrop de procesamiento durante el pago.

---

## 10. Accesibilidad

- Labels asociados a cada control y errores enlazados con `aria-describedby`.
- Mensajes de estado y de error anunciados con `aria-live`.
- Botones reales (`<button>`), orden de tabulación natural y foco visible.
- Jerarquía de headings coherente, texto alternativo en imágenes.
- El estado no depende solo del color (badges e iconos acompañan al texto).

---

## 11. Ejecución

Requisitos: Node.js 20+ y el backend corriendo en `VITE_API_BASE_URL`.

```bash
npm install
cp .env.example .env     # ajusta los valores si hace falta
npm run dev              # http://localhost:5173
```

Scripts disponibles:

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | `tsc -b` + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Oxlint |
| `npm test` | Pruebas con Jest |
| `npm run test:watch` | Pruebas en modo watch |
| `npm run test:cov` | Pruebas con reporte de cobertura en `coverage/` |

---

## 12. Variables de entorno

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Payment Checkout
VITE_CURRENCY=COP

# Solo para previsualizar el desglose en el resumen; el backend recalcula el
# total de forma autoritativa al cobrar. Deben coincidir con el backend.
VITE_BASE_FEE_IN_CENTS=5000
VITE_DELIVERY_FEE_IN_CENTS=10000
```

| Variable | Uso |
| --- | --- |
| `VITE_API_BASE_URL` | `baseURL` del cliente Axios |
| `VITE_APP_NAME` | Nombre mostrado en el header |
| `VITE_CURRENCY` | Moneda usada al formatear precios |
| `VITE_BASE_FEE_IN_CENTS` | Tarifa base mostrada en el desglose |
| `VITE_DELIVERY_FEE_IN_CENTS` | Tarifa de entrega mostrada en el desglose |

Solo las variables con prefijo `VITE_` llegan al navegador. Nunca deben
colocarse aquí llaves privadas ni secretos de la pasarela.

---

## 13. Pruebas

```bash
npm test           # ejecuta la suite
npm run test:cov   # con cobertura
```

Configuración: `ts-jest` + `jsdom` + React Testing Library. `jest.config.cjs`
sustituye el módulo de configuración por `test-utils/env-mock.ts` para evitar
`import.meta.env` dentro de Jest, y `test-utils/render.tsx` monta cada prueba con
el store, el router y un repositorio en memoria que implementa el puerto.

Qué se cubre:

- **ProductPage** — render del catálogo, precio y stock, límites de cantidad,
  bloqueo del pago sin stock y estado de error.
- **Formularios** — validación de campos, Luhn, vencimiento futuro, CVC,
  detección de Visa/Mastercard y continuación al resumen.
- **SummaryPage** — subtotal, tarifa base, tarifa de entrega, total, tarjeta
  enmascarada y bloqueo del doble envío.
- **ResultPage** — estados aprobado/rechazado/error, consulta por id y regreso al
  producto.
- **Persistencia** — recupera paso, cliente, entrega y `transactionId`; no
  recupera la tarjeta ni el CVC.
- **Repositorio HTTP** — mapeo de respuestas y de errores a errores de dominio.
- **Sistema de diseño y utilidades** — componentes de `shared/ui`, formato de
  dinero, mensajes de error y helpers de tarjeta.

---

## 14. Cobertura

Última ejecución de `npm run test:cov` — 14 suites, 57 pruebas, todas en verde:

| Métrica | Cobertura |
| --- | --- |
| Statements | 93.27 % (499/535) |
| Branches | 87.73 % (186/212) |
| Functions | 91.37 % (106/116) |
| Lines | 93.03 % (481/517) |

Por encima del 80 % exigido. Quedan fuera del cálculo los archivos sin lógica
propia: `main.tsx`, `App.tsx`, el router, el layout, la creación del store, la
lectura de `env` y las utilidades de prueba.

El reporte HTML se genera en `coverage/lcov-report/index.html`.

---

## 15. Despliegue

El proyecto es un SPA estático:

```bash
npm run build     # genera dist/
npm run preview   # verificación local del build
```

`dist/` puede publicarse en cualquier hosting estático (Vercel, Netlify, S3 +
CloudFront, Nginx). Dos requisitos:

1. **Fallback a `index.html`** para todas las rutas, ya que el ruteo es del lado
   del cliente (`createBrowserRouter`).
2. **Definir las variables `VITE_*` en el entorno de build**, no en tiempo de
   ejecución: Vite las inyecta durante la compilación. En particular
   `VITE_API_BASE_URL` debe apuntar al backend desplegado y este debe permitir
   por CORS el origen del frontend.

---

## 16. Uso de IA

Se usó asistencia de IA (Claude Code) como apoyo de desarrollo, a partir de las
especificaciones en `docs/agente_frontend_prueba_checkout.md` y
`docs/agente_backend_prueba_checkout.md`, para:

- Andamiaje de la estructura hexagonal y del sistema de diseño.
- Redacción de pruebas unitarias y de la documentación.
- Revisión de accesibilidad y de comportamiento responsive.

Las decisiones de arquitectura, el modelo de datos, el contrato con el backend y
la revisión final del código son propios. Todo el código generado fue leído,
ajustado y verificado con la suite de pruebas antes de integrarse.

---

## 17. Decisiones

- **Hexagonal en el frontend.** Aísla el flujo de checkout del transporte HTTP;
  cambiar Axios o el backend no toca páginas ni hooks, y las pruebas usan un
  doble del puerto en vez de mockear la librería.
- **Redux Toolkit con slices acotados.** El estado del checkout se comparte entre
  cuatro rutas y debe sobrevivir a una recarga; separar `payment` en su propio
  slice hace que excluir la tarjeta de la persistencia sea estructural y no un
  filtro que alguien pueda olvidar.
- **Persistencia manual en lugar de `redux-persist`.** El requisito es guardar un
  solo slice de datos no sensibles: 30 líneas explícitas son más auditables que
  una dependencia con listas de inclusión/exclusión.
- **Montos en centavos (enteros).** Evita errores de punto flotante; el formateo
  a moneda ocurre solo en la capa de presentación (`shared/utils/money`).
- **Idempotency-Key por montaje.** Un reintento tras un fallo de red reutiliza la
  misma clave, así que el backend puede deduplicar el cobro.
- **Tarifas en el `.env` solo para previsualizar.** El total lo calcula el
  backend; el frontend nunca decide cuánto se cobra.
- **Zod + React Hook Form.** El esquema de validación es una unidad testeable
  aparte de la UI (Luhn, vencimiento futuro, CVC, marca de la tarjeta).
- **Errores de dominio tipados.** Permiten mensajes comprensibles y reintentos
  sin exponer detalles técnicos de la respuesta.
- **Lazy loading por ruta.** El bundle inicial solo carga la página de producto,
  que es la entrada real del flujo.

---

## 18. Capturas

| Paso | Pantalla |
| --- | --- |
| 1 | Producto — catálogo, stock y selector de cantidad |
| 2 | Tarjeta y entrega — validaciones y detección de marca |
| 3 | Resumen — desglose de montos y tarjeta enmascarada |
| 4 | Resultado — estado, referencia y total |
| 5 | Producto — stock actualizado tras la compra |

> Pendiente: adjuntar las imágenes en `docs/screenshots/` y enlazarlas aquí.
