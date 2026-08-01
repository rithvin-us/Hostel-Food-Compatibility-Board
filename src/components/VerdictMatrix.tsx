import { EvidenceGutter } from './EvidenceGutter';
import { ReasonCodes } from './ReasonCode';
import type { DishVerdict } from '../domain/types';

interface Props {
  verdicts: DishVerdict[];
  residents: string[];
  budget: number;
}

/**
 * Every dish crossed with every resident, plus the budget. A failing cell shows
 * the same token that appears in the exclusion reason, so the screen is the
 * output rather than a paraphrase of it.
 */
export function VerdictMatrix({ verdicts, residents, budget }: Props) {
  return (
    <>
      <div className="pane-body">
        <table className="matrix" aria-label="Verdict matrix">
          <thead>
            <tr>
              <th className="th-evidence" scope="col">
                <span className="sr-only">Evidence</span>
              </th>
              <th className="th-dish" scope="col">
                Dish
              </th>
              {residents.map((name) => (
                <th className="th-person" key={name} scope="col">
                  {name}
                </th>
              ))}
              <th className="th-person" scope="col">
                Budget
              </th>
              <th className="th-verdict" scope="col">
                Verdict
              </th>
            </tr>
          </thead>
          <tbody>
            {verdicts.map((verdict) => (
              <tr key={verdict.dish.id} className={verdict.compatible ? 'row-pass' : ''}>
                <td className="td-evidence">
                  <EvidenceGutter verdict={verdict} />
                </td>

                <td data-label="Dish">
                  <span className="dish-id">{verdict.dish.id}</span>{' '}
                  <span className="dish-name">{verdict.dish.name}</span>
                  <span className="dish-meta">
                    {verdict.dish.cafe} · {verdict.dish.diet} · {verdict.dish.tags.join(', ')}
                  </span>
                </td>

                {verdict.cells.map((cell) => (
                  <td key={cell.resident} data-label={cell.resident}>
                    <PersonCell dietOk={cell.dietOk} hits={cell.allergenHits} />
                  </td>
                ))}

                <td data-label="Budget">
                  <BudgetCell
                    price={verdict.dish.price}
                    budget={budget}
                    budgetOk={verdict.budgetOk}
                  />
                </td>

                <td data-label="Verdict">
                  <span className={`verdict ${verdict.compatible ? 'verdict-pass' : 'verdict-fail'}`}>
                    {verdict.compatible ? '● Compatible' : '○ Excluded'}
                  </span>
                  <ReasonCodes reasons={verdict.reasons} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="legend">
        <span className="legend-item">
          <span className="swatch" style={{ background: 'var(--pass)' }} /> passes
        </span>
        <span className="legend-item">
          <span className="swatch" style={{ background: 'var(--block)' }} /> diet or allergen
        </span>
        <span className="legend-item">
          <span className="swatch" style={{ background: 'var(--over)' }} /> over budget
        </span>
        <span className="legend-item">Tracks: diet · allergen · budget</span>
      </div>
    </>
  );
}

function PersonCell({ dietOk, hits }: { dietOk: boolean; hits: string[] }) {
  if (dietOk && hits.length === 0) {
    return <span className="chip chip-pass">✓ ok</span>;
  }

  return (
    <span className="stack">
      {!dietOk && <span className="chip chip-block">✕ DIET</span>}
      {hits.map((tag) => (
        <span className="chip chip-block" key={tag}>
          ✕ {tag}
        </span>
      ))}
    </span>
  );
}

/**
 * A price exactly equal to the budget is marked, because the boundary case
 * (a ₹150 dish passes a ₹150 budget) is easy to get wrong and worth showing.
 */
function BudgetCell({
  price,
  budget,
  budgetOk,
}: {
  price: number;
  budget: number;
  budgetOk: boolean;
}) {
  if (!budgetOk) {
    return (
      <span className="stack">
        <span className="amount">₹{price}</span>
        <span className="chip chip-over">✕ OVER_BUDGET</span>
      </span>
    );
  }

  const atBoundary = price === budget;
  return (
    <span className="stack">
      <span className="amount">₹{price}</span>
      <span className="chip chip-pass">{atBoundary ? `= ₹${budget}` : `≤ ₹${budget}`}</span>
    </span>
  );
}
