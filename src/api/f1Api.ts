import { Session, Driver, LapData, LocationData } from '@/models';
import { fetchWithRetry, withRetry, withBatchMap, BatchMapOptions } from '@/utils/retry';

const API_BASE = (
  process.env.NEXT_PUBLIC_OPENF1_API_URL || 'https://api.openf1.org/v1'
).replace(/\/$/, '');

export const f1Api = {
  getSessions: (year: number): Promise<Session[]> =>
    fetchWithRetry(
      `${API_BASE}/sessions?year=${year}`,
      'Failed to fetch sessions'
    ),

  getDrivers: (sessionKey: number): Promise<Driver[]> =>
    fetchWithRetry(
      `${API_BASE}/drivers?session_key=${sessionKey}`,
      'Failed to fetch drivers'
    ),

  getLaps: (sessionKey: number, driverNumber?: number): Promise<LapData[]> => {
    const url = driverNumber
      ? `${API_BASE}/laps?session_key=${sessionKey}&driver_number=${driverNumber}`
      : `${API_BASE}/laps?session_key=${sessionKey}`;
    return fetchWithRetry(url, 'Failed to fetch laps');
  },

  getLocationData: (
    sessionKey: number,
    driverNumber: number,
    startTime: string,
    endTime: string
  ): Promise<LocationData[]> => {
    const url = `${API_BASE}/location?session_key=${sessionKey}&driver_number=${driverNumber}&date>=${encodeURIComponent(startTime)}&date<=${encodeURIComponent(endTime)}`;
    return fetchWithRetry(url, 'Failed to fetch location data');
  },

  getCarData: async (
    sessionKey: number,
    driverNumber: number,
    startTime: string,
    endTime: string
  ): Promise<any[]> => {
    const url = `${API_BASE}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}&date>=${encodeURIComponent(startTime)}&date<=${encodeURIComponent(endTime)}`;
    return withRetry(async () => {
      const res = await fetch(url);
      if (res.ok) return res.json();
      const body = await res.text().catch(() => '');
      throw new Error(
        `Failed to fetch car data status=${res.status} body=${body}`
      );
    });
  },

  getCarDataRaw: async (
    sessionKey: number,
    driverNumber: number,
    startTime: string,
    endTime: string
  ) => {
    const urls = [
      `${API_BASE}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}&${encodeURIComponent('date>=')}=${encodeURIComponent(startTime)}&${encodeURIComponent('date<=')}=${encodeURIComponent(endTime)}`,
      `${API_BASE}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}&date>=${encodeURIComponent(startTime)}&date<=${encodeURIComponent(endTime)}`,
    ];

    const attempts: Array<{
      url: string;
      status?: number;
      body?: string;
      error?: any;
    }> = [];

    for (const url of urls) {
      try {
        const res = await fetch(url);
        const body = await res.text().catch(() => '');
        attempts.push({ url, status: res.status, body });
        if (res.ok) return { ok: true, attempts };
      } catch (error) {
        attempts.push({ url, error: String(error) });
      }
    }

    return { ok: false, attempts };
  },

  getAllDriversLocationData: async (
    sessionKey: number,
    options?: {
      batchSize?: number;
      delayBetweenBatches?: number;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<{ [driverNumber: number]: LocationData[] }> => {
    const { batchSize = 3, delayBetweenBatches = 100, onProgress } = options || {};
    
    // First get all drivers for this session
    const drivers = await f1Api.getDrivers(sessionKey);
    const driverNumbers = drivers.map(d => d.driver_number);
    
    // Use the generic batching utility
    return withBatchMap(
      driverNumbers,
      async (driverNumber) => {
        const url = `${API_BASE}/location?session_key=${sessionKey}&driver_number=${driverNumber}`;
        return fetchWithRetry(url, `Failed to fetch location data for driver ${driverNumber}`);
      },
      (driverNumber) => driverNumber,
      {
        batchSize,
        delayBetweenBatches,
        onProgress,
        onError: (driverNumber, error) => {
          console.error(`Failed to fetch location data for driver ${driverNumber}:`, error);
        },
        continueOnError: true,
        defaultValue: [] as LocationData[], // Return empty array for failed requests
      }
    );
  },

  getSessionLocationData: async (
    sessionKey: number,
    driverNumbers?: number[],
    options?: {
      batchSize?: number;
      delayBetweenBatches?: number;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<{ [driverNumber: number]: LocationData[] }> => {
    const { batchSize = 5, delayBetweenBatches = 100, onProgress } = options || {};
    
    let targetDrivers: number[];
    
    if (driverNumbers) {
      targetDrivers = driverNumbers;
    } else {
      // Get all drivers if none specified
      const drivers = await f1Api.getDrivers(sessionKey);
      targetDrivers = drivers.map(d => d.driver_number);
    }
    
    // Use the generic batching utility
    return withBatchMap(
      targetDrivers,
      async (driverNumber) => {
        const url = `${API_BASE}/location?session_key=${sessionKey}&driver_number=${driverNumber}`;
        return fetchWithRetry(url, `Failed to fetch location data for driver ${driverNumber}`);
      },
      (driverNumber) => driverNumber,
      {
        batchSize,
        delayBetweenBatches,
        onProgress,
        onError: (driverNumber, error) => {
          console.error(`Failed to fetch location data for driver ${driverNumber}:`, error);
        },
        continueOnError: true,
        defaultValue: [] as LocationData[], // Return empty array for failed requests
      }
    );
  },
};
