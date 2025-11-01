import { UserIcon, RaceCarIcon } from "@/app/assets/Icons";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ProgressInfo } from "@/utils/dateChunking";

export const SessionDriverSelector = ({
    driverData,
    selectedDrivers,
    onToggleDriver,
    sessionLocationData,
    isLoading,
    loadingProgress,
    loadedDrivers,
    fetchingDrivers,
    onFetchDriver
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
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Drivers ({selectedDrivers.length} selected)
                </CardTitle>
                
                {/* Loading Progress for Location Data */}
                {loadingProgress?.isLoading && (
                    <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground truncate pr-2">
                                {loadingProgress.progressInfo ? 
                                    `Loading ${loadingProgress.progressInfo.driverName || `Driver #${loadingProgress.progressInfo.driverNumber}`} - Chunk ${loadingProgress.progressInfo.currentChunk}/${loadingProgress.progressInfo.totalChunks}` :
                                    "Loading location data..."
                                }
                            </span>
                            <span className="text-muted-foreground font-medium shrink-0">
                                {loadingProgress.loaded} / {loadingProgress.total}
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ 
                                    width: `${loadingProgress.total > 0 ? 
                                        (loadingProgress.loaded / loadingProgress.total) * 100 : 0}%` 
                                }}
                            />
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto p-4">
                {driverData.map((driver) => {
                    const isSelected = selectedDrivers.includes(driver.driver_number);
                    const hasLocationData = sessionLocationData[driver.driver_number]?.length > 0;
                    const isLoaded = loadedDrivers?.has(driver.driver_number) || false;
                    const isCurrentlyFetching = fetchingDrivers?.has(driver.driver_number) || false;
                    const isCurrentlyLoading = loadingProgress?.isLoading && 
                        loadingProgress.progressInfo?.driverNumber === driver.driver_number;
                    
                    // Calculate progress for this specific driver's chunks
                    const driverProgress = isCurrentlyLoading && loadingProgress.progressInfo ? 
                        ((loadingProgress.progressInfo.currentChunk - 1) / loadingProgress.progressInfo.totalChunks) * 100 : 0;

                    // Show fetch button only if not loaded, not fetching, and callback exists
                    const showFetchButton = !isLoaded && !isCurrentlyFetching && onFetchDriver;

                    return (
                        <div key={driver.driver_number} className="relative mb-4">
                            <div className="flex gap-3">
                                <Button
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onToggleDriver(driver.driver_number)}
                                    disabled={!hasLocationData}
                                    className="flex-1 justify-start gap-3 h-auto py-4 px-4"
                                    style={{
                                        backgroundColor: isSelected ? `#${driver.team_colour}` : undefined,
                                        borderColor: hasLocationData ? `#${driver.team_colour}` : undefined,
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <span className="font-bold text-base">#{driver.driver_number}</span>
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-sm font-medium">{driver.name_acronym}</span>
                                            <span className="text-xs opacity-75">{driver.team_name}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Status indicators */}
                                    {!hasLocationData && !isLoaded && !isCurrentlyFetching && (
                                        <span className="text-xs text-muted-foreground ml-auto">No data</span>
                                    )}
                                    {isCurrentlyFetching && !isCurrentlyLoading && (
                                        <span className="text-xs ml-auto" style={{ color: `#${driver.team_colour}` }}>Fetching...</span>
                                    )}
                                </Button>

                                {/* Fetch Button */}
                                {showFetchButton && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onFetchDriver(driver.driver_number)}
                                        className="px-4 py-4 text-xs font-medium min-w-16"
                                        style={{ borderColor: `#${driver.team_colour}` }}
                                    >
                                        Fetch
                                    </Button>
                                )}
                            </div>

                            {/* Race Car Loading Animation for Current Driver */}
                            {isCurrentlyLoading && loadingProgress.progressInfo && (
                                <div className="absolute inset-x-3 bottom-2 pointer-events-none">
                                    <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                                        {/* Track/Progress Bar Background */}
                                        <div 
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${driverProgress}%`,
                                                backgroundColor: `#${driver.team_colour}`,
                                                opacity: 0.4
                                            }}
                                        />
                                        
                                        {/* Race Car moving across */}
                                        <div 
                                            className="absolute top-0 transform -translate-y-1/4 transition-all duration-300 ease-out z-10"
                                            style={{ 
                                                left: `${Math.max(0, Math.min(95, driverProgress - 2))}%`,
                                                color: `#${driver.team_colour}`
                                            }}
                                        >
                                            <RaceCarIcon className="w-4 h-4 drop-shadow-lg" />
                                        </div>
                                        
                                        {/* Spark effect at car position */}
                                        <div 
                                            className="absolute top-1/2 w-1 h-1 rounded-full animate-ping z-10"
                                            style={{ 
                                                left: `${Math.max(0, Math.min(95, driverProgress))}%`,
                                                transform: 'translate(-50%, -50%)',
                                                backgroundColor: `#${driver.team_colour}`
                                            }}
                                        />
                                        
                                        {/* Progress glow effect */}
                                        <div 
                                            className="absolute top-0 h-full rounded-full opacity-20 animate-pulse"
                                            style={{ 
                                                width: `${driverProgress}%`,
                                                backgroundColor: `#${driver.team_colour}`,
                                                boxShadow: `0 0 8px #${driver.team_colour}`
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Progress text */}
                                    <div className="my-4 mt-2 text-xs text-center font-medium" style={{ color: `#${driver.team_colour}` }}>
                                        Chunk {loadingProgress.progressInfo.currentChunk} / {loadingProgress.progressInfo.totalChunks}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {driverData.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">
                            No drivers available for this session
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}