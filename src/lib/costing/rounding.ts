const DEFAULT_QUANTITY_DECIMALS = 8;
const DEFAULT_MONEY_DECIMALS = 2;

function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Cannot round non-finite numeric value: ${value}`);
  }

  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Preserve useful engineering quantity precision while removing binary
 * floating-point residue before quantities are exposed in traceable results.
 */
export function roundQuantity(
  value: number,
  decimals = DEFAULT_QUANTITY_DECIMALS
): number {
  return roundTo(value, decimals);
}

/**
 * RPE sample costing currently uses conventional two-decimal currency values.
 * Currency arithmetic is rounded at traceable line-item/subtotal boundaries so
 * displayed totals can be reproduced exactly from displayed components.
 */
export function roundMoney(value: number): number {
  return roundTo(value, DEFAULT_MONEY_DECIMALS);
}
