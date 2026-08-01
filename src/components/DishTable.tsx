import { DISH_DIET_CLASSES } from '../domain/types';
import type { DishInput } from '../domain/types';

interface Props {
  dishes: DishInput[];
  budget: string;
  onEdit: (key: string, field: keyof DishInput, value: string) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  isFlagged: (table: string, rows: string[], field: string) => boolean;
}

/**
 * The dish table, edited in place. Source order is contractual — the compatible
 * result must preserve it — so rows are never sorted.
 *
 * The diet selector offers only VEGAN / VEGETARIAN / NON_VEGETARIAN. NO_RESTRICTION
 * is deliberately absent: it is a resident-only class.
 */
export function DishTable({ dishes, budget, onEdit, onAdd, onRemove, isFlagged }: Props) {
  const budgetValue = Number(budget);

  return (
    <section className="section" aria-labelledby="dishes-heading">
      <div className="section-head">
        <h2 className="section-title" id="dishes-heading">
          Dishes
        </h2>
        <p className="section-note">Source order is preserved in the result.</p>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Cafe</th>
                <th scope="col">Dish</th>
                <th scope="col">Class</th>
                <th scope="col">Ingredient tags</th>
                <th scope="col">₹</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish, index) => {
                const rows = [dish.id.trim().toUpperCase(), `row ${index + 1}`];
                const price = Number(dish.price);
                const overBudget =
                  Number.isFinite(price) && Number.isFinite(budgetValue) && price > budgetValue;

                return (
                  <tr key={dish.key}>
                    <td>
                      <input
                        className={`cell-input ${isFlagged('dishes', rows, 'id') ? 'cell-invalid' : ''}`}
                        value={dish.id}
                        onChange={(e) => onEdit(dish.key, 'id', e.target.value)}
                        aria-label={`Dish ${index + 1} ID`}
                        size={5}
                      />
                    </td>
                    <td>
                      <input
                        className={`cell-input ${isFlagged('dishes', rows, 'cafe') ? 'cell-invalid' : ''}`}
                        value={dish.cafe}
                        onChange={(e) => onEdit(dish.key, 'cafe', e.target.value)}
                        aria-label={`Dish ${index + 1} cafe`}
                      />
                    </td>
                    <td>
                      <input
                        className={`cell-input ${isFlagged('dishes', rows, 'name') ? 'cell-invalid' : ''}`}
                        value={dish.name}
                        onChange={(e) => onEdit(dish.key, 'name', e.target.value)}
                        aria-label={`Dish ${index + 1} name`}
                      />
                    </td>
                    <td>
                      <select
                        className={`cell-input ${isFlagged('dishes', rows, 'diet') ? 'cell-invalid' : ''}`}
                        value={
                          DISH_DIET_CLASSES.includes(dish.diet.trim().toUpperCase() as never)
                            ? dish.diet.trim().toUpperCase()
                            : ''
                        }
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
                      <input
                        className={`cell-input ${isFlagged('dishes', rows, 'tags') ? 'cell-invalid' : ''}`}
                        value={dish.tags.join(', ')}
                        onChange={(e) => onEdit(dish.key, 'tags', e.target.value)}
                        aria-label={`Dish ${index + 1} ingredient tags, comma separated`}
                      />
                    </td>
                    <td>
                      <input
                        className={`cell-input cell-input-num ${
                          isFlagged('dishes', rows, 'price') ? 'cell-invalid' : ''
                        }`}
                        value={dish.price}
                        onChange={(e) => onEdit(dish.key, 'price', e.target.value)}
                        aria-label={`Dish ${index + 1} price in rupees`}
                        size={4}
                        inputMode="numeric"
                        style={overBudget ? { color: 'var(--over)' } : undefined}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="link-btn link-btn-danger"
                        onClick={() => onRemove(dish.key)}
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
            Add dish
          </button>
          <span className="dish-meta">{dishes.length} dishes · budget ₹{budget || '—'} per person</span>
        </div>
      </div>
    </section>
  );
}
