import { DIET_CLASSES } from '../domain/types';
import type { ResidentInput } from '../domain/types';

interface Props {
  group: ResidentInput[];
  onEdit: (key: string, field: keyof ResidentInput, value: string) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  isFlagged: (table: string, rows: string[], field: string) => boolean;
}

const validDiet = (value: string) =>
  (DIET_CLASSES as readonly string[]).includes(value.trim().toUpperCase())
    ? value.trim().toUpperCase()
    : '';

/** Resident order decides the order of exclusion reasons, so rows are never sorted. */
export function GroupTable({ group, onEdit, onAdd, onRemove, isFlagged }: Props) {
  return (
    <div className="inputs-pane">
      <div className="pane-head">
        <h2 className="pane-title">Group</h2>
        <span className="pane-count">{group.length}</span>
      </div>

      <div className="pane-body">
        <table className="table" aria-label="Group">
          <colgroup>
            <col style={{ width: '33%' }} />
            <col style={{ width: '33%' }} />
            <col style={{ width: '34%' }} />
            <col style={{ width: '30px' }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Resident</th>
              <th scope="col">Diet</th>
              <th scope="col">Allergens</th>
              <th scope="col">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {group.map((resident, index) => {
              // A blank name is reported against a positional label, so check both.
              const rows = [resident.name.trim(), `row ${index + 1}`];
              const label = resident.name.trim() || `row ${index + 1}`;

              return (
                <tr key={resident.key}>
                  <td>
                    <input
                      className={`cell ${isFlagged('group', rows, 'name') ? 'is-invalid' : ''}`}
                      value={resident.name}
                      onChange={(e) => onEdit(resident.key, 'name', e.target.value)}
                      aria-label={`Resident ${index + 1} name`}
                    />
                  </td>
                  <td>
                    <select
                      className={`cell cell-select ${
                        isFlagged('group', rows, 'diet') ? 'is-invalid' : ''
                      }`}
                      value={validDiet(resident.diet)}
                      onChange={(e) => onEdit(resident.key, 'diet', e.target.value)}
                      aria-label={`Resident ${index + 1} diet`}
                    >
                      <option value="">—</option>
                      {DIET_CLASSES.map((diet) => (
                        <option key={diet} value={diet}>
                          {diet}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className={`cell cell-mono ${
                        isFlagged('group', rows, 'allergens') ? 'is-invalid' : ''
                      }`}
                      value={resident.allergens.join(', ')}
                      onChange={(e) => onEdit(resident.key, 'allergens', e.target.value)}
                      placeholder="none"
                      aria-label={`Resident ${index + 1} allergen tags, comma separated`}
                    />
                  </td>
                  <td className="td-action">
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => onRemove(resident.key)}
                      aria-label={`Remove ${label}`}
                      title={`Remove ${label}`}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pane-foot">
        <button type="button" className="btn-add" onClick={onAdd}>
          Add resident
        </button>
      </div>
    </div>
  );
}
