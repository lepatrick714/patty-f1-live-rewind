import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/api/f1Api";
import { useRaceStore } from "@/hooks/useRaceStore";

export const useDriverDataManagement = () => {
    const raceStore = useRaceStore();
    
    // Track active fetch promises so we can cancel them
    const [activeFetches, setActiveFetches] = useState<Map<number, AbortController>>(new Map());
    
    // Track the last session key to prevent unnecessary resets
    const lastSessionKeyRef = useRef<number | null>(null);

    // Get drivers for the selected session
    const { data: driverData = [], isLoading: isDriversLoading } = useQuery({
        queryKey: ["drivers", raceStore.selectedSession?.session_key],
        queryFn: () =>
            raceStore.selectedSession
                ? f1Api.getDrivers(raceStore.selectedSession.session_key)
                : Promise.resolve([]),
        enabled: !!raceStore.selectedSession,
    });

    // Function to fetch location data for a single driver
    const fetchSingleDriverData = async (driverNumber: number): Promise<void> => {
        if (!raceStore.selectedSession) return;
        
        // Create an AbortController for this fetch
        const abortController = new AbortController();
        const currentSessionKey = raceStore.selectedSession.session_key;
        
        // Store the controller so we can cancel it later
        setActiveFetches(prev => new Map(prev.set(driverNumber, abortController)));
        
        // Mark as fetching
        raceStore.addFetchingDriver(driverNumber);
        raceStore.setIsLocationDataLoading(true);
        
        try {
            const data = await f1Api.getSingleDriverLocationData(
                currentSessionKey,
                driverNumber,
                {
                    onProgress: (loaded, total, info) => {
                        // Only update progress if this fetch hasn't been cancelled and session hasn't changed
                        if (!abortController.signal.aborted && raceStore.selectedSession?.session_key === currentSessionKey) {
                            raceStore.setLoadingProgress({ loaded, total, isLoading: true, progressInfo: info });
                        }
                    }
                }
            );
            
            // Only update data if this fetch hasn't been cancelled and session hasn't changed
            if (!abortController.signal.aborted && raceStore.selectedSession?.session_key === currentSessionKey) {
                // Update session data with this driver's data using race-condition-safe method
                raceStore.addDriverLocationData(driverNumber, data);
                
                // Mark driver as loaded
                raceStore.addLoadedDriver(driverNumber);
                
                // Only auto-select if the user hasn't selected any drivers yet AND this driver has data
                if (data.length > 0 && raceStore.selectedDrivers.length === 0) {
                    raceStore.toggleDriver(driverNumber);
                }
            }
            
        } catch (error) {
            // Only log error if it's not due to cancellation or session change
            if (!abortController.signal.aborted && raceStore.selectedSession?.session_key === currentSessionKey) {
                console.error(`Error fetching driver ${driverNumber} location data:`, error);
                raceStore.setLocationError(error as Error);
            }
        } finally {
            // Clean up: remove from active fetches and fetching set
            setActiveFetches(prev => {
                const newMap = new Map(prev);
                newMap.delete(driverNumber);
                return newMap;
            });
            
            raceStore.removeFetchingDriver(driverNumber);
        }
    };

    // Effect to manage loading state based on active fetches
    useEffect(() => {
        if (activeFetches.size === 0) {
            raceStore.setIsLocationDataLoading(false);
            raceStore.setLoadingProgress({ loaded: 0, total: 0, isLoading: false });
        }
    }, [activeFetches.size]);

    // Handle manual driver fetch - simplified
    const handleFetchDriver = (driverNumber: number) => {
        // Don't fetch if already loaded or currently fetching
        if (raceStore.loadedDrivers.has(driverNumber) || raceStore.fetchingDrivers.has(driverNumber)) {
            return;
        }
        
        fetchSingleDriverData(driverNumber);
    };

    // Function to cancel all active fetches
    const cancelAllFetches = () => {
        activeFetches.forEach((controller) => {
            controller.abort();
        });
        setActiveFetches(new Map());
        
        // Clear fetching state
        raceStore.setFetchingDrivers(new Set());
        raceStore.setIsLocationDataLoading(false);
        raceStore.setLoadingProgress({ loaded: 0, total: 0, isLoading: false });
    };

    // Reset state when session changes (but don't auto-fetch)
    useEffect(() => {
        const currentSessionKey = raceStore.selectedSession?.session_key || null;
        
        // Only reset if the session actually changed
        if (driverData.length > 0 && raceStore.selectedSession && currentSessionKey !== lastSessionKeyRef.current) {
            lastSessionKeyRef.current = currentSessionKey;
            
            // Cancel any ongoing fetches from the previous session
            cancelAllFetches();
            
            // Reset all state when session changes
            raceStore.setSessionLocationData({});
            raceStore.setLoadedDrivers(new Set());
            raceStore.setFetchingDrivers(new Set());
            raceStore.setLocationError(null);
            raceStore.setIsLocationDataLoading(false);
            raceStore.setLoadingProgress({ loaded: 0, total: 0, isLoading: false });
            
            // Clear selected drivers to prevent showing stale driver positions
            raceStore.clearSelectedDrivers();
        }
    }, [driverData, raceStore.selectedSession]);

    // Cleanup: cancel all fetches when component unmounts
    useEffect(() => {
        return () => {
            cancelAllFetches();
        };
    }, []);

    return {
        driverData,
        isDriversLoading,
        handleFetchDriver,
        cancelAllFetches
    };
};