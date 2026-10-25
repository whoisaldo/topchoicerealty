import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-gold text-black font-semibold shadow-lg shadow-gold/20 hover:shadow-glow-gold hover:brightness-105',
  secondary: 'bg-gray-800 text-white hover:bg-gray-700',
  outline: 'border-2 border-gold text-gold hover:bg-gold hover:text-black',
  ghost: 'text-gold hover:bg-gold/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
}: ButtonClassOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70',
    'disabled:opacity-50 disabled:pointer-events-none',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full'
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      isLoading,
      loadingText,
      fullWidth,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonClasses({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
