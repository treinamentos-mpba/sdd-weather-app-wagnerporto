import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="mt-8">
      <h2 id="forecast-heading" className="mb-4 text-lg font-semibold text-white">
        Próximos dias
      </h2>
      {forecast.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day) => (
            <ForecastCard key={day.date} day={day} unit={unit} />
          ))}
        </div>
      ) : (
        <p role="status" className="text-sm text-white/70">
          Previsão indisponível.
        </p>
      )}
    </section>
  );
}
