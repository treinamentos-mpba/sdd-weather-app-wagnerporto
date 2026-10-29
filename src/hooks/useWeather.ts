import { useCallback, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: WeatherServiceError | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function toWeatherServiceError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceError) return error;
  return new WeatherServiceError(
    'Não foi possível obter os dados meteorológicos.',
    'invalid-response',
  );
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState('');

  // Identificador de requisição: respostas de operações antigas são descartadas.
  const requestIdRef = useRef(0);
  const lastOperationRef = useRef<(() => Promise<void>) | null>(null);

  const search = useCallback(async (name: string) => {
    const requestId = ++requestIdRef.current;
    lastOperationRef.current = () => search(name);

    setQuery(name);
    setError(null);
    setStatus('loading');

    try {
      const foundCities = await searchCities(name);
      if (requestId !== requestIdRef.current) return;

      setCities(foundCities);

      if (foundCities.length === 0) {
        setData(null);
        setStatus('empty');
        return;
      }

      const weather = await getWeather(foundCities[0]);
      if (requestId !== requestIdRef.current) return;

      setData(weather);
      setStatus('success');
    } catch (caught) {
      if (requestId !== requestIdRef.current) return;
      setError(toWeatherServiceError(caught));
      setStatus('error');
    }
  }, []);

  const selectCity = useCallback(async (city: City) => {
    const requestId = ++requestIdRef.current;
    lastOperationRef.current = () => selectCity(city);

    setError(null);
    setStatus('loading');

    try {
      const weather = await getWeather(city);
      if (requestId !== requestIdRef.current) return;

      setData(weather);
      setStatus('success');
    } catch (caught) {
      if (requestId !== requestIdRef.current) return;
      setError(toWeatherServiceError(caught));
      setStatus('error');
    }
  }, []);

  const retry = useCallback(async () => {
    await lastOperationRef.current?.();
  }, []);

  return { status, data, cities, error, query, search, selectCity, retry };
}
