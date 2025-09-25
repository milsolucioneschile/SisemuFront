import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const getDeviceType = (width: number): DeviceType => {
    if (width < BREAKPOINTS.md) return 'mobile';
    if (width < BREAKPOINTS.lg) return 'tablet';
    return 'desktop';
  };

  const isBreakpoint = (breakpoint: BreakpointKey): boolean => {
    return windowSize.width >= BREAKPOINTS[breakpoint];
  };

  const isBetweenBreakpoints = (min: BreakpointKey, max: BreakpointKey): boolean => {
    return windowSize.width >= BREAKPOINTS[min] && windowSize.width < BREAKPOINTS[max];
  };

  const deviceType = getDeviceType(windowSize.width);
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  
  const isSm = isBreakpoint('sm');
  const isMd = isBreakpoint('md');
  const isLg = isBreakpoint('lg');
  const isXl = isBreakpoint('xl');
  const is2Xl = isBreakpoint('2xl');

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    
    isBreakpoint,
    isBetweenBreakpoints,
    
    breakpoints: BREAKPOINTS
  };
};

export default useResponsive;