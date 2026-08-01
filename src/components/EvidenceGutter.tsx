import type { DishVerdict } from '../domain/types';

/**
 * Three tracks per dish row — diet, allergen, budget — so the failure classes can
 * be scanned down the whole table without reading. Reads the verdict that was
 * already calculated; it never re-runs a rule.
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
    <div className="evidence" role="img" aria-label={label}>
      <span className={`evidence-track ${dietOk ? 'track-pass' : 'track-block'}`} />
      <span className={`evidence-track ${allergenOk ? 'track-pass' : 'track-block'}`} />
      <span className={`evidence-track ${verdict.budgetOk ? 'track-pass' : 'track-over'}`} />
    </div>
  );
}
