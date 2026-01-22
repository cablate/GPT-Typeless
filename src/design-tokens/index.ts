/**
 * Design Tokens - Central Export
 *
 * All design system constants in one place
 */

export * from './colors';
export * from './spacing';
export * from './border-radius';
export * from './shadows';
export * from './typography';
export * from './transitions';

// Import all design tokens for combined export
import { colorVars } from './colors';
import { spacingVars } from './spacing';
import { borderRadiusVars } from './border-radius';
import { shadowVars } from './shadows';
import { typographyVars } from './typography';
import { transitionVars } from './transitions';

// Combined CSS variables for easy injection
export const allDesignVars = {
  // Colors
  ...colorVars,
  // Spacing
  ...spacingVars,
  // Border radius
  ...borderRadiusVars,
  // Shadows
  ...shadowVars,
  // Typography
  ...typographyVars,
  // Transitions
  ...transitionVars,
} as const;
