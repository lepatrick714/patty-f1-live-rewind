'use client';

import { useEffect } from 'react';
import { useRaceStore } from '@/hooks/useRaceStore';
import { Header, MainContent, ErrorDisplay } from './components';
import { useDriverDataManagement } from '@/hooks/useDriverDataManagement';
import { useAnimationState } from '@/hooks/useAnimationState';
import { VideoControls } from './components/VideoControls';
import { DEFAULT_ANIMATION_STATE } from '@/constants/animation';
import { Card } from '@/components/ui/card';

export default function TrackSessionRaceViewPage() {
  const raceStore = useRaceStore();

  // Custom hooks for state management
  const { driverData, isDriversLoading, handleFetchDriver, cancelAllFetches } =
    useDriverDataManagement();

  const {
    animationState,
    setAnimationState,
    handlePlayPause,
    handleReset,
    handleSpeedChange,
    handleProgressChange,
  } = useAnimationState();

  // Reset animation state when session changes
  useEffect(() => {
    if (raceStore.selectedSession) {
      setAnimationState(DEFAULT_ANIMATION_STATE);
    }
  }, [raceStore.selectedSession, setAnimationState]);

  // Handle driver toggle
  const handleDriverToggle = (driverNumber: number) => {
    raceStore.toggleDriver(driverNumber);
  };

  const isLoading = isDriversLoading || raceStore.isLocationDataLoading;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <div className="border-b border-zinc-700 bg-zinc-900/50 backdrop-blur p-2 md:p-3 gap-3">
        <Header
          selectedSession={raceStore.selectedSession}
          driverCount={driverData.length}
        />

        {/* Footer with Video Controls */}
        <VideoControls
          animationState={animationState}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          onProgressChange={handleProgressChange}
          isLoading={isLoading}
          loadingProgress={raceStore.loadingProgress}
          sessionData={raceStore.selectedSession || undefined}
        />
      </div>

      {/* Main Content Area */}
      <MainContent
        selectedSession={raceStore.selectedSession}
        driverData={driverData}
        selectedDrivers={raceStore.selectedDrivers}
        sessionLocationData={raceStore.sessionLocationData}
        isLocationDataLoading={raceStore.isLocationDataLoading}
        loadingProgress={raceStore.loadingProgress}
        loadedDrivers={raceStore.loadedDrivers}
        fetchingDrivers={raceStore.fetchingDrivers}
        animationState={animationState}
        isLoading={isLoading}
        onDriverToggle={handleDriverToggle}
        onFetchDriver={handleFetchDriver}
        onAnimationStateChange={setAnimationState}
      />

      {/* Error Display */}
      <ErrorDisplay error={raceStore.locationError} />
    </div>
  );
}
