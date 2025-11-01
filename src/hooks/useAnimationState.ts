import { useState, useEffect } from 'react';

interface AnimationState {
  isPlaying: boolean;
  progress: number;
  speed: number;
}

export const useAnimationState = (
  shouldResetOnSessionChange: boolean = false
) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    progress: 0,
    speed: 0.185, // Default to 0.185 (0.05x user speed for 3.7 Hz data)
  });

  // Reset animation state when needed (e.g., session changes)
  useEffect(() => {
    if (shouldResetOnSessionChange) {
      setAnimationState({
        isPlaying: false,
        progress: 0,
        speed: 0.185, // Reset to 0.185 (0.05x user speed for 3.7 Hz data)
      });
    }
  }, [shouldResetOnSessionChange]);

  const handlePlayPause = () => {
    setAnimationState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const handleReset = () => {
    setAnimationState(prev => ({
      ...prev,
      isPlaying: false,
      progress: 0,
    }));
  };

  const handleSpeedChange = (speed: number) => {
    setAnimationState(prev => ({
      ...prev,
      speed,
    }));
  };

  const handleProgressChange = (progress: number) => {
    setAnimationState(prev => ({
      ...prev,
      progress,
    }));
  };

  return {
    animationState,
    setAnimationState,
    handlePlayPause,
    handleReset,
    handleSpeedChange,
    handleProgressChange,
  };
};
