import type { DishVerdict } from '../domain/types';

interface Props {
  /** The unfiltered count, frozen at evaluate time. Search must not change it. */
  compatibleCount: number;
  filtered: DishVerdict[];
  query: string;
  onQuery: (value: string) => void;
}

export function ResultPanel({ compatibleCount, filtered, query, onQuery }: Props) {
  const trimmed = query.trim();

  return (
    <div className="result">
      <div className="tally">
        <span className="tally-figure">{compatibleCount}</span>
        <span className="tally-label">
          {compatibleCount === 1 ? 'dish everyone can eat' : 'dishes everyone can eat'}
        </span>
        {trimmed !== '' && (
          <p className="tally-note">
            Showing {filtered.length} of {compatibleCount} for “{trimmed}”
          </p>
        )}
      </div>

      <div className="picks">
        <div className="field">
          <label className="field-label" htmlFor="search">
            Search compatible dishes
          </label>
          <input
            id="search"
            className="input input-search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Cafe, dish or ingredient"
            autoComplete="off"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="empty-body">
            {compatibleCount === 0
              ? 'No dish clears every resident at this budget. Raise the budget or relax a restriction.'
              : `Nothing compatible matches “${trimmed}”.`}
          </p>
        ) : (
          <ul className="pick-list">
            {filtered.map(({ dish }) => (
              <li className="pick" key={dish.id}>
                <span className="pick-id">{dish.id}</span>
                <span className="pick-name">
                  <Highlight text={dish.name} query={trimmed} />
                </span>
                <span className="pick-cafe">
                  <Highlight text={dish.cafe} query={trimmed} />
                </span>
                <span className="amount">₹{dish.price}</span>
                <span className="pick-tags">
                  {dish.tags.map((tag, i) => (
                    <span key={tag}>
                      <Highlight text={tag} query={trimmed} />
                      {i < dish.tags.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Marks the matched substring, so it is obvious why a row survived the search. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (query === '') return <>{text}</>;

  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  );
}
