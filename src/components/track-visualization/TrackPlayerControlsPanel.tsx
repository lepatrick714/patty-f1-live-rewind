import * as React from 'react';
import { Button } from '../ui/button';
import { useRef } from 'react';
import { PauseIcon, PlayIcon, RotateCcwIcon } from '@/app/assets/Icons';
import { Slider } from '../ui/slider';

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
  setAnimationState: React.Dispatch<
    React.SetStateAction<{
      isPlaying: boolean;
      progress: number;
      speed: number;
    }>
  >;
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
  lastTimestampRef,
}: TrackPlayerControlsProps) => {
  const resetAnimation = () => {
    progressRef.current = 0;
    setAnimationState(prev => ({ ...prev, isPlaying: false, progress: 0 }));
    setAnimationProgress(0);
    render();
  };

  const togglePlayPause = () => {
    setAnimationState(prev => {
      if (!prev.isPlaying) lastTimestampRef.current = 0; // fresh delta after resume
      return { ...prev, isPlaying: !prev.isPlaying };
    });
  };
  return (
    <div className="absolute bottom-3 left-3 right-3 z-10">
      <div className="flex w-full flex-wrap items-center justify-between gap-2 overflow-hidden rounded-[12px] border border-[#2a2b31] bg-[rgba(15,15,18,0.65)] px-1.5 py-1 backdrop-blur-md sm:flex-nowrap sm:gap-3 sm:px-3 sm:py-2">
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
              cameraRef.current = { zoom: 1, panX: 0, panY: 0 };
              render();
            }}
            disabled={isLoading || processedDrivers.length === 0}
          >
            Reset View
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          <div className="flex w-40 shrink-0 items-center gap-2 sm:w-56">
            <span className="select-none text-xs text-zinc-300">Progress</span>
            <Slider
              value={[animationState.progress * 100]}
              onValueChange={value => {
                const p = value[0] / 100;
                progressRef.current = p;
                setAnimationState(prev => ({
                  ...prev,
                  progress: p,
                }));
                setAnimationProgress(p);
                render();
              }}
              max={100}
              step={1}
              className="h-5 w-full touch-pan-y sm:h-6"
              aria-label="Animation progress"
            />
            <span className="w-7 select-none text-right text-[10px] tabular-nums text-zinc-400 sm:w-8 sm:text-xs">
              {Math.round(animationState.progress * 100)}%
            </span>
          </div>
          <div className="flex w-36 shrink-0 items-center gap-2 sm:w-48">
            <span className="select-none text-[10px] text-zinc-300 sm:text-xs">
              Speed
            </span>
            <Slider
              value={[animationState.speed]}
              onValueChange={value =>
                setAnimationState(prev => ({
                  ...prev,
                  speed: value[0],
                }))
              }
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
  );
};
