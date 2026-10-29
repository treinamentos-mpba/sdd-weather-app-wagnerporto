import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

function mockJsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const geocodingPayload = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      admin1: 'São Paulo',
      country: 'Brasil',
      country_code: 'BR',
      latitude: -23.55,
      longitude: -46.63,
      timezone: 'America/Sao_Paulo',
    },
    { id: 7, name: 'São Paulo de Olivença', latitude: -3.37, longitude: -68.87 },
  ],
};

const forecastPayload = {
  timezone: 'America/Sao_Paulo',
  utc_offset_seconds: -10800,
  current: {
    time: '2026-10-29T16:00',
    temperature_2m: 18.9,
    apparent_temperature: 21.1,
    relative_humidity_2m: 91,
    weather_code: 61,
    wind_speed_10m: 3,
  },
  daily: {
    time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
    weather_code: [61, 2, 3, 1, 0],
    temperature_2m_max: [20.3, 22, 23, 24, 25],
    temperature_2m_min: [16.3, 15, 14, 16, 17],
    precipitation_probability_max: [98, 40, 10, 5, 0],
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('searchCities', () => {
  it('retorna [] para input vazio sem chamar a rede', async () => {
    const fetchMock = stubFetch(mockJsonResponse(geocodingPayload));

    await expect(searchCities('')).resolves.toEqual([]);
    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('monta a URL de geocoding com nome codificado, count=5 e language=pt', async () => {
    const fetchMock = stubFetch(mockJsonResponse(geocodingPayload));

    await searchCities('São Paulo');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('geocoding-api.open-meteo.com/v1/search');
    expect(url).toContain('name=S%C3%A3o%20Paulo');
    expect(url).toContain('count=5');
    expect(url).toContain('language=pt');
    expect(url).toContain('format=json');
  });

  it('mapeia results para City[]', async () => {
    stubFetch(mockJsonResponse(geocodingPayload));

    const cities = await searchCities('São Paulo');

    expect(cities).toHaveLength(2);
    expect(cities[0]).toEqual(city);
    // Campos ausentes viram null, nunca valores presumidos.
    expect(cities[1]).toMatchObject({
      name: 'São Paulo de Olivença',
      admin1: null,
      country: null,
      timezone: null,
    });
  });

  it('retorna [] quando results está ausente', async () => {
    stubFetch(mockJsonResponse({}));

    await expect(searchCities('Xyzzy')).resolves.toEqual([]);
  });

  it('preserva caracteres especiais do nome codificados na URL (AC-01.1)', async () => {
    const fetchMock = stubFetch(mockJsonResponse({}));

    await searchCities('Foz do Iguaçu & "Cia?"');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(`name=${encodeURIComponent('Foz do Iguaçu & "Cia?"')}`);
  });

  it('lança WeatherServiceError http em resposta não-ok', async () => {
    stubFetch(mockJsonResponse({}, { ok: false, status: 429 }));

    const failure = searchCities('São Paulo');

    await expect(failure).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(failure).rejects.toMatchObject({ kind: 'http' });
  });

  it('lança WeatherServiceError invalid-response para JSON ilegível', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as unknown as Response),
    );

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('converte falha de rede em "Falha de rede."', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      kind: 'network',
      message: 'Falha de rede.',
    });
  });

  it('converte timeout de 10s em "A requisição demorou demais."', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('The operation was aborted.', 'AbortError')),
            );
          }),
      ),
    );

    const failure = searchCities('São Paulo');
    const assertion = expect(failure).rejects.toMatchObject({
      kind: 'timeout',
      message: 'A requisição demorou demais.',
    });

    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
  });
});

describe('getWeather', () => {
  it('monta a URL de forecast com coordenadas, current, daily e 5 dias', async () => {
    const fetchMock = stubFetch(mockJsonResponse(forecastPayload));

    await getWeather(city);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=-23.55');
    expect(url).toContain('longitude=-46.63');
    expect(url).toContain('forecast_days=5');
    expect(url).toContain('timezone=auto');
    expect(url).toContain('current=');
    expect(url).toContain('daily=');
  });

  it('mapeia current e os arrays paralelos de daily para 5 ForecastDay', async () => {
    // Relógio fixo igual ao instante observado (16:00 locais em UTC−3 = 19:00 UTC).
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-29T19:00:00Z') });
    stubFetch(mockJsonResponse(forecastPayload));

    const weather = await getWeather(city);

    expect(weather.city).toEqual(city);
    expect(weather.timezone).toBe('America/Sao_Paulo');
    expect(weather.current).toEqual({
      temperatureC: 18.9,
      apparentTemperatureC: 21.1,
      relativeHumidityPercent: 91,
      windSpeedKmh: 3,
      weatherCode: 61,
      observedAt: '2026-10-29T16:00',
      freshness: 'current',
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toEqual({
      date: '2026-10-29',
      weatherCode: 61,
      minimumTemperatureC: 16.3,
      maximumTemperatureC: 20.3,
      maximumPrecipitationProbabilityPercent: 98,
    });
    expect(weather.forecast[4].date).toBe('2026-11-02');
  });

  it('mantém campos parciais como null, nunca zero (resposta parcial é success)', async () => {
    const partial = {
      ...forecastPayload,
      current: { ...forecastPayload.current, temperature_2m: null, wind_speed_10m: 'n/a' },
      daily: {
        ...forecastPayload.daily,
        precipitation_probability_max: [null, 40, 10, 5, 0],
        temperature_2m_min: [16.3],
      },
    };
    stubFetch(mockJsonResponse(partial));

    const weather = await getWeather(city);

    expect(weather.current?.temperatureC).toBeNull();
    expect(weather.current?.windSpeedKmh).toBeNull();
    expect(weather.forecast[0].maximumPrecipitationProbabilityPercent).toBeNull();
    expect(weather.forecast[1].minimumTemperatureC).toBeNull();
    // Os demais campos da mesma data permanecem válidos.
    expect(weather.forecast[1].maximumTemperatureC).toBe(22);
  });

  it('marca freshness como stale fora da janela de −3h/+5min', async () => {
    // 16:00 locais (19:00 UTC) observados; relógio 4 horas depois.
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-29T23:00:00Z') });
    stubFetch(mockJsonResponse(forecastPayload));

    const weather = await getWeather(city);

    expect(weather.current?.freshness).toBe('stale');
  });

  it('marca freshness como unavailable para observedAt ausente ou inválido', async () => {
    const payload = {
      ...forecastPayload,
      current: { ...forecastPayload.current, time: 'not-a-date' },
    };
    stubFetch(mockJsonResponse(payload));

    const weather = await getWeather(city);

    expect(weather.current?.freshness).toBe('unavailable');
  });

  it('lança WeatherServiceError se current estiver ausente', async () => {
    stubFetch(mockJsonResponse({ ...forecastPayload, current: undefined }));

    const failure = getWeather(city);

    await expect(failure).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(failure).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('lança WeatherServiceError se daily estiver ausente', async () => {
    stubFetch(mockJsonResponse({ ...forecastPayload, daily: undefined }));

    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('lança WeatherServiceError http em resposta não-ok sem retry automático', async () => {
    const fetchMock = stubFetch(mockJsonResponse({}, { ok: false, status: 500 }));

    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'http' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
