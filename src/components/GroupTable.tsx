import { DIET_CLASSES } from '../domain/types';
import type { ResidentInput } from '../domain/types';

interface Props {
  group: ResidentInput[];
  onEdit: (key: string, field: keyof ResidentInput, value: string) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  isFlagged: (table: string, rows: string[], field: string) => boolean;
}

/**
 * The group table, edited in place. Resident order is contractual — it decides the
 * order of DIET and ALLERGEN reasons — so rows are never sorted.
 */
export function GroupTable({ group, onEdit, onAdd, onRemove, isFlagged }: Props) {
  return (
    <section className="section" aria-labelledby="group-heading">
      <div className="section-head">
        <h2 className="section-title" id="group-heading">
          Group
        </h2>
        <p className="section-note">Row order decides the order of exclusion reasons.</p>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th scope="col">Resident</th>
                <th scope="col">Diet</th>
                <th scope="col">Allergens</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {group.map((resident, index) => {
                // A blank name is reported against a positional label, so check both.
                const rows = [resident.name.trim(), `row ${index + 1}`];
                return (
                  <tr key={resident.key}>
                    <td>
                      <input
                        className={`cell-input ${isFlagged('group', rows, 'name') ? 'cell-invalid' : ''}`}
                        value={resident.name}
                        onChange={(e) => onEdit(resident.key, 'name', e.target.value)}
                        aria-label={`Resident ${index + 1} name`}
                      />
                    </td>
                    <td>
                      <select
                        className={`cell-input ${isFlagged('group', rows, 'diet') ? 'cell-invalid' : ''}`}
                        value={DIET_CLASSES.includes(resident.diet.trim().toUpperCase() as never)
                          ? resident.diet.trim().toUpperCase()
                          : ''}
                        onChange={(e) => onEdit(resident.key, 'diet', e.target.value)}
                        aria-label={`Resident ${index + 1} diet`}
                      >
                        {/* Present only when the stored value is not a valid class. */}
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
                        className={`cell-input ${isFlagged('group', rows, 'allergens') ? 'cell-invalid' : ''}`}
                        value={resident.allergens.join(', ')}
                        onChange={(e) => onEdit(resident.key, 'allergens', e.target.value)}
                        placeholder="none"
                        aria-label={`Resident ${index + 1} allergen tags, comma separated`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="link-btn link-btn-danger"
                        onClick={() => onRemove(resident.key)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="row-tools">
          <button type="button" className="link-btn" onClick={onAdd}>
            Add resident
          </button>
          <span className="dish-meta">{group.length} in group</span>
        </div>
      </div>
    </section>
  );
}
