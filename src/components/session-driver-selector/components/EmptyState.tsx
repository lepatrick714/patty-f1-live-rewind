interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => (
  <div className="py-8 text-center">
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);
