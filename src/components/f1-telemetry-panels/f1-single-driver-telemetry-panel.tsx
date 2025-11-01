import { useState, useEffect, useMemo } from "react";
import { ZapIcon, PlayIcon, PauseIcon, UserIcon } from "@/app/assets/Icons";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRaceStore } from "@/hooks/useRaceStore";
import { CarData } from "@/models";

interface TelemetryPanelProps {
  // Remove single driver number, use selected drivers from store
  animationProgress?: number; // 0-1 for timeline sync
  isPlaying?: boolean;
}

export const TelemetryPanel = ({ animationProgress = 0, isPlaying = false }: TelemetryPanelProps) => {
    const { 
        selectedSession,
        selectedDrivers, // Use selected drivers from store
        sessionCarData,
        loadedCarDataDrivers,
        fetchingCarDataDrivers,
        isCarDataLoading,
        carDataError,
        fetchSingleDriverCarData 
    } = useRaceStore();
    
    const [activeDriverIndex, setActiveDriverIndex] = useState(0);
    
    // Get data for all selected drivers
    const driversData = useMemo(() => {
        return selectedDrivers.map(driverNumber => ({
            driverNumber,
            carData: sessionCarData[driverNumber] || [],
            isLoaded: loadedCarDataDrivers.has(driverNumber),
            isFetching: fetchingCarDataDrivers.has(driverNumber)
        }));
    }, [selectedDrivers, sessionCarData, loadedCarDataDrivers, fetchingCarDataDrivers]);
    
    const activeDriver = driversData[activeDriverIndex];
    const hasAnyData = driversData.some(d => d.carData.length > 0);
    
    // Calculate current data point based on animation progress and timeline
    const getCurrentDataPoint = (carData: CarData[]): CarData | null => {
        if (!carData.length || !selectedSession) return null;
        
        // Use timeline sync if available, otherwise use manual index
        if (animationProgress > 0) {
            const targetIndex = Math.floor(animationProgress * (carData.length - 1));
            return carData[targetIndex] || null;
        }
        
        return carData[0] || null;
    };
    
    const currentData = activeDriver ? getCurrentDataPoint(activeDriver.carData) : null;

    // Auto-cycle through telemetry data
    useEffect(() => {
        // No longer needed - we sync with animation timeline
    }, []);

    const handleFetchTelemetry = async (driverNumber: number) => {
        if (!selectedSession) return;
        
        try {
            await fetchSingleDriverCarData(driverNumber, {
                onProgress: (loaded, total, progressInfo) => {
                    console.log(`Telemetry progress for driver ${driverNumber}: ${loaded}/${total}`, progressInfo);
                }
            });
        } catch (error) {
            console.error('Failed to fetch telemetry:', error);
        }
    };

    const handleFetchAllTelemetry = async () => {
        for (const driverNumber of selectedDrivers) {
            try {
                await handleFetchTelemetry(driverNumber);
            } catch (error) {
                console.error(`Failed to fetch telemetry for driver ${driverNumber}:`, error);
            }
        }
    };

    const switchDriver = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setActiveDriverIndex(prev => prev > 0 ? prev - 1 : driversData.length - 1);
        } else {
            setActiveDriverIndex(prev => prev < driversData.length - 1 ? prev + 1 : 0);
        }
    };

    if (!selectedSession) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ZapIcon className="w-5 h-5" />
                        Live Telemetry
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center py-8">
                        <ZapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm">
                            Select a session to view telemetry data
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!driverNumber) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ZapIcon className="w-5 h-5" />
                        Live Telemetry
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center py-8">
                        <ZapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm">
                            Select a driver to view telemetry data
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ZapIcon className="w-5 h-5" />
                    Driver {driverNumber} Telemetry
                    {hasData && (
                        <span className="text-sm font-normal text-muted-foreground">
                            ({driverCarData.length} data points)
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Fetch Button */}
                {!isDriverLoaded && !isDriverFetching && (
                    <div className="text-center">
                        <Button 
                            onClick={handleFetchTelemetry}
                            disabled={isCarDataLoading}
                            className="w-full"
                        >
                            <ZapIcon className="w-4 h-4 mr-2" />
                            Fetch Telemetry Data
                        </Button>
                    </div>
                )}

                {/* Loading State */}
                {isDriverFetching && (
                    <div className="text-center py-4">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                            Loading telemetry data...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {carDataError && (
                    <div className="text-center py-4">
                        <div className="text-red-500 text-sm">
                            Error: {carDataError.message}
                        </div>
                        <Button 
                            onClick={handleFetchTelemetry}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* Telemetry Data Display */}
                {hasData && (
                    <>
                        {/* Controls */}
                        <div className="flex justify-between items-center">
                            <Button
                                onClick={toggleAutoUpdate}
                                variant="outline"
                                size="sm"
                            >
                                {isAutoUpdating ? (
                                    <PauseIcon className="w-4 h-4 mr-2" />
                                ) : (
                                    <PlayIcon className="w-4 h-4 mr-2" />
                                )}
                                {isAutoUpdating ? 'Pause' : 'Play'}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {currentDataIndex + 1} / {driverCarData.length}
                            </span>
                        </div>

                        {/* Current Telemetry Values */}
                        {currentData && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Speed:</span>
                                        <span className="font-mono font-bold ml-2">
                                            {currentData.speed ? `${currentData.speed} km/h` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Throttle:</span>
                                        <span className="font-mono font-bold ml-2 text-green-500">
                                            {currentData.throttle !== undefined ? `${currentData.throttle}%` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Brake:</span>
                                        <span className="font-mono font-bold ml-2 text-red-500">
                                            {currentData.brake !== undefined ? `${currentData.brake}%` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">RPM:</span>
                                        <span className="font-mono font-bold ml-2">
                                            {currentData.rpm || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Gear:</span>
                                        <span className="font-mono font-bold ml-2">
                                            {currentData.n_gear || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">DRS:</span>
                                        <span className="font-mono font-bold ml-2 text-blue-500">
                                            {currentData.drs !== undefined ? (currentData.drs ? 'OPEN' : 'CLOSED') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Timestamp */}
                        {currentData && (
                            <div className="text-xs text-muted-foreground text-center">
                                {new Date(currentData.date).toLocaleTimeString()}
                            </div>
                        )}
                    </>
                )}

                {/* No Data State (after fetch attempt) */}
                {isDriverLoaded && !hasData && (
                    <div className="text-center py-8">
                        <ZapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                        <p className="text-muted-foreground text-sm">
                            No telemetry data found for this driver and session
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
