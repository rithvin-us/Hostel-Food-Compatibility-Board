import { isDietClass, isDishDietClass, normalizeName, normalizeTag, parseWholeRupees } from './normalize';
import type { Dish, DishInput, FieldError, Resident, ResidentInput } from './types';

export interface ValidationResult {
  errors: FieldError[];
  /** Only populated when `errors` is empty. */
  residents: Resident[];
  dishes: Dish[];
  budget: number;
}

function invalid(table: FieldError['table'], row: string, field: string, message: string): FieldError {
  return { code: 'INVALID_INPUT', table, row, field, message };
}

/**
 * Validates the budget, the group table and the dish table, collecting EVERY error
 * rather than stopping at the first — the user should be able to fix the whole form
 * in one pass.
 *
 * Contract: "Resident names, dish IDs, cafe names, dish names, and ingredient tags
 * must be non-empty after trimming; dish IDs must be unique; the budget and every
 * dish price must be positive whole rupee values."
 */
export function validate(
  residentInputs: ResidentInput[],
  dishInputs: DishInput[],
  budgetInput: string,
): ValidationResult {
  const errors: FieldError[] = [];

  // ---- Budget -------------------------------------------------------------
  const budget = parseWholeRupees(budgetInput);
  if (budget === null) {
    errors.push(
      invalid('budget', 'group budget', 'budget', 'Budget must be a positive whole rupee amount.'),
    );
  }

  // ---- Group table --------------------------------------------------------
  // The PS assumes a group exists; an empty group would make "compatible for every
  // resident" vacuously true for every dish, which is not a useful answer.
  if (residentInputs.length === 0) {
    errors.push(invalid('group', 'group', 'residents', 'Add at least one resident.'));
  }

  const residents: Resident[] = [];
  residentInputs.forEach((input, index) => {
    // Fall back to a positional label so a blank name still points at a row.
    const name = normalizeName(input.name);
    const row = name === '' ? `row ${index + 1}` : name;

    if (name === '') {
      errors.push(invalid('group', row, 'name', 'Resident name must not be empty.'));
    }

    const diet = normalizeTag(input.diet);
    if (!isDietClass(diet)) {
      errors.push(
        invalid(
          'group',
          row,
          'diet',
          'Diet must be VEGAN, VEGETARIAN, NON_VEGETARIAN or NO_RESTRICTION.',
        ),
      );
    }

    const allergens = input.allergens.map(normalizeTag);
    if (allergens.some((tag) => tag === '')) {
      errors.push(invalid('group', row, 'allergens', 'Allergen tags must not be empty.'));
    }

    if (name !== '' && isDietClass(diet) && !allergens.some((t) => t === '')) {
      residents.push({ name, diet, allergens });
    }
  });

  // ---- Dish table ---------------------------------------------------------
  if (dishInputs.length === 0) {
    errors.push(invalid('dishes', 'dishes', 'dishes', 'Add at least one dish.'));
  }

  const dishes: Dish[] = [];
  const seenIds = new Set<string>();

  dishInputs.forEach((input, index) => {
    // Dish IDs are identifiers, so they normalize like tags (trim + uppercase).
    const id = normalizeTag(input.id);
    const row = id === '' ? `row ${index + 1}` : id;
    let rowOk = true;

    if (id === '') {
      errors.push(invalid('dishes', row, 'id', 'Dish ID must not be empty.'));
      rowOk = false;
    } else if (seenIds.has(id)) {
      // Contract: duplicates report DUPLICATE_DISH_ID, not INVALID_INPUT.
      errors.push({
        code: 'DUPLICATE_DISH_ID',
        table: 'dishes',
        row,
        field: 'id',
        message: `Dish ID ${id} is used more than once.`,
      });
      rowOk = false;
    } else {
      seenIds.add(id);
    }

    const cafe = normalizeName(input.cafe);
    if (cafe === '') {
      errors.push(invalid('dishes', row, 'cafe', 'Cafe name must not be empty.'));
      rowOk = false;
    }

    const name = normalizeName(input.name);
    if (name === '') {
      errors.push(invalid('dishes', row, 'name', 'Dish name must not be empty.'));
      rowOk = false;
    }

    const diet = normalizeTag(input.diet);
    if (!isDishDietClass(diet)) {
      // NO_RESTRICTION lands here on purpose: it is a resident-only class.
      errors.push(
        invalid('dishes', row, 'diet', 'Dish diet must be VEGAN, VEGETARIAN or NON_VEGETARIAN.'),
      );
      rowOk = false;
    }

    const tags = input.tags.map(normalizeTag);
    if (tags.length === 0) {
      errors.push(invalid('dishes', row, 'tags', 'A dish needs at least one ingredient tag.'));
      rowOk = false;
    } else if (tags.some((tag) => tag === '')) {
      errors.push(invalid('dishes', row, 'tags', 'Ingredient tags must not be empty.'));
      rowOk = false;
    }

    const price = parseWholeRupees(input.price);
    if (price === null) {
      errors.push(invalid('dishes', row, 'price', 'Price must be a positive whole rupee amount.'));
      rowOk = false;
    }

    if (rowOk && isDishDietClass(diet) && price !== null) {
      dishes.push({ id, cafe, name, diet, tags, price });
    }
  });

  return { errors, residents, dishes, budget: budget ?? 0 };
}
