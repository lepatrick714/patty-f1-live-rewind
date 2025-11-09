'use client';

import { Card } from '@/components/ui/card';
import { WeatherData } from '@/models';

interface WeatherInfoProps {
  weather: WeatherData | null;
}

export function WeatherInfo({ weather }: WeatherInfoProps) {
  if (!weather) {
    return (
      <Card className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300">Weather Info</h3>
          <p className="text-sm text-zinc-400">No weather data available</p>
        </div>
      </Card>
    );
  }

  const getWeatherCondition = (rainfall: number): string => {
    if (rainfall === 0) return 'Clear';
    if (rainfall < 1) return 'Light Rain';
    if (rainfall < 3) return 'Rain';
    return 'Heavy Rain';
  };

  const getWindDirectionLabel = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getRainfallIcon = (rainfall: number): string => {
    if (rainfall === 0) return '☀️';
    if (rainfall < 1) return '🌦️';
    if (rainfall < 3) return '🌧️';
    return '⛈️';
  };

  return (
    <Card className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Weather Info</h3>

        {/* Weather condition */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Condition</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getRainfallIcon(weather.rainfall)}</span>
            <span className="font-medium text-zinc-100">
              {getWeatherCondition(weather.rainfall)}
            </span>
          </div>
        </div>

        {/* Temperatures */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400">Air Temp</p>
            <p className="text-2xl font-bold text-zinc-100">
              {weather.air_temperature.toFixed(1)}°C
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-400">Track Temp</p>
            <p className="text-2xl font-bold text-zinc-100">
              {weather.track_temperature.toFixed(1)}°C
            </p>
          </div>
        </div>

        {/* Additional info */}
        <div className="space-y-2 border-t border-zinc-800 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Humidity</span>
            <span className="font-medium text-zinc-100">{weather.humidity}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Pressure</span>
            <span className="font-medium text-zinc-100">
              {weather.pressure.toFixed(1)} hPa
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Wind</span>
            <span className="font-medium text-zinc-100">
              {weather.wind_speed.toFixed(1)} m/s {getWindDirectionLabel(weather.wind_direction)}
            </span>
          </div>
          {weather.rainfall > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Rainfall</span>
              <span className="font-medium text-blue-400">{weather.rainfall} mm</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
