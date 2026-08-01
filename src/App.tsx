import { BoardHeader } from './components/BoardHeader';
import { DishTable } from './components/DishTable';
import { GroupTable } from './components/GroupTable';
import { ResultPanel } from './components/ResultPanel';
import { ValidationBanner } from './components/ValidationBanner';
import { VerdictMatrix } from './components/VerdictMatrix';
import { useBoard } from './state/useBoard';

export default function App() {
  const { state, actions, errors, filtered, isFlagged } = useBoard();
  const { report } = state;

  const budgetInvalid = errors.some((e) => e.table === 'budget');
  const residentNames = state.group.map((r) => r.name.trim()).filter((n) => n !== '');

  return (
    <>
      <BoardHeader
        budget={state.budget}
        budgetInvalid={budgetInvalid}
        onBudget={actions.setBudget}
        onCheck={actions.check}
        onLoadSample={actions.loadSample}
        onReset={actions.reset}
      />

      <div className="shell">
        <div className="tables">
          <GroupTable
            group={state.group}
            onEdit={actions.editResident}
            onAdd={actions.addResident}
            onRemove={actions.removeResident}
            isFlagged={isFlagged}
          />
          <DishTable
            dishes={state.dishes}
            budget={state.budget}
            onEdit={actions.editDish}
            onAdd={actions.addDish}
            onRemove={actions.removeDish}
            isFlagged={isFlagged}
          />
        </div>

        <section className="section" aria-labelledby="verdict-heading">
          <div className="section-head">
            <h2 className="section-title" id="verdict-heading">
              Verdict
            </h2>
            <p className="section-note">
              Every dish against every resident, plus the budget. Failing cells show the exclusion
              code itself.
            </p>
          </div>

          {/* Three states, one at a time: not yet run, invalid input, or a result. */}
          {report === null && (
            <div className="panel empty">
              <p className="empty-title">Nothing calculated yet</p>
              <p className="empty-body">
                Choose “Check compatibility” to run the built-in group of {state.group.length}{' '}
                against {state.dishes.length} dishes at ₹{state.budget || '—'} per person.
              </p>
            </div>
          )}

          {report !== null && report.status !== 'OK' && (
            <ValidationBanner code={report.status} errors={report.errors} />
          )}

          {report !== null && report.status === 'OK' && (
            <VerdictMatrix
              verdicts={report.verdicts}
              residents={residentNames}
              budget={report.budget}
            />
          )}
        </section>

        {report !== null && report.status === 'OK' && (
          <section className="section" aria-labelledby="result-heading">
            <div className="section-head">
              <h2 className="section-title" id="result-heading">
                Result
              </h2>
              <p className="section-note">
                Search narrows what is displayed. It never changes the count.
              </p>
            </div>

            <ResultPanel
              compatibleCount={report.compatibleCount}
              filtered={filtered}
              query={state.query}
              onQuery={actions.setQuery}
            />
          </section>
        )}

        <footer className="foot">
          <span>SI26_P02 · Hostel Food Compatibility Board</span>
          <span>no backend · no database · no network calls</span>
          <span>rules live in src/domain</span>
        </footer>
      </div>
    </>
  );
}
