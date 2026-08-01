import { allergenHits, dietAccepts, withinBudget } from './rules';
import { validate } from './validate';
import type {
  Dish,
  DishInput,
  DishVerdict,
  Reason,
  Report,
  Resident,
  ResidentCell,
  ResidentInput,
} from './types';

/**
 * Build the exclusion reasons for one dish, in the exact contracted order:
 *
 *   "For each resident, emit a diet reason before allergen reasons;
 *    order residents by the resident table,
 *    matched allergens by the dish's ingredient-tag order,
 *    and OVER_BUDGET last."
 *
 * The loop structure below IS that sentence, in the same order. Do not reorder it.
 */
export function judgeDish(dish: Dish, residents: Resident[], budget: number): DishVerdict {
  const reasons: Reason[] = [];
  const cells: ResidentCell[] = [];

  for (const resident of residents) {
    const dietOk = dietAccepts(resident.diet, dish.diet);
    const hits = allergenHits(dish, resident);

    if (!dietOk) {
      reasons.push(`DIET:${resident.name}`);
    }
    for (const tag of hits) {
      reasons.push(`ALLERGEN:${resident.name}:${tag}`);
    }

    cells.push({ resident: resident.name, dietOk, allergenHits: hits });
  }

  const budgetOk = withinBudget(dish, budget);
  if (!budgetOk) {
    reasons.push('OVER_BUDGET');
  }

  return { dish, compatible: reasons.length === 0, reasons, cells, budgetOk };
}

/**
 * Validate, then evaluate. Returns either a full report or a pure error report —
 * never both. On error the caller has nothing to render, which is exactly the
 * contract: "show no compatibility or exclusion rows, and clear any earlier counts."
 */
export function evaluate(
  residentInputs: ResidentInput[],
  dishInputs: DishInput[],
  budgetInput: string,
): Report {
  const { errors, residents, dishes, budget } = validate(residentInputs, dishInputs, budgetInput);

  if (errors.length > 0) {
    // A duplicate ID anywhere reports as DUPLICATE_DISH_ID; otherwise INVALID_INPUT.
    const status = errors.some((e) => e.code === 'DUPLICATE_DISH_ID')
      ? 'DUPLICATE_DISH_ID'
      : 'INVALID_INPUT';
    return { status, errors };
  }

  // Source order is preserved because we map over `dishes` as supplied.
  const verdicts = dishes.map((dish) => judgeDish(dish, residents, budget));
  const compatible = verdicts.filter((v) => v.compatible);

  return {
    status: 'OK',
    verdicts,
    compatible,
    // Frozen here. The search box filters a copy of `compatible`; this number is
    // never recomputed from that filtered list.
    compatibleCount: compatible.length,
    budget,
  };
}
