/**
 * Design Tokens - Transition System
 *
 * Compositor-friendly animations using only transform and opacity
 */

export const transition = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
} as const;

export const easing = {
  DEFAULT: 'ease-out',
  in: 'ease-in',
  inout: 'ease-in-out',
} as const;

// Pre-defined transition properties (compositor-friendly)
export const transitions = {
  fast: 'transform 150ms ease-out, opacity 150ms ease-out',
  base: 'transform 200ms ease-out, opacity 200ms ease-out',
  slow: 'transform 300ms ease-out, opacity 300ms ease-out',
  colors: 'background-color 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out',
  interactive: 'transform 150ms ease-out, background-color 200ms ease-out, color 200ms ease-out',
} as const;

// CSS Variables
export const transitionVars = {
  '--transition-fast': transition.fast,
  '--transition-base': transition.base,
  '--transition-slow': transition.slow,
} as const;

// Animation keyframes (compositor-friendly)
export const keyframes = {
  // Fade in/out
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },

  // Slide up (from below)
  slideUp: {
    from: { opacity: '0', transform: 'translateY(8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },

  // Slide down (from above)
  slideDown: {
    from: { opacity: '0', transform: 'translateY(-8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },

  // Scale in
  scaleIn: {
    from: { opacity: '0', transform: 'scale(0.95)' },
    to: { opacity: '1', transform: 'scale(1)' },
  },

  // Spin (for loading indicators)
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },

  // Pulse (for recording indicator)
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.4' },
  },
} as const;
