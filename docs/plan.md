# Presentation plan — SI26_P02

What to say, in what order, with the evidence to show at each step. Budget ~12 minutes of talking,
leaving the rest for the live modification and questions.

---

## 1. The plan I started with (2 min)

Five steps, with a checkpoint at each so I'd know if I'd gone wrong before writing more code.

| # | Step | Checkpoint |
|---|---|---|
| 1 | Scaffold, and freeze the contract as TypeScript types | `tsc` clean, fixtures typecheck |
| 2 | Pure domain engine, tests written first from the six criteria | tests green; `src/domain` has zero React imports |
| 3 | UI shell wired to the engine | Check button produces D01 + D02 in the browser |
| 4 | Verdict matrix, evidence, search, validation, reset | all six criteria walked by hand |
| 5 | Docs and deploy | live URL reproduces all six criteria |

**The one decision that shaped everything else:** put the contract in a pure TypeScript module with
no React in it. The problem statement is unusually precise — it pins the exact output strings, their
order, and every edge case — so the risk was never "can this be built", it was "does it match the
contract exactly, and can I change it live in front of you". A pure module is testable without a
browser and has a small edit radius.

### What changed from that plan, and why

Say these honestly — they're all deliberate.

1. **Dropped Tailwind for plain CSS custom properties.** The board is a dense data table with a
   bespoke token set; utility classes were adding a dependency without saving work.
2. **Self-hosted the two web fonts instead of linking Google Fonts.** A demo shouldn't depend on
   venue wifi. 120 KB, no runtime CDN call.
3. **Added UI-level tests.** I'd planned to verify the six criteria by hand in the browser. Instead
   I drove the real components with Testing Library, so the criteria are now automated too. This is
   better evidence than a screenshot, and it's re-runnable in front of you.
4. **Rebuilt the visual layer once.** The first pass used a display typeface, uppercase tracked
   section labels and coloured edge stripes — brand-page grammar on what is actually a tool. I
   audited it against a product-UI standard and cut all three. Detail in `DESIGN.md`.

---

## 2. Demo — the six required criteria (5 min)

Run these in order. Each is one interaction.

| # | Do this | Say this |
|---|---|---|
| 1 | **Check compatibility** on the built-in board | "Two compatible, D01 then D02, in source order." |
| 2 | Point at the D03/D04/D05 verdict column | "These are the contracted strings, printed verbatim — `DIET:Asha, ALLERGEN:Mira:MILK`. Diet before allergens, residents in table order." |
| 3 | Point at D02's budget cell showing `= ₹150` | "The boundary. `≤`, not `<`. And the budget is per person — I never multiply by group size." |
| 4 | Type `wheat` in search | "Display narrows to D02. **The count stays 2.** Search is applied to the compatible result only — it can't surface an excluded dish." Then clear it. |
| 5 | Set budget to `130`, Check | "D02 is now `OVER_BUDGET`, and that reason always sorts last." |
| 6 | Set D01 price to `0`, Check | "`INVALID_INPUT`, naming dishes · D01 · price. Every result row and the count are gone — nothing stale on screen." |
| 7 | **Reset** | "Built-in rows back, ₹150 back, search empty, no stale error and no stale result until I run it again." |

**Bonus if asked about the optional criterion:** the three-track bar at the left of every row is
diet / allergen / budget. It reads the verdict that was already calculated — it can't change the
result.

**One detail worth volunteering:** edit any cell after running a check and the result disappears.
The screen can never show a verdict that doesn't match the rows currently visible.

---

## 3. Testing (2 min)

```
npm test
```

123 tests, five files. Show the output — the block names are the acceptance criteria.

- `acceptance.test.ts` — one block per required criterion, named after it
- `board.ui.test.tsx` — the same six criteria driven through the real UI
- `compatibility.test.ts` — normalization, the three rules, reason ordering
- `validate.test.ts` — every invalid-input permutation
- `search.test.ts` — scope, case, trimming, count stability

Worth calling out three edge cases that aren't in the statement's examples:

- A `MILK` allergy must **not** match a `MILKSHAKE` tag. The statement says tags are authoritative
  and forbids inference, so the comparison is `===`, never `includes`.
- Searching `peanut` returns nothing, because D04 is excluded and search only sees compatible dishes.
- A dish may not be `NO_RESTRICTION` — that class is resident-only, so it's rejected as invalid.

Full list in `TEST_EVIDENCE.md`.

---

## 4. AI workflow (2 min)

Walk through `PROMPT_LIBRARY.md`. The three prompts to actually show:

- **Deriving the spec's own answers.** I made the model derive the three exclusion strings from the
  rules and check them against the statement's stated answers. That's what caught the per-person
  budget rule and the `≤` boundary before either became code.
- **Asking for ambiguities up front.** That's where the NON_VEGETARIAN-resident gap came from.
- **Sending a screenshot instead of a description.** The first UI had prices truncated to `11` and
  `VEGETARIAN` clipped to `VEGETARI`. I'd never have described those; the image did it for me.

Be straightforward that AI wrote most of the code. What's mine is the contract reading, the
constraints, the architecture split, and every assumption below.

---

## 5. Assumptions to state before you're asked

1. **A NON_VEGETARIAN resident accepts every dish class.** The statement defines acceptance for
   VEGAN, VEGETARIAN and NO_RESTRICTION residents but is silent on this one. No graded criterion
   depends on it — the built-in group has no such resident.
2. **A repeated ingredient tag produces one allergen reason, not two.** Duplicating `MILK` in a
   dish's tags is a data-entry error, not two separate violations.
3. **A dish needs at least one ingredient tag**, and the group needs at least one resident. An empty
   group would make every dish vacuously compatible, which isn't a useful answer.
4. **Duplicate resident names are allowed.** The statement requires uniqueness for dish IDs only.

---

## 6. Live modification — ready to go

The engine is one folder, so most changes land in one or two files.

| If asked for | Open | Roughly |
|---|---|---|
| A new diet class (HALAL, JAIN) | `domain/types.ts`, `domain/rules.ts` | Add to the union, add a case to `dietAccepts`. UI selectors read from the union automatically. |
| Per-resident budgets | `domain/rules.ts`, `domain/types.ts` | Move `price <= budget` onto the resident loop. |
| A new exclusion reason, or reordering them | `domain/compatibility.ts` | `judgeDish` is one function and its loop order *is* the contract sentence. |
| Search also matching diet class | `domain/search.ts` | One line in the haystack array. |
| Sorting the compatible list by price | `domain/compatibility.ts` | Deliberately not done — source order is contractual. Say so before changing it. |

Workflow to use live: change the test first, watch it fail, then change the engine.
`npm run test:watch` is already running.

---

## 7. Questions I expect

**Why no backend?** The statement rules it out, and nothing here needs one — no persistence, no
multi-user state, no external menu. Adding one would be the over-engineering the guide penalises.

**How does the count stay 2 while only one dish shows?** `compatibleCount` is computed once inside
`evaluate` and stored on the report. The search function returns rows only — it has no way to return
a count, so the headline number can't accidentally be derived from a filtered list.

**Why does a ₹150 dish pass a ₹150 budget?** The rule is "less than or equal to", and the budget is
the maximum for one serving for one person. There's a test asserting exactly this, and the UI marks
it `= ₹150` so it's visible rather than assumed.

**Where does the contract live?** `src/domain`. Five files, no React, no DOM. Everything else renders
what those files return.

**What would you do with another hour?** Persist the board to `localStorage` so a session survives a
refresh, and add a keyboard shortcut to run the check. Neither is in the statement, which is why
neither is built.
