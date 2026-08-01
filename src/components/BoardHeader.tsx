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
    <header className="topbar">
      <div className="topbar-inner">
        <h1 className="brand">Food Compatibility Board</h1>

        <div className="topbar-actions">
          <div className="field">
            <label className="field-label" htmlFor="budget">
              Budget per person
            </label>
            <input
              id="budget"
              className={`input input-rupees ${budgetInvalid ? 'is-invalid' : ''}`}
              value={budget}
              onChange={(e) => onBudget(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <button type="button" className="btn btn-primary" onClick={onCheck}>
            Check compatibility
          </button>
          <button type="button" className="btn" onClick={onLoadSample}>
            Load sample
          </button>
          <button type="button" className="btn" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
