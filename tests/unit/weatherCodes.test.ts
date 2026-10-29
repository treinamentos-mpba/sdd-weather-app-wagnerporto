import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('retorna rótulo e ícone para um código WMO conhecido', () => {
    expect(getWeatherCondition(0)).toEqual({ label: 'Céu limpo', icon: '☀️' });
    expect(getWeatherCondition(61)).toEqual({ label: 'Chuva', icon: '🌧️' });
    expect(getWeatherCondition(95)).toEqual({ label: 'Trovoada', icon: '⛈️' });
  });

  it('usa fallback de indisponível para código desconhecido', () => {
    expect(getWeatherCondition(42)).toEqual({ label: 'Condição indisponível', icon: '—' });
  });

  it('usa fallback para null e valores não finitos', () => {
    expect(getWeatherCondition(null)).toEqual({ label: 'Condição indisponível', icon: '—' });
    expect(getWeatherCondition(Number.NaN)).toEqual({
      label: 'Condição indisponível',
      icon: '—',
    });
  });
});
