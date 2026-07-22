export function formatMoney(amount: number, symbol: string, opts?: { compact?: boolean }): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (opts?.compact && abs >= 1000) {
    return `${sign}${symbol}${(abs / 1000).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}k`;
  }
  return `${sign}${symbol}${abs.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: abs % 1 === 0 ? 0 : 2,
  })}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function percent(n: number): string {
  return `${Math.round(clamp(n, 0, 1) * 100)}%`;
}
