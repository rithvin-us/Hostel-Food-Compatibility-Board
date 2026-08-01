import type { DishVerdict } from './types';

/**
 * Contract: "Trim and compare the search query case-insensitively as a SUBSTRING of
 * the compatible dish's cafe, dish name, or any ingredient tag. Apply it ONLY to
 * compatible dishes. An empty query displays all compatible dishes, and the overall
 * compatible count remains based on the unfiltered result."
 *
 * Two consequences worth stating out loud:
 *  - callers must pass `report.compatible`, never `report.verdicts`, so an excluded
 *    dish can never be surfaced by a search;
 *  - this function returns rows only. It never returns a count, so there is no way
 *    for a caller to accidentally derive the headline count from a filtered list.
 */
export function filterCompatible(compatible: DishVerdict[], query: string): DishVerdict[] {
  const q = query.trim().toLowerCase();
  if (q === '') return compatible;

  return compatible.filter(({ dish }) => {
    const haystack = [dish.cafe, dish.name, ...dish.tags];
    return haystack.some((field) => field.toLowerCase().includes(q));
  });
}
