import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData | null;
  unit: Unit;
}

function formatMetric(value: number | null | undefined, suffix: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  return `${value} ${suffix}`;
}

// Data inválida ou fuso desconhecido não podem derrubar a renderização (AC-05.5).
function formatObservedTime(observedAt: string, timezone: string | null): string | null {
  const date = new Date(observedAt);
  if (Number.isNaN(date.getTime())) return null;

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone ?? undefined,
    }).format(date);
  } catch {
    return null;
  }
}

function availabilityMessage(current: CurrentWeatherData | null): string | null {
  if (current === null) return 'Condições atuais indisponíveis.';
  if (current.freshness !== 'current') return 'Dados atuais desatualizados ou indisponíveis.';
  return null;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const titleId = useId();
  const condition = getWeatherCondition(current?.weatherCode ?? null);
  const observedTime = current?.observedAt
    ? formatObservedTime(current.observedAt, city.timezone)
    : null;
  const freshnessMessage = availabilityMessage(current);
  const locationDetails = [city.admin1, city.country].filter(Boolean).join(', ');

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-6"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold text-white">
            Clima em {city.name}
          </h2>
          {locationDetails && <p className="mt-1 text-sm text-white/60">{locationDetails}</p>}
          <p className="mt-4 text-sm text-white/80">{condition.label}</p>
          {observedTime && (
            <p className="mt-1 text-sm text-white/60">
              Observado às <time dateTime={current?.observedAt ?? undefined}>{observedTime}</time>
            </p>
          )}
          {freshnessMessage && (
            <p role="status" className="mt-3 text-sm text-sun">
              {freshnessMessage}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 sm:shrink-0">
          <span aria-hidden="true" className="text-5xl leading-none sm:text-6xl">
            {condition.icon}
          </span>
          <p className="text-5xl font-semibold leading-none text-white sm:text-6xl">
            {formatTemperature(current?.temperatureC ?? null, unit)}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-white/60">Umidade</dt>
          <dd className="mt-1 font-medium text-white">
            {formatMetric(current?.relativeHumidityPercent, '%')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Vento</dt>
          <dd className="mt-1 font-medium text-white">
            {formatMetric(current?.windSpeedKmh, 'km/h')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Precipitação</dt>
          <dd className="mt-1 font-medium text-white">
            {formatMetric(current?.precipitationMm, 'mm')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Pressão</dt>
          <dd className="mt-1 font-medium text-white">
            {formatMetric(current?.pressureHPa, 'hPa')}
          </dd>
        </div>
      </dl>
    </section>
  );
}
