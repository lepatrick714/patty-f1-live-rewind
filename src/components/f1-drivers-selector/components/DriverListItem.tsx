import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TimerIcon } from '@/app/assets/Icons';

interface Driver {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string;
}

interface DriverListItemProps {
  driver: Driver;
  isSelected: boolean;
  isSessionFastest: boolean;
  isFastestSelected: boolean;
  onToggle: (driverNumber: number) => void;
}

export function DriverListItem({
  driver,
  isSelected,
  isSessionFastest,
  isFastestSelected,
  onToggle,
}: DriverListItemProps) {
  return (
    <div
      className={[
        'group rounded-md px-2 py-1.5',
        isSelected
          ? 'border border-zinc-600 bg-zinc-900/60'
          : 'bg-zinc-900/30 hover:bg-zinc-900/40',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          id={`driver-${driver.driver_number}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(driver.driver_number)}
          className="h-4 w-4 border-zinc-700 data-[state=checked]:border-zinc-600 data-[state=checked]:bg-zinc-700"
        />
        <span
          className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
          style={{ backgroundColor: `#${driver.team_colour}` }}
        />
        <label
          htmlFor={`driver-${driver.driver_number}`}
          className="min-w-0 flex-1 cursor-pointer"
        >
          <span className="inline-flex items-center gap-1 truncate text-sm font-semibold leading-tight tracking-wide text-zinc-100">
            <span>{driver.name_acronym}</span>
            <span className="ml-1 text-xs text-zinc-400">
              #{driver.driver_number}
            </span>
            {isSessionFastest && (
              <span title="Fastest lap in session">
                <TimerIcon
                  className="h-4 w-4 text-purple-400"
                  aria-label="Fastest overall"
                />
              </span>
            )}
            {isFastestSelected && (
              <Badge
                variant="outline"
                className="ml-1 h-4 whitespace-nowrap rounded-sm border-purple-400/40 bg-purple-500/10 px-1 py-0 text-[10px] leading-none text-purple-300"
              >
                FS
              </Badge>
            )}
          </span>
        </label>
      </div>
      <div className="truncate pl-8 text-xs text-zinc-400">
        {driver.full_name} • {driver.team_name}
      </div>
    </div>
  );
}
