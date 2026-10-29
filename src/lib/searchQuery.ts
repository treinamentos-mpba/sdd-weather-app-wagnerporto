export type SearchQueryValidation =
  | { valid: true; query: string }
  | { valid: false; reason: 'empty' | 'control-chars' };

// Caracteres Unicode de controle (categoria Cc) são rejeitados antes da API (AC-01.6).
const CONTROL_CHARS = /\p{Cc}/u;

/**
 * Normaliza (NFC + trim) e valida o termo de busca (AC-01.1, AC-01.3, AC-01.6).
 * Acentos, hífens e demais caracteres do nome são preservados.
 */
export function validateSearchQuery(raw: string): SearchQueryValidation {
  const query = raw.normalize('NFC').trim();

  if (CONTROL_CHARS.test(query)) return { valid: false, reason: 'control-chars' };
  if (query === '') return { valid: false, reason: 'empty' };

  return { valid: true, query };
}
