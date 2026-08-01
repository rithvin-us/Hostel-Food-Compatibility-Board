# Design summary

## Architecture

Three layers, one direction of dependency.

```
src/domain      pure TypeScript. no React, no DOM, no I/O.   <- the contract
src/state       one useReducer. owns rows, budget, query, report.
src/components  render what the domain returned. no rules.
```

The problem statement pins every output string, their ordering, and every edge case. That makes it a
contract, not a feature request — so it lives in one folder with a hard rule: **zero React imports in
`src/domain`**. Greppable, and it buys three things:

1. The engine is testable without a browser (fast, and the tests read like the rubric).
2. A live modification usually touches one file.
3. There is exactly one place to look when a result is wrong.

### Two invariants worth knowing

**The count is frozen at evaluate time.** `compatibleCount` is stored on the report. `filterCompatible`
returns rows and nothing else — it has no way to return a count — so the headline number physically
cannot be derived from a filtered list. That's the third acceptance criterion enforced by type shape
rather than by discipline.

**Any input edit nulls the report.** Every edit action funnels through one `edited()` helper that sets
`report: null`. The screen therefore can never display a verdict that doesn't match the rows on it.
Reset falls out of this for free.

## Technology choices

| Choice | Why | What it cost |
|---|---|---|
| Vite + React + TypeScript | ~200 ms HMR, which matters because the interview includes a live modification. Static output, so "no backend" is structural, not a promise. | Slightly more setup than a single HTML file |
| No CSS framework | The board is a dense data table with a bespoke token set. Utilities were adding a dependency without saving work. | Hand-written CSS, ~13 KB |
| Vitest + Testing Library | Same toolchain as the bundler, nothing extra to explain. Testing Library lets the six criteria run through the real components. | Two dev dependencies |
| Self-hosted fonts | A demo shouldn't depend on venue wifi. | 120 KB in the repo |
| No router, no state library | One screen, one reducer. | None |

Total runtime dependencies: **react and react-dom.** Everything else is a dev dependency.

## Visual design

This is a tool someone uses to make a decision, not a page selling something. So the interface aims
to disappear into the task: one type family, restrained colour, familiar affordances.

**Colour.** Three signal hues, because the domain has exactly three failure classes — `DIET`,
`ALLERGEN`, `OVER_BUDGET`. Colour encodes contract state and nothing else. It is never the only
carrier: every coloured cell also shows a glyph and the literal code, so the board reads in greyscale
and to a screen reader. All three ink levels clear 4.5:1 on the surface colour.

**Type.** Public Sans for the interface, DM Mono for data and codes. The exclusion strings are
rendered in the mono face deliberately — what's on screen is character-identical to the problem
statement, so the contract can be read off the UI instead of taken on trust.

**The centrepiece** is the verdict matrix: every dish crossed with every resident, plus budget. A
failing cell shows the same token that appears in the exclusion reason. The screen is the output,
not a paraphrase of it.

**The three-track bar** at the left of each row is diet / allergen / budget, so the failure classes
can be scanned down the whole table without reading. That's the statement's optional "compact visual
evidence chips", built as a scanning device rather than a badge row. It reads an already-calculated
verdict, so it cannot change the result.

### The rebuild

The first visual pass was wrong and got replaced. It used a display typeface in UI labels, a small
uppercase letterspaced label above every section, and coloured left-edge stripes on cards — all
brand-page grammar applied to what is actually a product surface. I audited it against a product-UI
standard and cut all three. The same pass caught a muted grey at 3.5:1 contrast, now 5.3:1.

A screenshot drove the layout fix: the two source tables were separate cards of accidentally
different heights, with inputs clipping (`110` rendering as `11`, `VEGETARIAN` as `VEGETARI`). They
now share one panel and one column rhythm, with explicit `<colgroup>` widths, so they read as one
object. The eight red REMOVE links became a quiet `×` that appears on row hover or keyboard focus.

## Trade-offs

**Taken**

- Inline-editable tables over a separate row form. More code, but the demo is one click per criterion
  instead of open-form-edit-save.
- Collect every validation error in one pass rather than stopping at the first, so a broken board can
  be fixed in one go.
- Errors carry `table / row / field`, which needs a positional fallback (`row 2`) when the identifier
  itself is blank.

**Deferred**

- No persistence. Refresh resets the board. Nothing in the statement asks for it.
- No undo. Reset covers the demo path.
- No CSV or clipboard import. The statement explicitly excludes file upload.

## Assumptions

Places the statement is silent, and what I chose. All four are stated aloud in the presentation.

1. **A NON_VEGETARIAN resident accepts every dish class.** Acceptance is defined for VEGAN,
   VEGETARIAN and NO_RESTRICTION residents; NON_VEGETARIAN is listed as valid but its behaviour is
   never given. Modelled as unrestricted. No graded criterion depends on it.
2. **A repeated ingredient tag yields one allergen reason.** Duplicating `MILK` is a data-entry
   error, not two violations.
3. **A dish needs ≥1 ingredient tag; a group needs ≥1 resident.** An empty group makes every dish
   vacuously compatible, which isn't a useful answer.
4. **Duplicate resident names are allowed.** Uniqueness is required for dish IDs only.

## How AI shaped this

Detail in `PROMPT_LIBRARY.md`. The three that changed the code:

- Making the model derive the statement's own stated answers from the rules caught the per-person
  budget rule (don't multiply by group size) and the `≤` boundary before either became code.
- Asking for ambiguities before asking for a plan surfaced the NON_VEGETARIAN gap.
- Asking the model to audit its own UI against a design standard found the three brand-grammar
  mistakes and the contrast failure listed above.

What I decided rather than accepted: the pure-domain split, the stack, the no-extra-dependencies
rule, and all four assumptions.
