import { cn } from '../lib/utils';

const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

interface SpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-gold/25 border-t-gold',
        sizes[size],
        className
      )}
    />
  );
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      {label && <p className="text-gray-600 font-medium">{label}</p>}
    </div>
  );
}
