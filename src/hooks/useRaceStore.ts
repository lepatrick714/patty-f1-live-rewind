import { useState, useCallback } from 'react';
import { Session, LapData, LocationData, CarData } from '@/models';
import { ProgressInfo } from '@/utils/dateChunking';

interface RaceState {
  selectedSession: Session | null;
  selectedDrivers: number[];
  lapData: Record<number, LapData[]>;
  isLoading: boolean;
  error: string | null;
  // shared animation state
  animationProgress: number; // 0..1
  isPlaying: boolean;
  
  // Location data fetching state
  sessionLocationData: Record<number, LocationData[]>;
  loadedDrivers: Set<number>;
  fetchingDrivers: Set<number>;
  isLocationDataLoading: boolean;
  locationError: Error | null;
  
  // Car data (telemetry) fetching state
  sessionCarData: Record<number, CarData[]>;
  loadedCarDataDrivers: Set<number>;
  fetchingCarDataDrivers: Set<number>;
  isCarDataLoading: boolean;
  carDataError: Error | null;
  loadingProgress: {
    loaded: number;
    total: number;
    isLoading: boolean;
    progressInfo?: ProgressInfo;
  };

  setSelectedSession: (session: Session | null) => void;
  toggleDriver: (driverNumber: number) => void;
  clearSelectedDrivers: () => void;
  setLapData: (driverNumber: number, data: LapData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnimationProgress: (p: number) => void;
  setIsPlaying: (v: boolean) => void;
  
  // Location data actions
  setSessionLocationData: (data: Record<number, LocationData[]>) => void;
  addDriverLocationData: (driverNumber: number, locationData: LocationData[]) => void;
  setLoadedDrivers: (drivers: Set<number>) => void;
  addLoadedDriver: (driverNumber: number) => void;
  setFetchingDrivers: (drivers: Set<number>) => void;
  addFetchingDriver: (driverNumber: number) => void;
  removeFetchingDriver: (driverNumber: number) => void;
  setIsLocationDataLoading: (loading: boolean) => void;
  setLocationError: (error: Error | null) => void;
  setLoadingProgress: (progress: {
    loaded: number;
    total: number;
    isLoading: boolean;
    progressInfo?: ProgressInfo;
  }) => void;
  
  // Car data (telemetry) actions
  setSessionCarData: (data: Record<number, CarData[]>) => void;
  addDriverCarData: (driverNumber: number, carData: CarData[]) => void;
  setLoadedCarDataDrivers: (drivers: Set<number>) => void;
  addLoadedCarDataDriver: (driverNumber: number) => void;
  setFetchingCarDataDrivers: (drivers: Set<number>) => void;
  addFetchingCarDataDriver: (driverNumber: number) => void;
  removeFetchingCarDataDriver: (driverNumber: number) => void;
  setIsCarDataLoading: (loading: boolean) => void;
  setCarDataError: (error: Error | null) => void;
  
  // High-level car data fetching
  fetchSingleDriverCarData: (driverNumber: number, options?: {
    onProgress?: (completed: number, total: number, progressInfo?: ProgressInfo) => void;
    dateChunkingOptions?: any;
  }) => Promise<void>;
  
  reset: () => void;
}

// Global state store
let globalState = {
  selectedSession: null as Session | null,
  selectedDrivers: [] as number[],
  lapData: {} as Record<number, LapData[]>,
  isLoading: false,
  error: null as string | null,
  animationProgress: 0,
  isPlaying: false,
  
  // Location data fetching state
  sessionLocationData: {} as Record<number, LocationData[]>,
  loadedDrivers: new Set<number>(),
  fetchingDrivers: new Set<number>(),
  isLocationDataLoading: false,
  locationError: null as Error | null,
  
  // Car data (telemetry) fetching state
  sessionCarData: {} as Record<number, CarData[]>,
  loadedCarDataDrivers: new Set<number>(),
  fetchingCarDataDrivers: new Set<number>(),
  isCarDataLoading: false,
  carDataError: null as Error | null,
  loadingProgress: {
    loaded: 0,
    total: 0,
    isLoading: false,
    progressInfo: undefined as ProgressInfo | undefined,
  },
};

// Subscribers list
const subscribers = new Set<() => void>();

// Subscribe function
function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// Notify all subscribers
function notifySubscribers() {
  subscribers.forEach(callback => callback());
}

// Update state function
function setState(
  partial:
    | Partial<typeof globalState>
    | ((state: typeof globalState) => Partial<typeof globalState>)
) {
  const nextState =
    typeof partial === 'function' ? partial(globalState) : partial;
  globalState = { ...globalState, ...nextState };
  notifySubscribers();
}

export function useRaceStore(): RaceState {
  const [, forceUpdate] = useState({});

  // Force re-render when state changes
  const rerender = useCallback(() => forceUpdate({}), []);

  // Subscribe to state changes on mount, unsubscribe on unmount
  useState(() => {
    const unsubscribe = subscribe(rerender);
    return unsubscribe;
  });

  const setSelectedSession = useCallback((session: Session | null) => {
    setState({ selectedSession: session });
  }, []);

  const toggleDriver = useCallback((driverNumber: number) => {
    setState(state => ({
      selectedDrivers: state.selectedDrivers.includes(driverNumber)
        ? state.selectedDrivers.filter(d => d !== driverNumber)
        : [...state.selectedDrivers, driverNumber],
    }));
  }, []);

  const clearSelectedDrivers = useCallback(() => {
    setState({ selectedDrivers: [] });
  }, []);

  const setLapData = useCallback((driverNumber: number, data: LapData[]) => {
    setState(state => ({
      lapData: { ...state.lapData, [driverNumber]: data },
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState({ isLoading: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    setState({ error });
  }, []);

  const setAnimationProgress = useCallback((p: number) => {
    setState({ animationProgress: Math.max(0, Math.min(1, p)) });
  }, []);

  const setIsPlaying = useCallback((v: boolean) => {
    setState({ isPlaying: v });
  }, []);

  // Location data actions
  const setSessionLocationData = useCallback((data: Record<number, LocationData[]>) => {
    setState({ sessionLocationData: data });
  }, []);

  const addDriverLocationData = useCallback((driverNumber: number, locationData: LocationData[]) => {
    setState(state => ({
      sessionLocationData: {
        ...state.sessionLocationData,
        [driverNumber]: locationData
      }
    }));
  }, []);

  const setLoadedDrivers = useCallback((drivers: Set<number>) => {
    setState({ loadedDrivers: drivers });
  }, []);

  const addLoadedDriver = useCallback((driverNumber: number) => {
    setState(state => ({
      loadedDrivers: new Set([...state.loadedDrivers, driverNumber])
    }));
  }, []);

  const setFetchingDrivers = useCallback((drivers: Set<number>) => {
    setState({ fetchingDrivers: drivers });
  }, []);

  const addFetchingDriver = useCallback((driverNumber: number) => {
    setState(state => ({
      fetchingDrivers: new Set([...state.fetchingDrivers, driverNumber])
    }));
  }, []);

  const removeFetchingDriver = useCallback((driverNumber: number) => {
    setState(state => {
      const newFetching = new Set(state.fetchingDrivers);
      newFetching.delete(driverNumber);
      return { fetchingDrivers: newFetching };
    });
  }, []);

  const setIsLocationDataLoading = useCallback((loading: boolean) => {
    setState({ isLocationDataLoading: loading });
  }, []);

  const setLocationError = useCallback((error: Error | null) => {
    setState({ locationError: error });
  }, []);

  // Car data (telemetry) actions
  const setSessionCarData = useCallback((data: Record<number, CarData[]>) => {
    setState({ sessionCarData: data });
  }, []);

  const addDriverCarData = useCallback((driverNumber: number, carData: CarData[]) => {
    setState(state => ({
      sessionCarData: {
        ...state.sessionCarData,
        [driverNumber]: carData
      }
    }));
  }, []);

  const setLoadedCarDataDrivers = useCallback((drivers: Set<number>) => {
    setState({ loadedCarDataDrivers: drivers });
  }, []);

  const addLoadedCarDataDriver = useCallback((driverNumber: number) => {
    setState(state => ({
      loadedCarDataDrivers: new Set([...state.loadedCarDataDrivers, driverNumber])
    }));
  }, []);

  const setFetchingCarDataDrivers = useCallback((drivers: Set<number>) => {
    setState({ fetchingCarDataDrivers: drivers });
  }, []);

  const addFetchingCarDataDriver = useCallback((driverNumber: number) => {
    setState(state => ({
      fetchingCarDataDrivers: new Set([...state.fetchingCarDataDrivers, driverNumber])
    }));
  }, []);

  const removeFetchingCarDataDriver = useCallback((driverNumber: number) => {
    setState(state => {
      const newFetching = new Set(state.fetchingCarDataDrivers);
      newFetching.delete(driverNumber);
      return { fetchingCarDataDrivers: newFetching };
    });
  }, []);

  const setIsCarDataLoading = useCallback((loading: boolean) => {
    setState({ isCarDataLoading: loading });
  }, []);

  const setCarDataError = useCallback((error: Error | null) => {
    setState({ carDataError: error });
  }, []);

  // High-level car data fetching method
  const fetchSingleDriverCarData = useCallback(async (
    driverNumber: number,
    options?: {
      onProgress?: (completed: number, total: number, progressInfo?: ProgressInfo) => void;
      dateChunkingOptions?: any;
    }
  ) => {
    if (!globalState.selectedSession) {
      throw new Error('No session selected');
    }

    // Check if already fetching this driver
    if (globalState.fetchingCarDataDrivers.has(driverNumber)) {
      console.log(`Already fetching car data for driver ${driverNumber}`);
      return;
    }

    // Check if already loaded this driver
    if (globalState.loadedCarDataDrivers.has(driverNumber)) {
      console.log(`Car data for driver ${driverNumber} already loaded`);
      return;
    }

    try {
      // Mark as fetching
      addFetchingCarDataDriver(driverNumber);
      setIsCarDataLoading(true);
      setCarDataError(null);

      // Import API here to avoid circular dependencies
      const { f1Api } = await import('@/api/f1Api');
      
      const carData = await f1Api.getSingleDriverCarData(
        globalState.selectedSession.session_key,
        driverNumber,
        options
      );
      
      // Store the data
      addDriverCarData(driverNumber, carData);
      addLoadedCarDataDriver(driverNumber);
      
      console.log(`Successfully fetched ${carData.length} car data points for driver ${driverNumber}`);
      
    } catch (error) {
      console.error(`Failed to fetch car data for driver ${driverNumber}:`, error);
      setCarDataError(error as Error);
      throw error;
    } finally {
      removeFetchingCarDataDriver(driverNumber);
      setIsCarDataLoading(false);
    }
  }, [
    addFetchingCarDataDriver,
    setIsCarDataLoading,
    setCarDataError,
    addDriverCarData,
    addLoadedCarDataDriver,
    removeFetchingCarDataDriver
  ]);

  const setLoadingProgress = useCallback((progress: {
    loaded: number;
    total: number;
    isLoading: boolean;
    progressInfo?: ProgressInfo;
  }) => {
    setState({ 
      loadingProgress: {
        ...progress,
        progressInfo: progress.progressInfo || undefined
      }
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      selectedSession: null,
      selectedDrivers: [],
      lapData: {},
      isLoading: false,
      error: null,
      animationProgress: 0,
      isPlaying: false,
      sessionLocationData: {},
      loadedDrivers: new Set(),
      fetchingDrivers: new Set(),
      isLocationDataLoading: false,
      locationError: null,
      sessionCarData: {},
      loadedCarDataDrivers: new Set(),
      fetchingCarDataDrivers: new Set(),
      isCarDataLoading: false,
      carDataError: null,
      loadingProgress: {
        loaded: 0,
        total: 0,
        isLoading: false,
        progressInfo: undefined,
      },
    });
  }, []);

  return {
    // State
    selectedSession: globalState.selectedSession,
    selectedDrivers: globalState.selectedDrivers,
    lapData: globalState.lapData,
    isLoading: globalState.isLoading,
    error: globalState.error,
    animationProgress: globalState.animationProgress,
    isPlaying: globalState.isPlaying,
    
    // Location data state
    sessionLocationData: globalState.sessionLocationData,
    loadedDrivers: globalState.loadedDrivers,
    fetchingDrivers: globalState.fetchingDrivers,
    isLocationDataLoading: globalState.isLocationDataLoading,
    locationError: globalState.locationError,
    loadingProgress: globalState.loadingProgress,
    
    // Car data (telemetry) state
    sessionCarData: globalState.sessionCarData,
    loadedCarDataDrivers: globalState.loadedCarDataDrivers,
    fetchingCarDataDrivers: globalState.fetchingCarDataDrivers,
    isCarDataLoading: globalState.isCarDataLoading,
    carDataError: globalState.carDataError,

    // Actions
    setSelectedSession,
    toggleDriver,
    clearSelectedDrivers,
    setLapData,
    setLoading,
    setError,
    setAnimationProgress,
    setIsPlaying,
    
    // Location data actions
    setSessionLocationData,
    addDriverLocationData,
    setLoadedDrivers,
    addLoadedDriver,
    setFetchingDrivers,
    addFetchingDriver,
    removeFetchingDriver,
    setIsLocationDataLoading,
    setLocationError,
    setLoadingProgress,
    
    // Car data (telemetry) actions
    setSessionCarData,
    addDriverCarData,
    setLoadedCarDataDrivers,
    addLoadedCarDataDriver,
    setFetchingCarDataDrivers,
    addFetchingCarDataDriver,
    removeFetchingCarDataDriver,
    setIsCarDataLoading,
    setCarDataError,
    
    // High-level car data fetching
    fetchSingleDriverCarData,
    
    reset,
  };
}
