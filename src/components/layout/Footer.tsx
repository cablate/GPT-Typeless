/**
 * Footer Component
 *
 * Application footer with version info
 */

import React from 'react';

export interface FooterProps {
  /** Application version */
  version?: string;
  /** Additional footer content */
  children?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({
  version = '0.1.0',
  children,
}) => {
  return (
    <footer className="px-6 py-5 text-center text-xs text-gray-400 border-t border-gray-200">
      {children || <p>GPTService v{version}</p>}
    </footer>
  );
};
