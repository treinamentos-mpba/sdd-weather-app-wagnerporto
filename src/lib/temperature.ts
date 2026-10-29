import type { Unit } from '../types/weather';

export function formatTemperature(valueC: number | null, unit: Unit): string {
  if (valueC === null || !Number.isFinite(valueC)) return 'Indisponível';

  const value = unit === 'fahrenheit' ? Math.round((valueC * 9) / 5 + 32) : Math.round(valueC);
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';

  return `${value} ${symbol}`;
}
