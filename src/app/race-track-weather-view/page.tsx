'use client';

import { F1RaceSelector } from '@/components/f1-race-selector';
import { WeatherTrackVisualization } from './components/WeatherTrackVisualization';
import { useRaceStore } from '@/hooks/useRaceStore';
import { useQuery } from '@tanstack/react-query';
import { f1Api } from '@/api/f1Api';

export default function RaceTrackWeatherViewPage() {
  const { selectedSession } = useRaceStore();

  const { data: weatherData = [], isLoading: isWeatherLoading } = useQuery({
    queryKey: ['weather', selectedSession?.session_key],
    queryFn: () =>
      selectedSession
        ? f1Api.getWeatherData(selectedSession.session_key)
        : Promise.resolve([]),
    enabled: !!selectedSession,
  });

  const { data: driverData = [], isLoading: isDriversLoading } = useQuery({
    queryKey: ['drivers', selectedSession?.session_key],
    queryFn: () =>
      selectedSession
        ? f1Api.getDrivers(selectedSession.session_key)
        : Promise.resolve([]),
    enabled: !!selectedSession,
  });

  // Get location data from any driver to draw the track outline
  const { data: trackLocationData = [], isLoading: isTrackLoading } = useQuery({
    queryKey: ['track-location', selectedSession?.session_key],
    queryFn: async () => {
      if (!selectedSession || driverData.length === 0) return [];
      
      // Use the first driver to get track outline
      const firstDriver = driverData[0];
      try {
        const locationData = await f1Api.getSingleDriverLocationData(
          selectedSession.session_key,
          firstDriver.driver_number
        );
        return locationData;
      } catch (error) {
        console.error('Failed to fetch track location data:', error);
        return [];
      }
    },
    enabled: !!selectedSession && driverData.length > 0,
  });

  const isLoading = isWeatherLoading || isDriversLoading || isTrackLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 md:p-6">
      <div className="mx-auto max-w-[1800px] space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm md:p-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 md:text-3xl">
              Weather Track Replay
            </h1>
            <p className="mt-1 text-sm text-zinc-400 md:text-base">
              Watch live weather conditions replay on the track
            </p>
          </div>
          <F1RaceSelector />
        </div>

        {/* Visualization */}
        {selectedSession ? (
          <WeatherTrackVisualization
            selectedSession={selectedSession}
            weatherData={weatherData}
            trackLocationData={trackLocationData}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex min-h-[500px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="text-center">
              <p className="text-lg text-zinc-400">
                Select a race session to view weather replay
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
