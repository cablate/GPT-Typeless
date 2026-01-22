/**
 * ProgressStepper Component
 *
 * Multi-step progress indicator with accessibility support
 */

import React from 'react';
import { CheckIcon } from '../Icons';

export type StepStatus = 'pending' | 'active' | 'completed';

export interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

export interface ProgressStepperProps {
  /** Array of steps to display */
  steps: Step[];
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  direction = 'vertical',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const stepIconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const getStepStyles = (status: StepStatus) => {
    const base = 'flex items-center p-2 rounded-md transition-all duration-200';

    switch (status) {
      case 'pending':
        return `${base} text-gray-400`;
      case 'active':
        return `${base} bg-primary-50 text-primary-600 font-medium`;
      case 'completed':
        return `${base} bg-success-50 text-success-600`;
      default:
        return base;
    }
  };

  const getIconContent = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckIcon />;
      case 'active':
        return (
          <svg
            className="animate-spin"
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
        );
      case 'pending':
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  const containerStyles =
    direction === 'horizontal'
      ? 'flex flex-row flex-wrap justify-center'
      : 'flex flex-col';

  return (
    <div
      className={`${containerStyles} ${sizeStyles[size]} ${className}`.trim()}
      role="list"
      aria-label="Progress steps"
    >
      {steps.map((step) => (
        <div
          key={step.id}
          className={getStepStyles(step.status)}
          role="listitem"
          aria-current={step.status === 'active' ? 'step' : undefined}
        >
          <span
            className={`${stepIconSize[size]} flex-shrink-0`}
            aria-hidden="true"
          >
            {getIconContent(step.status)}
          </span>
          <span className="whitespace-nowrap">{step.label}</span>
        </div>
      ))}
    </div>
  );
};
