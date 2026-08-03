import type { DishInput, ResidentInput } from './types';

/** Contract: the built-in group carries a per-person budget of ₹150. */
export const DEFAULT_BUDGET = '150';

/**
 * The built-in group, in the order printed in the problem statement.
 * Resident order is contractual: it drives the order of DIET/ALLERGEN reasons.
 */
export const BUILT_IN_GROUP: ResidentInput[] = [
  { key: 'r1', name: 'ASHA', diet: 'VEGAN', allergens: [] },
  { key: 'r2', name: 'DEV', diet: 'VEGETARIAN', allergens: ['PEANUT'] },
  { key: 'r3', name: 'MIRA', diet: 'NO_RESTRICTION', allergens: ['MILK'] },
];

/**
 * The built-in dishes, in the shown source order.
 * Dish order is contractual: the compatible result must preserve it.
 */
export const BUILT_IN_DISHES: DishInput[] = [
  {
    key: 'd1',
    id: 'D01',
    cafe: 'HOSTEL CAFE',
    name: 'LENTIL RICE BOWL',
    diet: 'VEGAN',
    tags: ['LENTIL', 'RICE', 'SPINACH'],
    price: '110',
  },
  {
    key: 'd2',
    id: 'D02',
    cafe: 'LIBRARY CAFE',
    name: 'TOMATO PASTA',
    diet: 'VEGAN',
    tags: ['WHEAT', 'TOMATO'],
    price: '150',
  },
  {
    key: 'd3',
    id: 'D03',
    cafe: 'HOSTEL CAFE',
    name: 'PANEER WRAP',
    diet: 'VEGETARIAN',
    tags: ['MILK', 'WHEAT'],
    price: '140',
  },
  {
    key: 'd4',
    id: 'D04',
    cafe: 'EAST CAFE',
    name: 'PEANUT NOODLES',
    diet: 'VEGAN',
    tags: ['PEANUT', 'WHEAT'],
    price: '130',
  },
  {
    key: 'd5',
    id: 'D05',
    cafe: 'LIBRARY CAFE',
    name: 'EGG SANDWICH',
    diet: 'NON_VEGETARIAN',
    tags: ['EGG', 'WHEAT'],
    price: '100',
  },
];

/** Deep copies, so editing the board can never mutate the reset target. */
export function builtInGroup(): ResidentInput[] {
  return BUILT_IN_GROUP.map((r) => ({ ...r, allergens: [...r.allergens] }));
}

export function builtInDishes(): DishInput[] {
  return BUILT_IN_DISHES.map((d) => ({ ...d, tags: [...d.tags] }));
}
