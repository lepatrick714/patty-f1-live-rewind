import { useState, useEffect, useMemo } from 'react';
import {
  ZapIcon,
  PlayIcon,
  UserIcon,
} from '@/app/assets/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useRaceStore } from '@/hooks/useRaceStore';
import { CarData } from '@/models';
import {
  SpeedGauge,
  RPMGauge,
  ThrottleBrakeBar,
  DRSToggle,
} from './TelemetryGauges';
import GearDisplay from './GearDisplay';

interface TelemetryPanelProps {
  animationProgress?: number;
  isPlaying?: boolean;
  driverData?: any[];
}

export const TelemetryPanel = ({
  animationProgress = 0,
  isPlaying = false,
  driverData = [],
}: TelemetryPanelProps) => {
  const {
    selectedSession,
    selectedDrivers,
    sessionCarData,
    loadedCarDataDrivers,
    fetchingCarDataDrivers,
    isCarDataLoading,
    carDataError,
    fetchSingleDriverCarData,
  } = useRaceStore();

  const [activeDriverIndex, setActiveDriverIndex] = useState(0);

  const driversData = useMemo(() => {
    return selectedDrivers.map(driverNumber => {
      const driverInfo = driverData.find(d => d.driver_number === driverNumber);
      return {
        driverNumber,
        driverInfo,
        carData: sessionCarData[driverNumber] || [],
        isLoaded: loadedCarDataDrivers.has(driverNumber),
        isFetching: fetchingCarDataDrivers.has(driverNumber),
      };
    });
  }, [
    selectedDrivers,
    sessionCarData,
    loadedCarDataDrivers,
    fetchingCarDataDrivers,
    driverData,
  ]);

  useEffect(() => {
    if (activeDriverIndex >= driversData.length) {
      setActiveDriverIndex(0);
    }
  }, [driversData.length, activeDriverIndex]);

  const activeDriver = driversData[activeDriverIndex];
  const hasAnyData = driversData.some(d => d.carData.length > 0);
  const unloadedDrivers = driversData.filter(d => !d.isLoaded && !d.isFetching);
  const fetchingDrivers = driversData.filter(d => d.isFetching);

  const getCurrentDataPoint = (carData: CarData[]): CarData | null => {
    if (!carData.length || !selectedSession) return null;

    if (animationProgress > 0 && carData.length > 1) {
      const targetIndex = Math.floor(animationProgress * (carData.length - 1));
      return carData[targetIndex] || null;
    }

    return carData[0] || null;
  };

  const currentData = activeDriver
    ? getCurrentDataPoint(activeDriver.carData)
    : null;

  const handleFetchTelemetry = async (driverNumber: number) => {
    if (!selectedSession) return;

    try {
      await fetchSingleDriverCarData(driverNumber);
    } catch (error) {
      console.error('Failed to fetch telemetry:', error);
    }
  };

  const handleFetchAllTelemetry = async () => {
    for (const driverNumber of selectedDrivers) {
      if (
        !loadedCarDataDrivers.has(driverNumber) &&
        !fetchingCarDataDrivers.has(driverNumber)
      ) {
        try {
          await handleFetchTelemetry(driverNumber);
        } catch (error) {
          console.error(
            `Failed to fetch telemetry for driver ${driverNumber}:`,
            error
          );
        }
      }
    }
  };

  const switchDriver = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setActiveDriverIndex(prev =>
        prev > 0 ? prev - 1 : driversData.length - 1
      );
    } else {
      setActiveDriverIndex(prev =>
        prev < driversData.length - 1 ? prev + 1 : 0
      );
    }
  };

  // No session selected
  if (!selectedSession) {
    return (
      <Card className="h-full border-gray-800 bg-gradient-to-br from-gray-950 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ZapIcon className="h-5 w-5" />
            Live Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="py-12 text-center">
            <ZapIcon className="mx-auto mb-4 h-16 w-16 text-gray-700" />
            <p className="text-sm text-gray-500">
              Select a session to view telemetry data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No drivers selected
  if (selectedDrivers.length === 0) {
    return (
      <Card className="h-full border-gray-800 bg-gradient-to-br from-gray-950 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ZapIcon className="h-5 w-5" />
            Live Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="py-12 text-center">
            <UserIcon className="mx-auto mb-4 h-16 w-16 text-gray-700" />
            <p className="text-sm text-gray-500">
              Select drivers to view telemetry data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-gray-800 bg-gradient-to-br from-gray-950 to-black">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-white">
            <ZapIcon className="h-5 w-5" />
            Live Telemetry
            <Badge variant="secondary" className="bg-gray-800 text-xs text-gray-300">
              {driversData.length} {driversData.length === 1 ? 'driver' : 'drivers'}
            </Badge>
            {isPlaying && (
              <Badge variant="secondary" className="bg-green-900/30 text-xs text-green-400">
                <PlayIcon className="mr-1 h-3 w-3" />
                Synced
              </Badge>
            )}
          </CardTitle>
        </div>

        {/* Bulk Actions */}
        {unloadedDrivers.length > 1 && (
          <Button
            onClick={handleFetchAllTelemetry}
            disabled={isCarDataLoading}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <ZapIcon className="mr-2 h-4 w-4" />
            Fetch All Telemetry ({unloadedDrivers.length} drivers)
          </Button>
        )}

        {/* Loading State */}
        {fetchingDrivers.length > 0 && (
          <div className="mt-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 text-center">
            <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-xs text-gray-400">
              Loading telemetry for{' '}
              {fetchingDrivers.map(d => d.driverNumber).join(', ')}...
            </p>
          </div>
        )}

        {/* Error State */}
        {carDataError && (
          <div className="mt-3 rounded-lg border border-red-900 bg-red-950/50 p-3 text-center">
            <div className="text-xs text-red-400">
              Error: {carDataError.message}
            </div>
            <Button
              onClick={handleFetchAllTelemetry}
              variant="outline"
              size="sm"
              className="mt-2 border-red-800 hover:bg-red-900/30"
            >
              Retry
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="max-h-[calc(100vh-400px)] space-y-6 overflow-y-auto p-6">
        {/* F1 Style Driver Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {driversData.map(driver => {
            const currentData = getCurrentDataPoint(driver.carData);

            return (
              <TelemetryDriverCard
                key={driver.driverNumber}
                driver={driver}
                currentData={currentData}
                onFetchTelemetry={handleFetchTelemetry}
                isPlaying={isPlaying}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface TelemetryDriverCardProps {
  driver: {
    driverNumber: number;
    driverInfo?: any;
    carData: CarData[];
    isLoaded: boolean;
    isFetching: boolean;
  };
  currentData: CarData | null;
  onFetchTelemetry: (driverNumber: number) => void;
  isPlaying?: boolean;
}

const TelemetryDriverCard = ({
  driver,
  currentData,
  onFetchTelemetry,
  isPlaying = false,
}: TelemetryDriverCardProps) => {
  const teamColor = driver.driverInfo?.team_colour
    ? `#${driver.driverInfo.team_colour}`
    : '#3B82F6';

  return (
    <div
      className="relative overflow-hidden rounded-xl border-2 bg-black shadow-2xl transition-all duration-300 hover:shadow-3xl"
      style={{
        borderColor: driver.isLoaded ? teamColor : '#1F2937',
        boxShadow: driver.isLoaded
          ? `0 0 30px ${teamColor}20, 0 10px 40px rgba(0,0,0,0.5)`
          : '0 10px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1.5"
        style={{
          background: driver.isLoaded
            ? `linear-gradient(90deg, ${teamColor}, ${teamColor}80)`
            : 'linear-gradient(90deg, #374151, #1F2937)',
        }}
      />

      {/* Driver Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg border-2 font-black text-white"
              style={{
                borderColor: teamColor,
                backgroundColor: `${teamColor}20`,
                boxShadow: `0 0 20px ${teamColor}30`,
              }}
            >
              <span className="text-xl">{driver.driverNumber}</span>
            </div>
            <div>
              <div className="text-lg font-black text-white">
                {driver.driverInfo?.name_acronym || `DR${driver.driverNumber}`}
              </div>
              {driver.driverInfo?.full_name && (
                <div className="text-xs text-gray-500">
                  {driver.driverInfo.full_name}
                </div>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {driver.isFetching && (
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: teamColor }}
              />
            )}
            {!driver.isLoaded && !driver.isFetching && (
              <Button
                onClick={() => onFetchTelemetry(driver.driverNumber)}
                variant="outline"
                size="sm"
                className="h-8 border-gray-700 bg-gray-800 px-4 text-xs font-bold text-white hover:bg-gray-700"
                style={{
                  borderColor: teamColor,
                }}
              >
                LOAD
              </Button>
            )}
            {driver.isLoaded && (
              <div className="flex items-center gap-1">
                <div
                  className="h-2 w-2 animate-pulse rounded-full"
                  style={{ backgroundColor: teamColor }}
                />
                <span className="text-xs font-bold" style={{ color: teamColor }}>
                  LIVE
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Data points badge */}
        {driver.carData.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-800 text-[10px] text-gray-400">
              {driver.carData.length.toLocaleString()} data points
            </Badge>
            {isPlaying && (
              <Badge variant="secondary" className="bg-green-900/30 text-[10px] text-green-400">
                SYNCED
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Telemetry Display */}
      <div className="p-6">
        {currentData ? (
          <div className="space-y-6">
            {/* Top Row: Speed & RPM Gauges */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <SpeedGauge speed={currentData.speed || 0} color={teamColor} />
                <div className="mt-2 text-[10px] font-bold tracking-wider text-gray-500">
                  SPEED (KM/H)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <RPMGauge rpm={currentData.rpm || 0} color={teamColor} />
                <div className="mt-2 text-[10px] font-bold tracking-wider text-gray-500">
                  RPM
                </div>
              </div>
            </div>

            {/* Middle Row: Gearbox & Throttle/Brake */}
            <div className="grid grid-cols-2 gap-6">
              {/* Gearbox */}
              <div className="flex justify-center">
                <GearDisplay gear={currentData.n_gear || 0} color={teamColor} />
              </div>

              {/* Throttle/Brake & DRS */}
              <div className="space-y-4">
                <ThrottleBrakeBar
                  throttle={currentData.throttle || 0}
                  brake={currentData.brake || 0}
                />

                <div className="flex justify-center">
                  <DRSToggle
                    isOpen={Boolean(currentData.drs)}
                    color={teamColor}
                  />
                </div>
              </div>
            </div>

            {/* Bottom: Timestamp */}
            <div className="border-t border-gray-800 pt-3 text-center">
              <div className="text-[10px] font-bold tracking-wider text-gray-600">
                TIMESTAMP
              </div>
              <div className="text-xs font-mono text-gray-400">
                {new Date(currentData.date).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ) : driver.carData.length > 0 ? (
          <div className="py-12 text-center">
            <ZapIcon className="mx-auto mb-3 h-12 w-12 text-gray-700" />
            <p className="text-sm text-gray-500">
              No data at current timeline position
            </p>
          </div>
        ) : driver.isLoaded ? (
          <div className="py-12 text-center">
            <ZapIcon className="mx-auto mb-3 h-12 w-12 text-gray-700" />
            <p className="text-sm text-gray-500">
              No telemetry data available
            </p>
          </div>
        ) : (
          <div className="py-12 text-center">
            <UserIcon className="mx-auto mb-3 h-12 w-12 text-gray-700" />
            <p className="mb-4 text-sm text-gray-500">
              Click LOAD to fetch telemetry data
            </p>
            <Button
              onClick={() => onFetchTelemetry(driver.driverNumber)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 font-bold hover:from-blue-700 hover:to-blue-800"
              style={{
                background: `linear-gradient(135deg, ${teamColor}, ${teamColor}dd)`,
              }}
            >
              <ZapIcon className="mr-2 h-4 w-4" />
              Load Telemetry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};