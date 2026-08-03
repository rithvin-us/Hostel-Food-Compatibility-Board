/** Edge cases for normalization, the three rules, and reason ordering. */
import { describe, expect, it } from 'vitest';
import { normalizeTag, parseWholeRupees, splitTags } from '../normalize';
import { allergenHits, dietAccepts, withinBudget } from '../rules';
import { judgeDish } from '../compatibility';
import type { Dish, Resident } from '../types';
import { dishesWith, groupWith, ids, ok, reasonsFor, run } from './helpers';

const dish = (patch: Partial<Dish> = {}): Dish => ({
  id: 'X01',
  cafe: 'Test Cafe',
  name: 'Test Dish',
  diet: 'VEGAN',
  tags: ['RICE'],
  price: 100,
  ...patch,
});

const resident = (patch: Partial<Resident> = {}): Resident => ({
  name: 'Test',
  diet: 'NO_RESTRICTION',
  allergens: [],
  ...patch,
});

describe('normalization', () => {
  it('trims and uppercases tags', () => {
    expect(normalizeTag('  milk ')).toBe('MILK');
    expect(normalizeTag('Vegan')).toBe('VEGAN');
    expect(normalizeTag('non_vegetarian')).toBe('NON_VEGETARIAN');
  });

  it('trims tabs and newlines, not only spaces', () => {
    expect(normalizeTag('\t\n milk \n')).toBe('MILK');
  });

  it('splits and normalizes a comma-separated tag list', () => {
    expect(splitTags(' wheat , Tomato ')).toEqual(['WHEAT', 'TOMATO']);
  });

  it('treats a blank tag list as zero tags, not one empty tag', () => {
    expect(splitTags('   ')).toEqual([]);
  });

  it('keeps an interior blank tag so validation can catch it', () => {
    expect(splitTags('WHEAT,,TOMATO')).toEqual(['WHEAT', '', 'TOMATO']);
  });

  it('accepts messy casing and spacing end to end', () => {
    const messy = dishesWith('D03', { diet: '  vegetarian ', tags: [' milk ', 'Wheat'] });
    expect(reasonsFor(run({ dishes: messy }), 'D03')).toEqual(['DIET:ASHA', 'ALLERGEN:MIRA:MILK']);
  });
});

describe('parseWholeRupees', () => {
  it.each([
    ['150', 150],
    [' 150 ', 150],
    ['1', 1],
  ])('accepts %s', (input, expected) => {
    expect(parseWholeRupees(input)).toBe(expected);
  });

  it.each(['0', '-5', '12.5', '', '   ', 'abc', '12abc', 'NaN', 'Infinity', '1e3.5'])(
    'rejects %s',
    (input) => {
      expect(parseWholeRupees(input)).toBeNull();
    },
  );
});

describe('diet rule', () => {
  it('VEGAN resident accepts only a VEGAN dish', () => {
    expect(dietAccepts('VEGAN', 'VEGAN')).toBe(true);
    expect(dietAccepts('VEGAN', 'VEGETARIAN')).toBe(false);
    expect(dietAccepts('VEGAN', 'NON_VEGETARIAN')).toBe(false);
  });

  it('VEGETARIAN resident accepts VEGAN or VEGETARIAN', () => {
    expect(dietAccepts('VEGETARIAN', 'VEGAN')).toBe(true);
    expect(dietAccepts('VEGETARIAN', 'VEGETARIAN')).toBe(true);
    expect(dietAccepts('VEGETARIAN', 'NON_VEGETARIAN')).toBe(false);
  });

  it('NO_RESTRICTION resident accepts any dish class', () => {
    expect(dietAccepts('NO_RESTRICTION', 'VEGAN')).toBe(true);
    expect(dietAccepts('NO_RESTRICTION', 'VEGETARIAN')).toBe(true);
    expect(dietAccepts('NO_RESTRICTION', 'NON_VEGETARIAN')).toBe(true);
  });

  it('NON_VEGETARIAN resident accepts any dish class (documented assumption)', () => {
    expect(dietAccepts('NON_VEGETARIAN', 'VEGAN')).toBe(true);
    expect(dietAccepts('NON_VEGETARIAN', 'VEGETARIAN')).toBe(true);
    expect(dietAccepts('NON_VEGETARIAN', 'NON_VEGETARIAN')).toBe(true);
  });
});

describe('allergen rule', () => {
  it('matches a tag exactly', () => {
    expect(allergenHits(dish({ tags: ['MILK'] }), resident({ allergens: ['MILK'] }))).toEqual(['MILK']);
  });

  it('does not match a tag that merely contains the allergen', () => {
    expect(allergenHits(dish({ tags: ['MILKSHAKE'] }), resident({ allergens: ['MILK'] }))).toEqual([]);
    expect(allergenHits(dish({ tags: ['PEANUT_OIL'] }), resident({ allergens: ['PEANUT'] }))).toEqual([]);
  });

  it('does not match an allergen that contains the tag', () => {
    expect(allergenHits(dish({ tags: ['NUT'] }), resident({ allergens: ['PEANUT'] }))).toEqual([]);
  });

  it('returns nothing for a resident with no allergens', () => {
    expect(allergenHits(dish({ tags: ['MILK', 'WHEAT'] }), resident())).toEqual([]);
  });

  it('returns multiple hits in the dish tag order, not the allergen order', () => {
    const d = dish({ tags: ['WHEAT', 'MILK'] });
    const r = resident({ allergens: ['MILK', 'WHEAT'] });
    expect(allergenHits(d, r)).toEqual(['WHEAT', 'MILK']);
  });

  it('reports a repeated dish tag once', () => {
    const d = dish({ tags: ['MILK', 'WHEAT', 'MILK'] });
    expect(allergenHits(d, resident({ allergens: ['MILK'] }))).toEqual(['MILK']);
  });

  it('does not infer cross-contamination between dishes', () => {
    // D01 shares a cafe with the milk-bearing D03 and must stay compatible.
    expect(ids(run())).toContain('D01');
  });
});

