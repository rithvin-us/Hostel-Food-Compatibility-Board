# Test evidence

```
npm test
```

```
 ✓ src/domain/__tests__/search.test.ts        (14 tests)
 ✓ src/domain/__tests__/acceptance.test.ts    (21 tests)
 ✓ src/domain/__tests__/validate.test.ts      (31 tests)
 ✓ src/domain/__tests__/compatibility.test.ts (42 tests)
 ✓ src/__tests__/board.ui.test.tsx            (15 tests)

 Test Files  5 passed (5)
      Tests  123 passed (123)
```

## Test plan

Two layers, deliberately.

**Domain tests** (108) run in Node against the pure engine. Fast, and they assert exact arrays —
reason *order* is contractual, so a substring match would let a wrong ordering pass.

**UI tests** (15) drive the real components with Testing Library: clicking the same buttons and
typing in the same boxes a jury would. They exist because "the rules are right" and "the screen is
right" are different claims, and the acceptance criteria are about the screen.

`acceptance.test.ts` has one `describe` block per required criterion, named after it, so the test
output doubles as the rubric.

## The six required criteria

| # | Criterion | Domain test | UI test |
|---|---|---|---|
| 1 | Built-in load shows D01 then D02, count 2 | ✓ | ✓ |
| 2 | Contracted reasons for D03/D04/D05; D02 passes at the ₹150 boundary | ✓ | ✓ |
| 3 | `wheat` shows only D02, count stays 2, clearing restores both | ✓ | ✓ |
| 4 | Budget ₹130 leaves only D01; D02 is `OVER_BUDGET` | ✓ | ✓ |
| 5 | D01 price 0 reports `INVALID_INPUT` at dishes/D01/price and clears all rows and counts | ✓ | ✓ |
| 6 | Reset restores the built-in board, ₹150 and empty search with nothing stale | ✓ | ✓ |
| — | Optional: evidence chips for diet, allergen and budget, result unchanged | ✓ | ✓ |

## Edge cases covered

### Normalization
Trim and uppercase on diet classes, ingredient tags and allergen tags · tabs and newlines trimmed,
not only spaces · `' vegan '` → `VEGAN` · blank tag list is zero tags, not one empty tag ·
`'WHEAT,,TOMATO'` keeps the blank segment so validation can report it · a fully messy row
(`'  vegetarian '`, `' milk '`) still produces the exact contracted reasons.

### Diet rule
VEGAN resident accepts only VEGAN · VEGETARIAN accepts VEGAN or VEGETARIAN, not NON_VEGETARIAN ·
NO_RESTRICTION accepts all three · NON_VEGETARIAN accepts all three (documented assumption) · a dish
declared `NO_RESTRICTION` is rejected, because that class is resident-only · an unknown class
(`PESCATARIAN`, `JAIN`) is rejected.

### Allergen rule
Exact equality only — a `MILK` allergy does **not** match `MILKSHAKE`, and `PEANUT` does not match
`PEANUT_OIL` · nor does a `NUT` tag match a `PEANUT` allergy · a resident with no allergens · one
resident hitting two tags, reported in the dish's tag order not the allergen order · a repeated dish
tag reported once · two residents allergic to the same tag get one reason each, in resident order ·
no cross-contamination inferred between dishes sharing a cafe.

### Budget rule
Price equal to budget passes (`≤`, not `<`) · one rupee over fails · minimum price of 1 passes ·
never multiplied by group size — three residents and a ₹150 budget still admit a ₹150 dish · a
budget below the cheapest dish yields zero compatible and a count of 0.

### Reason ordering
Diet before allergens for the same resident · residents in table order, not alphabetical · a
reordered group table reorders the reasons · `OVER_BUDGET` always last, even behind diet and allergen
failures on the same dish · a compatible dish has an empty reason array · dish source order preserved
in the result, and a reordered dish table reorders the output.

### Search
Empty query shows all compatible · whitespace-only query behaves as empty · case-insensitive ·
query trimmed before matching · partial substrings match · matches cafe name, dish name and
ingredient tags · no match returns an empty list · **never surfaces an excluded dish** (`peanut`,
`milk`, `egg`, `east` all return nothing) · the count stays 2 while one row shows, and while none
show · the compatible list is not mutated · source order preserved among matches.

### Validation
Price zero, negative, fractional, blank, whitespace-only, non-numeric, or numeric-with-suffix
(`110rs`) · budget zero, negative, fractional, blank · empty and whitespace-only resident name, with
a positional `row 2` fallback when the name itself is blank · blank allergen tag · empty group ·
blank cafe, dish name, dish ID · blank tag inside a list · dish with no tags · empty dish list ·
duplicate dish ID reports `DUPLICATE_DISH_ID` rather than `INVALID_INPUT` · a duplicate differing
only by case or spacing (`' d01 '` vs `D01`) is still caught · `DUPLICATE_DISH_ID` still wins when
other fields are also invalid · every error collected in one pass, not just the first.

### The clearing rule
An invalid report carries no `verdicts`, no `compatible` and no `compatibleCount` — enforced by the
report being a discriminated union, so those fields don't exist on the error branch rather than being
set to empty.

### Screen synchronization
Editing any row discards a calculated result · changing the budget discards it · typing in the search
box does **not** discard it · reset clears the error, the result and the search together · the
built-in fixtures are deep-copied, so editing the board can't mutate the reset target.

## Not covered

- No browser-level screenshot tests. The Chrome extension wasn't available in this environment, so
  visual checks were done by hand against a screenshot; the behavioural claims are all covered by the
  UI tests instead.
- No performance testing. Five dishes and three residents is fifteen comparisons.
- No i18n. The exclusion codes are contract strings and must not be translated.
