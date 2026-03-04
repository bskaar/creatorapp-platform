import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface DeviceInfo {
  deviceType: DeviceType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
}

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
};

export function useDeviceType(): DeviceInfo {
  const getDeviceInfo = useCallback((): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        deviceType: 'desktop',
        orientation: 'landscape',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isPortrait: false,
        isLandscape: true,
        isTouchDevice: false,
        screenWidth: 1920,
        screenHeight: 1080,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation: Orientation = height > width ? 'portrait' : 'landscape';

    let deviceType: DeviceType;
    if (width < BREAKPOINTS.mobile) {
      deviceType = 'mobile';
    } else if (width < BREAKPOINTS.tablet) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      deviceType,
      orientation,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      isTouchDevice,
      screenWidth: width,
      screenHeight: height,
    };
  }, []);

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [getDeviceInfo]);

  return deviceInfo;
}

export function useResponsiveValue<T>(values: { mobile?: T; tablet?: T; desktop: T }): T {
  const { deviceType } = useDeviceType();

  if (deviceType === 'mobile' && values.mobile !== undefined) {
    return values.mobile;
  }
  if (deviceType === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.desktop;
}

export function useIsTouch(): boolean {
  const { isTouchDevice } = useDeviceType();
  return isTouchDevice;
}
