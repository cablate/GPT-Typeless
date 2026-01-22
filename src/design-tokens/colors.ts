/**
 * Design Tokens - Color System
 *
 * Color palette following WCAG AA accessibility standards
 * All color pairs maintain at least 4.5:1 contrast ratio
 */

// Primary (Blue) - Main action color
export const primary = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6', // Main primary
  600: '#2563eb', // Hover state
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
} as const;

// Semantic Colors
export const semantic = {
  // Success (Green)
  success: {
    light: '#d1fae5',
    DEFAULT: '#059669',
    dark: '#047857',
  },

  // Danger (Red)
  danger: {
    light: '#fee2e2',
    DEFAULT: '#dc2626',
    dark: '#b91c1c',
  },

  // Warning (Amber)
  warning: {
    light: '#fef3c7',
    DEFAULT: '#d97706',
    dark: '#b45309',
  },

  // Info (Blue)
  info: {
    light: '#dbeafe',
    DEFAULT: '#0284c7',
    dark: '#0369a1',
  },
} as const;

// Neutral Scale (Gray)
export const gray = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
} as const;

// Surface Colors (Backgrounds)
export const surface = {
  DEFAULT: '#ffffff',
  elevated: '#f8fafc',
  overlay: 'rgba(15, 23, 42, 0.5)',
} as const;

// CSS Variables for runtime usage
export const colorVars = {
  '--primary-50': primary[50],
  '--primary-100': primary[100],
  '--primary-200': primary[200],
  '--primary-300': primary[300],
  '--primary-400': primary[400],
  '--primary-500': primary[500],
  '--primary-600': primary[600],
  '--primary-700': primary[700],
  '--primary-800': primary[800],
  '--primary-900': primary[900],

  '--success-light': semantic.success.light,
  '--success': semantic.success.DEFAULT,
  '--success-dark': semantic.success.dark,

  '--danger-light': semantic.danger.light,
  '--danger': semantic.danger.DEFAULT,
  '--danger-dark': semantic.danger.dark,

  '--warning-light': semantic.warning.light,
  '--warning': semantic.warning.DEFAULT,
  '--warning-dark': semantic.warning.dark,

  '--info-light': semantic.info.light,
  '--info': semantic.info.DEFAULT,
  '--info-dark': semantic.info.dark,

  '--gray-50': gray[50],
  '--gray-100': gray[100],
  '--gray-200': gray[200],
  '--gray-300': gray[300],
  '--gray-400': gray[400],
  '--gray-500': gray[500],
  '--gray-600': gray[600],
  '--gray-700': gray[700],
  '--gray-800': gray[800],
  '--gray-900': gray[900],

  '--surface': surface.DEFAULT,
  '--surface-elevated': surface.elevated,
  '--surface-overlay': surface.overlay,
} as const;
