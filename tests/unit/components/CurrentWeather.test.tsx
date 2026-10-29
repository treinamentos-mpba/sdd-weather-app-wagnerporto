import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import type { City, CurrentWeather as CurrentWeatherData } from '../../../src/types/weather';

const city: City = {
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const baseline: CurrentWeatherData = {
  temperatureC: 18.9,
  apparentTemperatureC: 21.1,
  relativeHumidityPercent: 91,
  windSpeedKmh: 3,
  weatherCode: 61,
  observedAt: '2026-10-29T16:00',
  freshness: 'current',
};

describe('CurrentWeather', () => {
  it('exibe "Condições atuais indisponíveis." quando current é null (AC-02.3)', () => {
    render(<CurrentWeather city={city} current={null} unit="celsius" />);

    expect(screen.getByRole('status')).toHaveTextContent('Condições atuais indisponíveis.');
    // Temperatura + 4 métricas indisponíveis, nenhum valor inventado.
    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
  });

  it('avisa sobre dados desatualizados quando freshness não é current (AC-05.4)', () => {
    render(
      <CurrentWeather city={city} current={{ ...baseline, freshness: 'stale' }} unit="celsius" />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Dados atuais desatualizados ou indisponíveis.',
    );
  });

  it('não quebra com observedAt inválido e omite o horário observado', () => {
    render(
      <CurrentWeather
        city={city}
        current={{ ...baseline, observedAt: 'not-a-date' }}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Clima em São Paulo' })).toBeInTheDocument();
    expect(screen.queryByText(/Observado às/)).not.toBeInTheDocument();
  });

  it('não quebra com timezone inválido', () => {
    render(
      <CurrentWeather
        city={{ ...city, timezone: 'Invalid/Zone' }}
        current={baseline}
        unit="celsius"
      />,
    );

    expect(screen.getByText('19 °C')).toBeInTheDocument();
    expect(screen.queryByText(/Observado às/)).not.toBeInTheDocument();
  });

  it('marca apenas o campo ausente como Indisponível, mantendo os demais (AC-02.2)', () => {
    render(
      <CurrentWeather
        city={city}
        current={{ ...baseline, relativeHumidityPercent: null }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('19 °C')).toBeInTheDocument();
    expect(screen.getByText('3 km/h')).toBeInTheDocument();
    // Umidade, precipitação e pressão ausentes → três "Indisponível".
    expect(screen.getAllByText('Indisponível')).toHaveLength(3);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
