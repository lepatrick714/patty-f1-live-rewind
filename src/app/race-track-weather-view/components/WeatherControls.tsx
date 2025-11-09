'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { PlayIcon, PauseIcon, RotateCcwIcon } from '@/app/assets/Icons';
import { format } from 'date-fns';

interface AnimationState {
  isPlaying: boolean;
  progress: number;
  speed: number;
}

interface WeatherControlsProps {
  animationState: AnimationState;
  onAnimationStateChange: (state: AnimationState) => void;
  sessionStart: string;
  sessionEnd: string;
}

export function WeatherControls({
  animationState,
  onAnimationStateChange,
  sessionStart,
  sessionEnd,
}: WeatherControlsProps) {
  const handlePlayPause = () => {
    onAnimationStateChange({
      ...animationState,
      isPlaying: !animationState.isPlaying,
    });
  };

  const handleReset = () => {
    onAnimationStateChange({
      ...animationState,
      progress: 0,
      isPlaying: false,
    });
  };

  const handleProgressChange = (value: number[]) => {
    onAnimationStateChange({
      ...animationState,
      progress: value[0],
      isPlaying: false,
    });
  };

  const handleSpeedChange = (value: number[]) => {
    onAnimationStateChange({
      ...animationState,
      speed: value[0],
    });
  };

  // Calculate current time based on progress
  const getCurrentTime = () => {
    if (!sessionStart || !sessionEnd) return '--:--:--';
    
    const start = new Date(sessionStart).getTime();
    const end = new Date(sessionEnd).getTime();
    
    // Check if dates are valid
    if (isNaN(start) || isNaN(end)) return '--:--:--';
    
    const current = start + animationState.progress * (end - start);
    const currentDate = new Date(current);
    
    // Check if resulting date is valid
    if (isNaN(currentDate.getTime())) return '--:--:--';
    
    return format(currentDate, 'HH:mm:ss');
  };

  return (
    <Card className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Playback Controls</h3>

        {/* Time display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Time</span>
          <span className="font-mono text-zinc-100">{getCurrentTime()}</span>
        </div>

        {/* Progress slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Progress</span>
            <span>{Math.round(animationState.progress * 100)}%</span>
          </div>
          <Slider
            value={[animationState.progress]}
            onValueChange={handleProgressChange}
            min={0}
            max={1}
            step={0.001}
            className="w-full"
          />
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayPause}
            variant="default"
            size="sm"
            className="flex-1"
          >
            {animationState.isPlaying ? (
              <>
                <PauseIcon className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="mr-2 h-4 w-4" />
                Play
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
          >
            <RotateCcwIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Speed control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Speed</span>
            <span>{animationState.speed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[animationState.speed]}
            onValueChange={handleSpeedChange}
            min={0.1}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}
