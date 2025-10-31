import * as React from "react";
import { Button } from "../ui/button";
import { useRef } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon } from "@/app/assets/Icons";
import { Slider } from "../ui/slider";

type TrackPlayerControlsProps = {
    isLoading: boolean;
    animationState: {
        isPlaying: boolean;
        progress: number;
        speed: number;
    };
    processedDrivers: any[];
    cameraRef: React.RefObject<{ zoom: number; panX: number; panY: number }>;
    render: () => void;
    setAnimationState: React.Dispatch<React.SetStateAction<{
        isPlaying: boolean;
        progress: number;
        speed: number;
    }>>;
    progressRef: React.RefObject<number>;
    setAnimationProgress: (progress: number) => void;
    lastTimestampRef: React.RefObject<number>;
};

export const TrackPlayerControlsPanel = ({
    isLoading,
    animationState,
    processedDrivers,
    cameraRef,
    render,
    setAnimationState,
    progressRef,
    setAnimationProgress,
    lastTimestampRef
}: TrackPlayerControlsProps) => {
    
    const resetAnimation = () => {
        progressRef.current = 0;
        setAnimationState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
        setAnimationProgress(0);
        render();
    };

    const togglePlayPause = () => {
        setAnimationState((prev) => {
            if (!prev.isPlaying) lastTimestampRef.current = 0; // fresh delta after resume
            return { ...prev, isPlaying: !prev.isPlaying };
        });
    };
    return (
        <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="flex w-full items-center justify-between gap-2 sm:gap-3 rounded-[12px] px-1.5 py-1 sm:px-3 sm:py-2 bg-[rgba(15,15,18,0.65)] backdrop-blur-md border border-[#2a2b31] overflow-hidden flex-wrap sm:flex-nowrap">
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
                            cameraRef.current = { zoom: 1, panX: 0, panY: 0 };
                            render();
                        }}
                        disabled={isLoading || processedDrivers.length === 0}
                    >
                        Reset View
                    </Button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2 w-40 sm:w-56 shrink-0">
                        <span className="text-xs text-zinc-300 select-none">
                            Progress
                        </span>
                        <Slider
                            value={[animationState.progress * 100]}
                            onValueChange={(value) => {
                                const p = value[0] / 100;
                                progressRef.current = p;
                                setAnimationState((prev) => ({
                                    ...prev,
                                    progress: p,
                                }));
                                setAnimationProgress(p);
                                render();
                            }}
                            max={100}
                            step={1}
                            className="w-full h-5 sm:h-6 touch-pan-y"
                            aria-label="Animation progress"
                        />
                        <span className="text-[10px] sm:text-xs text-zinc-400 w-7 sm:w-8 text-right tabular-nums select-none">
                            {Math.round(animationState.progress * 100)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2 w-36 sm:w-48 shrink-0">
                        <span className="text-[10px] sm:text-xs text-zinc-300 select-none">
                            Speed
                        </span>
                        <Slider
                            value={[animationState.speed]}
                            onValueChange={(value) =>
                                setAnimationState((prev) => ({
                                    ...prev,
                                    speed: value[0],
                                }))
                            }
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
    );
}