/**
 * Input Component
 *
 * Accessible text input following Vercel Web Interface Guidelines
 */

import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Error state */
  hasError?: boolean;
  /** Helper text to display below input */
  helperText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Label for the input */
  label?: string;
  /** Full width input */
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      hasError = false,
      helperText,
      errorMessage,
      label,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const baseStyles = `
      px-3 py-2
      bg-white border rounded-md
      text-sm text-gray-900
      placeholder:text-gray-400
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
    `;

    const borderStyles = hasError
      ? 'border-danger-600 focus:ring-danger-500 focus:border-danger-600'
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-600';

    const classes = [baseStyles, borderStyles, className]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const describedBy = [
      errorMessage ? errorId : null,
      helperText && !errorMessage ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={classes}
          style={fullWidth ? { width: '100%' } : undefined}
          aria-invalid={hasError}
          aria-describedby={describedBy || undefined}
          {...props}
        />

        {errorMessage && (
          <p id={errorId} className="text-xs text-danger-600">
            {errorMessage}
          </p>
        )}

        {helperText && !errorMessage && (
          <p id={helperId} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
