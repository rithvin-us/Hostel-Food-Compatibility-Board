/**
 * One block per REQUIRED acceptance criterion in SI26_P02, named after it.
 * If this file is green, the graded criteria are met.
 */
import { describe, expect, it } from 'vitest';
import { builtInDishes, builtInGroup, DEFAULT_BUDGET } from '../fixtures';
import { filterCompatible } from '../search';
import { dishesWith, err, ids, ok, reasonsFor, run } from './helpers';

describe('AC1 — load the built-in group and dishes in one action', () => {
  it('returns exactly D01 then D02', () => {
    expect(ids(run())).toEqual(['D01', 'D02']);
  });

  it('reports an overall compatible count of 2', () => {
    expect(ok(run()).compatibleCount).toBe(2);
  });

  it('keeps every dish in the verdict list, in source order', () => {
    expect(ok(run()).verdicts.map((v) => v.dish.id)).toEqual(['D01', 'D02', 'D03', 'D04', 'D05']);
  });

  it('gives compatible dishes an empty reason list', () => {
    expect(reasonsFor(run(), 'D01')).toEqual([]);
    expect(reasonsFor(run(), 'D02')).toEqual([]);
  });
});

describe('AC2 — contracted exclusion reasons, and the budget boundary', () => {
  it('D03 Paneer Wrap: DIET:ASHA then ALLERGEN:MIRA:MILK', () => {
    expect(reasonsFor(run(), 'D03')).toEqual(['DIET:ASHA', 'ALLERGEN:MIRA:MILK']);
  });

  it('D04 Peanut Noodles: ALLERGEN:DEV:PEANUT', () => {
    expect(reasonsFor(run(), 'D04')).toEqual(['ALLERGEN:DEV:PEANUT']);
  });

  it('D05 Egg Sandwich: DIET:ASHA then DIET:DEV', () => {
    expect(reasonsFor(run(), 'D05')).toEqual(['DIET:ASHA', 'DIET:DEV']);
  });

  it('D02 at ₹150 passes the ₹150 budget (<=, not <)', () => {
    const d02 = ok(run()).verdicts.find((v) => v.dish.id === 'D02')!;
    expect(d02.budgetOk).toBe(true);
    expect(d02.compatible).toBe(true);
  });

  it('does not multiply the price by group size', () => {
    // 3 residents x ₹150 would be ₹450 and would exclude D02. It must not.
    expect(builtInGroup()).toHaveLength(3);
    expect(ids(run())).toContain('D02');
  });
});

describe('AC3 — the exact query "wheat" narrows the result to D02', () => {
  it('displays only D02', () => {
    const report = ok(run());
    expect(filterCompatible(report.compatible, 'wheat').map((v) => v.dish.id)).toEqual(['D02']);
  });

  it('keeps the overall compatible count at 2 while filtered', () => {
    const report = ok(run());
    filterCompatible(report.compatible, 'wheat');
    expect(report.compatibleCount).toBe(2);
  });

  it('displays both compatible dishes again once the query is cleared', () => {
    const report = ok(run());
    expect(filterCompatible(report.compatible, '').map((v) => v.dish.id)).toEqual(['D01', 'D02']);
  });
});

describe('AC4 — group budget of ₹130', () => {
  it('leaves only D01 compatible', () => {
    expect(ids(run({ budget: '130' }))).toEqual(['D01']);
  });

  it('identifies D02 as OVER_BUDGET', () => {
    expect(reasonsFor(run({ budget: '130' }), 'D02')).toEqual(['OVER_BUDGET']);
  });

  it('drops the compatible count to 1', () => {
    expect(ok(run({ budget: '130' })).compatibleCount).toBe(1);
  });
});

describe('AC5 — D01 price of 0', () => {
  const report = err(run({ dishes: dishesWith('D01', { price: '0' }) }));

  it('reports INVALID_INPUT', () => {
    expect(report.status).toBe('INVALID_INPUT');
  });

  it('names the dishes table, the D01 row and the price field', () => {
    expect(report.errors).toContainEqual(
      expect.objectContaining({ table: 'dishes', row: 'D01', field: 'price' }),
    );
  });

  it('carries no verdicts, no compatible rows and no count', () => {
    expect(report).not.toHaveProperty('verdicts');
    expect(report).not.toHaveProperty('compatible');
    expect(report).not.toHaveProperty('compatibleCount');
  });
});

describe('AC6 — reset after the invalid-price case', () => {
  it('restores the valid built-in rows, ₹150 and an empty search', () => {
    // Simulate: break it, confirm broken, then reset by re-reading the fixtures.
    expect(err(run({ dishes: dishesWith('D01', { price: '0' }) })).status).toBe('INVALID_INPUT');

    const afterReset = run({ group: builtInGroup(), dishes: builtInDishes(), budget: DEFAULT_BUDGET });
    expect(ids(afterReset)).toEqual(['D01', 'D02']);
    expect(ok(afterReset).compatibleCount).toBe(2);
    expect(ok(afterReset).budget).toBe(150);
    expect(filterCompatible(ok(afterReset).compatible, '')).toHaveLength(2);
  });

  it('leaves the fixtures unmutated by an earlier edit', () => {
    dishesWith('D01', { price: '0' });
    expect(builtInDishes().find((d) => d.id === 'D01')!.price).toBe('110');
  });
});

describe('optional — evidence data for the diet, allergen and budget checks', () => {
  it('exposes a per-resident cell for every dish without changing the result', () => {
    const d03 = ok(run()).verdicts.find((v) => v.dish.id === 'D03')!;
    expect(d03.cells).toEqual([
      { resident: 'ASHA', dietOk: false, allergenHits: [] },
      { resident: 'DEV', dietOk: true, allergenHits: [] },
      { resident: 'MIRA', dietOk: true, allergenHits: ['MILK'] },
    ]);
    expect(d03.budgetOk).toBe(true);
    expect(d03.reasons).toEqual(['DIET:ASHA', 'ALLERGEN:MIRA:MILK']);
  });
});
