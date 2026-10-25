import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this right now. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn('text-center py-12 px-6', className)}>
      <div className="mx-auto w-fit rounded-full bg-red-50 p-4">
        <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      {onRetry && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
}
