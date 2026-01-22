/**
 * Design Tokens - Shadow System
 *
 * Layer-based elevation shadows following material design principles
 */

export const shadow = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// Focus ring shadows for accessibility
export const focusRing = {
  DEFAULT: '0 0 0 3px var(--primary-100)',
  inner: '0 0 0 2px var(--surface), 0 0 0 4px var(--primary-500)',
} as const;

// CSS Variables
export const shadowVars = {
  '--shadow-xs': shadow.xs,
  '--shadow-sm': shadow.sm,
  '--shadow': shadow.DEFAULT,
  '--shadow-md': shadow.md,
  '--shadow-lg': shadow.lg,
  '--shadow-xl': shadow.xl,
  '--focus-ring': focusRing.DEFAULT,
  '--focus-ring-inner': focusRing.inner,
} as const;
