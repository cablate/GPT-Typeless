/**
 * Select Component
 *
 * Accessible dropdown select following Vercel Web Interface Guidelines
 */

import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Options to display */
  options: SelectOption[];
  /** Error state */
  hasError?: boolean;
  /** Helper text to display below select */
  helperText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Label for the select */
  label?: string;
  /** Full width select */
  fullWidth?: boolean;
  /** Placeholder option */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options = [],
      hasError = false,
      helperText,
      errorMessage,
      label,
      fullWidth = false,
      placeholder,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const baseStyles = `
      px-3 py-2 pr-8
      bg-white border rounded-md
      text-sm text-gray-900
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
      appearance-none
      cursor-pointer
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
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={classes}
            style={fullWidth ? { width: '100%' } : undefined}
            aria-invalid={hasError}
            aria-describedby={describedBy || undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom arrow icon */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

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

Select.displayName = 'Select';
