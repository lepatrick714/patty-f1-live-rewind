import { useState, useEffect, useMemo } from 'react';
import {
  ZapIcon,
  PlayIcon,
  PauseIcon,
  UserIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@/app/assets/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useRaceStore } from '@/hooks/useRaceStore';
import { CarData } from '@/models';
import {
  SpeedGauge,
  RPMGauge,
  GearDisplay,
  ThrottleBrakeBar,
  DRSToggle,
} from './TelemetryGauges';

interface TelemetryPanelProps {
  animationProgress?: number; // 0-1 for timeline sync
  isPlaying?: boolean;
  driverData?: any[]; // Add driver data for names/colors
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

  // Get data for all selected drivers with additional info
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

  // Reset active driver index when drivers change
  useEffect(() => {
    if (activeDriverIndex >= driversData.length) {
      setActiveDriverIndex(0);
    }
  }, [driversData.length, activeDriverIndex]);

  const activeDriver = driversData[activeDriverIndex];
  const hasAnyData = driversData.some(d => d.carData.length > 0);
  const unloadedDrivers = driversData.filter(d => !d.isLoaded && !d.isFetching);
  const fetchingDrivers = driversData.filter(d => d.isFetching);

  // Calculate current data point based on animation progress and timeline
  const getCurrentDataPoint = (carData: CarData[]): CarData | null => {
    if (!carData.length || !selectedSession) return null;

    // Use timeline sync if available and playing
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
      await fetchSingleDriverCarData(driverNumber, {
        onProgress: (loaded, total, progressInfo) => {
          console.log(
            `Telemetry progress for driver ${driverNumber}: ${loaded}/${total}`,
            progressInfo
          );
        },
      });
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
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5" />
            Live Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="py-8 text-center">
            <ZapIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
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
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5" />
            Live Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="py-8 text-center">
            <UserIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Select drivers to view telemetry data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="h-5 w-5" />
          Live Telemetry ({driversData.length} drivers)
          {isPlaying && (
            <Badge variant="secondary" className="text-xs">
              <PlayIcon className="mr-1 h-3 w-3" />
              Synced
            </Badge>
          )}
        </CardTitle>

        {/* Bulk Actions */}
        {unloadedDrivers.length > 1 && (
          <Button
            onClick={handleFetchAllTelemetry}
            disabled={isCarDataLoading}
            className="mt-2 w-full"
            size="sm"
          >
            <ZapIcon className="mr-2 h-4 w-4" />
            Fetch All Telemetry ({unloadedDrivers.length} drivers)
          </Button>
        )}

        {/* Loading State */}
        {fetchingDrivers.length > 0 && (
          <div className="mt-2 py-2 text-center">
            <div className="border-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
            <p className="text-muted-foreground text-xs">
              Loading telemetry for{' '}
              {fetchingDrivers.map(d => d.driverNumber).join(', ')}...
            </p>
          </div>
        )}

        {/* Error State */}
        {carDataError && (
          <div className="mt-2 py-2 text-center">
            <div className="text-xs text-red-500">
              Error: {carDataError.message}
            </div>
            <Button
              onClick={handleFetchAllTelemetry}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="max-h-[calc(100vh-400px)] space-y-6 overflow-y-auto">
        {/* Individual Driver Telemetry Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {driversData.map(driver => {
            const currentData = getCurrentDataPoint(driver.carData);

            return (
              <TelemetryDriverCard
                key={driver.driverNumber}
                driver={driver}
                currentData={currentData}
                onFetchTelemetry={handleFetchTelemetry}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Separate component for individual driver telemetry display
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
}

const TelemetryDriverCard = ({
  driver,
  currentData,
  onFetchTelemetry,
}: TelemetryDriverCardProps) => {
  const teamColor = driver.driverInfo?.team_colour
    ? `#${driver.driverInfo.team_colour}`
    : '#3B82F6';

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">#{driver.driverNumber}</span>
            <span className="text-base">
              {driver.driverInfo?.name_acronym ||
                `Driver ${driver.driverNumber}`}
            </span>
            {driver.carData.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {driver.carData.length} pts
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {driver.isFetching && (
              <div className="border-primary h-4 w-4 animate-spin rounded-full border border-t-transparent"></div>
            )}
            {!driver.isLoaded && !driver.isFetching && (
              <Button
                onClick={() => onFetchTelemetry(driver.driverNumber)}
                variant="outline"
                size="sm"
                className="h-8 px-4 text-xs"
                style={{ borderColor: teamColor }}
              >
                Fetch
              </Button>
            )}
            {driver.isLoaded && <ZapIcon className="h-4 w-4 text-green-500" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6 pt-0">
        {currentData ? (
          <div className="space-y-6">
            {/* Level 1: Speed and RPM */}
            <div className="flex justify-center gap-8">
              <SpeedGauge speed={currentData.speed || 0} color={teamColor} />
              <RPMGauge rpm={currentData.rpm || 0} color={teamColor} />
            </div>

            {/* Level 2: Gearbox and Controls */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Half: Gearbox */}
              <div className="flex justify-center">
                <GearDisplay gear={currentData.n_gear || 0} color={teamColor} />
              </div>

              {/* Right Half: Throttle, Brake, DRS */}
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

            {/* Data Timestamp */}
            <div className="text-muted-foreground border-t pt-3 text-center text-xs">
              {new Date(currentData.date).toLocaleTimeString()}
            </div>
          </div>
        ) : driver.carData.length > 0 ? (
          <div className="py-6 text-center">
            <ZapIcon className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              No data at current timeline position
            </p>
          </div>
        ) : driver.isLoaded ? (
          <div className="py-6 text-center">
            <ZapIcon className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              No telemetry data available
            </p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <UserIcon className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              Click Fetch to load telemetry data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
