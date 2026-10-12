export function parseRates(data: unknown): { rates: Record<string, number>; date: string } {
  if (!data || typeof data !== 'object') throw new Error('Invalid rate response');
  const value = data as Record<string, unknown>;
  if (value.base !== 'USD' || typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date) || !Number.isFinite(Date.parse(value.date)) || new Date(value.date as string).toISOString().slice(0, 10) !== value.date) throw new Error('Missing rate base or date');
  if (!value.rates || typeof value.rates !== 'object') throw new Error('Missing rates');
  const rates: Record<string, number> = {};
  for (const [code, rate] of Object.entries(value.rates)) {
    if (/^[A-Z]{3}$/.test(code) && typeof rate === 'number' && Number.isFinite(rate) && rate > 0) rates[code] = rate;
  }
  if (rates.USD !== 1) throw new Error('Invalid USD base rate');
  return { rates, date: value.date };
}
export function convertAmount(amount: string, from: string, to: string, rates: Record<string, number> | null): number | null {
  if (!amount.trim() || !rates) return null;
  const number = Number(amount);
  const source = rates[from], target = rates[to];
  if (!Number.isFinite(number) || number < 0 || !Number.isFinite(source) || source <= 0 || !Number.isFinite(target) || target <= 0) return null;
  const result = number / source * target;
  return Number.isFinite(result) ? result : null;
}
