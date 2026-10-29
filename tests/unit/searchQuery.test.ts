import { describe, expect, it } from 'vitest';
import { validateSearchQuery } from '../../src/lib/searchQuery';

describe('validateSearchQuery', () => {
  it('remove espaços externos e preserva acentos e hífen (AC-01.1)', () => {
    expect(validateSearchQuery('  Foz do Iguaçu  ')).toEqual({
      valid: true,
      query: 'Foz do Iguaçu',
    });
    expect(validateSearchQuery('Entre-Rios')).toEqual({ valid: true, query: 'Entre-Rios' });
  });

  it('normaliza Unicode em NFC', () => {
    // 'São' composto por 'a' + combining tilde (NFD) vira a forma composta.
    const decomposed = 'Sa\u0303o Paulo';

    expect(validateSearchQuery(decomposed)).toEqual({ valid: true, query: 'São Paulo' });
  });

  it('rejeita campo vazio ou só de espaços (AC-01.3)', () => {
    expect(validateSearchQuery('')).toEqual({ valid: false, reason: 'empty' });
    expect(validateSearchQuery('   ')).toEqual({ valid: false, reason: 'empty' });
  });

  it('rejeita caracteres Unicode de controle (AC-01.6)', () => {
    expect(validateSearchQuery('São\u0007Paulo')).toEqual({
      valid: false,
      reason: 'control-chars',
    });
    expect(validateSearchQuery('Rec\u0000ife')).toEqual({
      valid: false,
      reason: 'control-chars',
    });
  });
});
