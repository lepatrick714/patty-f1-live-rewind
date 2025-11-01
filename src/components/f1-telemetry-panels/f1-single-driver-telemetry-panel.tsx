import { useState, useEffect, useMemo } from "react";
import { ZapIcon, PlayIcon, PauseIcon, UserIcon, ChevronUpIcon, ChevronDownIcon } from "@/app/assets/Icons";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRaceStore } from "@/hooks/useRaceStore";
import { CarData } from "@/models";
import { SpeedGauge, RPMGauge, GearDisplay, ThrottleBrakeBar, DRSToggle } from "./TelemetryGauges";

interface TelemetryPanelProps {
  animationProgress?: number; // 0-1 for timeline sync
  isPlaying?: boolean;
  driverData?: any[]; // Add driver data for names/colors
}

export const TelemetryPanel = ({ animationProgress = 0, isPlaying = false, driverData = [] }: TelemetryPanelProps) => {
    const { 
        selectedSession,
        selectedDrivers,
        sessionCarData,
        loadedCarDataDrivers,
        fetchingCarDataDrivers,
        isCarDataLoading,
        carDataError,
        fetchSingleDriverCarData 
    } = useRaceStore();
    
    const [activeDriverIndex, setActiveDriverIndex] = useState(0);
    
    // Get data for all selected drivers with additional info
    const driversData = useMemo(() => {
        return selectedDrivers.map(driverNumber => {
            const driverInfo = driverData.find(d => d.driver_number === driverNumber);
            return {
                driverNumber,
                driverInfo,
                carData: sessionCarData[driverNumber] || [],
                isLoaded: loadedCarDataDrivers.has(driverNumber),
                isFetching: fetchingCarDataDrivers.has(driverNumber)
            };
        });
    }, [selectedDrivers, sessionCarData, loadedCarDataDrivers, fetchingCarDataDrivers, driverData]);
    
    // Reset active driver index when drivers change
    useEffect(() => {
        if (activeDriverIndex >= driversData.length) {
            setActiveDriverIndex(0);
        }
    }, [driversData.length, activeDriverIndex]);
    
    const activeDriver = driversData[activeDriverIndex];
    const hasAnyData = driversData.some(d => d.carData.length > 0);
    const unloadedDrivers = driversData.filter(d => !d.isLoaded && !d.isFetching);
    const fetchingDrivers = driversData.filter(d => d.isFetching);
    
    // Calculate current data point based on animation progress and timeline
    const getCurrentDataPoint = (carData: CarData[]): CarData | null => {
        if (!carData.length || !selectedSession) return null;
        
        // Use timeline sync if available and playing
        if (animationProgress > 0 && carData.length > 1) {
            const targetIndex = Math.floor(animationProgress * (carData.length - 1));
            return carData[targetIndex] || null;
        }
        
        return carData[0] || null;
    };
    
    const currentData = activeDriver ? getCurrentDataPoint(activeDriver.carData) : null;

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
            if (!loadedCarDataDrivers.has(driverNumber) && !fetchingCarDataDrivers.has(driverNumber)) {
                try {
                    await handleFetchTelemetry(driverNumber);
                } catch (error) {
                    console.error(`Failed to fetch telemetry for driver ${driverNumber}:`, error);
                }
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

    // No session selected
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

    // No drivers selected
    if (selectedDrivers.length === 0) {
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
                        <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm">
                            Select drivers to view telemetry data
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
                    Live Telemetry ({driversData.length} drivers)
                    {isPlaying && (
                        <Badge variant="secondary" className="text-xs">
                            <PlayIcon className="w-3 h-3 mr-1" />
                            Synced
                        </Badge>
                    )}
                </CardTitle>
                
                {/* Bulk Actions */}
                {unloadedDrivers.length > 1 && (
                    <Button 
                        onClick={handleFetchAllTelemetry}
                        disabled={isCarDataLoading}
                        className="w-full mt-2"
                        size="sm"
                    >
                        <ZapIcon className="w-4 h-4 mr-2" />
                        Fetch All Telemetry ({unloadedDrivers.length} drivers)
                    </Button>
                )}

                {/* Loading State */}
                {fetchingDrivers.length > 0 && (
                    <div className="text-center py-2 mt-2">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-xs text-muted-foreground">
                            Loading telemetry for {fetchingDrivers.map(d => d.driverNumber).join(', ')}...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {carDataError && (
                    <div className="text-center py-2 mt-2">
                        <div className="text-red-500 text-xs">
                            Error: {carDataError.message}
                        </div>
                        <Button 
                            onClick={handleFetchAllTelemetry}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                )}
            </CardHeader>
            
            <CardContent className="space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                {/* Individual Driver Telemetry Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {driversData.map((driver) => {
                        const currentData = getCurrentDataPoint(driver.carData);
                        
                        return (
                            <TelemetryDriverCard
                                key={driver.driverNumber}
                                driver={driver}
                                currentData={currentData}
                                onFetchTelemetry={handleFetchTelemetry}
                            />
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// Separate component for individual driver telemetry display
interface TelemetryDriverCardProps {
    driver: {
        driverNumber: number;
        driverInfo?: any;
        carData: CarData[];
        isLoaded: boolean;
        isFetching: boolean;
    };
    currentData: CarData | null;
    onFetchTelemetry: (driverNumber: number) => void;
}

const TelemetryDriverCard = ({ driver, currentData, onFetchTelemetry }: TelemetryDriverCardProps) => {
    const teamColor = driver.driverInfo?.team_colour ? `#${driver.driverInfo.team_colour}` : "#3B82F6";
    
    return (
        <Card className="relative">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">#{driver.driverNumber}</span>
                        <span className="text-base">
                            {driver.driverInfo?.name_acronym || `Driver ${driver.driverNumber}`}
                        </span>
                        {driver.carData.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {driver.carData.length} pts
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {driver.isFetching && (
                            <div className="w-4 h-4 border border-primary border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {!driver.isLoaded && !driver.isFetching && (
                            <Button
                                onClick={() => onFetchTelemetry(driver.driverNumber)}
                                variant="outline"
                                size="sm"
                                className="h-8 px-4 text-xs"
                                style={{ borderColor: teamColor }}
                            >
                                Fetch
                            </Button>
                        )}
                        {driver.isLoaded && (
                            <ZapIcon className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
                {currentData ? (
                    <div className="space-y-6">
                        {/* Level 1: Speed and RPM */}
                        <div className="flex justify-center gap-8">
                            <SpeedGauge 
                                speed={currentData.speed || 0} 
                                color={teamColor}
                            />
                            <RPMGauge 
                                rpm={currentData.rpm || 0} 
                                color={teamColor}
                            />
                        </div>
                        
                        {/* Level 2: Gearbox and Controls */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Left Half: Gearbox */}
                            <div className="flex justify-center">
                                <GearDisplay 
                                    gear={currentData.n_gear || 0}
                                    color={teamColor}
                                />
                            </div>
                            
                            {/* Right Half: Throttle, Brake, DRS */}
                            <div className="space-y-4">
                                <ThrottleBrakeBar 
                                    throttle={currentData.throttle || 0}
                                    brake={currentData.brake || 0}
                                />
                                
                                <div className="flex justify-center">
                                    <DRSToggle 
                                        isOpen={Boolean(currentData.drs)}
                                        color={teamColor}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Data Timestamp */}
                        <div className="text-xs text-muted-foreground text-center pt-3 border-t">
                            {new Date(currentData.date).toLocaleTimeString()}
                        </div>
                    </div>
                ) : driver.carData.length > 0 ? (
                    <div className="text-center py-6">
                        <ZapIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No data at current timeline position
                        </p>
                    </div>
                ) : driver.isLoaded ? (
                    <div className="text-center py-6">
                        <ZapIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No telemetry data available
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <UserIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Click Fetch to load telemetry data
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
