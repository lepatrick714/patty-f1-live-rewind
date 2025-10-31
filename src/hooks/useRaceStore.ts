import { useState, useCallback } from 'react';
import { Session, LapData } from '@/models';

interface RaceState {
  selectedSession: Session | null;
  selectedDrivers: number[];
  lapData: Record<number, LapData[]>;
  isLoading: boolean;
  error: string | null;
  // shared animation state
  animationProgress: number; // 0..1
  isPlaying: boolean;
  // live car positions (world coords)
  // currentPositions: Record<number, { x: number; y: number; elapsed: number }>;

  setSelectedSession: (session: Session | null) => void;
  toggleDriver: (driverNumber: number) => void;
  setLapData: (driverNumber: number, data: LapData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnimationProgress: (p: number) => void;
  setIsPlaying: (v: boolean) => void;
  //setCurrentPositions: (positions: Record<number, { x: number; y: number; elapsed: number }>) => void;
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
  //currentPositions: {} as Record<number, { x: number; y: number; elapsed: number }>,
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

  //const setCurrentPositions = useCallback((positions: Record<number, { x: number; y: number; elapsed: number }>) => {
  //  setState({ currentPositions: positions });
  //}, []);

  const reset = useCallback(() => {
    setState({
      selectedSession: null,
      selectedDrivers: [],
      lapData: {},
      isLoading: false,
      error: null,
      animationProgress: 0,
      isPlaying: false,
      //currentPositions: {}
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
    //currentPositions: globalState.currentPositions,

    // Actions
    setSelectedSession,
    toggleDriver,
    setLapData,
    setLoading,
    setError,
    setAnimationProgress,
    setIsPlaying,
    //setCurrentPositions,
    reset,
  };
}
