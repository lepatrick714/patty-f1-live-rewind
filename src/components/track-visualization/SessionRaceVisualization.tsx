"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getTrackOptimization } from "@/utils/trackConfig";
import { ZapIcon } from "@/app/assets/Icons";
import { LocationData } from "@/models";

interface GPSPoint {
  date: string;
  x: number;
  y: number;
  z: number;
}

interface ProcessedDriverData {
  driverNumber: number;
  acronym: string;
  name: string;
  team: string;
  color: string;
  locations: GPSPoint[];
}

interface AnimationState {
  isPlaying: boolean;
  progress: number;
  speed: number;
}

interface SessionRaceVisualizationProps {
  selectedSession: {
    session_key: number;
    location: string;
    session_name: string;
  };
  selectedDrivers: number[];
  locationData: Record<number, LocationData[]>;
  driverData: Array<{
    driver_number: number;
    name_acronym: string;
    full_name: string;
    team_name: string;
    team_colour: string;
  }>;
  animationState: AnimationState;
  isLoading: boolean;
  onAnimationStateChange: (state: AnimationState) => void;
}

export function SessionRaceVisualization({
  selectedSession,
  selectedDrivers,
  locationData,
  driverData,
  animationState,
  isLoading,
  onAnimationStateChange,
}: SessionRaceVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const lastUIUpdateRef = useRef<number>(0);
  
  // Camera controls
  const cameraRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 6;

  // Update internal progress when external state changes
  useEffect(() => {
    progressRef.current = animationState.progress;
  }, [animationState.progress]);

  // Process driver data
  const processedDrivers: ProcessedDriverData[] = selectedDrivers
    .map((driverNumber) => {
      const driver = driverData.find((d) => d.driver_number === driverNumber);
      const locations = locationData[driverNumber] || [];
      
      return {
        driverNumber,
        acronym: driver?.name_acronym || `#${driverNumber}`,
        name: driver?.full_name || `Driver ${driverNumber}`,
        team: driver?.team_name || "Unknown",
        color: driver?.team_colour || getDriverColor(driverNumber),
        locations: locations.map(loc => ({
          date: loc.date,
          x: loc.x,
          y: loc.y,
          z: loc.z || 0,
        })),
      };
    })
    .filter((d) => d.locations.length > 0);

  // Calculate bounds from all GPS points
  const bounds = (() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    
    processedDrivers.forEach((driver) => {
      driver.locations.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    });
    
    return isFinite(minX) ? { minX, minY, maxX, maxY } : null;
  })();

  const trackOpts = getTrackOptimization(selectedSession?.location);

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

    // Raw bounds center & half-spans
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const halfW = (bounds.maxX - bounds.minX) / 2 || 0.5;
    const halfH = (bounds.maxY - bounds.minY) / 2 || 0.5;

    // Orientation flags & rotation
    const mirrorX = !!trackOpts.mirrorX;
    const mirrorY = !!trackOpts.mirrorY;
    const angleDeg = trackOpts.rotate || 0;
    const rad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // Calculate oriented bounding box for scaling
    const orientedHalfWidthUnits =
      Math.abs(halfW * cosA) + Math.abs(halfH * sinA);
    const orientedHalfHeightUnits =
      Math.abs(halfW * sinA) + Math.abs(halfH * cosA);
    let scale = Math.min(
      availW / (2 * orientedHalfWidthUnits || 1),
      availH / (2 * orientedHalfHeightUnits || 1)
    );
    if (trackOpts.aspectScale) scale *= trackOpts.aspectScale;

    // Translate to center-based coordinates
    let rx = x - centerX;
    let ry = y - centerY;

    // Apply mirroring
    if (mirrorX) rx = -rx;
    if (mirrorY) ry = -ry;

    // Apply rotation
    const xRot = rx * cosA - ry * sinA;
    const yRot = rx * sinA + ry * cosA;

    // Scale
    let sx = xRot * scale;
    let sy = yRot * scale;

    // Position in canvas
    let baseX = canvasW / 2 + sx;
    let baseY = canvasH / 2 + sy;

    // Apply content offsets
    if (trackOpts.contentOffsetX) baseX += trackOpts.contentOffsetX;
    if (trackOpts.contentOffsetY) baseY += trackOpts.contentOffsetY;

    // Apply camera transform
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const dpr = Math.min(
      2,
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    );
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  // Draw the track outline
  const drawTrack = (ctx: CanvasRenderingContext2D) => {
    if (processedDrivers.length === 0) return;
    
    // Use the first driver's locations to draw the track outline
    const trackPoints = processedDrivers[0].locations;
    if (trackPoints.length === 0) return;

    const z = cameraRef.current.zoom;
    const bgWidth = Math.max(6, Math.min(40, 20 * z));
    const fgWidth = Math.max(4, Math.min(30, 14 * z));
    const sfWidth = Math.max(2, Math.min(6, 3 * z));
    const dashLen = 8 * Math.max(0.6, Math.min(1.8, z));

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Track background
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = bgWidth;
    ctx.beginPath();
    trackPoints.forEach((p, i) => {
      const [x, y] = worldToCanvas(p.x, p.y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Track surface
    ctx.strokeStyle = "#4b5563";
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
      ctx.strokeStyle = "#ffffff";
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

  // Get car position at specific progress
  const getCarPosition = (driver: ProcessedDriverData, progress: number) => {
    const { locations } = driver;
    if (locations.length === 0) return null;

    const targetIndex = Math.floor(progress * (locations.length - 1));
    const nextIndex = Math.min(targetIndex + 1, locations.length - 1);
    
    if (targetIndex >= locations.length - 1) {
      return locations[locations.length - 1];
    }

    const current = locations[targetIndex];
    const next = locations[nextIndex];
    const t = (progress * (locations.length - 1)) % 1;

    return {
      x: current.x + (next.x - current.x) * t,
      y: current.y + (next.y - current.y) * t,
      z: current.z + (next.z - current.z) * t,
      date: current.date,
    };
  };

  // Draw cars at current progress
  const drawCars = (ctx: CanvasRenderingContext2D, progress: number) => {
    const z = cameraRef.current.zoom;
    const radius = Math.max(4, Math.min(16, 8 * z));
    const outline = Math.max(1, Math.min(3, 2 * z));
    const labelSize = Math.round(Math.max(10, Math.min(16, 12 * (0.9 + 0.2 * z))));
    const labelOffset = Math.max(10, Math.min(18, 12 * (0.9 + 0.2 * z)));

    processedDrivers.forEach((driver) => {
      const pos = getCarPosition(driver, progress);
      if (!pos) return;
      
      const [x, y] = worldToCanvas(pos.x, pos.y);

      ctx.save();

      // Car dot
      ctx.fillStyle = `#${driver.color}`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = outline;
      ctx.stroke();

      // Label
      ctx.font = `600 ${labelSize}px ui-sans-serif, system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#ffffffde";
      ctx.fillText(driver.acronym, x, y - labelOffset);

      ctx.restore();
    });
  };

  // Draw trajectories up to current progress
  const drawTrajectories = (ctx: CanvasRenderingContext2D, progress: number) => {
    processedDrivers.forEach((driver) => {
      const currentIndex = Math.floor(progress * driver.locations.length);
      
      ctx.save();
      ctx.strokeStyle = `#${driver.color}66`;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let started = false;
      driver.locations.slice(0, currentIndex + 1).forEach((p) => {
        const [x, y] = worldToCanvas(p.x, p.y);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      ctx.restore();
    });
  };

  // Main render function
  const render = () => {
    const ctx = setupCanvas();
    if (!ctx || !bounds) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw grid
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < rect.width; i += 50) {
      ctx.fillRect(i, 0, 1, rect.height);
    }
    for (let j = 0; j < rect.height; j += 50) {
      ctx.fillRect(0, j, rect.width, 1);
    }
    ctx.restore();

    const p = progressRef.current;
    drawTrack(ctx);
    drawTrajectories(ctx, p);
    drawCars(ctx, p);
  };

  // Animation loop
  const animate = (ts: number) => {
    if (!lastTimestampRef.current) lastTimestampRef.current = ts;
    const deltaTime = (ts - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = ts;

    if (animationState.isPlaying && processedDrivers.length > 0) {
      // Assume session duration based on available data points
      const maxPoints = Math.max(...processedDrivers.map(d => d.locations.length));
      const sessionDuration = 60; // Assume 60 seconds for demo, adjust as needed
      const progressIncrement = (deltaTime / sessionDuration) * animationState.speed;
      const next = Math.min(1, progressRef.current + progressIncrement);
      progressRef.current = next;

      // Update UI at reduced frequency
      if (ts - lastUIUpdateRef.current > 150) {
        lastUIUpdateRef.current = ts;
        onAnimationStateChange({
          ...animationState,
          progress: progressRef.current,
        });
      }

      if (next >= 1) {
        progressRef.current = 1;
        onAnimationStateChange({
          ...animationState,
          isPlaying: false,
          progress: 1,
        });
      }
    }

    render();
    animationRef.current = requestAnimationFrame(animate);
  };

  // Start animation loop when data is ready
  useEffect(() => {
    if (processedDrivers.length > 0) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [processedDrivers]);

  // Restart on animation state changes
  useEffect(() => {
    if (processedDrivers.length === 0) return;
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Camera controls (zoom and pan)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let dragging = false;
    let lastX = 0, lastY = 0;
    let activePointerId: number | null = null;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!bounds) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const factor = Math.exp((-e.deltaY / 100) * 0.2);
      const oldZoom = cameraRef.current.zoom;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * factor));
      if (newZoom === oldZoom) return;

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const { panX, panY } = cameraRef.current;

      const baseX = (mx - cx - panX) / oldZoom + cx;
      const baseY = (my - cy - panY) / oldZoom + cy;

      cameraRef.current.zoom = newZoom;
      cameraRef.current.panX = mx - (baseX - cx) * newZoom - cx;
      cameraRef.current.panY = my - (baseY - cy) * newZoom - cy;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      activePointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      cameraRef.current.panX += dx;
      cameraRef.current.panY += dy;
    };

    const onPointerUpOrCancel = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      dragging = false;
      activePointerId = null;
      canvas.style.cursor = "grab";
      try { 
        canvas.releasePointerCapture(e.pointerId); 
      } catch {}
    };

    const onDoubleClick = () => {
      cameraRef.current = { zoom: 1, panX: 0, panY: 0 };
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUpOrCancel);
    canvas.addEventListener("pointercancel", onPointerUpOrCancel);
    canvas.addEventListener("dblclick", onDoubleClick);

    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUpOrCancel);
      canvas.removeEventListener("pointercancel", onPointerUpOrCancel);
      canvas.removeEventListener("dblclick", onDoubleClick);
    };
  }, [bounds]);

  function getDriverColor(driverNumber: number): string {
    const colors = ["ED1131", "FF8000", "005AFF", "2D826D", "DC143C", "F58020"];
    return colors[driverNumber % colors.length];
  }

  if (isLoading) {
    return (
      <Card className="w-full h-[500px] lg:h-[70vh] xl:h-[80vh] flex items-center justify-center rounded-xl overflow-hidden border">
        <CardContent className="p-0 w-full h-full">
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">
                Loading session data...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processedDrivers.length === 0) {
    return (
      <Card className="w-full h-[500px] lg:h-[70vh] xl:h-[80vh] flex items-center justify-center rounded-xl overflow-hidden border">
        <CardContent className="p-0 w-full h-full">
          <div className="text-center">
            <ZapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground">
              No location data available for the selected drivers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl overflow-hidden border w-full h-[500px] lg:h-[70vh] xl:h-[80vh]">
      <CardContent className="p-0 h-full">
        <div className="relative h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{
              imageRendering: "auto",
              touchAction: "none",
              background: "#0f0f12",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}