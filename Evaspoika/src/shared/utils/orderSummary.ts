import { OrderLine } from '@/src/features/orderLines/domain/types';
import { formatKg } from '@/src/shared/utils/weight';

const FALLBACK_LABEL = 'Tuntematon tuote';

const getProductLabel = (line: OrderLine) =>
  line.Batch?.Product?.name?.trim() ||
  (line.Batch?.batch_number ? `Erä ${line.Batch.batch_number}` : FALLBACK_LABEL);

export function buildOrderLineSummary(
  orderLines?: OrderLine[] | null,
  maxItems = 2,
) {
  const totalsByProduct = new Map<string, number>();

  (orderLines ?? [])
    .filter((line) => !line.deleted_at)
    .forEach((line) => {
      const label = getProductLabel(line);
      totalsByProduct.set(label, (totalsByProduct.get(label) ?? 0) + line.sold_weight);
    });

  const items = [...totalsByProduct.entries()].sort(
    ([leftName, leftWeight], [rightName, rightWeight]) =>
      rightWeight - leftWeight || leftName.localeCompare(rightName, 'fi'),
  );

  if (items.length === 0) {
    return 'Ei tuotteita vielä.';
  }

  const visible = items
    .slice(0, Math.max(1, maxItems))
    .map(([name, weight]) => `${name} ${formatKg(weight)} kg`);

  const remaining = items.length - visible.length;

  return remaining > 0
    ? `${visible.join(', ')} + ${remaining} muuta`
    : visible.join(', ');
}
