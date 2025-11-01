"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { f1Api } from "@/api/f1Api";
import { useRaceStore } from "@/hooks/useRaceStore";
import { SessionRaceVisualization } from "@/components/track-visualization";
import { F1RaceSelector } from "@/components/f1-race-selector";
import { 
  PauseIcon, 
  PlayIcon, 
  RotateCcwIcon, 
  ZapIcon,
  TimerIcon,
  UserIcon 
} from "@/app/assets/Icons";

// Driver Selector Component for Session View
function SessionDriverSelector({
  driverData,
  selectedDrivers,
  onToggleDriver,
  sessionLocationData,
  isLoading
}: {
  driverData: any[];
  selectedDrivers: number[];
  onToggleDriver: (driverNumber: number) => void;
  sessionLocationData: Record<number, any[]>;
  isLoading: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Drivers ({selectedDrivers.length} selected)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
        {driverData.map((driver) => {
          const isSelected = selectedDrivers.includes(driver.driver_number);
          const hasLocationData = sessionLocationData[driver.driver_number]?.length > 0;
          
          return (
            <Button
              key={driver.driver_number}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleDriver(driver.driver_number)}
              disabled={!hasLocationData}
              className="w-full justify-start gap-2 h-auto py-3"
              style={{
                backgroundColor: isSelected ? `#${driver.team_colour}` : undefined,
                borderColor: hasLocationData ? `#${driver.team_colour}` : undefined,
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="font-bold">#{driver.driver_number}</span>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{driver.name_acronym}</span>
                  <span className="text-xs opacity-75">{driver.team_name}</span>
                </div>
              </div>
              {!hasLocationData && (
                <span className="text-xs text-muted-foreground ml-auto">No data</span>
              )}
            </Button>
          );
        })}
        
        {driverData.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              No drivers available for this session
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Right Panel Placeholder for Telemetry
function TelemetryPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="w-5 h-5" />
          Live Telemetry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <ZapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-sm">
            Real-time telemetry data will be displayed here
          </p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>• Speed Data</div>
          <div>• Throttle & Brake</div>
          <div>• Tire Information</div>
          <div>• Lap Times</div>
          <div>• Position Data</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Header Component
function Header({ selectedSession, driverCount }: { selectedSession: any; driverCount: number }) {
  return (
    <header className="border-b border-zinc-700 bg-zinc-900/50 backdrop-blur">
      <div className="w-full px-3 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Live Session Race View
          </h1>
          <p className="text-zinc-400 mt-1 text-sm sm:text-base">
            {selectedSession ? 
              `${selectedSession.session_name} - ${selectedSession.location}` : 
              "Watch entire F1 sessions unfold with real-time driver positions"
            }
          </p>
        </div>
        <div className="w-full md:w-auto md:shrink-0 flex items-center gap-4">
          {selectedSession && (
            <Badge variant="outline" className="text-zinc-300">
              {driverCount} Drivers
            </Badge>
          )}
          <F1RaceSelector />
        </div>
      </div>
    </header>
  );
}

// Footer with Video Controls
function VideoControlsFooter({
  animationState,
  onPlayPause,
  onReset,
  onSpeedChange,
  onProgressChange,
  isLoading,
  loadingProgress
}: {
  animationState: any;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onProgressChange: (progress: number) => void;
  isLoading: boolean;
  loadingProgress: any;
}) {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-4">
      <div className="space-y-4">
        {/* Loading Progress */}
        {loadingProgress.isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">
                Loading driver location data...
              </span>
              <span className="text-zinc-300 font-medium">
                {loadingProgress.loaded} / {loadingProgress.total}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${loadingProgress.total > 0 ? 
                    (loadingProgress.loaded / loadingProgress.total) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Video Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Main Controls */}
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
              disabled={isLoading}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
            >
              <RotateCcwIcon className="w-4 h-4" />
            </Button>
            
            <Button
              size="lg"
              onClick={onPlayPause}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {animationState.isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
              {animationState.isPlaying ? "Pause" : "Play"}
            </Button>

            {/* Progress Info */}
            <div className="text-sm text-zinc-400">
              Progress: {Math.round(animationState.progress * 100)}%
            </div>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400 mr-2">
              Speed: {animationState.speed}x
            </span>
            {[0.25, 0.5, 1, 2, 4].map((speed) => (
              <Button
                key={speed}
                variant={animationState.speed === speed ? "default" : "outline"}
                size="sm"
                onClick={() => onSpeedChange(speed)}
                className="w-12 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-2">
          <Slider
            value={[animationState.progress * 100]}
            onValueChange={([value]) => onProgressChange(value / 100)}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </footer>
  );
}

export default function TrackSessionRaceViewPage() {
  const { selectedSession } = useRaceStore();
  const [loadingProgress, setLoadingProgress] = useState<{
    loaded: number;
    total: number;
    isLoading: boolean;
  }>({ loaded: 0, total: 0, isLoading: false });
  
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  const [animationState, setAnimationState] = useState({
    isPlaying: false,
    progress: 0,
    speed: 1,
  });

  // Get drivers for the selected session
  const { data: driverData = [], isLoading: isDriversLoading } = useQuery({
    queryKey: ["drivers", selectedSession?.session_key],
    queryFn: () =>
      selectedSession
        ? f1Api.getDrivers(selectedSession.session_key)
        : Promise.resolve([]),
    enabled: !!selectedSession,
  });

  // Get location data for all drivers in the session
  const { 
    data: sessionLocationData = {}, 
    isLoading: isLocationDataLoading,
    error: locationError 
  } = useQuery({
    queryKey: ["session-location-data", selectedSession?.session_key],
    queryFn: async () => {
      if (!selectedSession) return {};
      
      setLoadingProgress({ loaded: 0, total: 0, isLoading: true });
      
      const data = await f1Api.getAllDriversLocationData(
        selectedSession.session_key,
        {
          batchSize: 3, // Smaller batches to be more conservative
          delayBetweenBatches: 150, // Slightly longer delay
          onProgress: (loaded, total) => {
            setLoadingProgress({ loaded, total, isLoading: true });
          }
        }
      );
      
      setLoadingProgress({ loaded: 0, total: 0, isLoading: false });
      return data;
    },
    enabled: !!selectedSession,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2, // Retry failed requests
  });

  // Auto-select top 6 drivers when data loads
  useEffect(() => {
    if (driverData.length > 0 && selectedDrivers.length === 0) {
      // Select first 6 drivers by driver number
      const topDrivers = driverData
        .sort((a, b) => a.driver_number - b.driver_number)
        .slice(0, 6)
        .map(d => d.driver_number);
      setSelectedDrivers(topDrivers);
    }
  }, [driverData, selectedDrivers.length]);

  const toggleDriver = (driverNumber: number) => {
    setSelectedDrivers(prev => 
      prev.includes(driverNumber)
        ? prev.filter(d => d !== driverNumber)
        : [...prev, driverNumber]
    );
  };

  const handlePlayPause = () => {
    setAnimationState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const handleReset = () => {
    setAnimationState(prev => ({
      ...prev,
      isPlaying: false,
      progress: 0
    }));
  };

  const handleSpeedChange = (speed: number) => {
    setAnimationState(prev => ({
      ...prev,
      speed
    }));
  };

  const handleProgressChange = (progress: number) => {
    setAnimationState(prev => ({
      ...prev,
      progress
    }));
  };

  const isLoading = isDriversLoading || isLocationDataLoading;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <Header selectedSession={selectedSession} driverCount={driverData.length} />

      {/* Main Content Area */}
      <main className="grid flex-1 grid-cols-12 gap-6 p-6">
        {/* Left Panel - Driver Selector */}
        <aside className="col-span-3">
          <SessionDriverSelector
            driverData={driverData}
            selectedDrivers={selectedDrivers}
            onToggleDriver={toggleDriver}
            sessionLocationData={sessionLocationData}
            isLoading={isLoading}
          />
        </aside>

        {/* Center - Track Visualization */}
        <section className="col-span-6">
          {selectedSession ? (
            <SessionRaceVisualization
              selectedSession={selectedSession}
              selectedDrivers={selectedDrivers}
              locationData={sessionLocationData}
              driverData={driverData}
              animationState={animationState}
              isLoading={isLoading}
              onAnimationStateChange={setAnimationState}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <ZapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Session</h3>
                <p className="text-muted-foreground">
                  Choose a race session to view the track visualization
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Right Panel - Telemetry */}
        <aside className="col-span-3">
          <TelemetryPanel />
        </aside>
      </main>

      {/* Footer with Video Controls */}
      <VideoControlsFooter
        animationState={animationState}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
        onProgressChange={handleProgressChange}
        isLoading={isLoading}
        loadingProgress={loadingProgress}
      />

      {/* Error Display */}
      {locationError && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-4">
              <div className="text-destructive text-sm">
                <p className="font-semibold">Error loading location data</p>
                <p className="mt-1">
                  {locationError instanceof Error ? locationError.message : String(locationError)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}