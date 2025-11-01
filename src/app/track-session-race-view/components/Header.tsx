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
    <header className="">
      <div className="flex w-full flex-col justify-between gap-2 px-2 py-2 sm:px-3 sm:py-3 md:flex-row md:items-center md:gap-3 md:px-4 md:py-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-white sm:text-2xl md:text-3xl">
            Live Session Race View
          </h1>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm md:text-base">
            {selectedSession
              ? `${selectedSession.session_name} - ${selectedSession.location}`
              : 'Watch entire F1 sessions unfold with real-time driver positions'}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:gap-4 md:w-auto md:shrink-0">
          {selectedSession && (
            <Badge variant="outline" className="text-xs text-zinc-300 sm:text-sm">
              {driverCount} Drivers
            </Badge>
          )}
          <F1RaceSelector />
        </div>
      </div>
    </header>
  );
};
