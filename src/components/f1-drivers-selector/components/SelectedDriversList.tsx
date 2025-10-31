import { Badge } from '@/components/badge';

interface Driver {
  driver_number: number;
  name_acronym: string;
  team_colour: string;
}

interface SelectedDriversListProps {
  selectedDrivers: number[];
  drivers: Driver[];
}

export function SelectedDriversList({
  selectedDrivers,
  drivers,
}: SelectedDriversListProps) {
  if (selectedDrivers.length === 0) return null;

  return (
    <div className="mt-4 border-t border-zinc-800 pt-4">
      <p className="mb-2 text-xs text-zinc-400">Selected for comparison:</p>
      <div className="flex flex-wrap gap-1">
        {selectedDrivers.map((driverNumber: number) => {
          const driver = drivers?.find(d => d.driver_number === driverNumber);
          return driver ? (
            <Badge
              key={driverNumber}
              variant="outline"
              className="border bg-zinc-900/60 text-xs text-zinc-200"
              style={{ borderColor: `#${driver.team_colour}` }}
            >
              {driver.name_acronym}
            </Badge>
          ) : null;
        })}
      </div>
    </div>
  );
}
