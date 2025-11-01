import Link from 'next/link';
import { ZapIcon, TimerIcon, UserIcon } from '@/app/assets/Icons';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-4xl font-bold tracking-tight">
            F1 Live Rewind
          </h1>
          <p className="text-xl text-muted-foreground">
            Experience Formula 1 races like never before with live telemetry and track visualization
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Race Dashboard */}
          <Link href="/race-dashboard" className="group">
            <div className="p-6 border rounded-lg bg-card hover:bg-accent transition-colors h-full">
              <div className="flex items-center gap-3 mb-4">
                <ZapIcon className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-semibold">Race Dashboard</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Analyze fastest laps and compare driver performance with detailed telemetry data and track visualization.
              </p>
              <div className="text-sm text-primary font-medium group-hover:underline">
                View Race Dashboard →
              </div>
            </div>
          </Link>

          {/* Session Race View */}
          <Link href="/track-session-race-view" className="group">
            <div className="p-6 border rounded-lg bg-card hover:bg-accent transition-colors h-full">
              <div className="flex items-center gap-3 mb-4">
                <TimerIcon className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-semibold">Live Session View</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Watch entire F1 sessions unfold in real-time with full driver tracking and video-player-like controls.
              </p>
              <div className="text-sm text-primary font-medium group-hover:underline">
                View Session Replay →
              </div>
            </div>
          </Link>
        </div>

        {/* Features List */}
        <div className="grid sm:grid-cols-3 gap-4 pt-8">
          <div className="text-center space-y-2">
            <UserIcon className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-semibold">Multi-Driver Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Track up to 20 drivers simultaneously with real-time position updates
            </p>
          </div>
          <div className="text-center space-y-2">
            <ZapIcon className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-semibold">Live Telemetry</h3>
            <p className="text-sm text-muted-foreground">
              Access speed, position, and timing data from the OpenF1 API
            </p>
          </div>
          <div className="text-center space-y-2">
            <TimerIcon className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-semibold">Session Replay</h3>
            <p className="text-sm text-muted-foreground">
              Rewind and replay any session with video-player controls
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 pb-8">
          <p className="text-sm text-muted-foreground">
            Powered by the OpenF1 API • Built with Next.js and React
          </p>
        </div>
      </div>
    </div>
  );
}
