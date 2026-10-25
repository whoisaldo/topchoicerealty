import { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export type BadgeVariant = 'gold' | 'yellow' | 'dark' | 'neutral';

const variants: Record<BadgeVariant, string> = {
  gold: 'bg-gold/15 text-gold-dark border-gold/40',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  dark: 'bg-gray-900 text-white border-gray-700',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'gold', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export const statusToBadgeVariant = {
  active: 'gold',
  pending: 'yellow',
  sold: 'dark',
} as const satisfies Record<'active' | 'pending' | 'sold', BadgeVariant>;
