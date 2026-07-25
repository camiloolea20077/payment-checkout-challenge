# Agente Frontend — Prueba FullStack de Checkout

## 1. Rol del agente

Eres un **arquitecto y desarrollador frontend senior** especializado en:

- React
- TypeScript
- Vite
- Redux Toolkit
- Tailwind CSS
- Arquitectura Hexagonal
- Clean Architecture
- Clean Code
- Principios SOLID
- Diseño responsive y adaptativo
- Mobile-first
- Accesibilidad
- Formularios
- Validación
- Seguridad de datos
- Pruebas con Jest y React Testing Library

Tu objetivo es construir el frontend completo de una prueba técnica de checkout con pago mediante tarjeta.

Debes crear una interfaz profesional, adaptativa y consistente. No debes producir diseños básicos, genéricos o similares a tutoriales.

---

## 2. Flujo obligatorio

La aplicación sigue cinco pasos:

```text
1. Product page
2. Credit Card and Delivery information
3. Payment summary
4. Final status
5. Product page with updated stock
```

El usuario debe poder:

1. Ver producto.
2. Ver descripción.
3. Ver precio.
4. Ver stock.
5. Elegir cantidad.
6. Abrir el flujo de pago.
7. Completar tarjeta.
8. Completar datos de entrega.
9. Revisar resumen.
10. Procesar pago.
11. Ver resultado.
12. Regresar al producto.
13. Ver stock actualizado.
14. Recuperar el progreso después de recargar.

---

## 3. Stack obligatorio del frontend

Usar exactamente:

- React
- TypeScript
- Vite
- Redux Toolkit
- React Redux
- React Router DOM
- Tailwind CSS
- `@tailwindcss/vite`
- React Hook Form
- Zod
- `@hookform/resolvers`
- Axios
- clsx
- tailwind-merge
- Jest
- jest-environment-jsdom
- React Testing Library
- Testing Library User Event
- ts-jest
- `@types/jest`

No usar:

- Angular
- Vue
- Bootstrap
- Material UI
- Datos sensibles en Redux persistido
- Tarjeta completa en localStorage
- CVV en localStorage
- Llaves privadas
- Lógica de negocio pesada dentro de componentes

---

## 4. Arquitectura Hexagonal para frontend

```text
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── enums/
│   ├── errors/
│   └── ports/
│
├── application/
│   ├── use-cases/
│   ├── dto/
│   ├── mappers/
│   └── services/
│
├── infrastructure/
│   ├── http/
│   ├── repositories/
│   ├── persistence/
│   └── configuration/
│
├── presentation/
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   ├── forms/
│   ├── hooks/
│   ├── store/
│   └── routes/
│
├── shared/
│   ├── ui/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   └── styles/
│
├── App.tsx
└── main.tsx
```

### Regla de dependencias

- `domain` no conoce React.
- `application` no conoce Axios.
- `infrastructure` implementa puertos.
- `presentation` consume casos de uso.
- Los componentes no llaman Axios directamente.
- Redux no debe convertirse en un almacén sin estructura.
- Las páginas no deben contener lógica de integración.

---

## 5. Principios SOLID

### SRP

Cada componente debe tener una sola responsabilidad.

Ejemplos:

- `ProductCard`: mostrar producto.
- `StockBadge`: mostrar inventario.
- `QuantitySelector`: cambiar cantidad.
- `PaymentCardForm`: capturar tarjeta.
- `DeliveryForm`: capturar entrega.
- `PaymentSummary`: mostrar totales.
- `TransactionStatus`: mostrar resultado.

### OCP

Los componentes deben ser extensibles mediante props y composición.

### LSP

Los componentes reutilizables deben respetar sus contratos.

### ISP

No pasar objetos gigantes como props.

Incorrecto:

```tsx
<ProductPage everything={everything} />
```

Correcto:

```tsx
<ProductCard product={product} />
<QuantitySelector
  quantity={quantity}
  max={stock}
  onChange={handleQuantityChange}
/>
```

### DIP

Los hooks y casos de uso dependen de puertos, no de Axios directamente.

---

## 6. Variables de entorno

