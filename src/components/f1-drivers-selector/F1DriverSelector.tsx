'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimerIcon, UserIcon } from '@/app/assets/Icons';
import { useRaceStore } from '../../hooks/useRaceStore';
import { useQuery } from '@tanstack/react-query';
import { f1Api } from '@/api/f1Api';

// Mock data for development - remove when implementing real API
const mockDrivers = [
  {
    driver_number: 1,
    name_acronym: 'VER',
    full_name: 'Max Verstappen',
    team_name: 'Red Bull Racing',
    team_colour: '3671C6',
  },
  {
    driver_number: 11,
    name_acronym: 'PER',
    full_name: 'Sergio Perez',
    team_name: 'Red Bull Racing',
    team_colour: '3671C6',
  },
  {
    driver_number: 44,
    name_acronym: 'HAM',
    full_name: 'Lewis Hamilton',
    team_name: 'Mercedes',
    team_colour: '00D2BE',
  },
  {
    driver_number: 63,
    name_acronym: 'RUS',
    full_name: 'George Russell',
    team_name: 'Mercedes',
    team_colour: '00D2BE',
  },
  {
    driver_number: 16,
    name_acronym: 'LEC',
    full_name: 'Charles Leclerc',
    team_name: 'Ferrari',
    team_colour: 'DC143C',
  },
  {
    driver_number: 55,
    name_acronym: 'SAI',
    full_name: 'Carlos Sainz',
    team_name: 'Ferrari',
    team_colour: 'DC143C',
  },
];

