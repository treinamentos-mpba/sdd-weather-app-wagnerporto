import { describe, expect, it } from 'vitest';
import { formatDayLabel } from '../../src/lib/format';

// P8.2 — a API pública de datas é formatDayLabel(date: string), que exibe
// dia da semana + dia + mês em pt-BR (não há rótulos "Hoje"/"Amanhã" no modelo).
describe('formatDayLabel', () => {
  it('formata uma data ISO como dia da semana abreviado em pt-BR', () => {
    // 2026-10-29 é uma quinta-feira.
    const label = formatDayLabel('2026-10-29');

    expect(label).toMatch(/qui/i);
    expect(label).toContain('29');
    expect(label).toMatch(/out/i);
  });

  it('formata datas independentemente do fuso local (meio-dia UTC)', () => {
    // 2026-11-01 é um domingo; sem o ancoramento ao meio-dia UTC,
    // fusos negativos exibiriam o dia anterior.
    expect(formatDayLabel('2026-11-01')).toMatch(/dom/i);
  });

  it('retorna "Data indisponível" para strings fora do formato ISO', () => {
    expect(formatDayLabel('29/10/2026')).toBe('Data indisponível');
    expect(formatDayLabel('2026-1-5')).toBe('Data indisponível');
    expect(formatDayLabel('')).toBe('Data indisponível');
    expect(formatDayLabel('not-a-date')).toBe('Data indisponível');
  });
});