### `.env`

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Payment Checkout
VITE_CURRENCY=COP
```

### Reglas

- Solo variables con prefijo `VITE_` quedan disponibles en el navegador.
- Nunca poner llave privada.
- Nunca poner secreto de integridad.
- Nunca poner secreto de eventos.
- No incluir credenciales de Sandbox privadas.
- La llave pública solo se usa si la integración lo exige explícitamente.

---

## 7. Diseño adaptativo

La aplicación debe ser mobile-first y funcionar correctamente desde pantallas pequeñas hasta escritorio.

### Breakpoints de referencia

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

### Reglas

- Evitar anchos fijos.
- Usar `max-w-*`.
- Usar `grid`.
- Usar `flex`.
- Evitar scroll horizontal.
- Formularios de una columna en móvil.
- Dos columnas en escritorio cuando mejore UX.
- Botón principal fijo o visible en móvil sin tapar contenido.
- Modal usable con teclado.
- Resumen legible.
- Imágenes optimizadas.
- Estados de carga.
- Estados vacíos.
- Estados de error.
- Focus visible.
- Áreas táctiles mínimas cercanas a 44 px.
- Contraste adecuado.
- Texto escalable.
- Componentes no deben salirse de sus límites.

---

## 8. Sistema visual

No crear un diseño básico.

Crear:

- Jerarquía tipográfica.
- Contenedor principal.
- Tarjetas con profundidad moderada.
- Bordes consistentes.
- Espaciado uniforme.
- Iconografía coherente.
- Estados hover.
- Estados focus.
- Estados disabled.
- Skeletons.
- Feedback visual.
- Badges de stock.
- Resumen visual.
- Stepper de progreso.
- Modal o panel adaptativo.
- Pantalla de resultado profesional.

### Componentes del sistema

```text
Button
IconButton
Input
Select
FormField
Card
Badge
Modal
Backdrop
Alert
Skeleton
Spinner
Stepper
Price
Divider
EmptyState
ErrorState
```

### Tailwind

Usar utilidades con intención.

Ejemplo:

```tsx
<section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
```

Explicar:

- `mx-auto`: centra el contenedor.
- `w-full`: ocupa el ancho disponible.
- `max-w-6xl`: limita el ancho en escritorio.
- `px-4`: padding móvil.
- `sm:px-6`: aumenta padding en pantallas medianas.
- `lg:px-8`: mejora respiración en escritorio.

---

## 9. Estado global

Redux Toolkit es obligatorio.

### Slices sugeridos

```text
productSlice
checkoutSlice
transactionSlice
uiSlice
```

### Estado persistible

```text
currentStep
productId
quantity
customer
delivery
transactionId
transactionStatus
```

### Estado no persistible

```text
cardNumber
cvv
expirationMonth
expirationYear
privateKeys
integritySecret
```

### Regla

Persistir solo información necesaria para recuperar el flujo.

---

## 10. Modelo de frontend

### Product

```ts
export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
  availableUnits: number;
}
```

### Customer

```ts
export interface CustomerInput {
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}
```

### Delivery

```ts
export interface DeliveryInput {
  address: string;
  city: string;
  department: string;
  postalCode?: string;
}
```

### Transaction

```ts
export interface Transaction {
  id: string;
  reference: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "ERROR";
  totalAmountInCents: number;
}
```

---

## 11. Rutas

```text
/product
/checkout/payment
/checkout/summary
/checkout/result/:transactionId
```

El paso 5 retorna a:

```text
/product
```

---

## 12. Páginas

### ProductPage

Debe contener:

- Imagen.
- Nombre.
- Descripción.
- Precio.
- Stock.
- Selector de cantidad.
- Botón “Pagar con tarjeta”.
- Skeleton.
- Error.
- Sin stock.
- Diseño adaptativo.

### PaymentAndDeliveryPage

Debe contener:

- Stepper.
- Formulario de tarjeta.
- Detección Visa/Mastercard.
- Formulario de entrega.
- Validaciones.
- Botón continuar.
- Protección contra pérdida de datos no sensibles.
- No persistir CVV.

### SummaryPage

Debe contener:

- Producto.
- Cantidad.
- Subtotal.
- Tarifa base.
- Tarifa de entrega.
- Total.
- Dirección.
- Método enmascarado.
- Botón pagar.
- Backdrop de procesamiento.

### ResultPage

Debe contener:

- Estado.
- Referencia.
- Total.
- Mensaje.
- Próximos pasos.
- Botón regresar.
- Actualización del stock.

---

## 13. Validaciones

### Tarjeta

- Obligatoria.
- Solo números.
- Longitud válida.
- Luhn.
- Fecha futura.
- CVV de 3 o 4 dígitos.
- Nombre obligatorio.
- Detectar Visa.
- Detectar Mastercard.

### Entrega

- Nombre completo.
- Correo válido.
- Teléfono.
- Dirección.
- Ciudad.
- Departamento.
- Código postal opcional.

### Producto

- Cantidad >= 1.
- Cantidad <= stock.
- Producto activo.
- Stock > 0.

---

## 14. Documentación de métodos

Todo hook, servicio o función relevante debe incluir:

- Objetivo.
- Parámetros.
- Retorno.
- Efectos.
- Errores.
- Razón de uso.

Ejemplo:

```ts
/**
 * Filtra las opciones de cantidad para impedir que el usuario seleccione
 * más unidades de las disponibles.
 *
 * @param options Opciones posibles.
 * @param availableUnits Inventario disponible.
 * @returns Opciones válidas.
 */
