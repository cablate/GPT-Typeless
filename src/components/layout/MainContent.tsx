/**
 * MainContent Component
 *
 * Main content area wrapper with max-width and padding
 */

import React from 'react';

export interface MainContentProps {
  /** Content to display */
  children: React.ReactNode;
  /** Maximum width of content area */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  maxWidth = 'md',
  className = '',
}) => {
  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <main className={`flex-1 px-6 py-6 ${maxWidthStyles[maxWidth]} w-full mx-auto ${className}`.trim()}>
      {children}
    </main>
  );
};
