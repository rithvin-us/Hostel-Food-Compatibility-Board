import { describe, expect, it } from 'vitest';
import {
  computeExclusionBreakdown,
  computeHarmonyScore,
  computeResidentFriction,
  computeSmartUnlocker,
} from '../analytics';
import type { DishVerdict } from '../types';

const mockVerdicts: DishVerdict[] = [
  {
    dish: { id: 'D01', cafe: 'Hostel Cafe', name: 'Lentil Bowl', diet: 'VEGAN', tags: ['LENTIL'], price: 110 },
    compatible: true,
    reasons: [],
    cells: [{ resident: 'Asha', dietOk: true, allergenHits: [] }],
    budgetOk: true,
  },
  {
    dish: { id: 'D02', cafe: 'Library Cafe', name: 'Tomato Pasta', diet: 'VEGAN', tags: ['WHEAT'], price: 150 },
    compatible: true,
    reasons: [],
    cells: [{ resident: 'Asha', dietOk: true, allergenHits: [] }],
    budgetOk: true,
  },
  {
    dish: { id: 'D03', cafe: 'Hostel Cafe', name: 'Paneer Wrap', diet: 'VEGETARIAN', tags: ['MILK'], price: 140 },
    compatible: false,
    reasons: ['DIET:Asha', 'ALLERGEN:Mira:MILK'],
    cells: [],
    budgetOk: true,
  },
  {
    dish: { id: 'D04', cafe: 'East Cafe', name: 'Peanut Noodles', diet: 'VEGAN', tags: ['PEANUT'], price: 130 },
    compatible: false,
    reasons: ['ALLERGEN:Dev:PEANUT'],
    cells: [],
    budgetOk: true,
  },
  {
    dish: { id: 'D05', cafe: 'Library Cafe', name: 'Egg Sandwich', diet: 'NON_VEGETARIAN', tags: ['EGG'], price: 170 },
    compatible: false,
    reasons: ['DIET:Asha', 'OVER_BUDGET'],
    cells: [],
    budgetOk: false,
  },
];

describe('analytics domain module', () => {
  it('computes harmony score correctly', () => {
    const result = computeHarmonyScore(mockVerdicts);
    expect(result.score).toBe(40);
    expect(result.compatibleCount).toBe(2);
    expect(result.totalCount).toBe(5);
    expect(result.label).toBe('Moderate Friction');
    expect(result.status).toBe('moderate');
  });

  it('handles 100% universal feast harmony score', () => {
    const feastVerdicts = mockVerdicts.slice(0, 2);
    const result = computeHarmonyScore(feastVerdicts);
    expect(result.score).toBe(100);
    expect(result.label).toBe('Universal Feast');
    expect(result.status).toBe('feast');
  });

  it('computes exclusion breakdown percentages correctly', () => {
    const stats = computeExclusionBreakdown(mockVerdicts);
    // Total reasons = 2 (DIET) + 2 (ALLERGEN) + 1 (OVER_BUDGET) = 5
    expect(stats.totalReasons).toBe(5);
    expect(stats.dietCount).toBe(2);
    expect(stats.allergenCount).toBe(2);
    expect(stats.budgetCount).toBe(1);
    expect(stats.dietPct).toBe(40);
    expect(stats.allergenPct).toBe(40);
    expect(stats.budgetPct).toBe(20);
  });

  it('computes resident friction index correctly', () => {
    const friction = computeResidentFriction(mockVerdicts, ['Asha', 'Dev', 'Mira']);
    expect(friction.length).toBe(3);

    const asha = friction.find((f) => f.resident === 'Asha')!;
    expect(asha.rejectionCount).toBe(2);
    expect(asha.dietRejections).toBe(2);

    const dev = friction.find((f) => f.resident === 'Dev')!;
    expect(dev.rejectionCount).toBe(1);
    expect(dev.allergenRejections).toBe(1);
  });

  it('computes smart unlocker for budget increase requirement', () => {
    const budgetOnlyVerdicts: DishVerdict[] = [
      ...mockVerdicts.slice(0, 2),
      {
        dish: { id: 'D06', cafe: 'Library Cafe', name: 'Special Thali', diet: 'VEGAN', tags: ['RICE'], price: 160 },
        compatible: false,
        reasons: ['OVER_BUDGET'],
        cells: [],
        budgetOk: false,
      },
    ];

    const unlocker = computeSmartUnlocker(budgetOnlyVerdicts, 150);
    expect(unlocker).not.toBeNull();
    expect(unlocker?.type).toBe('BUDGET_INCREASE');
    expect(unlocker?.message).toContain('Increasing budget by ₹10');
    expect(unlocker?.impactDishNames).toEqual(['Special Thali']);
  });
});
