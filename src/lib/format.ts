export function formatDayLabel(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return 'Data indisponível';

  const [, year, month, day] = match;
  const localDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(localDate);
}
