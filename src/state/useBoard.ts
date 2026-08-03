import { useCallback, useMemo, useReducer } from 'react';
import { evaluate } from '../domain/compatibility';
import { builtInDishes, builtInGroup, DEFAULT_BUDGET } from '../domain/fixtures';
import { filterCompatible } from '../domain/search';
import type { DishInput, FieldError, Report, ResidentInput } from '../domain/types';

export interface BoardState {
  group: ResidentInput[];
  dishes: DishInput[];
  budget: string;
  query: string;
  /**
   * null until a check is run, and reset to null by ANY edit to the inputs.
   * This is what keeps the screen synchronized: the board can never display a
   * result that does not correspond to the rows currently on screen.
   */
  report: Report | null;
}

type Action =
  | { type: 'editResident'; key: string; field: keyof ResidentInput; value: string }
  | { type: 'editDish'; key: string; field: keyof DishInput; value: string }
  | { type: 'addResident' }
  | { type: 'removeResident'; key: string }
  | { type: 'addDish' }
  | { type: 'removeDish'; key: string }
  | { type: 'setBudget'; value: string }
  | { type: 'setQuery'; value: string }
  | { type: 'check' }
  | { type: 'loadSample' }
  | { type: 'reset' };

function initialState(): BoardState {
  return {
    group: builtInGroup(),
    dishes: builtInDishes(),
    budget: DEFAULT_BUDGET,
    query: '',
    report: null,
  };
}

let nextKey = 100;
const newKey = () => `k${nextKey++}`;

/** Every input edit funnels through here, so invalidation can never be forgotten. */
function edited(state: BoardState, patch: Partial<BoardState>): BoardState {
  return { ...state, ...patch, report: null };
}

function reducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'editResident':
      return edited(state, {
        group: state.group.map((r) =>
          r.key !== action.key
            ? r
            : action.field === 'allergens'
              ? { ...r, allergens: splitCommaList(action.value.toUpperCase()) }
              : { ...r, [action.field]: action.value.toUpperCase() },
        ),
      });

    case 'editDish':
      return edited(state, {
        dishes: state.dishes.map((d) =>
          d.key !== action.key
            ? d
            : action.field === 'tags'
              ? { ...d, tags: splitCommaList(action.value.toUpperCase()) }
              : { ...d, [action.field]: action.value.toUpperCase() },
        ),
      });

    case 'addResident': {
      let nextName = `RESIDENT ${state.group.length + 1}`;
      const last = state.group.length > 0 ? state.group[state.group.length - 1] : undefined;
      if (last) {
        const match = last.name.match(/(\d+)$/);
        if (match && match[1]) {
          nextName = `RESIDENT ${parseInt(match[1], 10) + 1}`;
        }
      }
      return edited(state, {
        group: [...state.group, { key: newKey(), name: nextName, diet: 'VEGETARIAN', allergens: [] }],
      });
    }

    case 'removeResident':
      return edited(state, { group: state.group.filter((r) => r.key !== action.key) });

    case 'addDish': {
      let nextId = `D${(state.dishes.length + 1).toString().padStart(2, '0')}`;
      const last = state.dishes.length > 0 ? state.dishes[state.dishes.length - 1] : undefined;
      if (last) {
        const match = last.id.match(/^D(\d+)$/);
        if (match && match[1]) {
          nextId = `D${(parseInt(match[1], 10) + 1).toString().padStart(2, '0')}`;
        }
      }
      return edited(state, {
        dishes: [
          ...state.dishes,
          { key: newKey(), id: nextId, cafe: 'NEW CAFE', name: 'NEW DISH', diet: 'VEGAN', tags: [], price: '0' },
        ],
      });
    }

    case 'removeDish':
      return edited(state, { dishes: state.dishes.filter((d) => d.key !== action.key) });

    case 'setBudget':
      return edited(state, { budget: action.value });

    // The search box is NOT an input edit — it never invalidates the report,
    // because filtering is applied to an already-calculated compatible result.
    case 'setQuery':
      return { ...state, query: action.value.toUpperCase() };

    case 'check':
      return { ...state, report: evaluate(state.group, state.dishes, state.budget) };

    case 'loadSample':
      return { ...state, group: builtInGroup(), dishes: builtInDishes(), budget: DEFAULT_BUDGET, report: null };

    // Contract: "Reset restores the valid built-in group, dishes, ₹150 budget, and
    // empty search, then clears validation and calculated output."
    case 'reset':
      return initialState();
  }
}

/**
 * A raw comma list keeps empty segments ("WHEAT,,TOMATO" -> three entries, one blank)
 * so validation can report the blank tag instead of silently swallowing it.
 * Normalization to uppercase happens in the domain, not here.
 */
function splitCommaList(raw: string): string[] {
  return raw.trim() === '' ? [] : raw.split(',');
}

/** A lookup key for "is this exact field flagged?", used to outline bad cells. */
export function fieldKey(table: string, row: string, field: string): string {
  return `${table}|${row}|${field}`;
}

export function useBoard() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const errors: FieldError[] = state.report && state.report.status !== 'OK' ? state.report.errors : [];

  /** Set of flagged fields, plus the positional fallbacks used when a row id is blank. */
  const flagged = useMemo(() => {
    const set = new Set<string>();
    for (const e of errors) set.add(fieldKey(e.table, e.row, e.field));
    return set;
  }, [errors]);

  const filtered = useMemo(() => {
    if (!state.report || state.report.status !== 'OK') return [];
    return filterCompatible(state.report.compatible, state.query);
  }, [state.report, state.query]);

  const actions = useMemo(
    () => ({
      editResident: (key: string, field: keyof ResidentInput, value: string) =>
        dispatch({ type: 'editResident', key, field, value }),
      editDish: (key: string, field: keyof DishInput, value: string) =>
        dispatch({ type: 'editDish', key, field, value }),
      addResident: () => dispatch({ type: 'addResident' }),
      removeResident: (key: string) => dispatch({ type: 'removeResident', key }),
      addDish: () => dispatch({ type: 'addDish' }),
      removeDish: (key: string) => dispatch({ type: 'removeDish', key }),
      setBudget: (value: string) => dispatch({ type: 'setBudget', value }),
      setQuery: (value: string) => dispatch({ type: 'setQuery', value }),
      check: () => dispatch({ type: 'check' }),
      loadSample: () => dispatch({ type: 'loadSample' }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  );

  const isFlagged = useCallback(
    (table: string, rows: string[], field: string) =>
      rows.some((row) => flagged.has(fieldKey(table, row, field))),
    [flagged],
  );

  return { state, actions, errors, filtered, isFlagged };
}
