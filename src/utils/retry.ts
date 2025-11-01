export type RetryOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
};

export type BatchOptions = {
  batchSize?: number;
  delayBetweenBatches?: number;
  onProgress?: (completed: number, total: number) => void;
  onError?: (item: any, error: any) => void;
  continueOnError?: boolean;
};

export type BatchMapOptions<R> = BatchOptions & {
  defaultValue?: R;
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const fetchWithRetry = async (url: string, errorMsg: string) => {
  return withRetry(async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${errorMsg}: ${response.status}`);
    return response.json();
  });
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 5,
    baseDelayMs = 500,
    backoffFactor = 2,
    jitter = true,
  } = opts;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isLast = attempt === maxRetries;

      // If caller provided a retryAfter value on the error, respect it
      const retryAfterMs =
        typeof err?.retryAfter === 'number' ? err.retryAfter : null;
      if (isLast) throw err;

      let delay =
        retryAfterMs ??
        Math.floor(baseDelayMs * Math.pow(backoffFactor, attempt));
      if (jitter) {
        // jitter between 0.5x and 1.5x
        const jitterFactor = 0.5 + Math.random();
        delay = Math.floor(delay * jitterFactor);
      }

      await sleep(delay);
      // loop to retry
    }
  }

  // unreachable
  throw new Error('withRetry: exceeded retries');
}

export async function withBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  opts: BatchOptions = {}
): Promise<R[]> {
  const {
    batchSize = 5,
    delayBetweenBatches = 100,
    onProgress,
    onError,
    continueOnError = true,
  } = opts;

  const results: R[] = [];
  const errors: Array<{ item: T; error: any }> = [];

  // Process items in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (item): Promise<{ success: true; result: R } | { success: false; error: any }> => {
      try {
        const result = await processor(item);
        return { success: true, result };
      } catch (error) {
        if (onError) {
          onError(item, error);
        }
        errors.push({ item, error });
        
        if (!continueOnError) {
          throw error;
        }
        
        return { success: false, error };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    // Extract successful results
    for (const result of batchResults) {
      if (result.success) {
        results.push(result.result);
      }
    }
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length);
    }
    
    // Add delay between batches
    if (i + batchSize < items.length && delayBetweenBatches > 0) {
      await sleep(delayBetweenBatches);
    }
  }
  
  if (errors.length > 0 && !continueOnError) {
    throw new Error(`Batch processing failed with ${errors.length} errors`);
  }
  
  return results;
}

export async function withBatchMap<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  keyExtractor: (item: T) => string | number,
  opts: BatchMapOptions<R> = {}
): Promise<{ [key: string | number]: R }> {
  const {
    batchSize = 5,
    delayBetweenBatches = 100,
    onProgress,
    onError,
    continueOnError = true,
    defaultValue,
  } = opts;

  const results: { [key: string | number]: R } = {};
  const errors: { [key: string | number]: string } = {};

  // Process items in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (item) => {
      const key = keyExtractor(item);
      try {
        const result = await processor(item);
        results[key] = result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (onError) {
          onError(item, error);
        }
        
        errors[key] = errorMessage;
        
        if (!continueOnError) {
          throw error;
        }
        
        // Set default value for failed items when continuing on error
        if (defaultValue !== undefined) {
          results[key] = defaultValue;
        }
      }
    });
    
    await Promise.all(batchPromises);
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length);
    }
    
    // Add delay between batches
    if (i + batchSize < items.length && delayBetweenBatches > 0) {
      await sleep(delayBetweenBatches);
    }
  }
  
  if (Object.keys(errors).length > 0) {
    console.warn('Some items failed to process:', errors);
  }
  
  return results;
}
