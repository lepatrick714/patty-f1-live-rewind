
import { Card, CardContent } from "@/components/card";
import { Slider } from "@/components/slider";
import { Button } from "@/components/button";
import { PlayIcon, PauseIcon, RotateCcwIcon, ZapIcon } from "@/app/assets/Icons";
import { useRef } from "react";

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
    const togglePlayPause = () => { }; // STUB
    const resetAnimation = () => { }; // STUB
    const updateSpeed = (speed: number) => { }; // STUB
    const updateProgress = (progress: number) => { }; // STUB

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

    const resetCamera = () => { }; // STUB

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

    const render = () => { }; // STUB

    // ============================================================================
    // EMPTY STATE: No session selected
    // ============================================================================
    if (!selectedSession) {
        return (
            <Card
                className="w-full h-[500px] lg:h-[70vh] xl:h-[80vh] flex items-center justify-center rounded-xl overflow-hidden border"
                style={{ background: "#0f0f12", borderColor: "#222" }}
            >
                <CardContent className="p-0 w-full h-full">
                    <div className="text-center">
                        <ZapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
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
                className="w-full h-[500px] lg:h-[70vh] xl:h-[80vh] flex items-center justify-center rounded-xl overflow-hidden border"
                style={{ background: "#0f0f12", borderColor: "#222" }}
            >
                <CardContent className="p-0 w-full h-full">
                    <div className="text-center">
                        <ZapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select Drivers</h3>
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
            className="rounded-xl overflow-hidden border w-full h-[500px] lg:h-[70vh] xl:h-[80vh] flex flex-col py-0"
            style={{ background: "#0f0f12", borderColor: "#222" }}
        >
            <CardContent className="p-0 flex-1">
                {/* ==================================================================== */}
                {/* LOADING STATE */}
                {/* ==================================================================== */}
                {isLoading ? (
                    <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center space-y-2">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground">
                                Loading track data...
                            </p>
                        </div>
                    </div>
                ) : processedDrivers.length === 0 ? (
                    /* ================================================================== */
                    /* EMPTY STATE: No GPS data */
                    /* ================================================================== */
                    <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
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
                            className="w-full h-full"
                            style={{
                                imageRendering: "auto",
                                touchAction: "none",
                                background: "#0f0f12",
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
                            <div className="pointer-events-auto flex w-full items-center justify-between gap-2 sm:gap-3 rounded-[12px] px-1.5 py-1 sm:px-3 sm:py-2 bg-[rgba(15,15,18,0.65)] backdrop-blur-md border border-[#2a2b31] overflow-hidden flex-wrap sm:flex-nowrap">
                                {/* ========================================================== */}
                                {/* LEFT CONTROLS: Play/Pause, Reset, Reset Camera */}
                                {/* ========================================================== */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                        onClick={togglePlayPause}
                                        disabled={isLoading || processedDrivers.length === 0}
                                        title={animationState.isPlaying ? "Pause" : "Play"}
                                    >
                                        {animationState.isPlaying ? (
                                            <PauseIcon className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
                                        ) : (
                                            <PlayIcon className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                        onClick={resetAnimation}
                                        disabled={isLoading || processedDrivers.length === 0}
                                        title="Restart"
                                    >
                                        <RotateCcwIcon className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 sm:h-7 px-2 text-[10px] sm:text-xs leading-none"
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
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                                    {/* Progress Slider */}
                                    <div className="flex items-center gap-2 w-40 sm:w-56 shrink-0">
                                        <span className="text-xs text-zinc-300 select-none">
                                            Progress
                                        </span>
                                        <Slider
                                            value={[animationState.progress * 100]}
                                            onValueChange={(value) => updateProgress(value[0] / 100)}
                                            max={100}
                                            step={1}
                                            className="w-full h-5 sm:h-6 touch-pan-y"
                                            aria-label="Animation progress"
                                        />
                                        <span className="text-[10px] sm:text-xs text-zinc-400 w-7 sm:w-8 text-right tabular-nums select-none">
                                            {Math.round(animationState.progress * 100)}%
                                        </span>
                                    </div>

                                    {/* Speed Slider */}
                                    <div className="flex items-center gap-2 w-36 sm:w-48 shrink-0">
                                        <span className="text-[10px] sm:text-xs text-zinc-300 select-none">
                                            Speed
                                        </span>
                                        <Slider
                                            value={[animationState.speed]}
                                            onValueChange={(value) => updateSpeed(value[0])}
                                            min={0.1}
                                            max={3}
                                            step={0.1}
                                            className="w-full h-5 sm:h-6 touch-pan-y"
                                            aria-label="Playback speed"
                                        />
                                        <span className="text-[10px] sm:text-xs text-zinc-400 w-9 sm:w-10 text-right tabular-nums select-none">
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