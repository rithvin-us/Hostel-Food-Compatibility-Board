import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface Props {
  values: string[];
  onChange: (raw: string) => void;
  ariaLabel: string;
  invalid?: boolean;
  placeholder?: string;
}

/**
 * Type a value, press Enter or "," to commit it as a removable chip.
 * Pasting a comma-separated string still splits into one chip per segment —
 * including blank segments — so validation can still catch "WHEAT,,TOMATO".
 * `onChange` always receives the full comma-joined list, so this is a drop-in
 * replacement for the raw text input the board's reducer already expects.
 */
export function TagInput({ values, onChange, ariaLabel, invalid, placeholder }: Props) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    if (raw === '') return;
    onChange([...values, ...raw.split(',')].join(','));
    setDraft('');
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index).join(','));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      removeAt(values.length - 1);
    }
  };

  return (
    <div className={`tag-input ${invalid ? 'is-invalid' : ''}`}>
      {values.map((tag, i) => (
        <span className="tag-chip" key={`${tag}-${i}`}>
          {tag === '' ? <span className="tag-chip-blank">blank</span> : tag}
          <button
            type="button"
            className="tag-chip-remove"
            onClick={() => removeAt(i)}
            aria-label={`Remove ${tag || 'blank'} from ${ariaLabel}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input-field"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        placeholder={values.length === 0 ? placeholder : undefined}
        aria-label={ariaLabel}
      />
    </div>
  );
}
