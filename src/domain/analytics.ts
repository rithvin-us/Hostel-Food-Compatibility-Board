import type { DishVerdict } from './types';

export interface HarmonyResult {
  score: number;
  compatibleCount: number;
  totalCount: number;
  label: string;
  status: 'feast' | 'high' | 'moderate' | 'low';
}

export interface ExclusionStats {
  dietCount: number;
  allergenCount: number;
  budgetCount: number;
  totalReasons: number;
  dietPct: number;
  allergenPct: number;
  budgetPct: number;
}

export interface ResidentFriction {
  resident: string;
  rejectionCount: number;
  dietRejections: number;
  allergenRejections: number;
}

export interface SmartUnlocker {
  type: 'BUDGET_INCREASE' | 'ALLERGEN_MODIFICATION' | 'ALL_COMPATIBLE';
  message: string;
  impactDishNames: string[];
}

/**
 * Computes Group Harmony Index (0-100%).
 */
export function computeHarmonyScore(verdicts: DishVerdict[]): HarmonyResult {
  const totalCount = verdicts.length;
  if (totalCount === 0) {
    return { score: 0, compatibleCount: 0, totalCount: 0, label: 'No Dishes', status: 'low' };
  }

  const compatibleCount = verdicts.filter((v) => v.compatible).length;
  const score = Math.round((compatibleCount / totalCount) * 100);

  let label = 'Severe Friction';
  let status: HarmonyResult['status'] = 'low';

  if (score === 100) {
    label = 'Universal Feast';
    status = 'feast';
  } else if (score >= 60) {
    label = 'High Harmony';
    status = 'high';
  } else if (score >= 30) {
    label = 'Moderate Friction';
    status = 'moderate';
  }

  return { score, compatibleCount, totalCount, label, status };
}

/**
 * Computes root-cause exclusion breakdown percentages.
 */
export function computeExclusionBreakdown(verdicts: DishVerdict[]): ExclusionStats {
  let dietCount = 0;
  let allergenCount = 0;
  let budgetCount = 0;

  for (const verdict of verdicts) {
    for (const reason of verdict.reasons) {
      if (reason.startsWith('DIET:')) dietCount++;
      else if (reason.startsWith('ALLERGEN:')) allergenCount++;
      else if (reason === 'OVER_BUDGET') budgetCount++;
    }
  }

  const totalReasons = dietCount + allergenCount + budgetCount;
  if (totalReasons === 0) {
    return {
      dietCount: 0,
      allergenCount: 0,
      budgetCount: 0,
      totalReasons: 0,
      dietPct: 0,
      allergenPct: 0,
      budgetPct: 0,
    };
  }

  return {
    dietCount,
    allergenCount,
    budgetCount,
    totalReasons,
    dietPct: Math.round((dietCount / totalReasons) * 100),
    allergenPct: Math.round((allergenCount / totalReasons) * 100),
    budgetPct: Math.round((budgetCount / totalReasons) * 100),
  };
}

/**
 * Computes resident-level rejection friction index.
 */
export function computeResidentFriction(
  verdicts: DishVerdict[],
  residentNames: string[],
): ResidentFriction[] {
  const map = new Map<string, ResidentFriction>();

  for (const name of residentNames) {
    map.set(name, {
      resident: name,
      rejectionCount: 0,
      dietRejections: 0,
      allergenRejections: 0,
    });
  }

  for (const verdict of verdicts) {
    for (const reason of verdict.reasons) {
      if (reason.startsWith('DIET:')) {
        const resident = reason.slice(5);
        const entry = map.get(resident);
        if (entry) {
          entry.rejectionCount++;
          entry.dietRejections++;
        }
      } else if (reason.startsWith('ALLERGEN:')) {
        const parts = reason.split(':');
        const resident = parts[1];
        if (resident) {
          const entry = map.get(resident);
          if (entry) {
            entry.rejectionCount++;
            entry.allergenRejections++;
          }
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.rejectionCount - a.rejectionCount);
}

/**
 * Computes actionable single-change unlocker recommendations.
 */
export function computeSmartUnlocker(
  verdicts: DishVerdict[],
  currentBudget: number,
): SmartUnlocker | null {
  const totalDishes = verdicts.length;
  const compatibleDishes = verdicts.filter((v) => v.compatible);

  if (totalDishes > 0 && compatibleDishes.length === totalDishes) {
    return {
      type: 'ALL_COMPATIBLE',
      message: '🎉 Universal Feast! All dishes are 100% compatible with your group.',
      impactDishNames: [],
    };
  }

  // Find dishes rejected ONLY due to OVER_BUDGET
  const overBudgetOnlyDishes = verdicts.filter(
    (v) => !v.compatible && v.reasons.length === 1 && v.reasons[0] === 'OVER_BUDGET',
  );

  if (overBudgetOnlyDishes.length > 0) {
    // Find min price among over-budget dishes
    const minRequiredPrice = Math.min(...overBudgetOnlyDishes.map((v) => v.dish.price));
    const delta = minRequiredPrice - currentBudget;
    const unlockableDishes = overBudgetOnlyDishes
      .filter((v) => v.dish.price === minRequiredPrice)
      .map((v) => v.dish.name);

    return {
      type: 'BUDGET_INCREASE',
      message: `Increasing budget by ₹${delta} (to ₹${minRequiredPrice}) unlocks ${unlockableDishes.length} dish: ${unlockableDishes.join(', ')}.`,
      impactDishNames: unlockableDishes,
    };
  }

  // Find dishes rejected due to single allergen hit
  const allergenOnlyDishes = verdicts.filter(
    (v) =>
      !v.compatible &&
      v.budgetOk &&
      v.reasons.every((r) => r.startsWith('ALLERGEN:')),
  );

  if (allergenOnlyDishes.length > 0) {
    const dish = allergenOnlyDishes[0];
    const reason = dish?.reasons[0];
    if (dish && reason) {
      const parts = reason.split(':');
      const resident = parts[1] ?? '';
      const tag = parts[2] ?? '';

      return {
        type: 'ALLERGEN_MODIFICATION',
        message: `Removing or substituting ${tag} in ${dish.dish.name} unlocks it for ${resident}.`,
        impactDishNames: [dish.dish.name],
      };
    }
  }

  return null;
}
