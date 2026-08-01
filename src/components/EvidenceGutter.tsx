import type { DishVerdict } from '../domain/types';

/**
 * Three stacked tracks per dish row — diet, allergen, budget — so the whole table's
 * failure classes can be scanned in one vertical pass without reading any text.
 *
 * This is the problem statement's optional "compact visual evidence chips", built as
 * a scanning device rather than a badge row. It reads the verdict that was already
 * calculated; it never re-runs a rule, so it cannot change the contracted result.
 */
export function EvidenceGutter({ verdict }: { verdict: DishVerdict }) {
  const dietOk = verdict.cells.every((c) => c.dietOk);
  const allergenOk = verdict.cells.every((c) => c.allergenHits.length === 0);

  const label = [
    `diet ${dietOk ? 'passed' : 'failed'}`,
    `allergens ${allergenOk ? 'passed' : 'failed'}`,
    `budget ${verdict.budgetOk ? 'passed' : 'failed'}`,
  ].join(', ');

  return (
    <div className="gutter" role="img" aria-label={label}>
      <span className={`gutter-track ${dietOk ? 'gutter-pass' : 'gutter-block'}`} />
      <span className={`gutter-track ${allergenOk ? 'gutter-pass' : 'gutter-block'}`} />
      <span className={`gutter-track ${verdict.budgetOk ? 'gutter-pass' : 'gutter-over'}`} />
    </div>
  );
}
