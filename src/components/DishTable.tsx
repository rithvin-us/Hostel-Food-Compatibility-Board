import { DISH_DIET_CLASSES } from '../domain/types';
import type { DishInput } from '../domain/types';
import { TagInput } from './TagInput';

interface Props {
  dishes: DishInput[];
  onEdit: (key: string, field: keyof DishInput, value: string) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  isFlagged: (table: string, rows: string[], field: string) => boolean;
}

const validDiet = (value: string) =>
  (DISH_DIET_CLASSES as readonly string[]).includes(value.trim().toUpperCase())
    ? value.trim().toUpperCase()
    : '';

/**
 * Dish source order is preserved in the result, so rows are never sorted.
 * The class selector omits NO_RESTRICTION: it is a resident-only class.
 */
export function DishTable({ dishes, onEdit, onAdd, onRemove, isFlagged }: Props) {
  return (
    <div className="inputs-pane">
      <div className="pane-head">
        <h2 className="pane-title">Dishes</h2>
        <span className="pane-count">{dishes.length}</span>
      </div>

      <div className="pane-body">
        <table className="table" aria-label="Dishes">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '30px' }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Cafe</th>
              <th scope="col">Dish</th>
              <th scope="col">Class</th>
              <th scope="col">Ingredients</th>
              <th scope="col" className="th-num">
                Price (₹)
              </th>
              <th scope="col">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => {
              const rows = [dish.id.trim().toUpperCase(), `row ${index + 1}`];
              const label = dish.name.trim() || dish.id.trim() || `row ${index + 1}`;

              return (
                <tr key={dish.key}>
                  <td>
                    <input
                      className={`cell cell-mono ${
                        isFlagged('dishes', rows, 'id') ? 'is-invalid' : ''
                      }`}
                      value={dish.id}
                      onChange={(e) => onEdit(dish.key, 'id', e.target.value)}
                      aria-label={`Dish ${index + 1} ID`}
                    />
                  </td>
                  <td>
                    <input
                      className={`cell ${isFlagged('dishes', rows, 'cafe') ? 'is-invalid' : ''}`}
                      value={dish.cafe}
                      onChange={(e) => onEdit(dish.key, 'cafe', e.target.value)}
                      aria-label={`Dish ${index + 1} cafe`}
                    />
                  </td>
                  <td>
                    <input
                      className={`cell ${isFlagged('dishes', rows, 'name') ? 'is-invalid' : ''}`}
                      value={dish.name}
                      onChange={(e) => onEdit(dish.key, 'name', e.target.value)}
                      aria-label={`Dish ${index + 1} name`}
                    />
                  </td>
                  <td>
                    <select
                      className={`cell cell-select ${
                        isFlagged('dishes', rows, 'diet') ? 'is-invalid' : ''
                      }`}
                      value={validDiet(dish.diet)}
                      onChange={(e) => onEdit(dish.key, 'diet', e.target.value)}
                      aria-label={`Dish ${index + 1} diet class`}
                    >
                      <option value="">—</option>
                      {DISH_DIET_CLASSES.map((diet) => (
                        <option key={diet} value={diet}>
                          {diet}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <TagInput
                      values={dish.tags}
                      onChange={(value) => onEdit(dish.key, 'tags', value)}
                      invalid={isFlagged('dishes', rows, 'tags')}
                      ariaLabel={`Dish ${index + 1} ingredient tags`}
                    />
                  </td>
                  <td>
                    <input
                      className={`cell cell-num ${
                        isFlagged('dishes', rows, 'price') ? 'is-invalid' : ''
                      }`}
                      value={dish.price}
                      onChange={(e) => onEdit(dish.key, 'price', e.target.value)}
                      aria-label={`Dish ${index + 1} price in rupees`}
                      inputMode="numeric"
                    />
                  </td>
                  <td className="td-action">
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => onRemove(dish.key)}
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
          Add dish
        </button>
      </div>
    </div>
  );
}
