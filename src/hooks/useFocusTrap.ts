/**
 * useFocusTrap Hook
 *
 * Traps keyboard focus within a container (for modals, dialogs)
 */

import { useEffect, RefObject } from 'react';

export function useFocusTrap(
  isActive: boolean,
  containerRef: RefObject<HTMLElement>
): void {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Focus first element
    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
}
