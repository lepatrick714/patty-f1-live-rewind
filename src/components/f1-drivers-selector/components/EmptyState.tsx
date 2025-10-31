import { UserIcon } from '@/app/assets/Icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';

interface EmptyStateProps {
  message: string;
  title?: string;
}

export function EmptyState({
  message,
  title = 'Select Drivers',
}: EmptyStateProps) {
  return (
    <Card
      className="flex h-[500px] w-full flex-col overflow-hidden rounded-xl border lg:h-[70vh] xl:h-[80vh]"
      style={{ background: '#0f0f12', borderColor: '#222' }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-zinc-100">
          <UserIcon className="h-5 w-5 text-zinc-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-zinc-400">{message}</p>
      </CardContent>
    </Card>
  );
}
