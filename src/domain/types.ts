/**
 * Contract types for SI26_P02.
 *
 * Everything in `src/domain` is pure: no React, no DOM, no I/O, no side effects.
 * The rules in this folder ARE the problem statement. The UI only renders them.
 */

/** Valid diet classes. NO_RESTRICTION is valid for residents only, never for a dish. */
export const DIET_CLASSES = ['VEGAN', 'VEGETARIAN', 'NON_VEGETARIAN', 'NO_RESTRICTION'] as const;
export type DietClass = (typeof DIET_CLASSES)[number];

/** Dish classes exclude NO_RESTRICTION — a dish cannot be "unrestricted". */
export const DISH_DIET_CLASSES = ['VEGAN', 'VEGETARIAN', 'NON_VEGETARIAN'] as const;
export type DishDietClass = (typeof DISH_DIET_CLASSES)[number];

/**
 * Rows as the user typed them. Free-form strings so the tables can hold
 * invalid input long enough for us to report a precise field error.
 */
export interface ResidentInput {
  /** Stable key for React lists. Not part of the contract. */
  key: string;
  name: string;
  diet: string;
  /** Comma-separated in the UI; already split by the time it reaches here. */
  allergens: string[];
}

export interface DishInput {
  key: string;
  id: string;
  cafe: string;
  name: string;
  diet: string;
  tags: string[];
  /** String because the input may be blank, fractional, or non-numeric. */
  price: string;
}

/** A resident after trim + uppercase normalization and validation. */
export interface Resident {
  name: string;
  diet: DietClass;
  allergens: string[];
}

/** A dish after trim + uppercase normalization and validation. */
export interface Dish {
  id: string;
  cafe: string;
  name: string;
  diet: DishDietClass;
  tags: string[];
  /** Positive whole rupees. */
  price: number;
}

/**
 * Exclusion reasons, in exactly the forms the problem statement contracts.
 * These strings are output, not copy — never reword them.
 */
export type Reason = `DIET:${string}` | `ALLERGEN:${string}:${string}` | 'OVER_BUDGET';

/** Per-resident evidence for one dish. Precomputed so the matrix never re-runs rules in render. */
export interface ResidentCell {
  resident: string;
  dietOk: boolean;
  /** Matched allergen tags, in the dish's ingredient-tag order. */
  allergenHits: string[];
}

export interface DishVerdict {
  dish: Dish;
  compatible: boolean;
  /** Empty when compatible. Otherwise ordered per the contract. */
  reasons: Reason[];
  cells: ResidentCell[];
  budgetOk: boolean;
}

export type ErrorCode = 'INVALID_INPUT' | 'DUPLICATE_DISH_ID';
export type TableName = 'group' | 'dishes' | 'budget';

/** A validation failure, pinned to the table, row and field the user must fix. */
export interface FieldError {
  code: ErrorCode;
  table: TableName;
  /** Dish id, resident name, or a positional label like "row 2" when the identifier itself is blank. */
  row: string;
  field: string;
  message: string;
}

export type Report =
  | {
      status: 'OK';
      /** Every dish, in source order, compatible or not. */
      verdicts: DishVerdict[];
      /** Compatible dishes only, source order preserved. */
      compatible: DishVerdict[];
      /**
       * Count of the UNFILTERED compatible result. The search box must never change this.
       * Stored at evaluate time precisely so it cannot be recomputed from a filtered list.
       */
      compatibleCount: number;
      budget: number;
    }
  | {
      status: ErrorCode;
      errors: FieldError[];
    };
