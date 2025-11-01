/**
 * Utility functions for chunking date ranges to handle large API requests
 */

export interface DateChunk {
  startDate: string;
  endDate: string;
  chunkIndex: number;
  totalChunks: number;
}

export interface DateChunkingOptions {
  /** 
   * Maximum duration of each chunk in minutes 
   * Default: 10 minutes 
   */
  chunkDurationMinutes?: number;
  
  /** 
   * Minimum number of chunks to create, even if session is short 
   * Default: 1
   */
  minChunks?: number;
  
  /** 
   * Maximum number of chunks to create, even if session is very long 
   * Default: 50
   */
  maxChunks?: number;
}

/**
 * Splits a date range into smaller chunks to avoid API timeouts
 */
export function createDateChunks(
  startDate: string, 
  endDate: string, 
  options: DateChunkingOptions = {}
): DateChunk[] {
  const {
    chunkDurationMinutes = 10,
    minChunks = 1,
    maxChunks = 50
  } = options;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    throw new Error('Start date must be before end date');
  }

  const totalDurationMs = end.getTime() - start.getTime();
  const chunkDurationMs = chunkDurationMinutes * 60 * 1000;
  
  // Calculate optimal number of chunks
  let numChunks = Math.ceil(totalDurationMs / chunkDurationMs);
  numChunks = Math.max(minChunks, Math.min(maxChunks, numChunks));
  
  const actualChunkDurationMs = totalDurationMs / numChunks;
  
  const chunks: DateChunk[] = [];
  
  for (let i = 0; i < numChunks; i++) {
    const chunkStartTime = start.getTime() + (i * actualChunkDurationMs);
    const chunkEndTime = i === numChunks - 1 
      ? end.getTime() // Last chunk ends exactly at session end
      : start.getTime() + ((i + 1) * actualChunkDurationMs);
    
    chunks.push({
      startDate: new Date(chunkStartTime).toISOString(),
      endDate: new Date(chunkEndTime).toISOString(),
      chunkIndex: i,
      totalChunks: numChunks
    });
  }
  
  return chunks;
}

/**
 * Enhanced progress information for UI display
 */
export interface ProgressInfo {
  currentDriver: number;
  totalDrivers: number;
  currentChunk: number;
  totalChunks: number;
  driverNumber?: number;
  driverName?: string;
  progressPercent: number;
}

/**
 * Calculates total progress from chunk-based fetching
 */
export function calculateChunkedProgress(
  completedChunks: number,
  totalChunks: number,
  driversCompleted: number,
  totalDrivers: number
): number {
  if (totalDrivers === 0 || totalChunks === 0) return 0;
  
  // Progress per driver = (completed chunks / total chunks) / total drivers
  const progressPerDriver = 1 / totalDrivers;
  const chunkProgressPerDriver = progressPerDriver / totalChunks;
  
  return Math.min(1, (driversCompleted * progressPerDriver) + (completedChunks * chunkProgressPerDriver));
}

/**
 * Formats progress information for UI display
 */
export function formatProgressInfo(
  currentDriver: number,
  totalDrivers: number,
  currentChunk: number,
  totalChunks: number,
  driverName?: string
): string {
  const driverInfo = driverName ? ` (${driverName})` : '';
  return `Driver ${currentDriver}/${totalDrivers}${driverInfo} - Chunk ${currentChunk}/${totalChunks}`;
}

/**
 * Creates detailed progress info object for enhanced UI feedback
 */
export function createProgressInfo(
  currentDriver: number,
  totalDrivers: number,
  currentChunk: number,
  totalChunks: number,
  driverNumber?: number,
  driverName?: string
): ProgressInfo {
  const overallProgress = calculateChunkedProgress(
    currentChunk - 1, // -1 because currentChunk is 1-indexed
    totalChunks,
    currentDriver - 1, // -1 because currentDriver is 1-indexed 
    totalDrivers
  );

  return {
    currentDriver,
    totalDrivers,
    currentChunk,
    totalChunks,
    driverNumber,
    driverName,
    progressPercent: Math.round(overallProgress * 100)
  };
}