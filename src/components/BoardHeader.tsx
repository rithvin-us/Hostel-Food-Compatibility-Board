interface Props {
  budget: string;
  budgetInvalid: boolean;
  onBudget: (value: string) => void;
  onCheck: () => void;
  onLoadSample: () => void;
  onReset: () => void;
}

export function BoardHeader({
  budget,
  budgetInvalid,
  onBudget,
  onCheck,
  onLoadSample,
  onReset,
}: Props) {
  return (
    <header className="masthead">
      <div className="masthead-inner">
        <h1 className="wordmark">
          Hostel Food Compatibility Board
          <span className="wordmark-sub">one dish the whole floor can eat</span>
        </h1>

        <div className="masthead-controls">
          <div className="field">
            <label className="field-label" htmlFor="budget">
              Budget per person
            </label>
            <input
              id="budget"
              className={`input input-budget ${budgetInvalid ? 'cell-invalid' : ''}`}
              value={budget}
              onChange={(e) => onBudget(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <button type="button" className="btn btn-primary" onClick={onCheck}>
            Check compatibility
          </button>
          <button type="button" className="btn btn-quiet" onClick={onLoadSample}>
            Load sample
          </button>
          <button type="button" className="btn btn-quiet" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
