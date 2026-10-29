import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import UnitToggle from '../../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../../src/types/weather';

const city: City = {
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const current: CurrentWeatherData = {
  temperatureC: 0,
  apparentTemperatureC: 1.2,
  relativeHumidityPercent: 80,
  windSpeedKmh: 10,
  weatherCode: 2,
  observedAt: null,
  freshness: 'current',
};

// Harness mínimo: unit é estado de UI, como no App.
function TemperaturePanel() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('conversão de unidade (UnitToggle + CurrentWeather)', () => {
  it('exibe 0 °C e converte para 32 °F ao clicar em Fahrenheit', async () => {
    const user = userEvent.setup();
    render(<TemperaturePanel />);

    expect(screen.getByText('0 °C')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('32 °F')).toBeInTheDocument();
    expect(screen.queryByText('0 °C')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('volta a exibir 0 °C ao retornar para Celsius', async () => {
    const user = userEvent.setup();
    render(<TemperaturePanel />);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    await user.click(screen.getByRole('button', { name: 'Celsius' }));

    // Sem acumulação de arredondamento: volta ao valor original.
    expect(screen.getByText('0 °C')).toBeInTheDocument();
  });

  it('exibe o nome da cidade como título acessível', () => {
    render(<TemperaturePanel />);

    expect(screen.getByRole('heading', { name: 'Clima em São Paulo' })).toBeInTheDocument();
  });
});
