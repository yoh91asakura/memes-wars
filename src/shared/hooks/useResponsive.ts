import { useState, useEffect } from 'react';

export interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

export const useResponsive = (): ResponsiveBreakpoints => {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    screenWidth,
  };
};
