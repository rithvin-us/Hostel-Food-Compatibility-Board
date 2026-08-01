import type { ErrorCode, FieldError } from '../domain/types';

/**
 * The error code is printed verbatim, and each row names table / row / field so
 * the user can go straight to the cell. Messages say how to fix it — they do not
 * apologise, and they are never vague about what happened.
 */
export function ValidationBanner({ code, errors }: { code: ErrorCode; errors: FieldError[] }) {
  return (
    <div className="alert" role="alert">
      <span className="alert-code">{code}</span>
      <p className="alert-lead">
        {errors.length === 1 ? '1 field needs fixing' : `${errors.length} fields need fixing`}.
      </p>
      <ul className="alert-list">
        {errors.map((e, i) => (
          <li className="alert-item" key={`${e.table}-${e.row}-${e.field}-${i}`}>
            <span className="alert-where">
              {e.table} · {e.row} · {e.field}
            </span>
            <span className="alert-why">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
