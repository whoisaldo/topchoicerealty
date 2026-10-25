import { HTMLAttributes } from 'react';
import { useInView } from '../hooks/useInView';
import { cn } from '../lib/utils';

type RevealVariant = 'fade-up' | 'fade' | 'scale';

const hiddenClasses: Record<RevealVariant, string> = {
  'fade-up': 'opacity-0 translate-y-8',
  fade: 'opacity-0',
  scale: 'opacity-0 scale-95',
};

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  variant?: RevealVariant;
}

export function Reveal({
  delay = 0,
  variant = 'fade-up',
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none',
        inView ? 'opacity-100 translate-y-0 scale-100' : hiddenClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