describe('budget rule', () => {
  it('passes at the boundary', () => {
    expect(withinBudget(dish({ price: 150 }), 150)).toBe(true);
  });

  it('fails one rupee over', () => {
    expect(withinBudget(dish({ price: 151 }), 150)).toBe(false);
  });

  it('passes at the minimum positive price', () => {
    expect(withinBudget(dish({ price: 1 }), 150)).toBe(true);
  });

  it('excludes every dish when the budget is below the cheapest', () => {
    expect(ids(run({ budget: '99' }))).toEqual([]);
    expect(ok(run({ budget: '99' })).compatibleCount).toBe(0);
  });
});

describe('reason ordering', () => {
  it('emits the diet reason before allergen reasons for the same resident', () => {
    const verdict = judgeDish(
      dish({ diet: 'NON_VEGETARIAN', tags: ['EGG', 'MILK'] }),
      [resident({ name: 'ASHA', diet: 'VEGAN', allergens: ['MILK', 'EGG'] })],
      500,
    );
    expect(verdict.reasons).toEqual(['DIET:ASHA', 'ALLERGEN:ASHA:EGG', 'ALLERGEN:ASHA:MILK']);
  });

  it('orders residents by the group table, not alphabetically', () => {
    const verdict = judgeDish(
      dish({ diet: 'NON_VEGETARIAN' }),
      [resident({ name: 'ZOYA', diet: 'VEGAN' }), resident({ name: 'AMIT', diet: 'VEGETARIAN' })],
      500,
    );
    expect(verdict.reasons).toEqual(['DIET:ZOYA', 'DIET:AMIT']);
  });

  it('follows a reordered group table', () => {
    const group = [
      { key: 'a', name: 'DEV', diet: 'VEGETARIAN', allergens: ['PEANUT'] },
      { key: 'b', name: 'ASHA', diet: 'VEGAN', allergens: [] },
      { key: 'c', name: 'MIRA', diet: 'NO_RESTRICTION', allergens: ['MILK'] },
    ];
    expect(reasonsFor(run({ group }), 'D05')).toEqual(['DIET:DEV', 'DIET:ASHA']);
  });

  it('puts OVER_BUDGET last, after every diet and allergen reason', () => {
    const verdict = judgeDish(
      dish({ diet: 'NON_VEGETARIAN', tags: ['EGG'], price: 900 }),
      [resident({ name: 'ASHA', diet: 'VEGAN', allergens: ['EGG'] })],
      150,
    );
    expect(verdict.reasons).toEqual(['DIET:ASHA', 'ALLERGEN:ASHA:EGG', 'OVER_BUDGET']);
    expect(verdict.reasons.at(-1)).toBe('OVER_BUDGET');
  });

  it('emits one reason per resident when two residents share an allergen', () => {
    const group = groupWith('ASHA', { diet: 'NO_RESTRICTION', allergens: ['WHEAT'] });
    const withWheatAllergyForMira = group.map((r) =>
      r.name === 'MIRA' ? { ...r, allergens: ['WHEAT'] } : r,
    );
    expect(reasonsFor(run({ group: withWheatAllergyForMira }), 'D02')).toEqual([
      'ALLERGEN:ASHA:WHEAT',
      'ALLERGEN:MIRA:WHEAT',
    ]);
  });

  it('leaves a compatible dish with no reasons at all', () => {
    expect(judgeDish(dish(), [resident()], 150).reasons).toEqual([]);
    expect(judgeDish(dish(), [resident()], 150).compatible).toBe(true);
  });
});

describe('source order', () => {
  it('preserves dish source order in the verdict list', () => {
    expect(ok(run()).verdicts.map((v) => v.dish.id)).toEqual(['D01', 'D02', 'D03', 'D04', 'D05']);
  });

  it('follows a reordered dish table', () => {
    const dishes = [
      { key: 'b', id: 'D02', cafe: 'Library Cafe', name: 'Tomato Pasta', diet: 'VEGAN', tags: ['WHEAT', 'TOMATO'], price: '150' },
      { key: 'a', id: 'D01', cafe: 'Hostel Cafe', name: 'Lentil Rice Bowl', diet: 'VEGAN', tags: ['LENTIL', 'RICE', 'SPINACH'], price: '110' },
    ];
    expect(ids(run({ dishes }))).toEqual(['D02', 'D01']);
  });
});
