import { Card, CardContent } from '@/components/ui/card';
import { ZapIcon } from '@/app/assets/Icons';
import { SessionDriverSelector } from '@/components/session-driver-selector';
import { SessionRaceVisualization } from '@/components/track-visualization';
import { TelemetryPanel } from '@/components/f1-telemetry-panels/f1-single-driver-telemetry-panel';

interface AnimationState {
  isPlaying: boolean;
  progress: number;
  speed: number;
}

interface MainContentProps {
  selectedSession: any;
  driverData: any[];
  selectedDrivers: number[];
  sessionLocationData: Record<number, any[]>;
  isLocationDataLoading: boolean;
  loadingProgress: any;
  loadedDrivers: Set<number>;
  fetchingDrivers: Set<number>;
  animationState: AnimationState;
  isLoading: boolean;
  onDriverToggle: (driverNumber: number) => void;
  onFetchDriver: (driverNumber: number) => void;
  onAnimationStateChange: (state: AnimationState) => void;
}

export const MainContent = ({
  selectedSession,
  driverData,
  selectedDrivers,
  sessionLocationData,
  isLocationDataLoading,
  loadingProgress,
  loadedDrivers,
  fetchingDrivers,
  animationState,
  isLoading,
  onDriverToggle,
  onFetchDriver,
  onAnimationStateChange,
}: MainContentProps) => {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      {/* Top Row - Driver Selector & Track Visualization */}
      <div className="grid flex-1 grid-cols-12 gap-6">
        {/* Driver Selector - 33% */}
        <aside className="col-span-4">
          <SessionDriverSelector
            driverData={driverData}
            selectedDrivers={selectedDrivers}
            onToggleDriver={onDriverToggle}
            sessionLocationData={sessionLocationData}
            isLoading={isLocationDataLoading}
            loadingProgress={loadingProgress}
            loadedDrivers={loadedDrivers}
            fetchingDrivers={fetchingDrivers}
            onFetchDriver={onFetchDriver}
          />
        </aside>

        {/* Track Visualization - 66% */}
        <section className="col-span-8">
          {selectedSession ? (
            <SessionRaceVisualization
              selectedSession={selectedSession}
              selectedDrivers={selectedDrivers}
              locationData={sessionLocationData}
              driverData={driverData}
              animationState={animationState}
              isLoading={isLoading}
              onAnimationStateChange={onAnimationStateChange}
            />
          ) : (
            <EmptySessionState />
          )}
        </section>
      </div>

      {/* Bottom Row - Telemetry Panel (Full Width) */}
      <section className="w-full">
        <TelemetryPanel
          animationProgress={animationState.progress}
          isPlaying={animationState.isPlaying}
          driverData={driverData}
        />
      </section>
    </main>
  );
};

// Empty Session State Component
const EmptySessionState = () => (
  <Card className="flex h-full items-center justify-center">
    <CardContent className="text-center">
      <ZapIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
      <h3 className="mb-2 text-lg font-semibold">Select a Session</h3>
      <p className="text-muted-foreground">
        Choose a race session to view the track visualization
      </p>
    </CardContent>
  </Card>
);
