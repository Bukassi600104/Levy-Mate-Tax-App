import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';

interface UseToastReturn {
  toasts: ToastMessage[];
  toast: {
    success: (title: string, message?: string, duration?: number) => string;
    error: (title: string, message?: string, duration?: number) => string;
    warning: (title: string, message?: string, duration?: number) => string;
    info: (title: string, message?: string, duration?: number) => string;
  };
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

/**
 * Hook for managing toast notifications
 *
 * Usage:
 * const { toast, toasts, dismissToast } = useToast();
 * toast.success('Saved!', 'Your changes have been saved.');
 * toast.error('Error', 'Something went wrong.');
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastMessage = {
        id,
        type,
        title,
        message,
        duration: duration ?? 5000, // Default 5 seconds
      };
      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = {
    success: (title: string, message?: string, duration?: number) =>
      addToast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      addToast('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      addToast('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      addToast('info', title, message, duration),
  };

  return { toasts, toast, dismissToast, dismissAll };
}

export default useToast;
