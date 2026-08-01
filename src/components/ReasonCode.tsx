import type { Reason } from '../domain/types';

/**
 * Renders the contracted exclusion strings verbatim, in the data face.
 *
 * The point of this component is that what appears on screen is character-identical
 * to the problem statement: `DIET:Asha, ALLERGEN:Mira:MILK`. Never reword, never
 * prettify, never localise these — they are output, not copy.
 */
export function ReasonCodes({ reasons }: { reasons: Reason[] }) {
  if (reasons.length === 0) return null;

  return (
    <p className="reasons">
      {reasons.map((reason, i) => (
        <span key={reason + i}>
          <span className={classFor(reason)}>{reason}</span>
          {i < reasons.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
}

function classFor(reason: Reason): string {
  if (reason === 'OVER_BUDGET') return 'reason-budget';
  if (reason.startsWith('DIET:')) return 'reason-diet';
  return 'reason-allergen';
}