function F1DriverSelector() {
  const {
    selectedSession,
    selectedDrivers,
    toggleDriver,
    loadedCarDataDrivers,
    fetchingCarDataDrivers,
    fetchSingleDriverCarData
  } = useRaceStore();

  // TODO: Implement API calls for production - using mock data for now
  const {
    data: drivers = mockDrivers,
    isLoading = false,
    error = null,
  } = useQuery({
    queryKey: ['drivers', selectedSession?.session_key],
    queryFn: () =>
      selectedSession
        ? f1Api.getDrivers(selectedSession.session_key)
        : Promise.resolve(mockDrivers),
    enabled: !!selectedSession,
  });

  const sessionFastest = {}; // Placeholder for session fastest driver data
  const fastestInfo = {}; // Placeholder for fastest selected driver data

  // Handle driver button click
  const handleDriverClick = async (driverNumber: number) => {
    const isLoaded = loadedCarDataDrivers.has(driverNumber);
    const isFetching = fetchingCarDataDrivers.has(driverNumber);

    if (isFetching) {
      // Do nothing if already fetching
      return;
    }

    if (!isLoaded) {
      // First click: fetch data
      try {
        await fetchSingleDriverCarData(driverNumber);
      } catch (error) {
        console.error('Failed to fetch driver data:', error);
      }
    } else {
      // Data is loaded: toggle selection
      toggleDriver(driverNumber);
    }
  };

  // // Session-wide fastest driver (across all drivers in session)
  // const { data: sessionFastest } = useQuery<{
  //   driverNumber: number;
  //   lapTime: number;
  // } | null>({
  //   queryKey: ["session-fastest", selectedSession?.session_key],
  //   queryFn: async () => {
  //     if (!selectedSession) return null;
  //     const allDrivers = await f1Api.getDrivers(selectedSession.session_key);
  //     const lapResults = await Promise.all(
  //       allDrivers.map(async (d: any) => {
  //         try {
  //           const laps = await f1Api.getLaps(
  //             selectedSession.session_key,
  //             d.driver_number
  //           );
  //           if (!laps || laps.length === 0) return null;
  //           const f = calculateFastestLap(laps);
  //           return {
  //             driverNumber: d.driver_number,
  //             lapTime: f.fastestLap.lapTime,
  //           } as const;
  //         } catch {
  //           return null;
  //         }
  //       })
  //     );
  //     const valid = lapResults.filter(Boolean) as Array<{
  //       driverNumber: number;
  //       lapTime: number;
  //     }>;
  //     if (valid.length === 0) return null;
  //     valid.sort((a, b) => a.lapTime - b.lapTime);
  //     return valid[0];
  //   },
  //   enabled: !!selectedSession,
  //   staleTime: 60_000,
  // });

  // // Find the fastest driver among currently selected (by fastest lap time)
  // const { data: fastestInfo } = useQuery<{
  //   fastestDriverNumber: number;
  //   lapTime: number;
  // } | null>({
  //   queryKey: ["fastest-driver", selectedSession?.session_key, selectedDrivers],
  //   queryFn: async () => {
  //     if (!selectedSession || selectedDrivers.length === 0) return null;
  //     const lapResults = await Promise.all(
  //       selectedDrivers.map(async (driverNumber) => {
  //         try {
  //           const laps = await f1Api.getLaps(
  //             selectedSession.session_key,
  //             driverNumber
  //           );
  //           if (!laps || laps.length === 0) return null;
  //           const fastest = calculateFastestLap(laps);
  //           return {
  //             driverNumber,
  //             lapTime: fastest.fastestLap.lapTime,
  //           } as const;
  //         } catch {
  //           return null;
  //         }
  //       })
  //     );
  //     const valid = lapResults.filter(Boolean) as Array<{
  //       driverNumber: number;
  //       lapTime: number;
  //     }>;
  //     if (valid.length === 0) return null;
  //     valid.sort((a, b) => a.lapTime - b.lapTime);
  //     return {
  //       fastestDriverNumber: valid[0].driverNumber,
  //       lapTime: valid[0].lapTime,
  //     };
  //   },
  //   enabled: !!(selectedSession && selectedDrivers.length > 0),
  //   staleTime: 30_000,
  // });

  if (!selectedSession) {
    return (
      <Card
        className="flex h-[500px] w-full flex-col overflow-hidden rounded-xl border lg:h-[70vh] xl:h-[80vh]"
        style={{ background: '#0f0f12', borderColor: '#222' }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <UserIcon className="h-5 w-5 text-zinc-400" />
            Select Drivers
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-zinc-400">
            Choose a race session first to see available drivers.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card
        className="flex h-[500px] w-full flex-col overflow-hidden rounded-xl border lg:h-[70vh] xl:h-[80vh]"
        style={{ background: '#0f0f12', borderColor: '#222' }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <UserIcon className="h-5 w-5 text-zinc-400" />
            Select Drivers
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-4 animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
                <div className="h-5 w-16 animate-pulse rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className="flex h-[500px] w-full flex-col overflow-hidden rounded-xl border lg:h-[70vh] xl:h-[80vh]"
        style={{ background: '#0f0f12', borderColor: '#222' }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <UserIcon className="h-5 w-5 text-zinc-400" />
            Select Drivers
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-red-400">
            Failed to load drivers. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="flex h-[500px] w-full flex-col overflow-hidden rounded-xl border lg:h-[70vh] xl:h-[80vh]"
      style={{ background: '#0f0f12', borderColor: '#222' }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-zinc-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-zinc-400" />
              <span>Select Drivers</span>
            </span>
            {selectedDrivers.length > 0 && (
              <span className="inline-flex items-center gap-3 lg:mt-1 lg:basis-full">
                <Badge
                  variant="secondary"
                  className="border-zinc-700 bg-zinc-800 text-zinc-200"
                >
                  {selectedDrivers.length} selected
                </Badge>
                <span className="inline-flex items-center gap-3 text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <TimerIcon
                      className="h-4 w-4 text-purple-400"
                      aria-hidden="true"
                    />
                    <span>Fastest in session</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="h-4 rounded-sm border-purple-400/40 bg-purple-500/10 px-1 py-0 text-[10px] leading-none text-purple-300"
                    >
                      FS
                    </Badge>
                    <span>Fastest (selected)</span>
                  </span>
                </span>
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full space-y-2 overflow-y-auto pr-1">
          {drivers?.map(driver => {
            const isSelected = selectedDrivers.includes(driver.driver_number);
            const isLoaded = loadedCarDataDrivers.has(driver.driver_number);
            const isFetching = fetchingCarDataDrivers.has(driver.driver_number);
            const isSessionFastest = null;
            // sessionFastest?.driverNumber === driver.driver_number;
            const isFastestSelected = null;
            // fastestInfo?.fastestDriverNumber === driver.driver_number;

            // Determine button state and appearance
            let buttonText = 'Fetch Data';
            let buttonVariant: 'default' | 'outline' | 'secondary' | 'ghost' = 'ghost';
            let buttonClassName = 'h-auto w-full justify-start p-0 text-left border-0 bg-transparent hover:bg-transparent shadow-none';
            
            if (isFetching) {
              buttonText = 'Fetching...';
              buttonClassName += ' cursor-not-allowed opacity-60';
            } else if (isLoaded && isSelected) {
              buttonText = 'Selected';
              buttonClassName += ' text-green-100';
            } else if (isLoaded && !isSelected) {
              buttonText = 'Select';
              buttonClassName += ' text-zinc-200';
            } else {
              // Not loaded yet - emphasize fetch action needed
              buttonText = '👆 Click to Fetch Data';
              buttonClassName += ' text-blue-400 hover:text-blue-300 opacity-90';
            }
            
            return (
              <Button
                key={driver.driver_number}
                variant={buttonVariant}
                onClick={() => handleDriverClick(driver.driver_number)}
                disabled={isFetching}
                className={buttonClassName}
              >
                <div className={[
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors',
                  isFetching && 'cursor-not-allowed opacity-60',
                  isLoaded && isSelected && 'border border-green-600 bg-green-700/20 hover:bg-green-700/30',
                  isLoaded && !isSelected && 'border border-zinc-500 hover:border-zinc-400 hover:bg-zinc-800/50',
                  !isLoaded && 'border-2 border-dashed border-blue-500/50 bg-blue-950/20 hover:bg-blue-900/30 hover:border-blue-400/70 cursor-pointer relative animate-pulse',
                  !isLoaded && 'before:absolute before:inset-1 before:border before:border-dashed before:border-blue-400/30 before:rounded-sm before:pointer-events-none'
                ].filter(Boolean).join(' ')}>
                  <span
                    className="inline-block h-3 w-3 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: `#${driver.team_colour}` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1 truncate text-sm font-semibold leading-tight tracking-wide">
                      <span>{driver.name_acronym}</span>
                      <span className="ml-1 text-xs text-zinc-400">
                        #{driver.driver_number}
                      </span>
                      {isSessionFastest && (
                        <span title="Fastest lap in session">
                          <TimerIcon
                            className="h-4 w-4 text-purple-400"
                            aria-label="Fastest overall"
                          />
                        </span>
                      )}
                      {isFastestSelected && (
                        <Badge  
                          variant="outline"
                          className="ml-1 h-4 whitespace-nowrap rounded-sm border-purple-400/40 bg-purple-500/10 px-1 py-0 text-[10px] leading-none text-purple-300"
                        >
                          FS
                        </Badge>
                      )}
                    </div>
                    <div className="truncate text-xs text-zinc-400">
                      {driver.full_name} • {driver.team_name}
                    </div>
                  </div>
                  <div className="text-red ml-auto flex items-center gap-2 text-xs font-medium">
                    {isFetching && (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
                    )}
                    {!isLoaded && !isFetching && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                      </div>
                    )}
                    <span className={!isLoaded && !isFetching ? 'font-semibold' : ''}>{buttonText}</span>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {selectedDrivers.length > 0 && (
          <div className="mt-4 border-t border-zinc-800 pt-4">
            <p className="mb-2 text-xs text-zinc-400">
              Selected for comparison:
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedDrivers.map((driverNumber: number) => {
                const driver = drivers?.find(
                  d => d.driver_number === driverNumber
                );
                return driver ? (
                  <Badge
                    key={driverNumber}
                    variant="outline"
                    className="border bg-zinc-900/60 text-xs text-zinc-200"
                    style={{ borderColor: `#${driver.team_colour}` }}
                  >
                    {driver.name_acronym}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { F1DriverSelector };
