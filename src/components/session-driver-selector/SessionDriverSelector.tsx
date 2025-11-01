import { UserIcon } from '@/app/assets/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ProgressInfo } from '@/utils/dateChunking';
import { DriverCard, LoadingProgress, EmptyState } from './components';

export const SessionDriverSelector = ({
  driverData,
  selectedDrivers,
  onToggleDriver,
  sessionLocationData,
  isLoading,
  loadingProgress,
  loadedDrivers,
  fetchingDrivers,
  onFetchDriver,
}: {
  driverData: any[];
  selectedDrivers: number[];
  onToggleDriver: (driverNumber: number) => void;
  sessionLocationData: Record<number, any[]>;
  isLoading: boolean;
  loadingProgress?: {
    loaded: number;
    total: number;
    isLoading: boolean;
    progressInfo?: ProgressInfo;
  };
  loadedDrivers?: Set<number>;
  fetchingDrivers?: Set<number>;
  onFetchDriver?: (driverNumber: number) => void;
}) => {
  return (
    <Card className="m-y-2 max-height-[600px] h-full space-y-2 border border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Drivers ({selectedDrivers.length} selected)
        </CardTitle>

        {/* Loading Progress for Location Data */}
        {loadingProgress?.isLoading && (
          <LoadingProgress loadingProgress={loadingProgress} />
        )}
      </CardHeader>

      <CardContent className="max-h-[600px] space-y-3 overflow-y-auto p-4">
        {driverData.map(driver => {
          const isSelected = selectedDrivers.includes(driver.driver_number);
          const hasLocationData =
            sessionLocationData[driver.driver_number]?.length > 0;
          const isLoaded = loadedDrivers?.has(driver.driver_number) || false;
          const isCurrentlyFetching =
            fetchingDrivers?.has(driver.driver_number) || false;
          const isCurrentlyLoading =
            loadingProgress?.isLoading &&
            loadingProgress.progressInfo?.driverNumber === driver.driver_number;

          // Calculate progress for this specific driver's chunks
          const driverProgress =
            isCurrentlyLoading && loadingProgress.progressInfo
              ? ((loadingProgress.progressInfo.currentChunk - 1) /
                  loadingProgress.progressInfo.totalChunks) *
                100
              : 0;

          // Show loading animation for any driver being fetched
          const shouldShowLoadingAnimation = isCurrentlyFetching;

          return (
            <DriverCard
              key={driver.driver_number}
              driver={driver}
              isSelected={isSelected}
              hasLocationData={hasLocationData}
              isLoaded={isLoaded}
              isCurrentlyFetching={isCurrentlyFetching}
              isCurrentlyLoading={isCurrentlyLoading || false}
              driverProgress={driverProgress}
              shouldShowLoadingAnimation={shouldShowLoadingAnimation}
              loadingProgress={loadingProgress}
              onToggleDriver={onToggleDriver}
              onFetchDriver={onFetchDriver}
            />
          );
        })}

        {driverData.length === 0 && !isLoading && (
          <EmptyState message="No drivers available for this session" />
        )}
      </CardContent>
    </Card>
  );
};
