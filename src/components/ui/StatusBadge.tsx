/**
 * StatusBadge Component
 *
 * Visual status indicator with accessible label
 */

import React from 'react';

export type StatusVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface StatusBadgeProps {
  /** Status variant */
  variant: StatusVariant;
  /** Text content */
  children: React.ReactNode;
  /** Show a dot indicator */
  withDot?: boolean;
  /** Dot animation (pulse) */
  animated?: boolean;
  /** Additional className */
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  children,
  withDot = false,
  animated = false,
  className = '',
}) => {
  const variantStyles: Record<StatusVariant, string> = {
    success: 'bg-success-light text-success-600 border-success-200',
    danger: 'bg-danger-light text-danger-600 border-danger-200',
    warning: 'bg-warning-light text-warning-600 border-warning-200',
    info: 'bg-info-light text-info-600 border-info-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const dotColors: Record<StatusVariant, string> = {
    success: 'bg-success-600',
    danger: 'bg-danger-600',
    warning: 'bg-warning-600',
    info: 'bg-info-600',
    neutral: 'bg-gray-600',
  };

  const classes = [
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
    variantStyles[variant],
    className,
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const dotAnimation = animated ? 'animate-pulse' : '';

  return (
    <span className={classes}>
      {withDot && (
        <span
          className={`w-2 h-2 rounded-full ${dotColors[variant]} ${dotAnimation}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
