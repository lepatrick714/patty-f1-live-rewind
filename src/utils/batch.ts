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

    const batchPromises = batch.map(
      async (
        item
      ): Promise<
        { success: true; result: R } | { success: false; error: any }
      > => {
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
      }
    );

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

    const batchPromises = batch.map(async item => {
      const key = keyExtractor(item);
      try {
        const result = await processor(item);
        results[key] = result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

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
