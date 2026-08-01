import type { ErrorCode, FieldError } from '../domain/types';

/**
 * Contract: "On invalid input, report INVALID_INPUT with the affected table, row,
 * and field, show no compatibility or exclusion rows, and clear any earlier counts."
 *
 * The code is printed verbatim, and each error names table / row / field so the user
 * can go straight to the cell. The message says how to fix it, in the interface's
 * voice — it does not apologise and it is never vague about what happened.
 */
export function ValidationBanner({ code, errors }: { code: ErrorCode; errors: FieldError[] }) {
  return (
    <div className="panel banner" role="alert">
      <span className="banner-code">{code}</span>
      <p className="banner-lead">
        {errors.length === 1 ? '1 field needs fixing' : `${errors.length} fields need fixing`}. No
        result is shown until every one is valid.
      </p>
      <ul className="banner-list">
        {errors.map((e, i) => (
          <li className="banner-item" key={`${e.table}-${e.row}-${e.field}-${i}`}>
            <span className="banner-where">
              {e.table} · {e.row} · {e.field}
            </span>
            <span className="banner-why">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