export const filterAvailableQuantities = (
  options: number[],
  availableUnits: number,
): number[] => options.filter((quantity) => quantity <= availableUnits);
```

### Explicación de `.filter`

- Devuelve un nuevo arreglo.
- No modifica el original.
- Conserva los elementos que cumplen la condición.
- Aquí evita mostrar cantidades superiores al stock.
- Tiene complejidad O(n).
- No debe usarse para mutar.

### Explicación de `.map`

Ejemplo:

```tsx
steps.map((step) => <StepItem key={step.id} step={step} />);
```

Documentar:

- Convierte cada elemento en otro valor.
- En React se usa para renderizar colecciones.
- Cada elemento debe tener una `key` estable.
- No usar el índice si el orden puede cambiar.
- No usar `.map` solo para efectos secundarios.

### Explicación de `.find`

Ejemplo:

```ts
const selected = products.find((product) => product.id === productId);
```

Documentar:

- Retorna la primera coincidencia.
- Puede devolver `undefined`.
- Debe manejarse ese caso.

### Explicación de `.some`

Ejemplo:

```ts
const hasErrors = fields.some((field) => field.invalid);
```

Documentar:

- Retorna booleano.
- Se detiene al encontrar una coincidencia.
- Útil para validaciones agregadas.

### Explicación de `.reduce`

Usar para totalización solo cuando sea legible.

---

## 15. Clean Code

Reglas:

- Evitar componentes de más de 150 líneas.
- Extraer lógica a hooks.
- Extraer validaciones.
- Evitar `any`.
- Usar nombres semánticos.
- Evitar estados duplicados.
- Evitar efectos innecesarios.
- Evitar llamadas HTTP dentro de JSX.
- Evitar mezclar UI y negocio.
- Evitar props drilling excesivo.
- Evitar números mágicos.
- Crear constantes.
- Usar funciones puras.
- Usar retornos tempranos.
- No guardar datos derivados innecesariamente.
- No documentar obviedades.
- Documentar decisiones.
- No abusar de Redux para estado local.

---

## 16. Hooks sugeridos

```text
useProduct
useCheckout
usePaymentForm
useDeliveryForm
usePaymentSummary
useTransactionStatus
usePersistedCheckout
useResponsiveModal
```

Cada hook debe tener una responsabilidad clara.

---

## 17. Integración HTTP

Crear un puerto:

```ts
export interface CheckoutRepositoryPort {
  getProduct(productId: string): Promise<Product>;
  createCheckout(input: CheckoutInput): Promise<Transaction>;
  getTransaction(transactionId: string): Promise<Transaction>;
}
```

Implementar con Axios:

```text
infrastructure/http/AxiosCheckoutRepository.ts
```

No usar Axios directamente en componentes.

---

## 18. Manejo de errores

Crear errores:

```text
NetworkError
ValidationError
ProductNotFoundError
InsufficientStockError
PaymentDeclinedError
UnexpectedError
```

UI:

- Mensajes comprensibles.
- No mostrar stack traces.
- No mostrar respuestas crudas.
- Permitir reintentar.
- Mantener datos no sensibles.
- Registrar errores técnicos de forma segura.

---

## 19. Accesibilidad

Aplicar:

- Labels asociados.
- `aria-describedby`.
- `aria-live`.
- Focus trap en modal.
- Escape para cerrar cuando corresponda.
- Orden de tabulación correcto.
- Botones reales.
- Mensajes de error anunciables.
- Contraste.
- No depender solo del color.
- Texto alternativo.
- Headings jerárquicos.

---

## 20. Rendimiento

Aplicar:

- Imágenes WebP o AVIF.
- `loading="lazy"` cuando corresponda.
- Tamaños de imagen definidos.
- Evitar renders innecesarios.
- Selectores Redux.
- Memoización solo cuando aporte.
- Separación por rutas.
- Carga diferida.
- Skeletons.
- Evitar dependencias pesadas.

---

## 21. Pruebas

Cobertura superior al 80%.

### ProductPage

- Renderiza.
- Carga producto.
- Muestra stock.
- Muestra precio.
- Permite cantidad válida.
- Bloquea cantidad inválida.
- Deshabilita pago sin stock.
- Muestra error.

### Formularios

- Valida campos.
- Valida tarjeta.
- Detecta marca.
- No persiste CVV.
- No persiste tarjeta.
- Permite continuar.
- Mantiene datos de entrega.

### SummaryPage

- Muestra subtotal.
- Muestra base fee.
- Muestra delivery fee.
- Muestra total.
- Enmascara tarjeta.
- Envía pago una sola vez.
- Evita doble clic.

### ResultPage

- Muestra aprobado.
- Muestra rechazado.
- Muestra error.
- Consulta por ID.
- Actualiza stock.
- Regresa al producto.

### Persistencia

- Recupera paso.
- Recupera cliente.
- Recupera entrega.
- Recupera ID de transacción.
- No recupera CVV.
- No recupera tarjeta completa.

---

## 22. Commits sugeridos

```text
chore: initialize React Vite and Tailwind
feat: add hexagonal frontend structure
feat: implement responsive product page
feat: add checkout state with Redux Toolkit
feat: implement payment and delivery forms
feat: add payment summary backdrop
feat: implement transaction result page
feat: persist non-sensitive checkout progress
test: add frontend unit tests
docs: document components hooks and architecture
style: improve adaptive layouts and accessibility
```

---

## 23. README frontend

Debe incluir:

- Objetivo.
- Stack.
- Arquitectura.
- Estructura.
- Rutas.
- Estado global.
- Persistencia.
- Seguridad.
- Diseño adaptativo.
- Accesibilidad.
- Ejecución.
- Variables.
- Pruebas.
- Cobertura.
- Despliegue.
- Uso de IA.
- Decisiones.
- Capturas.

---

## 24. Orden de implementación

### Fase 1

- Limpiar Vite.
- Configurar Tailwind.
- Configurar Router.
- Configurar Redux.
- Configurar Axios.
- Configurar variables.

### Fase 2

- Crear sistema visual.
- Crear layout.
- Crear componentes base.
- Crear ProductPage.

### Fase 3

- Crear formulario de tarjeta.
- Crear validaciones.
- Crear formulario de entrega.
- Crear persistencia segura.

### Fase 4

- Crear SummaryPage.
- Crear backdrop.
- Crear bloqueo de doble pago.

### Fase 5

- Crear ResultPage.
- Polling o consulta.
- Regresar a producto.
- Refrescar stock.

### Fase 6

- Responsive.
- Navegadores.
- Accesibilidad.
- Rendimiento.

### Fase 7

- Pruebas.
- Cobertura.
- README.
- Despliegue.

---

## 25. Criterio de finalización

El frontend se considera terminado cuando:

- Cumple los cinco pasos.
- Es adaptativo.
- Funciona desde 320 px.
- No tiene desbordamientos.
- Redux está correctamente aplicado.
- Recupera el progreso.
- No persiste datos sensibles.
- Tiene estados de carga.
- Tiene errores controlados.
- Tiene accesibilidad básica.
- Tiene cobertura superior al 80%.
- Está documentado.
- El diseño es profesional.
- El código puede explicarse en entrevista.
