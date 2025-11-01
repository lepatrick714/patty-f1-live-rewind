import { useState, useEffect } from 'react';
import { DEFAULT_ANIMATION_STATE } from '@/constants/animation';

interface AnimationState {
  isPlaying: boolean;
  progress: number;
  speed: number;
}

export const useAnimationState = (
  shouldResetOnSessionChange: boolean = false
) => {
  const [animationState, setAnimationState] = useState<AnimationState>(DEFAULT_ANIMATION_STATE);

  // Reset animation state when needed (e.g., session changes)
  useEffect(() => {
    if (shouldResetOnSessionChange) {
      setAnimationState(DEFAULT_ANIMATION_STATE);
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
