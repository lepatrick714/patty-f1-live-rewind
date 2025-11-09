import Link from 'next/link';
import { ZapIcon, TimerIcon, UserIcon } from '@/app/assets/Icons';

export default function Home() {
  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-4 py-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">F1 Live Rewind</h1>
          <p className="text-muted-foreground text-xl">
            Experience Formula 1 races like never before with live telemetry and
            track visualization
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Race Dashboard */}
          <Link href="/race-dashboard" className="group">
            <div className="bg-card hover:bg-accent h-full rounded-lg border p-6 transition-colors">
              <div className="mb-4 flex items-center gap-3">
                <ZapIcon className="text-primary h-8 w-8" />
                <h2 className="text-2xl font-semibold">Race Dashboard</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Analyze fastest laps and compare driver performance with
                detailed telemetry data and track visualization.
              </p>
              <div className="text-primary text-sm font-medium group-hover:underline">
                View Race Dashboard →
              </div>
            </div>
          </Link>

          {/* Session Race View */}
          <Link href="/track-session-race-view" className="group">
            <div className="bg-card hover:bg-accent h-full rounded-lg border p-6 transition-colors">
              <div className="mb-4 flex items-cernter gap-3">
                <TimerIcon className="text-primary h-8 w-8" />
                <h2 className="text-2xl font-semibold">Live Session View</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Watch entire F1 sessions unfold in real-time with full driver
                tracking and video-player-like controls.
              </p>
              <div className="text-primary text-sm font-medium group-hover:underline">
                View Session Replay →
              </div>
            </div>
          </Link>

          {/* Weather Track View */}
          <Link href="/race-track-weather-view" className="group">
            <div className="bg-card hover:bg-accent h-full rounded-lg border p-6 transition-colors">
              <div className="mb-4 flex items-center gap-3">
                <svg className="text-primary h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <h2 className="text-2xl font-semibold">Weather Track View</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Experience track weather conditions in real-time with dynamic
                day/night cycles, rain effects, and temperature data.
              </p>
              <div className="text-primary text-sm font-medium group-hover:underline">
                View Weather Replay →
              </div>
            </div>
          </Link>
        </div>

        {/* Features List */}
        <div className="grid gap-4 pt-8 sm:grid-cols-3">
          <div className="space-y-2 text-center">
            <UserIcon className="text-primary mx-auto h-8 w-8" />
            <h3 className="font-semibold">Multi-Driver Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Track up to 20 drivers simultaneously with real-time position
              updates
            </p>
          </div>
          <div className="space-y-2 text-center">
            <ZapIcon className="text-primary mx-auto h-8 w-8" />
            <h3 className="font-semibold">Live Telemetry</h3>
            <p className="text-muted-foreground text-sm">
              Access speed, position, and timing data from the OpenF1 API
            </p>
          </div>
          <div className="space-y-2 text-center">
            <TimerIcon className="text-primary mx-auto h-8 w-8" />
            <h3 className="font-semibold">Session Replay</h3>
            <p className="text-muted-foreground text-sm">
              Rewind and replay any session with video-player controls
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 pt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Powered by the OpenF1 API • Built with Next.js and React
          </p>
        </div>
      </div>
    </div>
  );
}
