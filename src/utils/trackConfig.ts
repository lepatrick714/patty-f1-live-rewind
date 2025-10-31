// Central configuration for per-track visualization optimizations
// Add an entry per circuit. Keys should match `selectedSession.location` (case-insensitive compare done by consumer).
// Orientation options:
//  - mirrorX: boolean (horizontal mirror)
//  - mirrorY: boolean (vertical mirror)
//  - rotate: number (degrees, any angle; applied after mirroring)
// Camera options set initial viewport (user can still zoom/pan):
//  - initialZoom: number
//  - initialPanX / initialPanY: number (in canvas pixels applied after first layout)
// Layout:
//  - extraPadding: number (adds to default padding in worldToCanvas)
//  - aspectScale: optional manual override scale multiplier (rarely needed)
//
// Example addition:
//  export const trackConfig = {
//    baku: { mirrorX: false, mirrorY: true, rotate: 0, initialZoom: 1.2 },
//  }
// If location not found, defaults are used.

export interface TrackOptimization {
  mirrorX?: boolean;
  mirrorY?: boolean;
  rotate?: number; // degrees, any angle
  initialZoom?: number;
  initialPanX?: number;
  initialPanY?: number;
  extraPadding?: number; // adds to base padding
  aspectScale?: number; // multiplier applied to base scale
  // Content (pre-camera) translation in canvas pixels after scale+orientation, before camera pan/zoom
  contentOffsetX?: number;
  contentOffsetY?: number;
}

export const trackConfig: Record<string, TrackOptimization> = {

sakhir: {
    mirrorX: false, 
    mirrorY: true,
    rotate: 267,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  melbourne: {
    mirrorX: false,
    mirrorY: true,
    rotate: 315,
    initialZoom: 1.1,
  
  },
  shanghai: {
    mirrorX: false,
    mirrorY: true,
    rotate: 122,
    initialZoom: 1.3,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  suzuka: {
    mirrorX: false,
    mirrorY: true,
    rotate: 0,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  jeddah: {
    mirrorX: false,
    mirrorY: true,
    rotate: 250,
    initialZoom: 1.2,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },    
  miami: {
    mirrorX: false,
    mirrorY: true,
    rotate: 0,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  imola: {
    mirrorX: false,
    mirrorY: true,
    rotate: 0,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
 monaco: {
    mirrorX: true,
    mirrorY: false,
    rotate: 220,
    initialZoom: 1.3,
    extraPadding: 20,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  barcelona: {
    mirrorX: false,
    mirrorY: true,
    rotate: 57,
    initialZoom: 1.2,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  montréal: {
    mirrorX: false,
    mirrorY: true,
    rotate: 300,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  spielberg: {
    mirrorX: false,
    mirrorY: true,
    rotate: 0,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  'spa-francorchamps': {
    mirrorX: false,
    mirrorY: true,
    rotate: 270,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  budapest: {
    mirrorX: false,
    mirrorY: true,
    rotate: 47,
    initialZoom: 1.3,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  zandvoort: {
    mirrorX: true,
    mirrorY: false,
    rotate: 0,
    initialZoom: 1.0,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  monza: {
    mirrorX: false,
    mirrorY: true,
    rotate: 270,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  baku: {
    mirrorX: false,
    mirrorY: true,
    rotate: 0,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  silverstone: {
    mirrorX: true,
    mirrorY: false,
    rotate: 270,
    initialZoom: 1.05,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  'marina bay': {
    mirrorX: false,
    mirrorY: true,
    rotate: 0,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,
  },
  austin: {
    mirrorX: false,
    mirrorY: true,
    rotate: 0,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,  
  },
  'mexico city': {
    mirrorX: false,
    mirrorY: true,
    rotate: 0,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,  
  },
  'são paulo': {
    mirrorX: false,
    mirrorY: true,
    rotate: 90,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,  
  },
  'las vegas': {
    mirrorX: false,
    mirrorY: true,
    rotate: 270,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,  
  },
  lusail: {
    mirrorX: false,
    mirrorY: true,
    rotate: 300,
    initialZoom: 1.3,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,  
  },
  'yas island': {
    mirrorX: true,
    mirrorY: false,
    rotate: 270,
    initialZoom: 1.1,
    extraPadding: 10,
    contentOffsetX: 0,
    contentOffsetY: 0,  
  },
};

export function getTrackOptimization(rawLocation?: string | null): TrackOptimization {
  if (!rawLocation) return {};
  const key = rawLocation.trim().toLowerCase();
  return trackConfig[key] || {};
}
