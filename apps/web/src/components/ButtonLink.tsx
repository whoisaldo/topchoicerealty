import { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ButtonSize, ButtonVariant, buttonClasses } from './Button';

interface ButtonLinkStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

type ButtonLinkProps = ButtonLinkStyleProps &
  (({ to: LinkProps['to'] } & Omit<LinkProps, 'to'>) | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>));

export function ButtonLink(props: ButtonLinkProps) {
  if ('to' in props) {
    const { variant, size, fullWidth, className, children, ...rest } = props;
    return (
      <Link {...rest} className={cn(buttonClasses({ variant, size, fullWidth }), className)}>
        {children}
      </Link>
    );
  }

  const { variant, size, fullWidth, className, children, ...rest } = props;
  return (
    <a {...rest} className={cn(buttonClasses({ variant, size, fullWidth }), className)}>
      {children}
    </a>
  );
}
