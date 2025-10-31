import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  ZapIcon,
} from '@/app/assets/Icons';
import { useRef } from 'react';

interface TrackVisualizationProps {
  // Props will come from Container component
  driverData?: Array<{
    driver_number: number;
    name_acronym: string;
    full_name: string;
    team_name: string;
    team_colour: string;
  }>;
  allLapData?: Record<number, any[]>;
  locationData?: Record<number, GPSPoint[]>;
  masterLapTime?: number;
  isLoading?: boolean;
  selectedSession?: any;
  selectedDrivers?: number[];
}

interface GPSPoint {
  date: string;
  x: number;
  y: number;
  z: number;
  elapsed: number;
}

function TrackVisualization({
  driverData = [],
  allLapData = {},
  locationData = {},
  masterLapTime = 0,
  isLoading = false,
  selectedSession,
  selectedDrivers = [],
}: TrackVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================================================
  // TODO: IMPLEMENT - Extract to useTrackAnimation hook
  // ============================================================================
  // const {
  //   animationState,
  //   progressRef,
  //   togglePlayPause,
  //   resetAnimation,
  //   updateSpeed,
  //   updateProgress
  // } = useTrackAnimation({
  //   processedDrivers,
  //   masterLapTime,
  //   onProgressChange: (progress) => {
  //     setAnimationProgress(progress); // store sync
  //     render(); // trigger render
  //   }
  // });
  // ============================================================================

  const animationState = { isPlaying: false, progress: 0, speed: 1 }; // STUB
  const togglePlayPause = () => {}; // STUB
  const resetAnimation = () => {}; // STUB
  const updateSpeed = (speed: number) => {}; // STUB
  const updateProgress = (progress: number) => {}; // STUB

  // ============================================================================
  // TODO: IMPLEMENT - Extract to useTrackCamera hook
  // ============================================================================
  // const {
  //   cameraRef,
  //   worldToCanvas,
  //   resetCamera,
  //   attachCameraEvents
  // } = useTrackCamera({
  //   bounds,
  //   trackOpts,
  //   canvasRef
  // });
  //
  // useEffect(() => {
  //   if (!canvasRef.current) return;
  //   return attachCameraEvents(canvasRef.current);
  // }, [attachCameraEvents, bounds]);
  // ============================================================================

  const resetCamera = () => {}; // STUB

  // ============================================================================
  // TODO: IMPLEMENT - Extract to trackDataProcessing.ts utility
  // ============================================================================
  // const processedDrivers = processDriverData(
  //   selectedDrivers,
  //   driverData,
  //   locationData,
  //   allLapData
  // );
  //
  // const bounds = calculateBounds(processedDrivers);
  // ============================================================================

  const processedDrivers: any[] = []; // STUB
  const bounds = null; // STUB

  // ============================================================================
  // TODO: IMPLEMENT - Extract to useCanvasRenderer hook
  // ============================================================================
  // const { render } = useCanvasRenderer({
  //   canvasRef,
  //   bounds,
  //   processedDrivers,
  //   trackOpts,
  //   worldToCanvas,
  //   progressRef,
  //   cameraRef
  // });
  //
  // This hook should:
  // 1. Handle canvas setup (DPR, sizing)
  // 2. Manage RAF loop
  // 3. Call drawing functions (drawTrack, drawCars, drawTrajectories)
  // 4. Handle window resize events
  // ============================================================================

  const render = () => {}; // STUB

  // ============================================================================
  // EMPTY STATE: No session selected
  // ============================================================================
  if (!selectedSession) {
    return (
      <Card
        className="flex h-[500px] w-full items-center justify-center overflow-hidden rounded-xl border lg:h-[70vh] xl:h-[80vh]"
        style={{ background: '#0f0f12', borderColor: '#222' }}
      >
        <CardContent className="h-full w-full p-0">
          <div className="text-center">
            <ZapIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Ready to Analyze</h3>
            <p className="text-muted-foreground">
              Select a race session and drivers to view the track visualization.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // EMPTY STATE: No drivers selected
  // ============================================================================
  if (selectedDrivers.length === 0) {
    return (
      <Card
        className="flex h-[500px] w-full items-center justify-center overflow-hidden rounded-xl border lg:h-[70vh] xl:h-[80vh]"
        style={{ background: '#0f0f12', borderColor: '#222' }}
      >
        <CardContent className="h-full w-full p-0">
          <div className="text-center">
            <ZapIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Select Drivers</h3>
            <p className="text-muted-foreground">
              Choose drivers to compare on the track visualization.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // MAIN RENDER: Track Visualization with Controls
  // ============================================================================
  return (
    <Card
      className="flex h-[500px] w-full flex-col overflow-hidden rounded-xl border py-0 lg:h-[70vh] xl:h-[80vh]"
      style={{ background: '#0f0f12', borderColor: '#222' }}
    >
      <CardContent className="flex-1 p-0">
        {/* ==================================================================== */}
        {/* LOADING STATE */}
        {/* ==================================================================== */}
        {isLoading ? (
          <div className="bg-muted/20 flex h-full items-center justify-center rounded-lg">
            <div className="space-y-2 text-center">
              <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-muted-foreground text-sm">
                Loading track data...
              </p>
            </div>
          </div>
        ) : processedDrivers.length === 0 ? (
          /* ================================================================== */
          /* EMPTY STATE: No GPS data */
          /* ================================================================== */
          <div className="bg-muted/20 flex h-full items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground">
                No GPS data available for selected drivers
              </p>
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* CANVAS + CONTROLS */
          /* ==================================================================== */
          <div className="relative h-full">
            {/* ================================================================ */}
            {/* CANVAS - Rendered by useCanvasRenderer hook */}
            {/* ================================================================ */}
            <canvas
              ref={canvasRef}
              className="h-full w-full"
              style={{
                imageRendering: 'auto',
                touchAction: 'none',
                background: '#0f0f12',
              }}
            />

            {/* ================================================================ */}
            {/* CONTROLS OVERLAY - Extract to <TrackControls /> component */}
            {/* ================================================================ */}
            {/* 
            <TrackControls
              animationState={animationState}
              isLoading={isLoading}
              hasData={processedDrivers.length > 0}
              onTogglePlayPause={togglePlayPause}
              onReset={resetAnimation}
              onResetCamera={() => { resetCamera(); render(); }}
              onProgressChange={updateProgress}
              onSpeedChange={updateSpeed}
            />
            */}
            <div className="pointer-events-none absolute inset-0 flex items-end p-3">
              <div className="pointer-events-auto flex w-full flex-wrap items-center justify-between gap-2 overflow-hidden rounded-[12px] border border-[#2a2b31] bg-[rgba(15,15,18,0.65)] px-1.5 py-1 backdrop-blur-md sm:flex-nowrap sm:gap-3 sm:px-3 sm:py-2">
                {/* ========================================================== */}
                {/* LEFT CONTROLS: Play/Pause, Reset, Reset Camera */}
                {/* ========================================================== */}
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 p-0 sm:h-7 sm:w-7"
                    onClick={togglePlayPause}
                    disabled={isLoading || processedDrivers.length === 0}
                    title={animationState.isPlaying ? 'Pause' : 'Play'}
                  >
                    {animationState.isPlaying ? (
                      <PauseIcon className="h-[12px] w-[12px] sm:h-[14px] sm:w-[14px]" />
                    ) : (
                      <PlayIcon className="h-[12px] w-[12px] sm:h-[14px] sm:w-[14px]" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 p-0 sm:h-7 sm:w-7"
                    onClick={resetAnimation}
                    disabled={isLoading || processedDrivers.length === 0}
                    title="Restart"
                  >
                    <RotateCcwIcon className="h-[12px] w-[12px] sm:h-[14px] sm:w-[14px]" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] leading-none sm:h-7 sm:text-xs"
                    onClick={() => {
                      resetCamera();
                      render();
                    }}
                    disabled={isLoading || processedDrivers.length === 0}
                  >
                    Reset View
                  </Button>
                </div>

                {/* ========================================================== */}
                {/* RIGHT CONTROLS: Progress & Speed Sliders */}
                {/* ========================================================== */}
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
                  {/* Progress Slider */}
                  <div className="flex w-40 shrink-0 items-center gap-2 sm:w-56">
                    <span className="select-none text-xs text-zinc-300">
                      Progress
                    </span>
                    <Slider
                      value={[animationState.progress * 100]}
                      onValueChange={value => updateProgress(value[0] / 100)}
                      max={100}
                      step={1}
                      className="h-5 w-full touch-pan-y sm:h-6"
                      aria-label="Animation progress"
                    />
                    <span className="w-7 select-none text-right text-[10px] tabular-nums text-zinc-400 sm:w-8 sm:text-xs">
                      {Math.round(animationState.progress * 100)}%
                    </span>
                  </div>

                  {/* Speed Slider */}
                  <div className="flex w-36 shrink-0 items-center gap-2 sm:w-48">
                    <span className="select-none text-[10px] text-zinc-300 sm:text-xs">
                      Speed
                    </span>
                    <Slider
                      value={[animationState.speed]}
                      onValueChange={value => updateSpeed(value[0])}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="h-5 w-full touch-pan-y sm:h-6"
                      aria-label="Playback speed"
                    />
                    <span className="w-9 select-none text-right text-[10px] tabular-nums text-zinc-400 sm:w-10 sm:text-xs">
                      {animationState.speed.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { TrackVisualization };
