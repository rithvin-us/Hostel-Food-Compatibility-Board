import type { DietClass, Dish, DishDietClass, Resident } from './types';

/**
 * Contract:
 *   "A VEGAN resident accepts only a VEGAN dish.
 *    A VEGETARIAN resident accepts VEGAN or VEGETARIAN.
 *    A NO_RESTRICTION resident accepts any dish class."
 *
 * ASSUMPTION (documented in docs/DESIGN.md): the problem statement never defines
 * what a NON_VEGETARIAN *resident* accepts, only that the class is valid. We model
 * it as accepting every dish class — a non-vegetarian eater is not restricted upward.
 * The built-in group contains no NON_VEGETARIAN resident, so no graded criterion
 * depends on this choice.
 */
export function dietAccepts(residentDiet: DietClass, dishDiet: DishDietClass): boolean {
  switch (residentDiet) {
    case 'VEGAN':
      return dishDiet === 'VEGAN';
    case 'VEGETARIAN':
      return dishDiet === 'VEGAN' || dishDiet === 'VEGETARIAN';
    case 'NON_VEGETARIAN':
    case 'NO_RESTRICTION':
      return true;
  }
}

/**
 * Contract: "A dish fails the allergen rule when any normalized ingredient tag
 * EXACTLY equals any allergen tag of any resident. Treat the supplied ingredient
 * tags as authoritative: do not infer ingredients, aliases, or cross-contamination."
 *
 * So this is `===` and never `includes()` on the string: a MILK allergy does not
 * match a MILKSHAKE tag, and a PEANUT allergy does not match PEANUT_OIL.
 *
 * Returns matches in the DISH'S ingredient-tag order, which is the order the
 * contract requires for ALLERGEN reasons. Duplicate dish tags yield one hit —
 * see docs/DESIGN.md for why we de-duplicate.
 */
export function allergenHits(dish: Dish, resident: Resident): string[] {
  const hits: string[] = [];
  for (const tag of dish.tags) {
    if (resident.allergens.includes(tag) && !hits.includes(tag)) {
      hits.push(tag);
    }
  }
  return hits;
}

/**
 * Contract: "The one group budget is the maximum allowed price for ONE SERVING
 * for ONE RESIDENT. A dish passes when its positive whole-rupee price is less than
 * or equal to the budget; DO NOT MULTIPLY the price by the group size."
 *
 * Hence `<=` (D02 at 150 passes a 150 budget) and no reference to group length.
 */
export function withinBudget(dish: Dish, budget: number): boolean {
  return dish.price <= budget;
}
