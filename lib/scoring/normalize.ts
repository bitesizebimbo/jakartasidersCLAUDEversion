/** Clamp a value to the [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Linearly map a value from [inMin, inMax] to [0, 100], clamped at both ends. */
export function normalizeLinear(
  value: number,
  inMin: number,
  inMax: number
): number {
  if (inMax <= inMin) return 0;
  const ratio = (value - inMin) / (inMax - inMin);
  return clamp(ratio * 100, 0, 100);
}

/**
 * Map a value using a logarithmic curve, useful for counts that grow with
 * diminishing significance (view counts, mention counts).
 */
export function normalizeLog(value: number, cap: number): number {
  if (value <= 0) return 0;
  const scaled = Math.log1p(value) / Math.log1p(cap);
  return clamp(scaled * 100, 0, 100);
}

/** Percentage change from `previous` to `current`, guarding division by zero. */
export function percentChange(current: number, previous: number): number {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

export function round(value: number): number {
  return Math.round(value);
}
