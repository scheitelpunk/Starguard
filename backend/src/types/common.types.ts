/**
 * Common Type Definitions
 * Shared types across the application
 */

/**
 * JSON-serializable value
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * JSON object
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * Serializable metadata
 */
export type Metadata = Record<string, JSONValue>;

/**
 * Unknown data that needs type checking
 */
export type UnknownData = unknown;

/**
 * Type guard for JSON value
 */
export function isJSONValue(value: unknown): value is JSONValue {
  if (value === null) return true;

  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJSONValue);
  }

  if (type === 'object') {
    return Object.values(value as object).every(isJSONValue);
  }

  return false;
}

/**
 * Type guard for JSON object
 */
export function isJSONObject(value: unknown): value is JSONObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isJSONValue)
  );
}

/**
 * Safe type conversion with default
 */
export function toNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

/**
 * Safe string conversion
 */
export function toString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Safe boolean conversion
 */
export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}
