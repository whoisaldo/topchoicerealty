import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '../lib/utils';

const sizes = {
  sm: 'h-9 w-9 border-2',
  md: 'h-16 w-16 border-4',
  lg: 'h-24 w-24 border-4',
  xl: 'h-32 w-32 border-4',
  '2xl': 'h-48 w-48 border-4',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
  xl: 'h-14 w-14',
  '2xl': 'h-20 w-20',
};

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full border-gold bg-gradient-to-br from-gold/25 to-gold/5 shadow-lg',
          sizes[size],
          className
        )}
      >
        <User className={cn('text-gold', iconSizes[size])} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn(
        'shrink-0 rounded-full object-cover border-gold shadow-lg',
        sizes[size],
        className
      )}
    />
  );
}
