import { Badge } from '@/components/badge';
import { UserIcon, TimerIcon } from '@/app/assets/Icons';

interface DriversHeaderProps {
  selectedDriversCount: number;
}

export function DriversHeader({ selectedDriversCount }: DriversHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-2">
        <UserIcon className="h-5 w-5 text-zinc-400" />
        <span>Select Drivers</span>
      </span>
      {selectedDriversCount > 0 && (
        <span className="inline-flex items-center gap-3 lg:mt-1 lg:basis-full">
          <Badge
            variant="secondary"
            className="border-zinc-700 bg-zinc-800 text-zinc-200"
          >
            {selectedDriversCount} selected
          </Badge>
          <span className="inline-flex items-center gap-3 text-[11px] text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <TimerIcon
                className="h-4 w-4 text-purple-400"
                aria-hidden="true"
              />
              <span>Fastest in session</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-4 rounded-sm border-purple-400/40 bg-purple-500/10 px-1 py-0 text-[10px] leading-none text-purple-300"
              >
                FS
              </Badge>
              <span>Fastest (selected)</span>
            </span>
          </span>
        </span>
      )}
    </div>
  );
}
