"use client";

import { F1DriverSelector } from "@/components/f1-drivers-selector/F1DriverSelector";
import { TrackVisualization } from "@/components/track-visualization";

function RightPanel() {
  return (
    <div >
      <h2 >Right Panel</h2>
      <div >
        <p>Live Timing</p>
        <p>Lap Analysis</p>
        <p>Telemetry Data</p>
        <p>Statistics</p>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-zinc-100">F1 Live Rewind</h1>
          <div className="text-sm text-zinc-400">Race Dashboard</div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-zinc-300">Session: <span className="text-zinc-500">Not Selected</span></div>
          <div className="text-zinc-300">Status: <span className="text-green-400">Ready</span></div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 px-6 py-4">
      <div className="flex items-center justify-between text-sm">
        <div className="text-zinc-400">
          © 2025 F1 Live Rewind | Real-time F1 Data Visualization
        </div>
        <div className="flex items-center space-x-2 text-zinc-500">
          <span>Data Source: FastF1</span>
          <span>•</span>
          <span>Last Updated: --:--</span>
        </div>
      </div>
    </footer>
  );
}

export default function RaceDashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* Left Panel */}
        <aside className="col-span-3">
          <F1DriverSelector />
        </aside>

        {/* Center - Track Visualization */}
        <section className="col-span-6">
          <TrackVisualization />
        </section>

        {/* Right Panel */}
        <aside className="col-span-3">
          <RightPanel />
        </aside>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}