import type { Reason } from '../domain/types';

/**
 * Renders the contracted exclusion strings verbatim, in the data face.
 * These are output, not copy — never reword, prettify or localise them.
 */
export function ReasonCodes({ reasons }: { reasons: Reason[] }) {
  if (reasons.length === 0) return null;

  return (
    <p className="codes">
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
  if (reason === 'OVER_BUDGET') return 'code-budget';
  if (reason.startsWith('DIET:')) return 'code-diet';
  return 'code-allergen';
}
