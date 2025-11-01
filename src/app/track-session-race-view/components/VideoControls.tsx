import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { PauseIcon, PlayIcon, RotateCcwIcon } from '@/app/assets/Icons';

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
  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-4">
      <div className="space-y-4">
        {/* Session Info */}
        {sessionData && <SessionInfo sessionData={sessionData} />}

        {/* Loading Progress */}
        {loadingProgress.isLoading && (
          <LoadingProgressBar loadingProgress={loadingProgress} />
        )}

        {/* Video Controls */}
        <div className="flex items-center justify-between">
          <PlaybackControls
            animationState={animationState}
            onPlayPause={onPlayPause}
            onReset={onReset}
            isLoading={isLoading}
          />

          <SpeedControls
            animationState={animationState}
            onSpeedChange={onSpeedChange}
          />
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
  isLoading,
}: {
  animationState: AnimationState;
  onPlayPause: () => void;
  onReset: () => void;
  isLoading: boolean;
}) => (
  <div className="flex items-center gap-4">
    {/* Main Controls */}
    <Button
      variant="outline"
      size="icon"
      onClick={onReset}
      disabled={isLoading}
      className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
    >
      <RotateCcwIcon className="h-4 w-4" />
    </Button>

    <Button
      size="lg"
      onClick={onPlayPause}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {animationState.isPlaying ? (
        <PauseIcon className="h-5 w-5" />
      ) : (
        <PlayIcon className="h-5 w-5" />
      )}
      {animationState.isPlaying ? 'Pause' : 'Play'}
    </Button>

    {/* Progress Info */}
    <div className="text-sm text-zinc-400">
      Progress: {Math.round(animationState.progress * 100)}%
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
  // For 3.7 Hz data: adjusted for slower speeds with 0.05 default and 0.5 max
  const DATA_RATE = 3.7;
  const getUserSpeed = (internalSpeed: number) => internalSpeed / DATA_RATE;

  return (
    <div className="flex items-center gap-2">
      <div className="mr-2 text-sm text-zinc-400">
        <div>Speed: {getUserSpeed(animationState.speed).toFixed(3)}x</div>
        <div className="text-xs opacity-75">
          ({animationState.speed.toFixed(2)}x internal)
        </div>
      </div>
      {[0.0185, 0.037, 0.074, 0.111, 0.185, 0.37, 0.555, 0.925, 1.85].map(
        speed => (
          <Button
            key={speed}
            variant={animationState.speed === speed ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSpeedChange(speed)}
            className="w-16 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          >
            {getUserSpeed(speed).toFixed(3)}x
          </Button>
        )
      )}
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
