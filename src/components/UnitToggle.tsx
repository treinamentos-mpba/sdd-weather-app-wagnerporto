import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusRef = useRef<HTMLButtonElement>(null);
  const fahrenheitRef = useRef<HTMLButtonElement>(null);

  function selectUnit(nextUnit: Unit) {
    if (nextUnit !== unit) onChange(nextUnit);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const nextUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    selectUnit(nextUnit);
    (nextUnit === 'celsius' ? celsiusRef : fahrenheitRef).current?.focus();
  }

  const buttonClass =
    'min-h-10 min-w-14 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900';

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      onKeyDown={handleKeyDown}
      className="inline-flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      <button
        ref={celsiusRef}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        tabIndex={unit === 'celsius' ? 0 : -1}
        onClick={() => selectUnit('celsius')}
        className={`${buttonClass} ${unit === 'celsius' ? 'bg-accent-500 text-night-900' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
      >
        °C
      </button>
      <button
        ref={fahrenheitRef}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        onClick={() => selectUnit('fahrenheit')}
        className={`${buttonClass} ${unit === 'fahrenheit' ? 'bg-accent-500 text-night-900' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
      >
        °F
      </button>
    </div>
  );
}
