'use client';

import { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { WeatherData, LocationData } from '@/models';
import { getTrackOptimization } from '@/utils/trackConfig';
import { WeatherControls } from './WeatherControls';
import { WeatherInfo } from './WeatherInfo';

interface GPSPoint {
  date: string;
  x: number;
  y: number;
  z: number;
}

interface AnimationState {
  isPlaying: boolean;
  progress: number;
  speed: number;
}

interface WeatherTrackVisualizationProps {
  selectedSession: {
    session_key: number;
    location: string;
    session_name: string;
    date_start: string;
    date_end: string;
  };
  weatherData: WeatherData[];
  trackLocationData: LocationData[];
  isLoading: boolean;
}

export function WeatherTrackVisualization({
  selectedSession,
  weatherData,
  trackLocationData,
  isLoading,
}: WeatherTrackVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  // Camera controls
  const cameraRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 6;

  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    progress: 0,
    speed: 1,
  });

  // Convert track location data to GPS points
  const trackPoints: GPSPoint[] = trackLocationData.map(loc => ({
    date: loc.date,
    x: loc.x,
    y: loc.y,
    z: loc.z || 0,
  }));

  // Update internal progress when external state changes
  useEffect(() => {
    progressRef.current = animationState.progress;
  }, [animationState.progress]);

  // Calculate bounds from all GPS points
  const bounds = (() => {
    if (trackPoints.length === 0) return null;
    
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    trackPoints.forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });

    return isFinite(minX) ? { minX, minY, maxX, maxY } : null;
  })();

  const trackOpts = getTrackOptimization(selectedSession?.location);

  // Get current weather based on progress
  const getCurrentWeather = (progress: number): WeatherData | null => {
    if (weatherData.length === 0) return null;
    if (!selectedSession.date_start || !selectedSession.date_end) return weatherData[0];

    const sessionStart = new Date(selectedSession.date_start).getTime();
    const sessionEnd = new Date(selectedSession.date_end).getTime();
    
    // Check if dates are valid
    if (isNaN(sessionStart) || isNaN(sessionEnd)) return weatherData[0];
    
    const currentTime = sessionStart + progress * (sessionEnd - sessionStart);

    // Find the closest weather data point
    let closestWeather = weatherData[0];
    let minDiff = Math.abs(new Date(closestWeather.date).getTime() - currentTime);

    for (const weather of weatherData) {
      const weatherTime = new Date(weather.date).getTime();
      if (isNaN(weatherTime)) continue;
      
      const diff = Math.abs(weatherTime - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestWeather = weather;
      }
    }

    return closestWeather;
  };

  // World to canvas coordinate transformation
  const worldToCanvas = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !bounds) return [0, 0];
    const rect = canvas.getBoundingClientRect();

    const padding = 40 + (trackOpts.extraPadding || 0);
    const canvasW = rect.width;
    const canvasH = rect.height;
    const availW = canvasW - 2 * padding;
    const availH = canvasH - 2 * padding;

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const halfW = (bounds.maxX - bounds.minX) / 2 || 0.5;
    const halfH = (bounds.maxY - bounds.minY) / 2 || 0.5;

    const mirrorX = !!trackOpts.mirrorX;
    const mirrorY = !!trackOpts.mirrorY;
    const angleDeg = trackOpts.rotate || 0;
    const rad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const orientedHalfWidthUnits =
      Math.abs(halfW * cosA) + Math.abs(halfH * sinA);
    const orientedHalfHeightUnits =
      Math.abs(halfW * sinA) + Math.abs(halfH * cosA);
    let scale = Math.min(
      availW / (2 * orientedHalfWidthUnits || 1),
      availH / (2 * orientedHalfHeightUnits || 1)
    );
    if (trackOpts.aspectScale) scale *= trackOpts.aspectScale;

    let rx = x - centerX;
    let ry = y - centerY;

    if (mirrorX) rx = -rx;
    if (mirrorY) ry = -ry;

    const xRot = rx * cosA - ry * sinA;
    const yRot = rx * sinA + ry * cosA;

    const sx = xRot * scale;
    const sy = yRot * scale;

    let baseX = canvasW / 2 + sx;
    let baseY = canvasH / 2 + sy;

    if (trackOpts.contentOffsetX) baseX += trackOpts.contentOffsetX;
    if (trackOpts.contentOffsetY) baseY += trackOpts.contentOffsetY;

    const { zoom, panX, panY } = cameraRef.current;
    const cx = canvasW / 2;
    const cy = canvasH / 2;
    const zx = (baseX - cx) * zoom + cx + panX;
    const zy = (baseY - cy) * zoom + cy + panY;

    return [zx, zy];
  };

  // Setup canvas with proper DPI scaling
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const dpr = Math.min(
      2,
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    );
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  // Determine if it's day or night based on hour
  const isDayTime = (weather: WeatherData | null): boolean => {
    if (!weather) return true;
    const hour = new Date(weather.date).getHours();
    return hour >= 6 && hour < 20; // Day from 6am to 8pm
  };

  // Get background color based on weather and time
  const getBackgroundColor = (weather: WeatherData | null): string => {
    if (!weather) return '#0a0e1a';
    
    const isDay = isDayTime(weather);
    const rainfall = weather.rainfall;

    if (isDay) {
      if (rainfall > 0) {
        return '#4a5568'; // Gray for rainy day
      }
      return '#87ceeb'; // Sky blue for clear day
    } else {
      if (rainfall > 0) {
        return '#1a202c'; // Dark gray for rainy night
      }
      return '#0a0e1a'; // Dark blue for clear night
    }
  };

  // Draw rain effect
  const drawRain = (ctx: CanvasRenderingContext2D, rainfall: number, canvas: HTMLCanvasElement) => {
    if (rainfall <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const numDrops = Math.min(Math.floor(rainfall * 100), 500);
    
    ctx.save();
    ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    for (let i = 0; i < numDrops; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const length = 10 + Math.random() * 10;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + length);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Draw the track outline with weather effects
  const drawTrack = (ctx: CanvasRenderingContext2D, weather: WeatherData | null) => {
    if (trackPoints.length === 0) return;

    const z = cameraRef.current.zoom;
    const bgWidth = Math.max(6, Math.min(40, 20 * z));
    const fgWidth = Math.max(4, Math.min(30, 14 * z));
    const sfWidth = Math.max(2, Math.min(6, 3 * z));
    const dashLen = 8 * Math.max(0.6, Math.min(1.8, z));

    // Adjust track colors based on weather
    const isRaining = weather && weather.rainfall > 0;
    const isDay = isDayTime(weather);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Track background - darker when wet
    ctx.strokeStyle = isRaining ? '#1a1f2e' : '#374151';
    ctx.lineWidth = bgWidth;
    ctx.beginPath();
    trackPoints.forEach((p, i) => {
      const [x, y] = worldToCanvas(p.x, p.y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Track surface - shows wet shine
    if (isRaining) {
      ctx.strokeStyle = '#2d3748';
      ctx.shadowColor = 'rgba(147, 197, 253, 0.3)';
      ctx.shadowBlur = 5;
    } else {
      ctx.strokeStyle = '#4b5563';
      ctx.shadowBlur = 0;
    }
    ctx.lineWidth = fgWidth;
    ctx.beginPath();
    trackPoints.forEach((p, i) => {
      const [x, y] = worldToCanvas(p.x, p.y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Start/finish line
    if (trackPoints.length > 0) {
      const [sx, sy] = worldToCanvas(trackPoints[0].x, trackPoints[0].y);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = sfWidth;
      ctx.setLineDash([dashLen, dashLen]);
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy - 12);
      ctx.lineTo(sx + 12, sy + 12);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  // Main render function
  const render = () => {
    const ctx = setupCanvas();
    if (!ctx || !bounds) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const currentWeather = getCurrentWeather(progressRef.current);
    const bgColor = getBackgroundColor(currentWeather);

    // Background with weather-based color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw subtle grid
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < rect.width; i += 50) {
      ctx.fillRect(i, 0, 1, rect.height);
    }
    for (let j = 0; j < rect.height; j += 50) {
      ctx.fillRect(0, j, rect.width, 1);
    }
    ctx.restore();

    drawTrack(ctx, currentWeather);
    
    // Draw rain effect if raining
    if (currentWeather && currentWeather.rainfall > 0) {
      drawRain(ctx, currentWeather.rainfall, canvas);
    }
  };

  // Animation loop
  const animate = (ts: number) => {
    if (!lastTimestampRef.current) lastTimestampRef.current = ts;
    const deltaTime = (ts - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = ts;

    if (animationState.isPlaying && trackPoints.length > 0) {
      const increment = (deltaTime * animationState.speed) / 60; // 60 seconds for full replay at 1x speed
      let newProgress = progressRef.current + increment;

      if (newProgress >= 1) {
        newProgress = 1;
        setAnimationState(prev => ({ ...prev, isPlaying: false, progress: 1 }));
      } else {
        progressRef.current = newProgress;
        // Throttle UI updates
        const now = Date.now();
        if (now - lastTimestampRef.current > 50) {
          setAnimationState(prev => ({ ...prev, progress: newProgress }));
          lastTimestampRef.current = now;
        }
      }
    }

    render();
    animationRef.current = requestAnimationFrame(animate);
  };

  // Start animation loop when data is ready
  useEffect(() => {
    if (trackPoints.length > 0) {
      lastTimestampRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [trackPoints.length]);

  // Restart on animation state changes
  useEffect(() => {
    if (trackPoints.length === 0) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animationState.isPlaying, animationState.speed]);

  // Initialize camera from track config
  useEffect(() => {
    cameraRef.current.zoom = trackOpts.initialZoom || 1;
    cameraRef.current.panX = trackOpts.initialPanX || 0;
    cameraRef.current.panY = trackOpts.initialPanY || 0;
  }, [trackOpts, selectedSession?.location]);

  // Re-render on progress changes
  useEffect(() => {
    render();
  }, [animationState.progress]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Camera controls (zoom and pan)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let dragging = false;
    let lastX = 0,
      lastY = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, cameraRef.current.zoom + delta)
      );
      cameraRef.current.zoom = newZoom;
      render();
    };

    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      cameraRef.current.panX += dx;
      cameraRef.current.panY += dy;
      lastX = e.clientX;
      lastY = e.clientY;
      render();
    };

    const onMouseUp = () => {
      dragging = false;
      canvas.style.cursor = 'grab';
    };

    const onDoubleClick = () => {
      cameraRef.current.zoom = trackOpts.initialZoom || 1;
      cameraRef.current.panX = trackOpts.initialPanX || 0;
      cameraRef.current.panY = trackOpts.initialPanY || 0;
      render();
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('dblclick', onDoubleClick);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      canvas.removeEventListener('dblclick', onDoubleClick);
    };
  }, [bounds]);

  if (isLoading) {
    return (
      <Card className="flex h-[500px] w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 lg:h-[70vh] xl:h-[80vh]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
          <p className="text-zinc-400">Loading weather data...</p>
        </div>
      </Card>
    );
  }

  if (trackPoints.length === 0) {
    return (
      <Card className="flex h-[500px] w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 lg:h-[70vh] xl:h-[80vh]">
        <div className="text-center">
          <p className="text-zinc-400">No track data available for this session</p>
        </div>
      </Card>
    );
  }

  const currentWeather = getCurrentWeather(animationState.progress);

  return (
    <div className="space-y-4">
      <Card className="h-[500px] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 lg:h-[70vh] xl:h-[80vh]">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ touchAction: 'none' }}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <WeatherControls
          animationState={animationState}
          onAnimationStateChange={setAnimationState}
          sessionStart={selectedSession.date_start}
          sessionEnd={selectedSession.date_end}
        />
        <WeatherInfo weather={currentWeather} />
      </div>
    </div>
  );
}
