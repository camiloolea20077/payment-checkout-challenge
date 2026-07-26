import { LOW_STOCK_THRESHOLD } from '../../../shared/constants/product';
import { Badge } from '../../../shared/ui/badge';

interface StockBadgeProps {
  availableUnits: number;
}

/**
 * Muestra el estado del inventario con color + texto (no solo color).
 *
 * @param availableUnits - Unidades disponibles del producto.
 */
export function StockBadge({ availableUnits }: StockBadgeProps) {
  if (availableUnits <= 0) {
    return <Badge tone="danger">Agotado</Badge>;
  }
  if (availableUnits <= LOW_STOCK_THRESHOLD) {
    return <Badge tone="warning">Últimas {availableUnits} unidades</Badge>;
  }
  return <Badge tone="success">{availableUnits} disponibles</Badge>;
}
