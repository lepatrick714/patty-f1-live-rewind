import { Session, Driver, LapData, LocationData } from '@/models';
import { fetchWithRetry, withRetry } from '@/utils/retry';

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
};
