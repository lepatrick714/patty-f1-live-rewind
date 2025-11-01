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
  ZapIcon
} from "@/app/assets/Icons";
import { SessionDriverSelector } from "@/components/session-driver-selector";
import { TelemetryPanel } from "@/components/f1-telemetry-panels/f1-single-driver-telemetry-panel";

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
                {loadingProgress.progressInfo ? 
                  `Loading ${loadingProgress.progressInfo.driverName || `Driver #${loadingProgress.progressInfo.driverNumber}`} - Chunk ${loadingProgress.progressInfo.currentChunk}/${loadingProgress.progressInfo.totalChunks}` :
                  "Loading driver location data..."
                }
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
  const raceStore = useRaceStore();
  
  const [animationState, setAnimationState] = useState({
    isPlaying: false,
    progress: 0,
    speed: 1,
  });

  // Track active fetch promises so we can cancel them
  const [activeFetches, setActiveFetches] = useState<Map<number, AbortController>>(new Map());

  // Get drivers for the selected session
  const { data: driverData = [], isLoading: isDriversLoading } = useQuery({
    queryKey: ["drivers", raceStore.selectedSession?.session_key],
    queryFn: () =>
      raceStore.selectedSession
        ? f1Api.getDrivers(raceStore.selectedSession.session_key)
        : Promise.resolve([]),
    enabled: !!raceStore.selectedSession,
  });

  // Function to fetch location data for a single driver
  const fetchSingleDriverData = async (driverNumber: number): Promise<void> => {
    if (!raceStore.selectedSession) return;
    
    // Create an AbortController for this fetch
    const abortController = new AbortController();
    const currentSessionKey = raceStore.selectedSession.session_key;
    
    // Store the controller so we can cancel it later
    setActiveFetches(prev => new Map(prev.set(driverNumber, abortController)));
    
    // Mark as fetching
    raceStore.addFetchingDriver(driverNumber);
    raceStore.setIsLocationDataLoading(true);
    
    try {
      const data = await f1Api.getSingleDriverLocationData(
        currentSessionKey,
        driverNumber,
        {
          onProgress: (loaded, total, info) => {
            // Only update progress if this fetch hasn't been cancelled and session hasn't changed
            if (!abortController.signal.aborted && raceStore.selectedSession?.session_key === currentSessionKey) {
              raceStore.setLoadingProgress({ loaded, total, isLoading: true, progressInfo: info });
            }
          }
        }
      );
      
      // Only update data if this fetch hasn't been cancelled and session hasn't changed
      if (!abortController.signal.aborted && raceStore.selectedSession?.session_key === currentSessionKey) {
        // Update session data with this driver's data
        const newData = { 
          ...raceStore.sessionLocationData, 
          [driverNumber]: data 
        };
        raceStore.setSessionLocationData(newData);
        
        // Mark driver as loaded
        raceStore.addLoadedDriver(driverNumber);
        
        // Only auto-select if the user hasn't selected any drivers yet AND this driver has data
        if (data.length > 0 && raceStore.selectedDrivers.length === 0) {
          raceStore.toggleDriver(driverNumber);
        }
      }
      
    } catch (error) {
      // Only log error if it's not due to cancellation or session change
      if (!abortController.signal.aborted && raceStore.selectedSession?.session_key === currentSessionKey) {
        console.error(`Error fetching driver ${driverNumber} location data:`, error);
        raceStore.setLocationError(error as Error);
      }
    } finally {
      // Clean up: remove from active fetches and fetching set
      setActiveFetches(prev => {
        const newMap = new Map(prev);
        newMap.delete(driverNumber);
        return newMap;
      });
      
      raceStore.removeFetchingDriver(driverNumber);
    }
  };

  // Effect to manage loading state based on active fetches
  useEffect(() => {
    if (activeFetches.size === 0) {
      raceStore.setIsLocationDataLoading(false);
      raceStore.setLoadingProgress({ loaded: 0, total: 0, isLoading: false });
    }
  }, [activeFetches.size]);

  // Handle manual driver fetch - simplified
  const handleFetchDriver = (driverNumber: number) => {
    // Don't fetch if already loaded or currently fetching
    if (raceStore.loadedDrivers.has(driverNumber) || raceStore.fetchingDrivers.has(driverNumber)) {
      return;
    }
    
    fetchSingleDriverData(driverNumber);
  };

  // Function to cancel all active fetches
  const cancelAllFetches = () => {
    activeFetches.forEach((controller) => {
      controller.abort();
    });
    setActiveFetches(new Map());
    
    // Clear fetching state
    raceStore.setFetchingDrivers(new Set());
    raceStore.setIsLocationDataLoading(false);
    raceStore.setLoadingProgress({ loaded: 0, total: 0, isLoading: false });
  };

  // Reset state when session changes (but don't auto-fetch)
  useEffect(() => {
    if (driverData.length > 0 && raceStore.selectedSession) {
      // Cancel any ongoing fetches from the previous session
      cancelAllFetches();
      
      // Reset all state when session changes
      raceStore.setSessionLocationData({});
      raceStore.setLoadedDrivers(new Set());
      raceStore.setFetchingDrivers(new Set());
      raceStore.setLocationError(null);
      raceStore.setIsLocationDataLoading(false);
      raceStore.setLoadingProgress({ loaded: 0, total: 0, isLoading: false });
      
      // Clear selected drivers to prevent showing stale driver positions
      raceStore.clearSelectedDrivers();
      
      // Reset animation state to prevent showing stale track visualization
      setAnimationState({
        isPlaying: false,
        progress: 0,
        speed: 1,
      });
    }
  }, [driverData, raceStore.selectedSession]);

  // Cleanup: cancel all fetches when component unmounts
  useEffect(() => {
    return () => {
      cancelAllFetches();
    };
  }, []);

  // Handle driver toggle
  const handleDriverToggle = (driverNumber: number) => {
    raceStore.toggleDriver(driverNumber);
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

  const isLoading = isDriversLoading || raceStore.isLocationDataLoading;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <Header selectedSession={raceStore.selectedSession} driverCount={driverData.length} />

      {/* Main Content Area */}
      <main className="grid flex-1 grid-cols-12 gap-6 p-6">
        {/* Left Panel - Driver Selector */}
        <aside className="col-span-3">
          <SessionDriverSelector
            driverData={driverData}
            selectedDrivers={raceStore.selectedDrivers}
            onToggleDriver={handleDriverToggle}
            sessionLocationData={raceStore.sessionLocationData}
            isLoading={raceStore.isLocationDataLoading}
            loadingProgress={raceStore.loadingProgress}
            loadedDrivers={raceStore.loadedDrivers}
            fetchingDrivers={raceStore.fetchingDrivers}
            onFetchDriver={handleFetchDriver}
          />
        </aside>

        {/* Center - Track Visualization */}
        <section className="col-span-6">
          {raceStore.selectedSession ? (
            <SessionRaceVisualization
              selectedSession={raceStore.selectedSession}
              selectedDrivers={raceStore.selectedDrivers}
              locationData={raceStore.sessionLocationData}
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
          <TelemetryPanel driverNumber={raceStore.selectedDrivers[0]} />
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
        loadingProgress={raceStore.loadingProgress}
      />

      {/* Error Display */}
      {raceStore.locationError && (
        <div className="bg-destructive/15 border-destructive/50 border text-destructive p-4 m-6 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Error loading location data:</div>
            <div className="text-sm">
              {raceStore.locationError instanceof Error ? raceStore.locationError.message : String(raceStore.locationError)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
