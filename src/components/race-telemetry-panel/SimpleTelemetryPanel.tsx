'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZapIcon, UserIcon, PlayIcon, PauseIcon } from '@/app/assets/Icons';
import { useRaceStore } from '@/hooks/useRaceStore';
import { CarData } from '@/models';
import { f1Api } from '@/api/f1Api';

interface SimpleTelemetryPanelProps {
  animationProgress?: number;
  isPlaying?: boolean;
}

export const SimpleTelemetryPanel = ({
  animationProgress = 0,
  isPlaying = false,
}: SimpleTelemetryPanelProps) => {
  const {
    selectedSession,
    selectedDrivers,
    sessionCarData,
    loadedCarDataDrivers,
    fetchingCarDataDrivers,
    fetchSingleDriverCarData,
    carDataError,
  } = useRaceStore();

  // Fetch drivers data to get their information including pictures
  const {
    data: allDrivers = [],
    isLoading: driversLoading,
  } = useQuery({
    queryKey: ['drivers', selectedSession?.session_key],
    queryFn: () =>
      selectedSession
        ? f1Api.getDrivers(selectedSession.session_key)
        : Promise.resolve([]),
    enabled: !!selectedSession,
  });

  // Create drivers data with telemetry
  const driversData = useMemo(() => {
    return selectedDrivers.map(driverNumber => {
      const driverInfo = allDrivers.find(d => d.driver_number === driverNumber);
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
    allDrivers,
    sessionCarData,
    loadedCarDataDrivers,
    fetchingCarDataDrivers,
  ]);

  const getCurrentDataPoint = (carData: CarData[]): CarData | null => {
    if (!carData.length || !selectedSession) return null;

    // If we have animation progress and multiple data points, use animated position
    if (animationProgress > 0 && carData.length > 1) {
      const targetIndex = Math.floor(animationProgress * (carData.length - 1));
      return carData[targetIndex] || null;
    }

    // Use first data point for static view (same as original implementation)
    return carData[0] || null;
  };

  const handleFetchTelemetry = async (driverNumber: number) => {
    if (!selectedSession) return;

    try {
      await fetchSingleDriverCarData(driverNumber);
    } catch (error) {
      console.error('Failed to fetch telemetry:', error);
    }
  };

  // No session selected
  if (!selectedSession) {
    return (
      <Card className="h-full border-gray-800 bg-gradient-to-br from-gray-950 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ZapIcon className="h-5 w-5" />
            Telemetry
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
            Telemetry
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
      <CardHeader className="border-b border-gray-800 pb-4">
        <CardTitle className="flex items-center gap-3 text-white">
          <ZapIcon className="h-5 w-5" />
          Live Telemetry
          <Badge variant="secondary" className="bg-gray-800 text-xs text-gray-300">
            {selectedDrivers.length} driver{selectedDrivers.length !== 1 ? 's' : ''}
          </Badge>
          {isPlaying && (
            <div className="flex items-center gap-1 text-green-400">
              <PlayIcon className="h-3 w-3" />
              <span className="text-xs">LIVE</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="max-h-[calc(100vh-300px)] space-y-4 overflow-y-auto p-4">
        <div className="grid gap-4">
          {driversData.map(driver => {
            const currentData = getCurrentDataPoint(driver.carData);
            
            return (
              <DriverTelemetryCard
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

interface DriverTelemetryCardProps {
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

const DriverTelemetryCard = ({
  driver,
  currentData,
  onFetchTelemetry,
  isPlaying = false,
}: DriverTelemetryCardProps) => {
  const teamColor = driver.driverInfo?.team_colour
    ? `#${driver.driverInfo.team_colour}`
    : '#3B82F6';

  const speed = currentData?.speed || 0;
  const rpm = currentData?.rpm || 0;

  return (
    <div
      className="relative overflow-hidden rounded-xl border-2 bg-black shadow-xl transition-all duration-300"
      style={{
        borderColor: driver.isLoaded ? teamColor : '#1F2937',
        boxShadow: driver.isLoaded
          ? `0 0 20px ${teamColor}20`
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1"
        style={{
          background: driver.isLoaded
            ? `linear-gradient(90deg, ${teamColor}, ${teamColor}80)`
            : 'linear-gradient(90deg, #374151, #1F2937)',
        }}
      />

      {/* Driver Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Driver Picture */}
            <div className="relative">
              {driver.driverInfo?.headshot_url ? (
                <img
                  src={driver.driverInfo.headshot_url}
                  alt={driver.driverInfo.full_name}
                  className="h-10 w-10 rounded-full border-2 border-gray-600 object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-600 text-sm font-bold text-white ${
                  driver.driverInfo?.headshot_url ? 'hidden' : ''
                }`}
                style={{ backgroundColor: teamColor }}
              >
                {driver.driverInfo?.name_acronym || driver.driverNumber}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-white">
                {driver.driverInfo?.name_acronym || `#${driver.driverNumber}`}
              </div>
              <div className="text-xs text-gray-400">
                {driver.driverInfo?.team_name || 'Unknown Team'}
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {driver.isFetching ? (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 animate-spin rounded-full border border-blue-500 border-t-transparent"></div>
                <span className="text-xs text-blue-400">Loading...</span>
              </div>
            ) : !driver.isLoaded ? (
              <Button
                onClick={() => onFetchTelemetry(driver.driverNumber)}
                size="sm"
                variant="outline"
                className="h-6 border-gray-600 bg-transparent px-2 text-xs text-gray-400 hover:bg-gray-800"
              >
                Load Data
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-green-400">Ready</span>
              </div>
            )}
          </div>
        </div>

        {/* Data points badge */}
        {driver.carData.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-800 text-xs">
              {driver.carData.length} data points
            </Badge>
            {isPlaying && (
              <div className="animate-pulse text-xs text-green-400">
                ● LIVE
              </div>
            )}
          </div>
        )}
      </div>

      {/* Telemetry Display */}
      <div className="p-4">
        {currentData ? (
          <div className="flex gap-4">
            {/* Speed Gauge */}
            <div className="flex-1">
              <SimpleGauge
                key={`speed-${driver.driverNumber}-${currentData?.date}`}
                value={speed}
                maxValue={350}
                label="SPEED"
                unit="KM/H"
                color={teamColor}
                type="speed"
              />
            </div>

            {/* RPM Gauge */}
            <div className="flex-1">
              <SimpleGauge
                key={`rpm-${driver.driverNumber}-${currentData?.date}`}
                value={rpm}
                maxValue={15000}
                label="RPM"
                unit="RPM"
                color={teamColor}
                type="rpm"
              />
            </div>
          </div>
        ) : driver.carData.length > 0 ? (
          <div className="py-8 text-center">
            <ZapIcon className="mx-auto mb-2 h-8 w-8 text-gray-700" />
            <p className="text-xs text-gray-500">No current data point</p>
          </div>
        ) : driver.isLoaded ? (
          <div className="py-8 text-center">
            <ZapIcon className="mx-auto mb-2 h-8 w-8 text-gray-700" />
            <p className="text-xs text-gray-500">No telemetry data available</p>
          </div>
        ) : (
          <div className="py-8 text-center">
            <UserIcon className="mx-auto mb-2 h-8 w-8 text-gray-700" />
            <p className="text-xs text-gray-500">
              Click "Load Data" to fetch telemetry
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface SimpleGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  color: string;
  type: 'speed' | 'rpm';
}

const SimpleGauge = ({ value, maxValue, label, unit, color, type }: SimpleGaugeProps) => {
  const percentage = Math.min(value / maxValue, 1);
  const angle = percentage * 180 - 90; // -90 to +90 degrees (180 degree arc)

  // Quick debug for speed gauge
  if (type === 'speed' && value > 0 && Math.random() < 0.1) {
    console.log(`Speed gauge: value=${value}, percentage=${percentage}, angle=${angle}`);
  }

  // Color gradient based on value
  const getValueColor = (percentage: number, type: 'speed' | 'rpm') => {
    if (type === 'speed') {
      if (percentage < 0.3) return '#10B981'; // Green - slow
      if (percentage < 0.6) return '#F59E0B'; // Yellow - moderate
      if (percentage < 0.8) return '#F97316'; // Orange - fast
      return '#EF4444'; // Red - very fast
    } else {
      // RPM
      if (percentage < 0.4) return '#10B981'; // Green - low
      if (percentage < 0.7) return '#F59E0B'; // Yellow - moderate
      if (percentage < 0.9) return '#F97316'; // Orange - high
      return '#DC2626'; // Red - redline
    }
  };

  const valueColor = getValueColor(percentage, type);

  return (
    <div className="relative flex flex-col items-center">
      {/* Gauge Container */}
      <div className="relative h-20 w-20">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`gauge-gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M 20 80 A 30 30 0 0 1 80 80"
            fill="none"
            stroke="#1F2937"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Value arc */}
          <path
            d={`M 20 80 A 30 30 0 0 1 ${50 + 30 * Math.cos((angle * Math.PI) / 180)} ${80 + 30 * Math.sin((angle * Math.PI) / 180)}`}
            fill="none"
            stroke={valueColor}
            strokeWidth="6"
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 4px ${valueColor})` }}
          />

          {/* Center dot */}
          <circle cx="50" cy="80" r="3" fill="#374151" />
        </svg>

        {/* Needle */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div
            className="absolute transition-transform duration-300"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <div
              className="h-6 w-0.5 origin-bottom"
              style={{
                background: valueColor,
                boxShadow: `0 0 4px ${valueColor}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Value Display */}
      <div className="mt-2 text-center">
        <div className="text-lg font-bold text-white">
          {Math.round(value)}
        </div>
        <div className="text-xs text-gray-400">
          {label}
        </div>
      </div>
    </div>
  );
};