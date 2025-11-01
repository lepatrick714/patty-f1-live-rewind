import { Session, Driver, LapData, LocationData, CarData } from '@/models';
import { fetchWithRetry, withRetry } from '@/utils/retry';
import { withBatchMap } from '@/utils/batch';
import { createDateChunks, DateChunkingOptions, createProgressInfo, ProgressInfo } from '@/utils/dateChunking';

const API_BASE = (
  process.env.NEXT_PUBLIC_OPENF1_API_URL || 'https://api.openf1.org/v1'
).replace(/\/$/, '');

export const f1Api = {
  getSessions: (year: number): Promise<Session[]> =>
    fetchWithRetry(
      `${API_BASE}/sessions?year=${year}`,
      'Failed to fetch sessions'
    ),

  getSessionByKey: (sessionKey: number): Promise<Session> =>
    fetchWithRetry(
      `${API_BASE}/sessions?session_key=${sessionKey}`,
      'Failed to fetch session details'
    ).then((sessions: Session[]) => {
      if (sessions.length === 0) {
        throw new Error(`Session with key ${sessionKey} not found`);
      }
      return sessions[0];
    }),

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

  // New method: Fetch location data for a single driver with chunking
  getSingleDriverLocationData: async (
    sessionKey: number,
    driverNumber: number,
    options?: {
      onProgress?: (completed: number, total: number, progressInfo?: ProgressInfo) => void;
      dateChunkingOptions?: DateChunkingOptions;
    }
  ): Promise<LocationData[]> => {
    const { onProgress, dateChunkingOptions = {} } = options || {};
    
    try {
      // Get session details to determine time range
      const session = await f1Api.getSessionByKey(sessionKey);
      
      if (!session.date_start || !session.date_end) {
        throw new Error('Session does not have valid start/end times');
      }

      // Create date chunks for this session
      const chunks = createDateChunks(
        session.date_start,
        session.date_end,
        dateChunkingOptions
      );

      let allLocationData: LocationData[] = [];
      let completedChunks = 0;

      // Process chunks one by one for this specific driver
      for (const chunk of chunks) {
        const progressInfo = createProgressInfo(
          1, // currentDriver (always 1 since we're fetching one driver)
          1, // totalDrivers (always 1)
          completedChunks + 1,
          chunks.length,
          driverNumber
        );

        // Call progress callback
        if (onProgress) {
          onProgress(completedChunks, chunks.length, progressInfo);
        }

        try {
          const chunkData = await f1Api.getLocationData(
            sessionKey,
            driverNumber,
            chunk.startDate,
            chunk.endDate
          );
          
          allLocationData = allLocationData.concat(chunkData);
          completedChunks++;
          
          // Small delay between chunks to be nice to the API
          if (completedChunks < chunks.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn(`Failed to fetch chunk ${completedChunks + 1}/${chunks.length} for driver ${driverNumber}:`, error);
          completedChunks++;
        }
      }

      // Final progress update
      if (onProgress) {
        const finalProgressInfo = createProgressInfo(
          1,
          1,
          chunks.length,
          chunks.length,
          driverNumber
        );
        onProgress(chunks.length, chunks.length, finalProgressInfo);
      }

      return allLocationData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error(`Error fetching location data for driver ${driverNumber}:`, error);
      throw error;
    }
  },

  getCarData: async (
    sessionKey: number,
    driverNumber: number,
    startTime: string,
    endTime: string
  ): Promise<CarData[]> => {
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
      onProgress?: (completed: number, total: number, progressInfo?: ProgressInfo) => void;
      dateChunkingOptions?: DateChunkingOptions;
    }
  ): Promise<{ [driverNumber: number]: LocationData[] }> => {
    const { 
      batchSize = 3, 
      delayBetweenBatches = 100, 
      onProgress,
      dateChunkingOptions = {} 
    } = options || {};
    
    try {
      // First get session details to get date bounds
      const session = await f1Api.getSessionByKey(sessionKey);
      
      if (!session.date_start || !session.date_end) {
        throw new Error('Session date information not available');
      }
      
      // Create date chunks
      const dateChunks = createDateChunks(
        session.date_start, 
        session.date_end, 
        {
          chunkDurationMinutes: 5, // Smaller chunks for better reliability
          minChunks: 2,
          maxChunks: 20,
          ...dateChunkingOptions
        }
      );
      
      // Get all drivers for this session
      const drivers = await f1Api.getDrivers(sessionKey);
      const driverNumbers = drivers.map(d => d.driver_number);
      
      // Track progress
      let completedOperations = 0;
      const totalOperations = driverNumbers.length * dateChunks.length;
      
      // Process each driver
      const allResults: { [driverNumber: number]: LocationData[] } = {};
      
      for (let driverIndex = 0; driverIndex < driverNumbers.length; driverIndex++) {
        const driverNumber = driverNumbers[driverIndex];
        const driver = drivers.find(d => d.driver_number === driverNumber);
        const driverName = driver?.name_acronym || `#${driverNumber}`;
        
        allResults[driverNumber] = [];
        
        // Process chunks for this driver in batches
        const chunkBatches: any[][] = [];
        for (let i = 0; i < dateChunks.length; i += batchSize) {
          chunkBatches.push(dateChunks.slice(i, i + batchSize));
        }
        
        for (const chunkBatch of chunkBatches) {
          const batchPromises = chunkBatch.map(async (chunk) => {
            try {
              const url = `${API_BASE}/location?session_key=${sessionKey}&driver_number=${driverNumber}&date>=${encodeURIComponent(chunk.startDate)}&date<=${encodeURIComponent(chunk.endDate)}`;
              const data = await fetchWithRetry(url, `Failed to fetch location data for driver ${driverNumber}, chunk ${chunk.chunkIndex + 1}`);
              return data;
            } catch (error) {
              console.error(`Error fetching chunk ${chunk.chunkIndex + 1} for driver ${driverNumber}:`, error);
              return []; // Return empty array for failed chunks
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          
          // Merge results for this driver
          for (const chunkData of batchResults) {
            if (Array.isArray(chunkData)) {
              allResults[driverNumber].push(...chunkData);
            }
          }
          
          // Update progress
          completedOperations += chunkBatch.length;
          if (onProgress) {
            const progressInfo = createProgressInfo(
              driverIndex + 1,
              driverNumbers.length,
              Math.min(completedOperations - (driverIndex * dateChunks.length), dateChunks.length),
              dateChunks.length,
              driverNumber,
              driverName
            );
            onProgress(completedOperations, totalOperations, progressInfo);
          }
          
          // Add delay between batches
          if (delayBetweenBatches > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
          }
        }
        
        // Sort the combined data by date for this driver
        allResults[driverNumber].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
      
      return allResults;
      
    } catch (error) {
      console.error('Error in getAllDriversLocationData:', error);
      
      // Fallback to original method without date chunking
      console.log('Falling back to original method without date chunking...');
      return withBatchMap(
        await f1Api.getDrivers(sessionKey).then(drivers => drivers.map(d => d.driver_number)),
        async (driverNumber) => {
          const url = `${API_BASE}/location?session_key=${sessionKey}&driver_number=${driverNumber}`;
          return fetchWithRetry(url, `Failed to fetch location data for driver ${driverNumber}`);
        },
        (driverNumber) => driverNumber,
        {
          batchSize,
          delayBetweenBatches,
          onProgress: onProgress ? (completed, total) => onProgress(completed, total) : undefined,
          onError: (driverNumber, error) => {
            console.error(`Failed to fetch location data for driver ${driverNumber}:`, error);
          },
          continueOnError: true,
          defaultValue: [] as LocationData[],
        }
      );
    }
  },

  getSessionLocationData: async (
    sessionKey: number,
    driverNumbers?: number[],
    options?: {
      batchSize?: number;
      delayBetweenBatches?: number;
      onProgress?: (completed: number, total: number, progressInfo?: ProgressInfo) => void;
      dateChunkingOptions?: DateChunkingOptions;
    }
  ): Promise<{ [driverNumber: number]: LocationData[] }> => {
    const { 
      batchSize = 5, 
      delayBetweenBatches = 100, 
      onProgress,
      dateChunkingOptions = {}
    } = options || {};
    
    let targetDrivers: number[];
    
    if (driverNumbers) {
      targetDrivers = driverNumbers;
    } else {
      // Get all drivers if none specified
      const drivers = await f1Api.getDrivers(sessionKey);
      targetDrivers = drivers.map(d => d.driver_number);
    }
    
    // Use the chunked method
    return f1Api.getAllDriversLocationData(sessionKey, {
      batchSize,
      delayBetweenBatches,
      onProgress,
      dateChunkingOptions
    }).then(allData => {
      // Filter to only requested drivers
      const filteredData: { [driverNumber: number]: LocationData[] } = {};
      for (const driverNumber of targetDrivers) {
        if (allData[driverNumber]) {
          filteredData[driverNumber] = allData[driverNumber];
        }
      }
      return filteredData;
    });
  },

  // Fetch car data for a single driver with chunking
  getSingleDriverCarData: async (
    sessionKey: number,
    driverNumber: number,
    options?: {
      onProgress?: (completed: number, total: number, progressInfo?: ProgressInfo) => void;
      dateChunkingOptions?: DateChunkingOptions;
    }
  ): Promise<CarData[]> => {
    const { onProgress, dateChunkingOptions = {} } = options || {};
    
    try {
      // Get session details to determine time range
      const session = await f1Api.getSessionByKey(sessionKey);
      
      if (!session.date_start || !session.date_end) {
        throw new Error('Session does not have valid start/end times');
      }

      // Create date chunks for this session
      const chunks = createDateChunks(
        session.date_start,
        session.date_end,
        dateChunkingOptions
      );

      let allCarData: CarData[] = [];
      let completedChunks = 0;

      // Process chunks one by one for this specific driver
      for (const chunk of chunks) {
        const progressInfo = createProgressInfo(
          1, // currentDriver (always 1 since we're fetching one driver)
          1, // totalDrivers (always 1)
          completedChunks + 1,
          chunks.length,
          driverNumber
        );

        // Call progress callback
        if (onProgress) {
          onProgress(completedChunks, chunks.length, progressInfo);
        }

        try {
          const chunkData = await f1Api.getCarData(
            sessionKey,
            driverNumber,
            chunk.startDate,
            chunk.endDate
          );
          
          allCarData = allCarData.concat(chunkData);
          completedChunks++;
          
          // Small delay between chunks to be nice to the API
          if (completedChunks < chunks.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn(`Failed to fetch car data chunk ${completedChunks + 1}/${chunks.length} for driver ${driverNumber}:`, error);
          completedChunks++;
        }
      }

      // Final progress update
      if (onProgress) {
        const finalProgressInfo = createProgressInfo(
          1,
          1,
          chunks.length,
          chunks.length,
          driverNumber
        );
        onProgress(chunks.length, chunks.length, finalProgressInfo);
      }

      return allCarData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error(`Error fetching car data for driver ${driverNumber}:`, error);
      throw error;
    }
  },
};
