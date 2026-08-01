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

      <main className="shell">
        {/* Both source tables share one panel, so they keep one column rhythm
            and one height instead of drifting apart as rows are added. */}
        <section className="panel">
          <div className="inputs">
            <GroupTable
              group={state.group}
              onEdit={actions.editResident}
              onAdd={actions.addResident}
              onRemove={actions.removeResident}
              isFlagged={isFlagged}
            />
            <DishTable
              dishes={state.dishes}
              onEdit={actions.editDish}
              onAdd={actions.addDish}
              onRemove={actions.removeDish}
              isFlagged={isFlagged}
            />
          </div>
        </section>

        {/* Exactly one of three states: not yet run, invalid input, or a result. */}
        {report === null && (
          <section className="panel empty">
            <p className="empty-title">No result yet</p>
            <p className="empty-body">
              Choose Check compatibility to test {state.dishes.length} dishes against{' '}
              {state.group.length} residents.
            </p>
          </section>
        )}

        {report !== null && report.status !== 'OK' && (
          <div className="enter">
            <ValidationBanner code={report.status} errors={report.errors} />
          </div>
        )}

        {report !== null && report.status === 'OK' && (
          <>
            <section className="panel enter">
              <div className="panel-head">
                <h2 className="panel-title">Verdict</h2>
              </div>
              <VerdictMatrix
                verdicts={report.verdicts}
                residents={residentNames}
                budget={report.budget}
              />
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">Result</h2>
              </div>
              <ResultPanel
                compatibleCount={report.compatibleCount}
                filtered={filtered}
                query={state.query}
                onQuery={actions.setQuery}
              />
            </section>
          </>
        )}
      </main>
    </>
  );
}
