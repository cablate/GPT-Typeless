/**
 * Accessibility Utilities
 *
 * Helper functions for ARIA attributes and keyboard navigation
 */

/**
 * Generate a unique ID for accessibility purposes
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return focusableSelectors.some((selector) =>
    element.matches(selector)
  );
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(
  container: HTMLElement
): HTMLElement[] {
  const focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  ).filter((el) => {
    // Check disabled property for elements that support it
    const disabled = (el as HTMLInputElement | HTMLButtonElement).disabled;
    return !disabled && !el.getAttribute('aria-hidden');
  });
}

/**
 * Trap focus within a container element
 */
export function trapFocus(
  container: HTMLElement,
  event: KeyboardEvent
): void {
  if (event.key !== 'Tab') return;

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

/**
 * Create ARIA props for a component with a label
 */
export function createAriaProps(
  role: string,
  label: string,
  describedBy?: string
) {
  const props: Record<string, string> = {
    role,
    'aria-label': label,
  };

  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }

  return props;
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
