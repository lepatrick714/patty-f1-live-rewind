'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimerIcon, PlayIcon, PauseIcon } from '@/app/assets/Icons';
import { useRaceStore } from '@/hooks/useRaceStore';

interface RaceTimerProps {
  isPlaying?: boolean;
  animationProgress?: number;
}

export const RaceTimer = ({ isPlaying = false, animationProgress = 0 }: RaceTimerProps) => {
  const { selectedSession } = useRaceStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format duration helper function - defined before useMemo
  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.abs(Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Calculate race timing information
  const raceTimingInfo = useMemo(() => {
    if (!selectedSession) {
      return {
        sessionStatus: 'No Session',
        elapsedTime: '00:00:00',
        sessionDuration: '00:00:00',
        progress: 0,
        isLive: false,
      };
    }

    const sessionStart = selectedSession.date_start ? new Date(selectedSession.date_start) : null;
    const sessionEnd = selectedSession.date_end ? new Date(selectedSession.date_end) : null;
    
    if (!sessionStart || !sessionEnd) {
      return {
        sessionStatus: 'Invalid Session',
        elapsedTime: '00:00:00',
        sessionDuration: '00:00:00',
        progress: 0,
        isLive: false,
      };
    }

    const totalDuration = sessionEnd.getTime() - sessionStart.getTime();
    const totalDurationFormatted = formatDuration(totalDuration);

    // If we're replaying with animation progress
    if (animationProgress > 0) {
      const replayElapsed = totalDuration * animationProgress;
      const replayElapsedFormatted = formatDuration(replayElapsed);
      const replayTime = new Date(sessionStart.getTime() + replayElapsed);
      
      return {
        sessionStatus: 'Replay',
        elapsedTime: replayElapsedFormatted,
        sessionDuration: totalDurationFormatted,
        progress: animationProgress * 100,
        isLive: false,
        replayTime: replayTime.toISOString(),
      };
    }

    // Live timing calculation
    const now = currentTime.getTime();
    const isBeforeStart = now < sessionStart.getTime();
    const isAfterEnd = now > sessionEnd.getTime();
    
    if (isBeforeStart) {
      const timeToStart = sessionStart.getTime() - now;
      return {
        sessionStatus: 'Starts In',
        elapsedTime: formatDuration(timeToStart),
        sessionDuration: totalDurationFormatted,
        progress: 0,
        isLive: false,
      };
    }

    if (isAfterEnd) {
      return {
        sessionStatus: 'Finished',
        elapsedTime: totalDurationFormatted,
        sessionDuration: totalDurationFormatted,
        progress: 100,
        isLive: false,
      };
    }

    // Session is currently running
    const elapsed = now - sessionStart.getTime();
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    return {
      sessionStatus: 'Live',
      elapsedTime: formatDuration(elapsed),
      sessionDuration: totalDurationFormatted,
      progress,
      isLive: true,
    };
  }, [selectedSession, currentTime, animationProgress]);

  const getStatusColor = (status: string, isLive: boolean) => {
    if (isLive) return '#10B981'; // Green for live
    if (status === 'Replay') return '#3B82F6'; // Blue for replay
    if (status === 'Finished') return '#6B7280'; // Gray for finished
    if (status === 'Starts In') return '#F59E0B'; // Orange for upcoming
    return '#6B7280'; // Default gray
  };

  const statusColor = getStatusColor(raceTimingInfo.sessionStatus, raceTimingInfo.isLive);

  return (
    <Card className="border-gray-800 bg-gradient-to-r from-gray-950 to-black">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Session Info */}
          <div className="flex items-center gap-3">
            <TimerIcon className="h-5 w-5 text-gray-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  {selectedSession?.session_name || 'No Session'}
                </h3>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                    borderColor: `${statusColor}40`,
                  }}
                >
                  <div className="flex items-center gap-1">
                    {raceTimingInfo.isLive || isPlaying ? (
                      <div
                        className="h-2 w-2 rounded-full animate-pulse"
                        style={{ backgroundColor: statusColor }}
                      />
                    ) : (
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                    )}
                    {raceTimingInfo.sessionStatus}
                  </div>
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                {selectedSession?.location || 'Unknown Location'} • {selectedSession?.session_type || 'Unknown Type'}
              </div>
            </div>
          </div>

          {/* Timing Display */}
          <div className="text-right">
            <div className="text-lg font-mono font-bold text-white">
              {raceTimingInfo.elapsedTime}
            </div>
            <div className="text-xs text-gray-400">
              / {raceTimingInfo.sessionDuration}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Session Progress</span>
            <span>{Math.round(raceTimingInfo.progress)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{
                width: `${raceTimingInfo.progress}%`,
                background: `linear-gradient(90deg, ${statusColor}, ${statusColor}80)`,
                boxShadow: `0 0 8px ${statusColor}40`,
              }}
            />
            {/* Pulse effect for live sessions */}
            {(raceTimingInfo.isLive || isPlaying) && (
              <div
                className="absolute inset-0 opacity-30 animate-slide-progress"
                style={{
                  background: `linear-gradient(90deg, transparent, ${statusColor}40, transparent)`,
                  width: '20%',
                }}
              />
            )}
          </div>
        </div>

        {/* Replay time indicator */}
        {raceTimingInfo.sessionStatus === 'Replay' && raceTimingInfo.replayTime && (
          <div className="mt-2 text-center">
            <div className="text-xs text-blue-400">
              Replay Time: {new Date(raceTimingInfo.replayTime).toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};