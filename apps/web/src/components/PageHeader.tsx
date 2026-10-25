import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  accent?: string;
  description?: string;
  as?: 'h1' | 'h2';
  align?: 'left' | 'center';
  className?: string;
}

export function PageHeader({
  title,
  accent,
  description,
  as: Heading = 'h1',
  align = 'left',
  className,
}: PageHeaderProps) {
  const centered = align === 'center';

  return (
    <div className={cn('mb-8', centered && 'text-center', className)}>
      <Heading className="text-4xl md:text-5xl font-bold text-gray-900">
        {title}
        {accent && <span className="text-gold"> {accent}</span>}
      </Heading>
      <div className={cn('mt-3 h-1 w-20 rounded-full bg-gradient-gold', centered && 'mx-auto')} />
      {description && (
        <p className={cn('mt-3 text-lg text-gray-600', centered && 'max-w-2xl mx-auto')}>
          {description}
        </p>
      )}
    </div>
  );
}
