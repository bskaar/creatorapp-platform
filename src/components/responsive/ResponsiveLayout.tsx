import { ReactNode } from 'react';
import { useDeviceType } from '../../hooks/useDeviceType';

interface ResponsiveLayoutProps {
  children: ReactNode;
  mobileContent?: ReactNode;
  tabletContent?: ReactNode;
  desktopContent?: ReactNode;
  className?: string;
}

export function ResponsiveLayout({
  children,
  mobileContent,
  tabletContent,
  desktopContent,
  className = '',
}: ResponsiveLayoutProps) {
  const { deviceType } = useDeviceType();

  let content: ReactNode;
  if (deviceType === 'mobile' && mobileContent) {
    content = mobileContent;
  } else if (deviceType === 'tablet' && tabletContent) {
    content = tabletContent;
  } else if (deviceType === 'desktop' && desktopContent) {
    content = desktopContent;
  } else {
    content = children;
  }

  return <div className={className}>{content}</div>;
}

interface ResponsiveContainerProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical' | 'auto';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveContainer({
  children,
  direction = 'auto',
  gap = 'md',
  className = '',
}: ResponsiveContainerProps) {
  const { isPortrait, isMobile } = useDeviceType();

  const isVertical = direction === 'vertical' || (direction === 'auto' && (isPortrait || isMobile));

  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={`flex ${isVertical ? 'flex-col' : 'flex-row'} ${gapClasses[gap]} ${className}`}
    >
      {children}
    </div>
  );
}

interface ShowOnDeviceProps {
  children: ReactNode;
  devices: ('mobile' | 'tablet' | 'desktop')[];
}

export function ShowOnDevice({ children, devices }: ShowOnDeviceProps) {
  const { deviceType } = useDeviceType();

  if (!devices.includes(deviceType)) {
    return null;
  }

  return <>{children}</>;
}

interface HideOnDeviceProps {
  children: ReactNode;
  devices: ('mobile' | 'tablet' | 'desktop')[];
}

export function HideOnDevice({ children, devices }: HideOnDeviceProps) {
  const { deviceType } = useDeviceType();

  if (devices.includes(deviceType)) {
    return null;
  }

  return <>{children}</>;
}
