/**
 * Validation Utilities
 *
 * Safe parsing and validation functions to prevent injection attacks
 * and ensure data integrity.
 */

import { TaxCalculationHistory } from '../types';

/**
 * Safe JSON parse with fallback
 * Returns fallback value if parsing fails instead of throwing
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    console.warn('JSON parse failed, using fallback');
    return fallback;
  }
}

/**
 * Get and validate localStorage item with type guard
 * Returns fallback if item doesn't exist or fails validation
 */
export function getLocalStorageItem<T>(
  key: string,
  validator: (data: unknown) => data is T,
  fallback: T
): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;

    const parsed = JSON.parse(item);
    if (validator(parsed)) {
      return parsed;
    }
    console.warn(`Invalid data shape for localStorage key: ${key}`);
    return fallback;
  } catch {
    console.warn(`Failed to parse localStorage key: ${key}`);
    return fallback;
  }
}

/**
 * Safely set localStorage item with JSON serialization
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error(`Failed to set localStorage key: ${key}`);
    return false;
  }
}

// ============ Type Guards ============

/**
 * Type guard for guest query count data
 */
export function isGuestQueryData(data: unknown): data is { date: string; count: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'date' in data &&
    'count' in data &&
    typeof (data as Record<string, unknown>).date === 'string' &&
    typeof (data as Record<string, unknown>).count === 'number' &&
    (data as Record<string, unknown>).count >= 0
  );
}

/**
 * Type guard for calculation history array
 */
export function isCalculationHistoryArray(data: unknown): data is TaxCalculationHistory[] {
  if (!Array.isArray(data)) return false;

  return data.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'date' in item &&
    'grossIncome' in item &&
    'taxableIncome' in item &&
    'totalTax' in item &&
    typeof item.id === 'string' &&
    typeof item.date === 'string' &&
    typeof item.grossIncome === 'number' &&
    typeof item.taxableIncome === 'number' &&
    typeof item.totalTax === 'number'
  );
}

/**
 * Type guard for tutorial state
 */
export function isTutorialState(data: unknown): data is { completed: boolean; step?: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'completed' in data &&
    typeof (data as Record<string, unknown>).completed === 'boolean'
  );
}

/**
 * Type guard for PWA banner state
 */
export function isPWABannerState(data: unknown): data is { dismissed: boolean; timestamp?: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'dismissed' in data &&
    typeof (data as Record<string, unknown>).dismissed === 'boolean'
  );
}

// ============ Input Sanitization ============

/**
 * Sanitize string input to prevent XSS
 * Removes potentially dangerous characters and HTML
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';

  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Sanitize numeric input
 * Returns NaN if not a valid number
 */
export function sanitizeNumber(input: unknown): number {
  if (typeof input === 'number' && !isNaN(input) && isFinite(input)) {
    return input;
  }
  if (typeof input === 'string') {
    const parsed = parseFloat(input.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Nigerian format)
 */
export function isValidNigerianPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  // Nigerian phone: starts with 0 or +234, followed by 10 digits
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  return phoneRegex.test(cleaned);
}
