import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function formatProbability(value: number | null): string {
  return value === null || !Number.isFinite(value) ? 'Indisponível' : `${value}%`;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const dayLabel = formatDayLabel(day.date);
  const condition = getWeatherCondition(day.weatherCode);

  return (
    <article
      aria-label={`Previsão para ${dayLabel}`}
      className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md"
    >
      <h3 className="truncate text-sm font-semibold capitalize text-white">{dayLabel}</h3>
      <div className="mt-4 flex items-center gap-2">
        <span aria-hidden="true" className="text-3xl leading-none">
          {condition.icon}
        </span>
        <p className="min-w-0 text-xs text-white/70">{condition.label}</p>
      </div>
      <dl className="mt-4 space-y-2 border-t border-white/10 pt-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-white/60">Máx.</dt>
          <dd className="font-medium text-white">
            {formatTemperature(day.maximumTemperatureC, unit)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-white/60">Mín.</dt>
          <dd className="font-medium text-white">
            {formatTemperature(day.minimumTemperatureC, unit)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-white/60">Chuva</dt>
          <dd className="font-medium text-white">
            {formatProbability(day.maximumPrecipitationProbabilityPercent)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
