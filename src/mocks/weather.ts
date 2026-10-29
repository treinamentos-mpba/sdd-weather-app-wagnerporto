import type { WeatherData } from '../types/weather';

export const weatherDataMock: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    admin1: 'São Paulo',
    country: 'Brasil',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    temperatureC: 20.1,
    apparentTemperatureC: 20.5,
    relativeHumidityPercent: 67,
    windSpeedKmh: 12.4,
    precipitationMm: 0.1,
    pressureHPa: 1012.8,
    weatherCode: 2,
    observedAt: '2026-10-29T12:00:00-03:00',
    freshness: 'current',
  },
  forecast: [
    {
      date: '2026-10-29',
      weatherCode: 2,
      minimumTemperatureC: 17,
      maximumTemperatureC: 24,
      maximumPrecipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-30',
      weatherCode: 3,
      minimumTemperatureC: 16,
      maximumTemperatureC: 23,
      maximumPrecipitationProbabilityPercent: 20,
    },
    {
      date: '2026-10-31',
      weatherCode: 61,
      minimumTemperatureC: 18,
      maximumTemperatureC: 21,
      maximumPrecipitationProbabilityPercent: 70,
    },
    {
      date: '2026-11-01',
      weatherCode: 1,
      minimumTemperatureC: 17,
      maximumTemperatureC: 25,
      maximumPrecipitationProbabilityPercent: 5,
    },
    {
      date: '2026-11-02',
      weatherCode: 0,
      minimumTemperatureC: 18,
      maximumTemperatureC: 26,
      maximumPrecipitationProbabilityPercent: 0,
    },
  ],
  timezone: 'America/Sao_Paulo',
  fetchedAt: '2026-10-29T15:05:00Z',
};
