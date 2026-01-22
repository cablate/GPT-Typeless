/**
 * Button Component
 *
 * Accessible, composable button following Vercel Web Interface Guidelines
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Icon as React node (renders before text) */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'start' | 'end';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      icon,
      iconPosition = 'start',
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-md
      transition-all duration-200
      focus-visible:outline-none
      focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.96]
    `;

    const variantStyles = {
      primary: `
        bg-primary-600 text-white
        hover:bg-primary-700
        focus-visible:ring-primary-500
      `,
      secondary: `
        bg-gray-100 text-gray-700
        hover:bg-gray-200
        focus-visible:ring-gray-400
      `,
      danger: `
        bg-danger-600 text-white
        hover:bg-danger-700
        focus-visible:ring-danger-500
      `,
      ghost: `
        bg-transparent text-gray-600
        hover:bg-gray-100
        focus-visible:ring-gray-400
      `,
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const classes = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className,
    ]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={classes}
        style={fullWidth ? { width: '100%' } : undefined}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && icon && iconPosition === 'start' && icon}
        {children}
        {!isLoading && icon && iconPosition === 'end' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';
