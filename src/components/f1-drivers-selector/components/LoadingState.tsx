import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon } from '@/app/assets/Icons';

export function LoadingState() {
  return (
    <Card
      className="flex h-[500px] w-full flex-col overflow-hidden rounded-xl border lg:h-[70vh] xl:h-[80vh]"
      style={{ background: '#0f0f12', borderColor: '#222' }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-zinc-100">
          <UserIcon className="h-5 w-5 text-zinc-400" />
          Select Drivers
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
              <div className="h-5 w-16 animate-pulse rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
