import { describe, expect, it } from 'vitest';
import { formatTemperature } from '../../src/lib/temperature';

// P8.1 — a API pública de conversão é formatTemperature(valueC, unit):
// converte, arredonda e anexa o símbolo em uma única função pura.
describe('formatTemperature', () => {
  describe('conversão celsius → fahrenheit', () => {
    it('converte 0 °C para 32 °F', () => {
      expect(formatTemperature(0, 'fahrenheit')).toBe('32 °F');
    });

    it('converte 100 °C para 212 °F', () => {
      expect(formatTemperature(100, 'fahrenheit')).toBe('212 °F');
    });

    it('converte -40 °C para -40 °F (ponto de encontro das escalas)', () => {
      expect(formatTemperature(-40, 'fahrenheit')).toBe('-40 °F');
    });
  });

  describe('exibição por unidade', () => {
    it('mantém o valor em celsius sem reconversão', () => {
      expect(formatTemperature(25, 'celsius')).toBe('25 °C');
    });

    it('usa o símbolo °C para celsius e °F para fahrenheit', () => {
      expect(formatTemperature(10, 'celsius')).toContain('°C');
      expect(formatTemperature(10, 'fahrenheit')).toContain('°F');
    });
  });

  describe('arredondamento', () => {
    it('arredonda celsius para o inteiro mais próximo', () => {
      expect(formatTemperature(21.4, 'celsius')).toBe('21 °C');
      expect(formatTemperature(21.6, 'celsius')).toBe('22 °C');
    });

    it('arredonda fahrenheit após a conversão, sem acumular arredondamentos', () => {
      // 20.1 °C → 68.18 °F → 68 °F (converte primeiro, arredonda depois)
      expect(formatTemperature(20.1, 'fahrenheit')).toBe('68 °F');
      // 18.9 °C → 66.02 °F → 66 °F
      expect(formatTemperature(18.9, 'fahrenheit')).toBe('66 °F');
    });
  });

  describe('valores indisponíveis', () => {
    it('retorna "Indisponível" para null em qualquer unidade', () => {
      expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
      expect(formatTemperature(null, 'fahrenheit')).toBe('Indisponível');
    });

    it('retorna "Indisponível" para valores não finitos', () => {
      expect(formatTemperature(Number.NaN, 'celsius')).toBe('Indisponível');
      expect(formatTemperature(Number.POSITIVE_INFINITY, 'fahrenheit')).toBe('Indisponível');
    });
  });
});
