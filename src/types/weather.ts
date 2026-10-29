export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number; // Identificador GeoNames, quando retornado.
  name: string; // Nome da localidade retornado pelo geocoding.
  admin1: string | null; // Região administrativa de primeiro nível.
  country: string | null; // País.
  latitude: number; // Latitude usada na consulta meteorológica.
  longitude: number; // Longitude usada na consulta meteorológica.
  timezone: string | null; // Fuso IANA, quando retornado pelo geocoding.
}

export interface CurrentWeather {
  temperatureC: number | null; // Temperatura atual normalizada para °C.
  apparentTemperatureC: number | null; // Sensação térmica normalizada para °C.
  relativeHumidityPercent: number | null; // Umidade relativa em porcentagem.
  windSpeedKmh: number | null; // Velocidade do vento normalizada para km/h.
  precipitationMm?: number | null; // Precipitação atual em milímetros, quando disponível.
  pressureHPa?: number | null; // Pressão atmosférica em hPa, quando disponível.
  weatherCode: number | null; // Código meteorológico WMO.
  observedAt: string | null; // Horário local da observação.
  freshness: 'current' | 'stale' | 'unavailable'; // Validade temporal dos dados.
}

export interface ForecastDay {
  date: string; // Data local no formato ISO 8601.
  weatherCode: number | null; // Código meteorológico diário WMO.
  minimumTemperatureC: number | null; // Temperatura mínima normalizada para °C.
  maximumTemperatureC: number | null; // Temperatura máxima normalizada para °C.
  maximumPrecipitationProbabilityPercent: number | null; // Probabilidade máxima em porcentagem.
}

export interface WeatherData {
  city: City; // Localidade consultada.
  current: CurrentWeather | null; // Condições atuais, se disponíveis.
  forecast: ForecastDay[]; // Cinco datas locais; campos podem estar ausentes.
  timezone: string; // Fuso IANA retornado pela API de previsão.
  fetchedAt: string; // Instante UTC em que a resposta foi recebida.
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: AppError };

export interface AppError {
  kind: 'network' | 'http' | 'timeout' | 'invalid-response';
  retryable: boolean;
}
