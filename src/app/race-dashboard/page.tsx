'use client';

import { F1DriverSelector } from '@/components/f1-drivers-selector/F1DriverSelector';
import { F1RaceSelector } from '@/components/f1-race-selector';
import { TrackVisualization } from '@/components/track-visualization';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function RightPanel() {
  return (
    <div>
      <h2>Right Panel</h2>
      <div>
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
    <header className="border-b border-zinc-700 bg-zinc-900/50 backdrop-blur">
      <div className="flex w-full flex-col justify-between gap-2 px-3 py-3 sm:py-4 md:flex-row md:items-center md:gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            F1 Race Analyzer
          </h1>
          <p className="mt-1 text-sm text-zinc-400 sm:text-base">
            Compare driver performance across the last 3 seasons
          </p>
        </div>
        <div className="w-full md:w-auto md:shrink-0">
          <F1RaceSelector />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-4">
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

const queryClient = new QueryClient();

export default function RaceDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-zinc-950">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main className="grid flex-1 grid-cols-12 gap-6 p-6">
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
    </QueryClientProvider>
  );
}
