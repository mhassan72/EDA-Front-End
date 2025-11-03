import React from 'react';
import { clsx } from 'clsx';

// Breakpoint visibility utilities
export interface BreakpointProps {
  children: React.ReactNode;
  className?: string;
}

// Show only on mobile (< 640px)
export const MobileOnly: React.FC<BreakpointProps> = ({ children, className }) => (
  <div className={clsx('block sm:hidden', className)}>
    {children}
  </div>
);

// Show only on tablet and up (>= 640px)
export const TabletUp: React.FC<BreakpointProps> = ({ children, className }) => (
  <div className={clsx('hidden sm:block', className)}>
    {children}
  </div>
);

// Show only on desktop and up (>= 1024px)
export const DesktopUp: React.FC<BreakpointProps> = ({ children, className }) => (
  <div className={clsx('hidden lg:block', className)}>
    {children}
  </div>
);

// Show only on large desktop and up (>= 1280px)
export const LargeDesktopUp: React.FC<BreakpointProps> = ({ children, className }) => (
  <div className={clsx('hidden xl:block', className)}>
    {children}
  </div>
);

// Show only on tablet (640px - 1023px)
export const TabletOnly: React.FC<BreakpointProps> = ({ children, className }) => (
  <div className={clsx('hidden sm:block lg:hidden', className)}>
    {children}
  </div>
);

// Show only on desktop (1024px - 1279px)
export const DesktopOnly: React.FC<BreakpointProps> = ({ children, className }) => (
  <div className={clsx('hidden lg:block xl:hidden', className)}>
    {children}
  </div>
);

// Responsive text utilities
export interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  };
  weight?: {
    mobile?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    tablet?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    desktop?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  };
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = { mobile: 'base', tablet: 'base', desktop: 'base' },
  weight = { mobile: 'normal', tablet: 'normal', desktop: 'normal' },
  className,
  as: Component = 'div'
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const responsiveClasses = [
    size.mobile && sizeClasses[size.mobile],
    size.tablet && `sm:${sizeClasses[size.tablet]}`,
    size.desktop && `lg:${sizeClasses[size.desktop]}`,
    weight.mobile && weightClasses[weight.mobile],
    weight.tablet && `sm:${weightClasses[weight.tablet]}`,
    weight.desktop && `lg:${weightClasses[weight.desktop]}`
  ].filter(Boolean).join(' ');

  return (
    <Component className={clsx(responsiveClasses, className)}>
      {children}
    </Component>
  );
};

// Responsive spacing utilities
export interface ResponsiveSpacingProps {
  children: React.ReactNode;
  padding?: {
    mobile?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    tablet?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    desktop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  };
  margin?: {
    mobile?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    tablet?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    desktop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  };
  className?: string;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  padding,
  margin,
  className
}) => {
  const spacingClasses = {
    none: '0',
    xs: '1',
    sm: '2',
    md: '4',
    lg: '6',
    xl: '8'
  };

  const paddingClasses = padding ? [
    padding.mobile && `p-${spacingClasses[padding.mobile]}`,
    padding.tablet && `sm:p-${spacingClasses[padding.tablet]}`,
    padding.desktop && `lg:p-${spacingClasses[padding.desktop]}`
  ].filter(Boolean).join(' ') : '';

  const marginClasses = margin ? [
    margin.mobile && `m-${spacingClasses[margin.mobile]}`,
    margin.tablet && `sm:m-${spacingClasses[margin.tablet]}`,
    margin.desktop && `lg:m-${spacingClasses[margin.desktop]}`
  ].filter(Boolean).join(' ') : '';

  return (
    <div className={clsx(paddingClasses, marginClasses, className)}>
      {children}
    </div>
  );
};

// Hook for detecting current breakpoint
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop' | 'large'>('mobile');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setBreakpoint('large');
      } else if (width >= 1024) {
        setBreakpoint('desktop');
      } else if (width >= 640) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isLarge: breakpoint === 'large',
    isTabletUp: ['tablet', 'desktop', 'large'].includes(breakpoint),
    isDesktopUp: ['desktop', 'large'].includes(breakpoint)
  };
};