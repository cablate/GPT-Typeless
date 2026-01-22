/**
 * Design Tokens - Typography System
 *
 * Font sizes, weights, and line heights following typographic scale
 */

// Font families
export const fontFamily = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
} as const;

// Font sizes (type scale: Major Third 1.250)
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
  sm: ['0.8125rem', { lineHeight: '1.25rem' }], // 13px
  base: ['0.875rem', { lineHeight: '1.5rem' }],  // 14px
  md: ['0.9375rem', { lineHeight: '1.5rem' }],   // 15px
  lg: ['1rem', { lineHeight: '1.5rem' }],        // 16px
  xl: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
  '2xl': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
  '3xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
} as const;

// Font weights
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Letter spacing
export const letterSpacing = {
  tighter: '-0.025em',
  tight: '-0.01em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
} as const;

// Text colors (semantic)
export const textColor = {
  primary: 'var(--gray-900)',
  secondary: 'var(--gray-600)',
  muted: 'var(--gray-400)',
  inverse: '#ffffff',
} as const;

// CSS Variables
export const typographyVars = {
  '--font-sans': fontFamily.sans,
  '--font-mono': fontFamily.mono,

  '--text-xs': fontSize.xs[0],
  '--text-sm': fontSize.sm[0],
  '--text-base': fontSize.base[0],
  '--text-md': fontSize.md[0],
  '--text-lg': fontSize.lg[0],
  '--text-xl': fontSize.xl[0],
  '--text-2xl': fontSize['2xl'][0],
  '--text-3xl': fontSize['3xl'][0],

  '--font-normal': fontWeight.normal,
  '--font-medium': fontWeight.medium,
  '--font-semibold': fontWeight.semibold,
  '--font-bold': fontWeight.bold,

  '--tracking-tighter': letterSpacing.tighter,
  '--tracking-tight': letterSpacing.tight,
  '--tracking-normal': letterSpacing.normal,
  '--tracking-wide': letterSpacing.wide,
  '--tracking-wider': letterSpacing.wider,

  '--text-primary': textColor.primary,
  '--text-secondary': textColor.secondary,
  '--text-muted': textColor.muted,
  '--text-inverse': textColor.inverse,
} as const;
