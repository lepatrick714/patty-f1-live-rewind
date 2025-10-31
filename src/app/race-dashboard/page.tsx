'use client';

import { TrackVisualization } from '@/components/track-visualization/';

// Placeholder components for the side panels
function LeftPanel() {
  return (
    <div>
      <h2>Left Panel</h2>
      <div>
        <p>Session Selection</p>
        <p>Driver Selection</p>
        <p>Race Settings</p>
        <p>Data Filters</p>
      </div>
    </div>
  );
}

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
    <header>
      <div>
        <div>
          <h1>F1 Live Rewind</h1>
          <div>Race Dashboard</div>
        </div>
        <div>
          <div>Session: Not Selected</div>
          <div>Status: Ready</div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div>
        <div>© 2025 F1 Live Rewind | Real-time F1 Data Visualization</div>
        <div>
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
    <div>
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main>
        {/* Left Panel */}
        <aside>
          <LeftPanel />
        </aside>

        {/* Center - Track Visualization */}
        <section>
          <TrackVisualization />
        </section>

        {/* Right Panel */}
        <aside>
          <RightPanel />
        </aside>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
