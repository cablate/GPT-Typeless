/**
 * Header Component
 *
 * Application header with title and settings button
 */

import React from 'react';
import { SettingsIcon } from '../Icons';
import { Button } from '../ui/Button';

export interface HeaderProps {
  /** Settings button click handler */
  onSettingsClick: () => void;
  /** Application title */
  title?: string;
  /** Additional header actions */
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  onSettingsClick,
  title = 'GPTService',
  actions,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {actions}
        <Button
          variant="secondary"
          size="sm"
          onClick={onSettingsClick}
          aria-label="開啟設定"
          icon={<SettingsIcon />}
        >
          設定
        </Button>
      </div>
    </header>
  );
};
