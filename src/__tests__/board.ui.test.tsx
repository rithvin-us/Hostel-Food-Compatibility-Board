/**
 * @vitest-environment jsdom
 *
 * The six required acceptance criteria, driven through the real UI rather than the
 * engine — clicking the same buttons and typing in the same boxes a jury would.
 * If this file is green, the screen behaves, not only the rules.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const setup = () => ({ user: userEvent.setup(), ...render(<App />) });

const check = () => screen.getByRole('button', { name: 'Check compatibility' });
const reset = () => screen.getByRole('button', { name: 'Reset' });
const budgetBox = () => screen.getByLabelText('Budget per person');
const searchBox = () => screen.getByLabelText('Search compatible dishes');

/** The verdict matrix, scoped so dish ids in the result panel do not collide. */
const matrix = () => within(screen.getByRole('table', { name: 'Verdict matrix' }));

/** The verdict row for a dish, found by its id cell inside the matrix. */
const rowFor = (id: string) => matrix().getByText(id).closest('tr')!;

describe('AC1 — one action loads the built-in board and shows two compatible dishes', () => {
  it('shows D01 and D02 as compatible and a count of 2', async () => {
    const { user } = setup();
    await user.click(check());

    expect(within(rowFor('D01')).getByText('● Compatible')).toBeTruthy();
    expect(within(rowFor('D02')).getByText('● Compatible')).toBeTruthy();
    expect(within(rowFor('D03')).getByText('○ Excluded')).toBeTruthy();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getByText('dishes everyone can eat')).toBeTruthy();
  });

  it('starts with nothing calculated', () => {
    setup();
    expect(screen.getByText('No result yet')).toBeTruthy();
  });
});

describe('AC2 — the screen prints the contracted exclusion reasons', () => {
  it('renders D03, D04 and D05 reasons verbatim', async () => {
    const { user } = setup();
    await user.click(check());

    expect(within(rowFor('D03')).getByText('DIET:ASHA')).toBeTruthy();
    expect(within(rowFor('D03')).getByText('ALLERGEN:MIRA:MILK')).toBeTruthy();
    expect(within(rowFor('D04')).getByText('ALLERGEN:DEV:PEANUT')).toBeTruthy();
    expect(within(rowFor('D05')).getAllByText('DIET:ASHA')).toHaveLength(1);
    expect(within(rowFor('D05')).getByText('DIET:DEV')).toBeTruthy();
  });

  it('marks D02 as sitting exactly on the ₹150 boundary', async () => {
    const { user } = setup();
    await user.click(check());
    expect(within(rowFor('D02')).getByText('= ₹150')).toBeTruthy();
  });
});

describe('AC3 — searching "wheat" narrows the display but not the count', () => {
  it('shows only D02 while the count stays at 2, then restores on clear', async () => {
    const { user } = setup();
    await user.click(check());

    await user.type(searchBox(), 'wheat');
    expect(screen.getByText(/Showing 1 of 2 for/)).toBeTruthy();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);

    await user.clear(searchBox());
    expect(screen.queryByText(/Showing/)).toBeNull();
  });

  it('never surfaces an excluded dish', async () => {
    const { user } = setup();
    await user.click(check());
    await user.type(searchBox(), 'peanut');
    expect(screen.getByText(/Nothing compatible matches/)).toBeTruthy();
  });
});

describe('AC4 — a ₹130 budget leaves only D01', () => {
  it('flags D02 as OVER_BUDGET and drops the count to 1', async () => {
    const { user } = setup();
    await user.clear(budgetBox());
    await user.type(budgetBox(), '130');
    await user.click(check());

    expect(within(rowFor('D01')).getByText('● Compatible')).toBeTruthy();
    expect(within(rowFor('D02')).getByText('OVER_BUDGET')).toBeTruthy();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('dish everyone can eat')).toBeTruthy();
  });
});

describe('AC5 — a D01 price of 0 reports INVALID_INPUT and clears the result', () => {
  it('names dishes / D01 / price and removes every verdict row', async () => {
    const { user } = setup();
    await user.click(check());
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);

    const price = screen.getByLabelText('Dish 1 price in rupees');
    await user.clear(price);
    await user.type(price, '0');
    await user.click(check());

    expect(screen.getByText('INVALID_INPUT')).toBeTruthy();
    expect(screen.getByText('dishes · D01 · price')).toBeTruthy();
    expect(screen.queryByText('● Compatible')).toBeNull();
    expect(screen.queryByText('dishes everyone can eat')).toBeNull();
  });

  it('reports DUPLICATE_DISH_ID when two dishes share an id', async () => {
    const { user } = setup();
    const id = screen.getByLabelText('Dish 5 ID');
    await user.clear(id);
    await user.type(id, 'D01');
    await user.click(check());

    expect(screen.getByText('DUPLICATE_DISH_ID')).toBeTruthy();
    expect(screen.queryByText('● Compatible')).toBeNull();
  });
});

describe('AC6 — reset returns a clean built-in board', () => {
  it('clears the error, restores ₹150 and the empty search, and shows no stale result', async () => {
    const { user } = setup();

    const price = screen.getByLabelText('Dish 1 price in rupees');
    await user.clear(price);
    await user.type(price, '0');
    await user.click(check());
    expect(screen.getByText('INVALID_INPUT')).toBeTruthy();

    await user.click(reset());

    expect(screen.queryByText('INVALID_INPUT')).toBeNull();
    expect(screen.getByText('No result yet')).toBeTruthy();
    expect((budgetBox() as HTMLInputElement).value).toBe('150');
    expect((screen.getByLabelText('Dish 1 price in rupees') as HTMLInputElement).value).toBe('110');

    await user.click(check());
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect((searchBox() as HTMLInputElement).value).toBe('');
  });

  it('clears the search box too', async () => {
    const { user } = setup();
    await user.click(check());
    await user.type(searchBox(), 'wheat');
    await user.click(reset());
    await user.click(check());
    expect((searchBox() as HTMLInputElement).value).toBe('');
  });
});

describe('screen stays synchronized with the inputs', () => {
  it('discards a calculated result as soon as any row is edited', async () => {
    const { user } = setup();
    await user.click(check());
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Resident 1 name'), 'x');

    expect(screen.getByText('No result yet')).toBeTruthy();
    expect(screen.queryByText('dishes everyone can eat')).toBeNull();
  });

  it('discards a calculated result when the budget changes', async () => {
    const { user } = setup();
    await user.click(check());
    await user.type(budgetBox(), '0');
    expect(screen.getByText('No result yet')).toBeTruthy();
  });

  it('keeps the result when only the search box changes', async () => {
    const { user } = setup();
    await user.click(check());
    await user.type(searchBox(), 'w');
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });
});

describe('optional evidence chips', () => {
  it('labels each dish row with its diet, allergen and budget outcome', async () => {
    const { user } = setup();
    await user.click(check());

    // D01 and D02 both pass every check; D03 fails diet and allergens but not budget.
    expect(screen.getAllByLabelText('diet passed, allergens passed, budget passed')).toHaveLength(2);
    expect(screen.getByLabelText('diet failed, allergens failed, budget passed')).toBeTruthy();
  });
});
