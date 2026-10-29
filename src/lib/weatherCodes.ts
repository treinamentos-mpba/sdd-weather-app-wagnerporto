export interface WeatherCondition {
  label: string;
  icon: string;
}

const conditions: Record<number, WeatherCondition> = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Predominantemente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Nevoeiro', icon: '🌫️' },
  48: { label: 'Nevoeiro', icon: '🌫️' },
  51: { label: 'Chuvisco', icon: '🌦️' },
  53: { label: 'Chuvisco', icon: '🌦️' },
  55: { label: 'Chuvisco', icon: '🌦️' },
  56: { label: 'Chuvisco congelante', icon: '🌧️' },
  57: { label: 'Chuvisco congelante', icon: '🌧️' },
  61: { label: 'Chuva', icon: '🌧️' },
  63: { label: 'Chuva', icon: '🌧️' },
  65: { label: 'Chuva', icon: '🌧️' },
  66: { label: 'Chuva congelante', icon: '🌧️' },
  67: { label: 'Chuva congelante', icon: '🌧️' },
  71: { label: 'Neve', icon: '❄️' },
  73: { label: 'Neve', icon: '❄️' },
  75: { label: 'Neve', icon: '❄️' },
  77: { label: 'Grãos de neve', icon: '🌨️' },
  80: { label: 'Pancadas de chuva', icon: '🌦️' },
  81: { label: 'Pancadas de chuva', icon: '🌦️' },
  82: { label: 'Pancadas de chuva', icon: '🌦️' },
  85: { label: 'Pancadas de neve', icon: '🌨️' },
  86: { label: 'Pancadas de neve', icon: '🌨️' },
  95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada com granizo', icon: '⛈️' },
  99: { label: 'Trovoada com granizo', icon: '⛈️' },
};

export function getWeatherCondition(code: number | null): WeatherCondition {
  if (code === null || !Number.isFinite(code)) {
    return { label: 'Condição indisponível', icon: '—' };
  }

  return conditions[code] ?? { label: 'Condição indisponível', icon: '—' };
}
