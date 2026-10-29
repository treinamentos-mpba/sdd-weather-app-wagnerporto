import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../../src/hooks/useWeather';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City, WeatherData } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/services/weatherService')>();
  return { ...actual, searchCities: vi.fn(), getWeather: vi.fn() };
});

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);

function makeCity(name: string): City {
  return {
    name,
    admin1: null,
    country: 'Brasil',
    latitude: -23.55,
    longitude: -46.63,
    timezone: 'America/Sao_Paulo',
  };
}

function makeWeather(city: City): WeatherData {
  return {
    city,
    current: null,
    forecast: [],
    timezone: 'America/Sao_Paulo',
    fetchedAt: '2026-10-29T19:00:00.000Z',
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  searchCitiesMock.mockReset();
  getWeatherMock.mockReset();
});

describe('useWeather', () => {
  it('inicia em idle, sem dados, cidades ou erro', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.query).toBe('');
  });

  it('search com resultados carrega o clima da primeira cidade (success)', async () => {
    const saoPaulo = makeCity('São Paulo');
    const olivenca = makeCity('São Paulo de Olivença');
    searchCitiesMock.mockResolvedValue([saoPaulo, olivenca]);
    getWeatherMock.mockResolvedValue(makeWeather(saoPaulo));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(getWeatherMock).toHaveBeenCalledWith(saoPaulo);
    expect(result.current.status).toBe('success');
    expect(result.current.cities).toEqual([saoPaulo, olivenca]);
    expect(result.current.data?.city).toEqual(saoPaulo);
    expect(result.current.query).toBe('São Paulo');
  });

  it('search sem resultados termina em empty sem chamar o forecast', async () => {
    searchCitiesMock.mockResolvedValue([]);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Xyzzy');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeNull();
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('passa por loading durante a busca', async () => {
    const pending = deferred<City[]>();
    searchCitiesMock.mockReturnValue(pending.promise);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      void result.current.search('Recife');
    });

    expect(result.current.status).toBe('loading');

    await act(async () => {
      pending.resolve([]);
    });

    expect(result.current.status).toBe('empty');
  });

  it('falha do service vira error com o WeatherServiceError original', async () => {
    searchCitiesMock.mockRejectedValue(new WeatherServiceError('Falha de rede.', 'network'));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Recife');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.kind).toBe('network');
    expect(result.current.error?.message).toBe('Falha de rede.');
  });

  it('retry refaz a última operação exatamente uma vez', async () => {
    const recife = makeCity('Recife');
    searchCitiesMock.mockRejectedValueOnce(
      new WeatherServiceError('A requisição demorou demais.', 'timeout'),
    );

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Recife');
    });
    expect(result.current.status).toBe('error');

    searchCitiesMock.mockResolvedValueOnce([recife]);
    getWeatherMock.mockResolvedValueOnce(makeWeather(recife));

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(searchCitiesMock).toHaveBeenLastCalledWith('Recife');
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('selectCity busca o clima da cidade escolhida', async () => {
    const olivenca = makeCity('São Paulo de Olivença');
    getWeatherMock.mockResolvedValue(makeWeather(olivenca));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(olivenca);
    });

    expect(getWeatherMock).toHaveBeenCalledWith(olivenca);
    expect(result.current.status).toBe('success');
    expect(result.current.data?.city).toEqual(olivenca);
  });

  it('descarta resposta obsoleta quando uma nova operação começa', async () => {
    const first = makeCity('Primeira');
    const second = makeCity('Segunda');
    const firstWeather = deferred<WeatherData>();

    searchCitiesMock.mockResolvedValueOnce([first]).mockResolvedValueOnce([second]);
    getWeatherMock.mockImplementation((requested: City) =>
      requested.name === 'Primeira' ? firstWeather.promise : Promise.resolve(makeWeather(second)),
    );

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      void result.current.search('Primeira');
    });
    await act(async () => {
      await result.current.search('Segunda');
    });

    expect(result.current.data?.city).toEqual(second);

    // A resposta antiga chega atrasada e não pode sobrescrever a atual.
    await act(async () => {
      firstWeather.resolve(makeWeather(first));
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data?.city).toEqual(second);
  });
});
