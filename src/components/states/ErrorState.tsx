interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="rounded-2xl border border-red-300/20 bg-red-400/5 p-6 text-center shadow-glass backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">Não foi possível carregar</h2>
      <p role="alert" className="mt-2 text-sm text-white/70">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-lg bg-accent-500 px-5 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </section>
  );
}
