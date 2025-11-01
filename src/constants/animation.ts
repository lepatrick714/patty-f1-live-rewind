// Animation speed constants
export const ANIMATION_SPEEDS = {
  // Available speed options (internal speed values)
  SPEED_OPTIONS: [0.555, 0.74, 0.925, 1.11, 1.295] as const,
  
  // Default speed (sweet spot: 0.925 internal = 0.250x user speed)
  DEFAULT_SPEED: 0.925,
  
  // Helper function to convert internal speed to user-facing speed
  getUserSpeed: (internalSpeed: number) => internalSpeed / 3.7,
} as const;

// Animation state defaults
export const DEFAULT_ANIMATION_STATE = {
  isPlaying: false,
  progress: 0,
  speed: ANIMATION_SPEEDS.DEFAULT_SPEED,
} as const;