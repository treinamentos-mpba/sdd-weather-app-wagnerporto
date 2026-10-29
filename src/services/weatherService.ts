import type { AppError, City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_CITY_RESULTS = 5;
const FORECAST_DAYS = 5;

// Janela de atualidade dos dados atuais (AC-05.4): até 3 h no passado e 5 min no futuro.
const FRESHNESS_PAST_LIMIT_MS = 3 * 60 * 60 * 1000;
const FRESHNESS_FUTURE_LIMIT_MS = 5 * 60 * 1000;

export class WeatherServiceError extends Error {
  readonly kind: AppError['kind'];
  readonly retryable: boolean;

  constructor(message: string, kind: AppError['kind'], retryable = true) {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
    this.retryable = retryable;
  }
}

// DOMException não herda de Error em todos os ambientes (realms distintos em
// jsdom/browsers), então o abort é detectado pelo name, não por instanceof.
function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw new WeatherServiceError('A requisição demorou demais.', 'timeout');
    }
    throw new WeatherServiceError('Falha de rede.', 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new WeatherServiceError('Resposta inválida do serviço.', 'invalid-response');
  }
}

function toFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

function mapCity(result: Record<string, unknown>): City | null {
  const latitude = toFiniteNumber(result.latitude);
  const longitude = toFiniteNumber(result.longitude);
  const name = toNullableString(result.name);

  if (latitude === null || longitude === null || name === null) return null;

  return {
    id: toFiniteNumber(result.id) ?? undefined,
    name,
    admin1: toNullableString(result.admin1),
    country: toNullableString(result.country),
    latitude,
    longitude,
    timezone: toNullableString(result.timezone),
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (query === '') return [];

  const url =
    `${GEOCODING_URL}?name=${encodeURIComponent(query)}` +
    `&count=${MAX_CITY_RESULTS}&language=pt&format=json`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new WeatherServiceError(`Erro ao buscar cidades (HTTP ${response.status}).`, 'http');
  }

  const payload = (await parseJson(response)) as { results?: unknown };
  const results = Array.isArray(payload.results) ? payload.results : [];

  return results
    .slice(0, MAX_CITY_RESULTS)
    .map((result) => mapCity(result as Record<string, unknown>))
    .filter((city): city is City => city !== null);
}

function computeFreshness(
  observedAt: string | null,
  utcOffsetSeconds: number | null,
  fetchedAtMs: number,
): CurrentWeather['freshness'] {
  if (observedAt === null) return 'unavailable';

  // current.time é horário local: normaliza para UTC com o offset da resposta.
  const parsedAsUtc = Date.parse(`${observedAt}Z`);
  if (Number.isNaN(parsedAsUtc)) return 'unavailable';

  const observedUtcMs = parsedAsUtc - (utcOffsetSeconds ?? 0) * 1000;
  const isWithinWindow =
    observedUtcMs >= fetchedAtMs - FRESHNESS_PAST_LIMIT_MS &&
    observedUtcMs <= fetchedAtMs + FRESHNESS_FUTURE_LIMIT_MS;

  return isWithinWindow ? 'current' : 'stale';
}

function mapCurrentWeather(
  current: Record<string, unknown>,
  utcOffsetSeconds: number | null,
  fetchedAtMs: number,
): CurrentWeather {
  const observedAt = toNullableString(current.time);

  return {
    temperatureC: toFiniteNumber(current.temperature_2m),
    apparentTemperatureC: toFiniteNumber(current.apparent_temperature),
    relativeHumidityPercent: toFiniteNumber(current.relative_humidity_2m),
    windSpeedKmh: toFiniteNumber(current.wind_speed_10m),
    weatherCode: toFiniteNumber(current.weather_code),
    observedAt,
    freshness: computeFreshness(observedAt, utcOffsetSeconds, fetchedAtMs),
  };
}

function mapForecast(daily: Record<string, unknown>): ForecastDay[] {
  const dates = Array.isArray(daily.time) ? daily.time : [];
  const weatherCodes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const minimums = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
  const maximums = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  const precipitationProbabilities = Array.isArray(daily.precipitation_probability_max)
    ? daily.precipitation_probability_max
    : [];

  return dates.slice(0, FORECAST_DAYS).map((date, index) => ({
    date: typeof date === 'string' ? date : '',
    weatherCode: toFiniteNumber(weatherCodes[index]),
    minimumTemperatureC: toFiniteNumber(minimums[index]),
    maximumTemperatureC: toFiniteNumber(maximums[index]),
    maximumPrecipitationProbabilityPercent: toFiniteNumber(precipitationProbabilities[index]),
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: String(FORECAST_DAYS),
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new WeatherServiceError(`Erro ao buscar a previsão (HTTP ${response.status}).`, 'http');
  }

  const payload = (await parseJson(response)) as Record<string, unknown>;
  const current = payload.current;
  const daily = payload.daily;

  if (
    typeof current !== 'object' ||
    current === null ||
    typeof daily !== 'object' ||
    daily === null
  ) {
    throw new WeatherServiceError(
      'Resposta incompleta do serviço de previsão.',
      'invalid-response',
    );
  }

  const fetchedAtMs = Date.now();
  const utcOffsetSeconds = toFiniteNumber(payload.utc_offset_seconds);

  return {
    city,
    current: mapCurrentWeather(current as Record<string, unknown>, utcOffsetSeconds, fetchedAtMs),
    forecast: mapForecast(daily as Record<string, unknown>),
    timezone: toNullableString(payload.timezone) ?? city.timezone ?? 'UTC',
    fetchedAt: new Date(fetchedAtMs).toISOString(),
  };
}
