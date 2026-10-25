import { ReactNode } from 'react';
import { Home, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from './Card';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Home,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('text-center py-12 px-6', className)}>
      <div className="mx-auto w-fit rounded-full bg-gold/10 p-4">
        <Icon className="h-10 w-10 text-gold" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Card>
  );
}
