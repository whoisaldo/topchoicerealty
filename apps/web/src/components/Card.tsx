import { ElementType, HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  hover?: boolean;
  padding?: 'none' | 'md' | 'lg';
}

export function Card({
  as: Component = 'div',
  hover,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        'bg-white rounded-2xl border-2 border-gold/15 shadow-card',
        padding === 'md' && 'p-6',
        padding === 'lg' && 'p-8',
        hover && 'transition duration-300 hover:-translate-y-1 hover:shadow-card-hover',
        className
      )}
      {...props}
    />
  );
}
