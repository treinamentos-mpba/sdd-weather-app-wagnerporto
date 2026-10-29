interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section
      role="status"
      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center shadow-glass backdrop-blur-md sm:px-10"
    >
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">{hint}</p>
    </section>
  );
}
