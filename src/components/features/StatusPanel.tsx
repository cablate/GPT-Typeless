/**
 * StatusPanel Component
 *
 * Display status messages and error messages
 */

import React from 'react';
import { CloseIcon } from '../Icons';

export interface StatusPanelProps {
  /** Status message to display */
  status?: string;
  /** Error message to display */
  error?: string;
  /** Error dismiss handler */
  onDismissError?: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  status,
  error,
  onDismissError,
}) => {
  if (error) {
    return (
      <div className="flex items-start justify-between gap-3 px-4 py-3 bg-danger-50 text-danger-700 rounded-lg border border-danger-200 animate-slide-down">
        <p className="text-sm font-medium flex-1">{error}</p>
        {onDismissError && (
          <button
            onClick={onDismissError}
            className="p-1 rounded hover:bg-danger-100 transition-colors"
            aria-label="關閉錯誤訊息"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    );
  }

  if (status) {
    return (
      <div className="px-4 py-3 bg-success-50 text-success-700 rounded-lg border border-success-200 animate-slide-down">
        <p className="text-sm font-medium">{status}</p>
      </div>
    );
  }

  return null;
};
