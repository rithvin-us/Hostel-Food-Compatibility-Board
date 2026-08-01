/** Edge cases for the search box: scope, case, trimming, and count stability. */
import { describe, expect, it } from 'vitest';
import { filterCompatible } from '../search';
import { ok, run } from './helpers';

const compatible = () => ok(run()).compatible;
const found = (query: string) => filterCompatible(compatible(), query).map((v) => v.dish.id);

describe('empty and whitespace queries', () => {
  it('shows all compatible dishes for an empty query', () => {
    expect(found('')).toEqual(['D01', 'D02']);
  });

  it('shows all compatible dishes for a whitespace-only query', () => {
    expect(found('   ')).toEqual(['D01', 'D02']);
    expect(found('\t\n')).toEqual(['D01', 'D02']);
  });
});

describe('matching', () => {
  it('matches an ingredient tag case-insensitively', () => {
    expect(found('wheat')).toEqual(['D02']);
    expect(found('WHEAT')).toEqual(['D02']);
    expect(found('WhEaT')).toEqual(['D02']);
  });

  it('trims the query before matching', () => {
    expect(found('  wheat  ')).toEqual(['D02']);
  });

  it('matches a partial substring', () => {
    expect(found('whe')).toEqual(['D02']);
    expect(found('en')).toEqual(['D01']); // "Lentil"
  });

  it('matches the cafe name', () => {
    expect(found('library')).toEqual(['D02']);
    expect(found('hostel')).toEqual(['D01']);
  });

  it('matches the dish name', () => {
    expect(found('pasta')).toEqual(['D02']);
    expect(found('rice bowl')).toEqual(['D01']);
  });

  it('returns nothing when there is no match', () => {
    expect(found('sushi')).toEqual([]);
  });
});

describe('scope — compatible dishes only', () => {
  it('never surfaces an excluded dish', () => {
    // PEANUT belongs to D04 and MILK to D03, both excluded.
    expect(found('peanut')).toEqual([]);
    expect(found('milk')).toEqual([]);
    expect(found('egg')).toEqual([]);
  });

  it('matches "east cafe" against nothing, because D04 is excluded', () => {
    expect(found('east')).toEqual([]);
  });
});

describe('count stability', () => {
  it('leaves the overall count untouched while filtered to one row', () => {
    const report = ok(run());
    const shown = filterCompatible(report.compatible, 'wheat');
    expect(shown).toHaveLength(1);
    expect(report.compatibleCount).toBe(2);
  });

  it('leaves the overall count untouched when the filter matches nothing', () => {
    const report = ok(run());
    expect(filterCompatible(report.compatible, 'sushi')).toHaveLength(0);
    expect(report.compatibleCount).toBe(2);
  });

  it('does not mutate the compatible list it filters', () => {
    const report = ok(run());
    filterCompatible(report.compatible, 'wheat');
    expect(report.compatible.map((v) => v.dish.id)).toEqual(['D01', 'D02']);
  });
});

describe('result order', () => {
  it('preserves source order among the matches', () => {
    // "cafe" is in every cafe name, so both compatible dishes match.
    expect(found('cafe')).toEqual(['D01', 'D02']);
  });
});
