/**
 * useMediaQuery Hook
 *
 * Responsive design breakpoint detection
 */

import { useEffect, useState } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const breakpoints: Record<Breakpoint, string> = {
  xs: '360px',
  sm: '400px',
  md: '600px',
  lg: '800px',
  xl: '1024px',
};

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * Hook to detect if viewport is at least the given breakpoint
 */
export function useMinBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`);
}

/**
 * Hook to detect if viewport is below the given breakpoint
 */
export function useMaxBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(max-width: ${breakpoints[breakpoint]})`);
}
