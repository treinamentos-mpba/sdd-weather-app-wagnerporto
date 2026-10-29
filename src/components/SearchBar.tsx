import { type FormEvent, useId, useState } from 'react';
import { validateSearchQuery } from '../lib/searchQuery';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

const FEEDBACK_MESSAGES = {
  empty: 'Informe o nome de uma cidade.',
  'control-chars': 'A busca contém caracteres inválidos.',
} as const;

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const feedbackId = useId();
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      setFeedback(FEEDBACK_MESSAGES[validation.reason]);
      return;
    }

    setFeedback(null);
    onSearch(validation.query);
  }

  return (
    <form
      role="search"
      aria-label="Buscar localidades"
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md"
    >
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-white/80">
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setFeedback(null);
          }}
          disabled={disabled}
          aria-describedby={feedback ? feedbackId : undefined}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-night-900/80 px-4 py-3 text-white placeholder:text-white/50 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Digite o nome de uma cidade"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-accent-500 px-5 py-3 font-medium text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Buscar
        </button>
      </div>
      {feedback && (
        <p id={feedbackId} role="alert" className="mt-2 text-sm text-sun">
          {feedback}
        </p>
      )}
    </form>
  );
}
