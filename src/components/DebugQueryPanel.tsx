import { useState } from 'react';
import type { DishInput, ResidentInput } from '../domain/types';

interface Props {
  group: ResidentInput[];
  dishes: DishInput[];
  budget: string;
}

/**
 * Not a real query — the board never touches a database. This mirrors the
 * two input tables and the rule engine's own logic (dietAccepts / allergenHits
 * / withinBudget in domain/rules.ts) as SQL, so a dev chasing a wrong verdict
 * has something runnable to check the reasoning against. Collapsed by
 * default: it's a debug aid, not something a resident checking dinner needs
 * to see.
 */
export function DebugQueryPanel({ group, dishes, budget }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="debug-panel">
      <button
        type="button"
        className="debug-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? 'Hide query' : 'Show query'}
      </button>

      {open && (
        <pre className="debug-sql">
          <code>{buildDebugSql(group, dishes, budget)}</code>
        </pre>
      )}
    </div>
  );
}

function sqlStr(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function residentsTableSql(group: ResidentInput[]): string {
  const rows = group.map(
    (r) => `  (${sqlStr(r.name)}, ${sqlStr(r.diet)}, ${sqlStr(r.allergens.join(','))})`,
  );

  return [
    'CREATE TABLE residents (',
    '  name TEXT,',
    '  diet TEXT,',
    '  allergens TEXT -- comma-separated',
    ');',
    '',
    'INSERT INTO residents (name, diet, allergens) VALUES',
    rows.length > 0 ? `${rows.join(',\n')};` : '  -- no residents yet',
  ].join('\n');
}

function dishesTableSql(dishes: DishInput[]): string {
  const rows = dishes.map(
    (d) =>
      `  (${sqlStr(d.id)}, ${sqlStr(d.cafe)}, ${sqlStr(d.name)}, ${sqlStr(d.diet)}, ${sqlStr(
        d.tags.join(','),
      )}, ${d.price || 'NULL'})`,
  );

  return [
    'CREATE TABLE dishes (',
    '  id TEXT,',
    '  cafe TEXT,',
    '  name TEXT,',
    '  diet TEXT,',
    '  tags TEXT, -- comma-separated',
    '  price INTEGER',
    ');',
    '',
    'INSERT INTO dishes (id, cafe, name, diet, tags, price) VALUES',
    rows.length > 0 ? `${rows.join(',\n')};` : '  -- no dishes yet',
  ].join('\n');
}

function compatibilitySelectSql(budget: string): string {
  return [
    '-- Mirrors judgeDish() in domain/compatibility.ts:',
    '-- a dish is compatible when no resident fails diet or allergen, and price <= budget.',
    'SELECT d.id, d.name, d.cafe, d.price',
    'FROM dishes d',
    `WHERE d.price <= ${budget || 'NULL'}`,
    '  AND NOT EXISTS (',
    '    SELECT 1 FROM residents r',
    "    WHERE (r.diet = 'VEGAN' AND d.diet <> 'VEGAN')",
    "       OR (r.diet = 'VEGETARIAN' AND d.diet = 'NON_VEGETARIAN')",
    '  )',
    '  AND NOT EXISTS (',
    '    SELECT 1 FROM residents r',
    '    WHERE EXISTS (',
    "      SELECT 1 FROM UNNEST(string_to_array(d.tags, ',')) AS tag",
    "      WHERE tag IN (SELECT UNNEST(string_to_array(r.allergens, ',')))",
    '    )',
    '  );',
  ].join('\n');
}

function buildDebugSql(group: ResidentInput[], dishes: DishInput[], budget: string): string {
  return [
    '-- residents (group table)',
    residentsTableSql(group),
    '',
    '-- dishes (food items table)',
    dishesTableSql(dishes),
    '',
    '-- compatibility check for the current budget',
    compatibilitySelectSql(budget),
  ].join('\n');
}
