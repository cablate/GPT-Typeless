/**
 * Design Tokens - Border Radius System
 *
 * Consistent corner rounding for UI elements
 */

export const borderRadius = {
  none: '0',
  sm: '4px',   // Small elements (tags, badges)
  DEFAULT: '6px', // Default (buttons, inputs)
  md: '8px',   // Medium (cards)
  lg: '12px',  // Large (panels)
  xl: '16px',  // Extra large (modals)
  full: '9999px', // Circular (avatar, pills)
} as const;

// CSS Variables
export const borderRadiusVars = {
  '--radius-none': borderRadius.none,
  '--radius-sm': borderRadius.sm,
  '--radius': borderRadius.DEFAULT,
  '--radius-md': borderRadius.md,
  '--radius-lg': borderRadius.lg,
  '--radius-xl': borderRadius.xl,
  '--radius-full': borderRadius.full,
} as const;
