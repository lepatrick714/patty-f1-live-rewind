import { Badge } from '@/components/ui/badge';
import { F1RaceSelector } from '@/components/f1-race-selector';

interface HeaderProps {
  selectedSession: {
    session_name: string;
    location: string;
  } | null;
  driverCount: number;
}

export const Header = ({ selectedSession, driverCount }: HeaderProps) => {
  return (
    <header className="border-b border-zinc-700 bg-zinc-900/50 backdrop-blur">
      <div className="flex w-full flex-col justify-between gap-2 px-3 py-3 sm:py-4 md:flex-row md:items-center md:gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Live Session Race View
          </h1>
          <p className="mt-1 text-sm text-zinc-400 sm:text-base">
            {selectedSession
              ? `${selectedSession.session_name} - ${selectedSession.location}`
              : 'Watch entire F1 sessions unfold with real-time driver positions'}
          </p>
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto md:shrink-0">
          {selectedSession && (
            <Badge variant="outline" className="text-zinc-300">
              {driverCount} Drivers
            </Badge>
          )}
          <F1RaceSelector />
        </div>
      </div>
    </header>
  );
};
