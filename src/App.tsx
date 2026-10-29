import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, search, retry } = useWeather();

  function renderContent() {
    switch (status) {
      case 'idle':
        return (
          <EmptyState
            title="Consulte uma cidade"
            hint="Pesquise uma cidade para ver as condições atuais e a previsão de 5 dias."
          />
        );
      case 'loading':
        return <LoadingState message="Carregando previsão..." />;
      case 'empty':
        return (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint="Confira a grafia ou tente um nome mais específico."
          />
        );
      case 'error':
        return (
          <ErrorState
            // Mensagem única da spec (AC-05.2) para HTTP, rede e timeout.
            message="Não foi possível obter os dados meteorológicos."
            onRetry={() => void retry()}
          />
        );
      case 'success':
        if (data === null) return null;
        return (
          <>
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4 md:block">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
                Open-Meteo
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-white">Tempo</h1>
            </div>
            <div className="md:hidden">
              <UnitToggle unit={unit} onChange={setUnit} />
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-4">
            <SearchBar onSearch={(city) => void search(city)} disabled={status === 'loading'} />
            <div className="hidden md:block">
              <UnitToggle unit={unit} onChange={setUnit} />
            </div>
          </div>
        </header>

        <main className="flex-1" aria-label="Previsão do tempo" aria-busy={status === 'loading'}>
          {renderContent()}
        </main>

        <footer className="border-t border-white/10 pt-4 text-sm text-white/55">
          Dados meteorológicos:{' '}
          <a
            className="text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white"
            href="https://open-meteo.com/"
          >
            Open-Meteo
          </a>
        </footer>
      </div>
    </div>
  );
}
