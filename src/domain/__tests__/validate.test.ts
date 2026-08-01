/** Edge cases for INVALID_INPUT and DUPLICATE_DISH_ID, and the clearing rule. */
import { describe, expect, it } from 'vitest';
import { builtInDishes, builtInGroup } from '../fixtures';
import { dishesWith, err, groupWith, run } from './helpers';
import type { FieldError } from '../types';

/** Assert exactly one error pointing at a given table/row/field. */
function expectField(errors: FieldError[], table: string, row: string, field: string) {
  expect(errors).toContainEqual(expect.objectContaining({ table, row, field }));
}

describe('price validation', () => {
  it.each([
    ['zero', '0'],
    ['negative', '-5'],
    ['fractional', '12.5'],
    ['blank', ''],
    ['whitespace only', '   '],
    ['non-numeric', 'free'],
    ['numeric with a suffix', '110rs'],
  ])('rejects a %s price and names the row and field', (_label, price) => {
    const report = err(run({ dishes: dishesWith('D01', { price }) }));
    expect(report.status).toBe('INVALID_INPUT');
    expectField(report.errors, 'dishes', 'D01', 'price');
  });
});

describe('budget validation', () => {
  it.each([['zero', '0'], ['negative', '-1'], ['fractional', '150.5'], ['blank', '']])(
    'rejects a %s budget',
    (_label, budget) => {
      const report = err(run({ budget }));
      expect(report.status).toBe('INVALID_INPUT');
      expectField(report.errors, 'budget', 'group budget', 'budget');
    },
  );
});

describe('group table validation', () => {
  it('rejects an empty resident name and falls back to a positional row label', () => {
    const group = builtInGroup().map((r) => (r.name === 'Dev' ? { ...r, name: '' } : r));
    const report = err(run({ group }));
    expectField(report.errors, 'group', 'row 2', 'name');
  });

  it('rejects a whitespace-only resident name', () => {
    const group = builtInGroup().map((r) => (r.name === 'Asha' ? { ...r, name: '   ' } : r));
    expectField(err(run({ group })).errors, 'group', 'row 1', 'name');
  });

  it('rejects an unknown diet class', () => {
    expectField(err(run({ group: groupWith('Asha', { diet: 'PESCATARIAN' }) })).errors, 'group', 'Asha', 'diet');
  });

  it('rejects a blank allergen tag', () => {
    expectField(err(run({ group: groupWith('Dev', { allergens: ['PEANUT', ''] }) })).errors, 'group', 'Dev', 'allergens');
  });

  it('rejects an empty group', () => {
    expectField(err(run({ group: [] })).errors, 'group', 'group', 'residents');
  });

  it('accepts NO_RESTRICTION for a resident', () => {
    expect(run({ group: groupWith('Asha', { diet: 'NO_RESTRICTION' }) }).status).toBe('OK');
  });
});

describe('dish table validation', () => {
  it.each([
    ['cafe', { cafe: '  ' }, 'cafe'],
    ['name', { name: '' }, 'name'],
  ])('rejects a blank %s', (_label, patch, field) => {
    expectField(err(run({ dishes: dishesWith('D02', patch) })).errors, 'dishes', 'D02', field);
  });

  it('rejects a blank dish id and falls back to a positional row label', () => {
    expectField(err(run({ dishes: dishesWith('D03', { id: '' }) })).errors, 'dishes', 'row 3', 'id');
  });

  it('rejects a blank ingredient tag inside the list', () => {
    expectField(err(run({ dishes: dishesWith('D02', { tags: ['WHEAT', '', 'TOMATO'] }) })).errors, 'dishes', 'D02', 'tags');
  });

  it('rejects a dish with no ingredient tags', () => {
    expectField(err(run({ dishes: dishesWith('D02', { tags: [] }) })).errors, 'dishes', 'D02', 'tags');
  });

  it('rejects NO_RESTRICTION on a dish — it is a resident-only class', () => {
    expectField(err(run({ dishes: dishesWith('D01', { diet: 'NO_RESTRICTION' }) })).errors, 'dishes', 'D01', 'diet');
  });

  it('rejects an unknown dish diet class', () => {
    expectField(err(run({ dishes: dishesWith('D01', { diet: 'JAIN' }) })).errors, 'dishes', 'D01', 'diet');
  });

  it('rejects an empty dish list', () => {
    expectField(err(run({ dishes: [] })).errors, 'dishes', 'dishes', 'dishes');
  });
});

describe('duplicate dish ids', () => {
  it('reports DUPLICATE_DISH_ID rather than INVALID_INPUT', () => {
    const dishes = builtInDishes();
    dishes[4] = { ...dishes[4]!, id: 'D01' };
    const report = err(run({ dishes }));
    expect(report.status).toBe('DUPLICATE_DISH_ID');
    expect(report.errors).toContainEqual(
      expect.objectContaining({ code: 'DUPLICATE_DISH_ID', table: 'dishes', row: 'D01', field: 'id' }),
    );
  });

  it('catches a duplicate that differs only by case or spacing', () => {
    const dishes = builtInDishes();
    dishes[4] = { ...dishes[4]!, id: '  d01 ' };
    expect(err(run({ dishes })).status).toBe('DUPLICATE_DISH_ID');
  });

  it('still reports DUPLICATE_DISH_ID when other fields are also invalid', () => {
    const dishes = builtInDishes();
    dishes[4] = { ...dishes[4]!, id: 'D01', price: '0' };
    expect(err(run({ dishes })).status).toBe('DUPLICATE_DISH_ID');
  });
});

describe('the clearing rule', () => {
  it('an invalid report carries no verdicts, compatible rows or count', () => {
    const report = err(run({ dishes: dishesWith('D01', { price: '0' }) }));
    expect(report).not.toHaveProperty('verdicts');
    expect(report).not.toHaveProperty('compatible');
    expect(report).not.toHaveProperty('compatibleCount');
  });

  it('a duplicate-id report carries no verdicts, compatible rows or count', () => {
    const dishes = builtInDishes();
    dishes[1] = { ...dishes[1]!, id: 'D01' };
    const report = err(run({ dishes }));
    expect(report).not.toHaveProperty('verdicts');
    expect(report).not.toHaveProperty('compatibleCount');
  });

  it('collects every error in one pass instead of stopping at the first', () => {
    const dishes = dishesWith('D01', { price: '0' }).map((d) =>
      d.id === 'D02' ? { ...d, cafe: '' } : d,
    );
    const report = err(run({ dishes, budget: '0' }));
    expect(report.errors.length).toBeGreaterThanOrEqual(3);
    expectField(report.errors, 'budget', 'group budget', 'budget');
    expectField(report.errors, 'dishes', 'D01', 'price');
    expectField(report.errors, 'dishes', 'D02', 'cafe');
  });
});
