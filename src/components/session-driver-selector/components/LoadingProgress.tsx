import { ProgressInfo } from '@/utils/dateChunking';

interface LoadingProgressProps {
  loadingProgress: {
    loaded: number;
    total: number;
    isLoading: boolean;
    progressInfo?: ProgressInfo;
  };
}

export const LoadingProgress = ({ loadingProgress }: LoadingProgressProps) => (
  <div className="mt-3 space-y-2">
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground truncate pr-2">
        {loadingProgress.progressInfo
          ? `Loading ${loadingProgress.progressInfo.driverName || `Driver #${loadingProgress.progressInfo.driverNumber}`} - Chunk ${loadingProgress.progressInfo.currentChunk}/${loadingProgress.progressInfo.totalChunks}`
          : 'Loading location data...'}
      </span>
      <span className="text-muted-foreground shrink-0 font-medium">
        {loadingProgress.loaded} / {loadingProgress.total}
      </span>
    </div>
    <div className="bg-muted h-1.5 w-full rounded-full">
      <div
        className="bg-primary h-1.5 rounded-full transition-all duration-300"
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
