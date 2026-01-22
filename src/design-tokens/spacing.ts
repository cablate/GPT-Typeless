/**
 * Design Tokens - Spacing System
 *
 * 8px base unit grid system for consistent spacing
 */

export const spacing = {
  0: '0px',
  1: '4px',   // 0.25rem
  2: '8px',   // 0.5rem
  3: '12px',  // 0.75rem
  4: '16px',  // 1rem
  5: '20px',  // 1.25rem
  6: '24px',  // 1.5rem
  8: '32px',  // 2rem
  10: '40px', // 2.5rem
  12: '48px', // 3rem
  16: '64px', // 4rem
  20: '80px', // 5rem
  24: '96px', // 6rem
} as const;

// Common spacing presets
export const spacingPresets = {
  xs: spacing[1],   // 4px  - Extra tight
  sm: spacing[2],   // 8px  - Small
  md: spacing[3],   // 12px - Medium
  lg: spacing[4],   // 16px - Large
  xl: spacing[6],   // 24px - Extra large
  '2xl': spacing[8], // 32px - 2x large
  '3xl': spacing[10], // 40px - 3x large
} as const;

// CSS Variables
export const spacingVars = {
  '--spacing-0': spacing[0],
  '--spacing-1': spacing[1],
  '--spacing-2': spacing[2],
  '--spacing-3': spacing[3],
  '--spacing-4': spacing[4],
  '--spacing-5': spacing[5],
  '--spacing-6': spacing[6],
  '--spacing-8': spacing[8],
  '--spacing-10': spacing[10],
  '--spacing-12': spacing[12],
  '--spacing-16': spacing[16],
  '--spacing-20': spacing[20],
  '--spacing-24': spacing[24],
} as const;
