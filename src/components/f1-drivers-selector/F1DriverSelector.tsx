'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Checkbox } from '@/components/checkbox';
import { Badge } from '@/components/badge';
import { TimerIcon, UserIcon } from '@/app/assets/Icons';
import { useRaceStore } from '../../hooks/useRaceStore';

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
  const { selectedSession, selectedDrivers, toggleDriver } = useRaceStore();

  // TODO: Implement API calls for production
  /*
    const {
        data: drivers,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["drivers", selectedSession?.session_key],
        queryFn: () =>
            selectedSession
                ? f1Api.getDrivers(selectedSession.session_key)
                : Promise.resolve([]),
        enabled: !!selectedSession,
    });

    // Session-wide fastest driver (across all drivers in session)
    const { data: sessionFastest } = useQuery<{
        driverNumber: number;
        lapTime: number;
    } | null>({
        queryKey: ["session-fastest", selectedSession?.session_key],
        queryFn: async () => {
            if (!selectedSession) return null;
            const allDrivers = await f1Api.getDrivers(selectedSession.session_key);
            const lapResults = await Promise.all(
                allDrivers.map(async (d: any) => {
                    try {
                        const laps = await f1Api.getLaps(
                            selectedSession.session_key,
                            d.driver_number
                        );
                        if (!laps || laps.length === 0) return null;
                        const f = calculateFastestLap(laps);
                        return {
                            driverNumber: d.driver_number,
                            lapTime: f.fastestLap.lapTime,
                        } as const;
                    } catch {
                        return null;
                    }
                })
            );
            const valid = lapResults.filter(Boolean) as Array<{
                driverNumber: number;
                lapTime: number;
            }>;
            if (valid.length === 0) return null;
            valid.sort((a, b) => a.lapTime - b.lapTime);
            return valid[0];
        },
        enabled: !!selectedSession,
        staleTime: 60_000,
    });

    // Find the fastest driver among currently selected (by fastest lap time)
    const { data: fastestInfo } = useQuery<{
        fastestDriverNumber: number;
        lapTime: number;
    } | null>({
        queryKey: ["fastest-driver", selectedSession?.session_key, selectedDrivers],
        queryFn: async () => {
            if (!selectedSession || selectedDrivers.length === 0) return null;
            const lapResults = await Promise.all(
                selectedDrivers.map(async (driverNumber) => {
                    try {
                        const laps = await f1Api.getLaps(
                            selectedSession.session_key,
                            driverNumber
                        );
                        if (!laps || laps.length === 0) return null;
                        const fastest = calculateFastestLap(laps);
                        return {
                            driverNumber,
                            lapTime: fastest.fastestLap.lapTime,
                        } as const;
                    } catch {
                        return null;
                    }
                })
            );
            const valid = lapResults.filter(Boolean) as Array<{
                driverNumber: number;
                lapTime: number;
            }>;
            if (valid.length === 0) return null;
            valid.sort((a, b) => a.lapTime - b.lapTime);
            return {
                fastestDriverNumber: valid[0].driverNumber,
                lapTime: valid[0].lapTime,
            };
        },
        enabled: !!(selectedSession && selectedDrivers.length > 0),
        staleTime: 30_000,
    });
    */

  // Mock data for development
  const drivers = mockDrivers;
  const isLoading = false;
  const error = null;
  const sessionFastest = { driverNumber: 1 }; // Mock fastest driver
  const fastestInfo =
    selectedDrivers.length > 0
      ? { fastestDriverNumber: selectedDrivers[0] }
      : null;

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
            const isSessionFastest =
              sessionFastest?.driverNumber === driver.driver_number;
            const isFastestSelected =
              fastestInfo?.fastestDriverNumber === driver.driver_number;
            return (
              <div
                key={driver.driver_number}
                className={[
                  'group rounded-md px-2 py-1.5',
                  isSelected
                    ? 'border border-zinc-600 bg-zinc-900/60'
                    : 'bg-zinc-900/30 hover:bg-zinc-900/40',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`driver-${driver.driver_number}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleDriver(driver.driver_number)}
                    className="h-4 w-4 border-zinc-700 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
                  />
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: `#${driver.team_colour}` }}
                  />
                  <label
                    htmlFor={`driver-${driver.driver_number}`}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1 truncate text-sm font-semibold leading-tight tracking-wide text-zinc-100">
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
                    </span>
                  </label>
                </div>
                <div className="truncate pl-8 text-xs text-zinc-400">
                  {driver.full_name} • {driver.team_name}
                </div>
              </div>
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
