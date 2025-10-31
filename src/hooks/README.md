# Location Data Hooks Documentation

This project provides two different hooks for fetching F1 location data, each serving different use cases.

## useLocationData (Fastest Lap Only)

**File:** `src/hooks/useLocationDataQuery.ts`

### Purpose
Fetches location data for only the fastest lap of each selected driver. This is optimized for visualization where you want to compare drivers on a standardized track layout.

### Key Features
- Computes fastest lap for each driver
- Uses the overall fastest driver's spatial path as the canonical track layout
- All drivers follow the same spatial path but with different timing
- Lightweight and fast loading
- Perfect for lap-by-lap comparisons

### Usage
```typescript
const { data: locationData, isLoading } = useLocationData(
  selectedSession,
  selectedDrivers,
  allLapData,
  masterLapTimeRef
);
```

### Data Structure
```typescript
{
  [driverNumber]: GPSPoint[] // Same spatial points for all drivers
}
```

## useRaceLocationData (Full Race)

**File:** `src/hooks/useRaceLocationData.ts`

### Purpose
Fetches complete location data for the entire race session in chunks. This provides the actual racing lines and movements throughout the race.

### Key Features
- Fetches entire race duration in time-based chunks
- Configurable chunk duration (default 5 minutes)
- Concurrent request limiting for performance
- Option to use lap data or session times for bounds
- Shows actual racing lines, not just fastest lap path
- Each driver has unique spatial data

### Usage
```typescript
// Basic usage
const { data: raceData, isLoading } = useRaceLocationData(
  selectedSession,
  selectedDrivers
);

// Advanced usage with options
const { data: raceData, isLoading } = useRaceLocationData(
  selectedSession,
  selectedDrivers,
  allLapData, // Optional: for determining time bounds
  {
    chunkDurationMinutes: 10,    // Larger chunks
    maxConcurrentRequests: 2,    // Limit concurrent requests
    useLapDataForBounds: true    // Use lap data instead of session times
  }
);
```

### Data Structure
```typescript
{
  [driverNumber]: GPSPoint[] // Unique spatial points for each driver
}
```

## When to Use Which Hook

### Use `useLocationData` when:
- You want to compare drivers on standardized lap timing
- You need fast loading for interactive visualization
- You're building lap-by-lap race replay
- You want consistent track layout across all drivers
- Memory and bandwidth are concerns

### Use `useRaceLocationData` when:
- You need complete race data for analysis
- You want to see actual racing lines and overtakes
- You're building full race replay functionality
- You need to analyze driver behavior throughout the race
- You want to see pit stops, safety cars, and race incidents

## API Endpoint Pattern

Both hooks use the F1 OpenAPI location endpoint:
```
https://api.openf1.org/v1/location?session_key={session}&driver_number={driver}&date%3E{start}&date%3C{end}
```

## Performance Considerations

- `useLocationData`: Fast, lightweight, ~100-500 points per driver
- `useRaceLocationData`: Slower, comprehensive, ~5000-20000 points per driver
- Use appropriate chunk sizes and concurrency limits based on your needs
- Consider implementing pagination or virtualization for large datasets