/**
 * useToast Hook
 *
 * Toast notification management
 */

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: Toast['type'] = 'info', duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) =>
      showToast(message, 'success', duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      showToast(message, 'error', duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      showToast(message, 'info', duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      showToast(message, 'warning', duration),
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}
