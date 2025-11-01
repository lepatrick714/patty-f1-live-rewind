interface ErrorDisplayProps {
  error: Error | string | null;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) return null;

  return (
    <div className="bg-destructive/15 border-destructive/50 text-destructive m-6 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">Error loading location data:</div>
        <div className="text-sm">
          {error instanceof Error ? error.message : String(error)}
        </div>
      </div>
    </div>
  );
};
