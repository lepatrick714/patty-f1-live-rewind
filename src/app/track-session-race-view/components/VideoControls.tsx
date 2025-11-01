import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { PauseIcon, PlayIcon, RotateCcwIcon } from '@/app/assets/Icons';
import { ANIMATION_SPEEDS } from '@/constants/animation';

interface AnimationState {
  isPlaying: boolean;
  progress: number;
  speed: number;
}

interface LoadingProgress {
  isLoading: boolean;
  loaded: number;
  total: number;
  progressInfo?: {
    driverName?: string;
    driverNumber?: number;
    currentChunk: number;
    totalChunks: number;
  };
}

interface VideoControlsProps {
  animationState: AnimationState;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onProgressChange: (progress: number) => void;
  isLoading: boolean;
  loadingProgress: LoadingProgress;
  sessionData?: {
    session_name?: string;
    date_start?: string;
    location?: string;
  };
}

export const VideoControls = ({
  animationState,
  onPlayPause,
  onReset,
  onSpeedChange,
  onProgressChange,
  isLoading,
  loadingProgress,
  sessionData,
}: VideoControlsProps) => {
  const isDisabled = isLoading || !sessionData;
  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {/* Session Info */}
        {sessionData && <SessionInfo sessionData={sessionData} />}

        {/* Loading Progress */}
        {loadingProgress.isLoading && (
          <LoadingProgressBar loadingProgress={loadingProgress} />
        )}

        {/* Video Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <PlaybackControls
            animationState={animationState}
            onPlayPause={onPlayPause}
            onReset={onReset}
            isDisabled={isDisabled}
          />

          <SpeedControls
            animationState={animationState}
            onSpeedChange={onSpeedChange}
          />
        </div>

        {/* Progress Slider */}
        <div className="space-y-4 py-4 sm:py-6">
          <Slider
            value={[animationState.progress * 100]}
            onValueChange={([value]) => onProgressChange(value / 100)}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

// Loading Progress Component
const LoadingProgressBar = ({
  loadingProgress,
}: {
  loadingProgress: LoadingProgress;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">
        {loadingProgress.progressInfo
          ? `Loading ${loadingProgress.progressInfo.driverName || `Driver #${loadingProgress.progressInfo.driverNumber}`} - Chunk ${loadingProgress.progressInfo.currentChunk}/${loadingProgress.progressInfo.totalChunks}`
          : 'Loading driver location data...'}
      </span>
      <span className="font-medium text-zinc-300">
        {loadingProgress.loaded} / {loadingProgress.total}
      </span>
    </div>
    <div className="h-2 w-full rounded-full bg-zinc-800">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{
          width: `${
            loadingProgress.total > 0
              ? (loadingProgress.loaded / loadingProgress.total) * 100
              : 0
          }%`,
        }}
      />
    </div>
  </div>
);

// Playback Controls Component
const PlaybackControls = ({
  animationState,
  onPlayPause,
  onReset,
  isDisabled,
}: {
  animationState: AnimationState;
  onPlayPause: () => void;
  onReset: () => void;
  isDisabled: boolean;
}) => (
  <div className="flex items-center gap-2 sm:gap-4">
    {/* Main Controls */}
    <Button
      variant="outline"
      size="icon"
      onClick={onReset}
      disabled={isDisabled}
      className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 sm:h-10 sm:w-10"
    >
      <RotateCcwIcon className="h-3 w-3 sm:h-4 sm:w-4" />
    </Button>

    <Button
      size="sm"
      onClick={onPlayPause}
      disabled={isDisabled}
      className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm md:size-lg"
    >
      {animationState.isPlaying ? (
        <PauseIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      ) : (
        <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      )}
      <span className="hidden sm:inline">
        {animationState.isPlaying ? 'Pause' : 'Play'}
      </span>
    </Button>

    {/* Progress Info */}
    <div className="text-xs text-zinc-400 sm:text-sm">
      {Math.round(animationState.progress * 100)}%
    </div>
  </div>
);

// Speed Controls Component
const SpeedControls = ({
  animationState,
  onSpeedChange,
}: {
  animationState: AnimationState;
  onSpeedChange: (speed: number) => void;
}) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
      <div className="text-xs text-zinc-400 sm:mr-2 sm:text-sm">
        <div>Speed: {ANIMATION_SPEEDS.getUserSpeed(animationState.speed).toFixed(3)}x</div>
        <div className="text-xs opacity-75 sm:hidden md:block">
          ({animationState.speed.toFixed(2)}x internal)
        </div>
      </div>
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {ANIMATION_SPEEDS.SPEED_OPTIONS.map(speed => (
          <Button
            key={speed}
            variant={animationState.speed === speed ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSpeedChange(speed)}
            className="h-7 w-12 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700 sm:h-8 sm:w-14 sm:text-sm md:w-16"
          >
            {ANIMATION_SPEEDS.getUserSpeed(speed).toFixed(3)}x
          </Button>
        ))}
      </div>
    </div>
  );
};

// Session Info Component
const SessionInfo = ({
  sessionData,
}: {
  sessionData: {
    session_name?: string;
    date_start?: string;
    location?: string;
  };
}) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex items-center justify-between text-sm text-zinc-400">
      <div className="flex items-center gap-4">
        {sessionData.session_name && (
          <span className="font-medium text-zinc-300">
            {sessionData.session_name}
          </span>
        )}
        {sessionData.location && <span>{sessionData.location}</span>}
      </div>
      {sessionData.date_start && (
        <span className="text-xs">
          {formatDateTime(sessionData.date_start)}
        </span>
      )}
    </div>
  );
};
