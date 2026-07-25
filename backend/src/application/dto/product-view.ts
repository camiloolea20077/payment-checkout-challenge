/**
 * Vista de lectura de un producto para exponer al cliente.
 *
 * Es un modelo plano de la capa de aplicación: no expone entidades de dominio
 * ni tipos de Prisma, e incluye las unidades disponibles que el frontend
 * necesita para mostrar el producto.
 */
export interface ProductView {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  imageUrl: string;
  isActive: boolean;
  availableUnits: number;
}
