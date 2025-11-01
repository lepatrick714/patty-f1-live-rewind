import { Button } from '../../ui/button';
import { RaceCarIcon } from '@/app/assets/Icons';
import { ProgressInfo } from '@/utils/dateChunking';

interface DriverCardProps {
  driver: {
    driver_number: number;
    name_acronym: string;
    full_name?: string;
    team_name: string;
    team_colour: string;
    country_code?: string;
    headshot_url?: string;
  };
  isSelected: boolean;
  hasLocationData: boolean;
  isLoaded: boolean;
  isCurrentlyFetching: boolean;
  isCurrentlyLoading: boolean;
  driverProgress: number;
  shouldShowLoadingAnimation: boolean;
  loadingProgress?: {
    loaded: number;
    total: number;
    isLoading: boolean;
    progressInfo?: ProgressInfo;
  };
  onToggleDriver: (driverNumber: number) => void;
  onFetchDriver?: (driverNumber: number) => void;
}

export const DriverCard = ({
  driver,
  isSelected,
  hasLocationData,
  isLoaded,
  isCurrentlyFetching,
  isCurrentlyLoading,
  driverProgress,
  shouldShowLoadingAnimation,
  loadingProgress,
  onToggleDriver,
  onFetchDriver,
}: DriverCardProps) => {
  // Handle single button click logic
  const handleButtonClick = () => {
    if (isCurrentlyFetching || isCurrentlyLoading) {
      // Do nothing if already fetching/loading
      return;
    }
    
    if (!hasLocationData && !isLoaded && onFetchDriver) {
      // First click: fetch data
      onFetchDriver(driver.driver_number);
    } else {
      // Data is loaded: toggle selection
      onToggleDriver(driver.driver_number);
    }
  };

  // Determine button state and appearance
  let buttonText = 'Fetch Data';
  let buttonVariant: 'default' | 'outline' | 'secondary' = 'outline';
  let buttonStyle = {};
  
  if (isCurrentlyFetching || isCurrentlyLoading) {
    buttonText = 'Fetching...';
    buttonVariant = 'outline';
  } else if (hasLocationData && isSelected) {
    buttonText = 'Selected';
    buttonVariant = 'default';
    buttonStyle = { backgroundColor: `#${driver.team_colour}` };
  } else if (hasLocationData && !isSelected) {
    buttonText = 'Select';
    buttonVariant = 'outline';
    buttonStyle = { borderColor: `#${driver.team_colour}` };
  } else {
    // Not loaded yet - grayed out state
    buttonText = 'Fetch Data';
    buttonVariant = 'outline';
  }

  return (
    <div className="relative mb-6">
      <Button
        variant={buttonVariant}
        size="sm"
        onClick={handleButtonClick}
        disabled={isCurrentlyFetching || isCurrentlyLoading}
        className="h-auto w-full justify-start gap-4 px-4 py-5"
        style={buttonStyle}
      >
        <div className="flex w-full items-center gap-4">
          {/* Driver Photo Component */}
          <DriverPhoto driver={driver} />

          {/* Driver Info Component */}
          <DriverInfo driver={driver} />
        </div>

        {/* Status Indicators Component */}
        <DriverStatus
          driver={driver}
          hasLocationData={hasLocationData}
          isLoaded={isLoaded}
          isCurrentlyFetching={isCurrentlyFetching}
          isCurrentlyLoading={isCurrentlyLoading}
          buttonText={buttonText}
        />
      </Button>

      {/* Loading Animation Component */}
      {shouldShowLoadingAnimation && (
        <LoadingAnimation
          driver={driver}
          isCurrentlyLoading={isCurrentlyLoading}
          driverProgress={driverProgress}
          loadingProgress={loadingProgress}
        />
      )}
    </div>
  );
};

// Driver Photo Component
const DriverPhoto = ({ driver }: { driver: DriverCardProps['driver'] }) => (
  <div className="relative">
    <img
      src={driver.headshot_url}
      alt={driver.full_name || driver.name_acronym}
      className="h-12 w-12 rounded-full border-2 border-white/20 object-cover"
      onError={e => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.nextElementSibling?.classList.remove('hidden');
      }}
    />
    {/* Fallback avatar */}
    <div
      className="flex hidden h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 text-lg font-bold text-white"
      style={{ backgroundColor: `#${driver.team_colour}` }}
    >
      {driver.name_acronym}
    </div>
  </div>
);

