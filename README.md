# Hostel Food Compatibility Board

**Live:** [hostel-food-compatibility-board.vercel.app](https://hostel-food-compatibility-board.vercel.app)

![Design-System-Unified Analytics](./screenshots/image%20copy%202.png)

Pick one dish a group of hostel residents can all eat — applying their diets, allergen exclusions and
a per-person budget to dishes from nearby campus cafes — and show the exact reason every other dish
was excluded.

Built for Cisco AI-assisted coding problem **SI26_P02**.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm test              # 128 tests
npm run build         # static output in dist/
npm run preview       # serve the production build
```

No backend, no database, no network calls. The built output is static files.

## Using it

The board loads with the built-in group and dish list. Edit any cell directly, then **Check
compatibility**.

- **Analytics** — a Group Harmony meter, a per-dish Compatibility Spectrum, an exclusion
  root-cause breakdown, and ranked resident constraints, all above the matrix.
- **Verdict** — every dish against every resident, plus budget. A failing cell shows the exclusion
  code itself. The three-track bar on the left of each row is diet / allergen / budget, so failures
  can be scanned without reading.
- **Result** — how many dishes work for everyone, and which. The search box narrows what's displayed;
  it never changes the count, and it only ever sees compatible dishes.
- **Load sample** restores the built-in rows. **Reset** does that and also clears the search and any
  calculated result.

Editing any input clears the current result, so the screen never shows a verdict that doesn't match
the rows on it.

## Sample data

Built in, from the problem statement. Group budget ₹150 per person.

| Resident | Diet | Allergens |
| --- | --- | --- |
| Asha | VEGAN | — |
| Dev | VEGETARIAN | PEANUT |
| Mira | NO_RESTRICTION | MILK |

| ID | Cafe | Dish | Class | Ingredients | ₹ |
| --- | --- | --- | --- | --- | --- |
| D01 | Hostel Cafe | Lentil Rice Bowl | VEGAN | LENTIL, RICE, SPINACH | 110 |
| D02 | Library Cafe | Tomato Pasta | VEGAN | WHEAT, TOMATO | 150 |
| D03 | Hostel Cafe | Paneer Wrap | VEGETARIAN | MILK, WHEAT | 140 |
| D04 | East Cafe | Peanut Noodles | VEGAN | PEANUT, WHEAT | 130 |
| D05 | Library Cafe | Egg Sandwich | NON_VEGETARIAN | EGG, WHEAT | 100 |

Expected result: **D01 and D02**, count 2.
Exclusions: D03 `DIET:Asha, ALLERGEN:Mira:MILK` · D04 `ALLERGEN:Dev:PEANUT` · D05 `DIET:Asha, DIET:Dev`.

## Constraints & Edge Cases

The domain engine strictly enforces the following rules and edge cases (see `docs/DESIGN.md` for full details):
1. **Separation of Concerns:** `src/domain` is pure TypeScript with zero React imports. The business logic contract is fully isolated from the UI.
2. **Strict Invalidation:** The compatibility count is frozen at evaluation time. Any edit to a resident, dish, or budget immediately clears the current result to prevent the screen from ever displaying a stale verdict.
3. **Domain Assumptions:**
   - A `NON_VEGETARIAN` resident accepts every dish class.
   - Duplicated ingredient tags on a dish only yield a single allergen violation.
   - A dish must have at least one ingredient, and a group must have at least one resident.
   - Duplicate resident names are permitted; only Dish IDs must be strictly unique.

## Layout

```
src/
  domain/                 the contract. pure TypeScript, zero React imports.
    types.ts                Resident, Dish, Reason, DishVerdict, Report
    normalize.ts             trim + uppercase, rupee parsing
    rules.ts                 diet, allergen and budget predicates
    validate.ts               INVALID_INPUT and DUPLICATE_DISH_ID
    compatibility.ts          judgeDish + evaluate — reason ordering lives here
    search.ts                 filter compatible dishes by query
    analytics.ts              harmony score, root-cause breakdown, resident friction, unlocker
    fixtures.ts                the built-in group, dishes and ₹150 budget
  state/                   one useReducer
  components/              render what the domain returned. no rules.
  styles/                  tokens + stylesheet
docs/
  plan.md                    presentation plan and demo runbook
  PROMPT_LIBRARY.md          the prompts used, and why they worked
  DESIGN.md                  architecture, trade-offs, assumptions
  TEST_EVIDENCE.md           test plan and full edge-case list
```

## Deploy

Static site, deployed on Vercel from `main`: **https://hostel-food-compatibility-board.vercel.app**
The framework preset is detected from `vercel.json`; every push to `main` redeploys automatically
(see `.github/workflows/ci.yml` for the checks that run alongside it).

```bash
npm run build     # -> dist/
```

## License

MIT — see [LICENSE](./LICENSE).
