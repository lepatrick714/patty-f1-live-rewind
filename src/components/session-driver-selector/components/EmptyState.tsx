interface EmptyStateProps {
    message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => (
    <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
            {message}
        </p>
    </div>
);