// Driver Info Component
const DriverInfo = ({ driver }: { driver: DriverCardProps['driver'] }) => (
  <div className="flex min-w-0 flex-1 flex-col items-start text-left">
    <div className="flex w-full items-center gap-2">
      <span className="text-lg font-bold">#{driver.driver_number}</span>
      <span className="truncate text-sm font-medium">
        {driver.full_name || driver.name_acronym}
      </span>
    </div>
    <div className="flex w-full items-center gap-2 text-xs opacity-75">
      <span className="truncate">{driver.team_name}</span>
      {driver.country_code && (
        <>
          <span>•</span>
          <span className="font-mono font-semibold">{driver.country_code}</span>
        </>
      )}
    </div>
  </div>
);

// Driver Status Component
const DriverStatus = ({
  driver,
  hasLocationData,
  isLoaded,
  isCurrentlyFetching,
  isCurrentlyLoading,
  buttonText,
}: {
  driver: DriverCardProps['driver'];
  hasLocationData: boolean;
  isLoaded: boolean;
  isCurrentlyFetching: boolean;
  isCurrentlyLoading: boolean;
  buttonText: string;
}) => (
  <div className="flex flex-col items-end gap-1">
    <div className="flex items-center gap-2 text-xs font-medium">
      {(isCurrentlyFetching || isCurrentlyLoading) && (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
      )}
      <span>{buttonText}</span>
    </div>
    {hasLocationData && (
      <div className="flex items-center gap-1">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: `#${driver.team_colour}` }}
        />
        <span className="text-xs opacity-75">Ready</span>
      </div>
    )}
  </div>
);

// Loading Animation Component
const LoadingAnimation = ({
  driver,
  isCurrentlyLoading,
  driverProgress,
  loadingProgress,
}: {
  driver: DriverCardProps['driver'];
  isCurrentlyLoading: boolean;
  driverProgress: number;
  loadingProgress?: {
    loaded: number;
    total: number;
    isLoading: boolean;
    progressInfo?: ProgressInfo;
  };
}) => (
  <div className="pointer-events-none absolute inset-x-3 bottom-3">
    <div className="relative h-2 w-full overflow-hidden rounded-full border border-gray-600 bg-gray-800">
      {/* Track/Progress Bar Background */}
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: isCurrentlyLoading ? `${driverProgress}%` : '100%',
          backgroundColor: `#${driver.team_colour}`,
          opacity: isCurrentlyLoading ? 0.4 : 0.2,
        }}
      />

      {/* Race Car moving across */}
      <div
        className="absolute top-0 z-10 -translate-y-1/4 transform transition-all duration-300 ease-out"
        style={{
          left: isCurrentlyLoading
            ? `${Math.max(0, Math.min(95, driverProgress - 2))}%`
            : '50%',
          color: `#${driver.team_colour}`,
        }}
      >
        <RaceCarIcon
          className={`h-4 w-4 drop-shadow-lg ${!isCurrentlyLoading ? 'animate-pulse' : ''}`}
        />
      </div>

      {/* Spark effect at car position */}
      <div
        className="absolute top-1/2 z-10 h-1 w-1 animate-ping rounded-full"
        style={{
          left: isCurrentlyLoading
            ? `${Math.max(0, Math.min(95, driverProgress))}%`
            : '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: `#${driver.team_colour}`,
        }}
      />

      {/* Progress glow effect */}
      <div
        className="absolute top-0 h-full animate-pulse rounded-full opacity-20"
        style={{
          width: isCurrentlyLoading ? `${driverProgress}%` : '100%',
          backgroundColor: `#${driver.team_colour}`,
          boxShadow: `0 0 8px #${driver.team_colour}`,
        }}
      />
    </div>

    {/* Progress text */}
    <div
      className="my-4 mt-2 text-center text-xs font-medium"
      style={{ color: `#${driver.team_colour}` }}
    >
      {isCurrentlyLoading && loadingProgress?.progressInfo
        ? `Chunk ${loadingProgress.progressInfo.currentChunk} / ${loadingProgress.progressInfo.totalChunks}`
        : 'Fetching data...'}
    </div>
  </div>
);
