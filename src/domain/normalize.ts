import { DIET_CLASSES, DISH_DIET_CLASSES, type DietClass, type DishDietClass } from './types';

/**
 * Contract: "Normalize diet classes, ingredient tags, and allergen tags by trimming
 * surrounding spaces and converting them to uppercase."
 *
 * `trim()` removes tabs and newlines too, which is what we want — a tag typed as
 * "\n milk " is the same MILK as one typed cleanly.
 */
export function normalizeTag(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Split a comma-separated tag list, normalize each part, drop nothing. */
export function splitTags(raw: string): string[] {
  if (raw.trim() === '') return [];
  return raw.split(',').map(normalizeTag);
}

/** Join for display in an editable cell. */
export function joinTags(tags: string[]): string {
  return tags.join(', ');
}

/** Names are trimmed but NOT uppercased — they appear verbatim inside reason strings. */
export function normalizeName(raw: string): string {
  return raw.trim();
}

export function isDietClass(value: string): value is DietClass {
  return (DIET_CLASSES as readonly string[]).includes(value);
}

/** NO_RESTRICTION is deliberately absent here: it is valid for residents only. */
export function isDishDietClass(value: string): value is DishDietClass {
  return (DISH_DIET_CLASSES as readonly string[]).includes(value);
}

/**
 * Parse a price or budget. Contract: "positive whole rupee values".
 * Rejects blank, non-numeric, fractional, zero, negative, Infinity and NaN.
 */
export function parseWholeRupees(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  // Number() is stricter than parseInt: "12abc" and "12.5" must not silently become 12.
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  if (!Number.isInteger(value)) return null;
  if (value <= 0) return null;
  return value;
}
