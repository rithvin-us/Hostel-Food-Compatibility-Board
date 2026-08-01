import { builtInDishes, builtInGroup, DEFAULT_BUDGET } from '../fixtures';
import { evaluate } from '../compatibility';
import type { DishInput, Report, ResidentInput } from '../types';

/** Run the engine over the built-in board with optional per-test tweaks. */
export function run(
  opts: {
    group?: ResidentInput[];
    dishes?: DishInput[];
    budget?: string;
  } = {},
): Report {
  return evaluate(
    opts.group ?? builtInGroup(),
    opts.dishes ?? builtInDishes(),
    opts.budget ?? DEFAULT_BUDGET,
  );
}

/** Narrow a report to OK, failing loudly if it is not. */
export function ok(report: Report) {
  if (report.status !== 'OK') {
    throw new Error(`expected OK report, got ${report.status}: ${JSON.stringify(report.errors)}`);
  }
  return report;
}

/** Narrow a report to an error, failing loudly if it is not. */
export function err(report: Report) {
  if (report.status === 'OK') {
    throw new Error('expected an error report, got OK');
  }
  return report;
}

export function ids(report: Report): string[] {
  return ok(report).compatible.map((v) => v.dish.id);
}

/** Reasons for one dish id, from a successful report. */
export function reasonsFor(report: Report, dishId: string): string[] {
  const verdict = ok(report).verdicts.find((v) => v.dish.id === dishId);
  if (!verdict) throw new Error(`no verdict for ${dishId}`);
  return verdict.reasons;
}

/** Copy the built-in dishes with one field of one dish replaced. */
export function dishesWith(id: string, patch: Partial<DishInput>): DishInput[] {
  return builtInDishes().map((d) => (d.id === id ? { ...d, ...patch } : d));
}

/** Copy the built-in group with one field of one resident replaced. */
export function groupWith(name: string, patch: Partial<ResidentInput>): ResidentInput[] {
  return builtInGroup().map((r) => (r.name === name ? { ...r, ...patch } : r));
}
