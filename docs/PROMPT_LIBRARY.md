# Prompt library

The prompts I actually used to build this, in order, with the reasoning behind each.

I've kept my raw wording where it's worth seeing, and written a cleaner version next to it
where I'd phrase it better a second time. The pattern that worked was the same every time:
**start broad, let the model ask, then constrain hard and demand evidence.**

---

## 1. Load the spec before asking for anything

**Raw**

> the above listed is a problem statement from cisco, i need to build a solution for this,
> understand the PS and plan for building it with reference to the Student Guide mentioned,
> strictly follow the rules of the guidelines

**Refined**

> Two documents are in this folder: the problem statement (`.docx`) and the evaluation guide
> (`.pdf`). Read both before proposing anything. Treat the problem statement as a contract —
> quote the exact rules for diet, allergens, budget, reason ordering, search scope, validation
> and reset back to me — and treat the guide as the grading rubric.

**Why it worked.** The model had no context; both files were binary. Naming them explicitly and
saying *read before proposing* stopped it inventing a generic "meal planner". Asking it to quote
the rules back is the cheap way to catch a misread before it becomes code.

---

## 2. Make the model verify the spec against its own worked example

The problem statement gives the expected answers (`D01, D02`, and the exact exclusion strings).
Those are free test oracles, so I made it check itself.

> The statement says the result is D01 and D02, and that D03 excludes as
> `DIET:Asha, ALLERGEN:Mira:MILK`. Derive those three exclusion strings yourself from the rules
> and show me the derivation. If your reading of the rules doesn't reproduce the stated answers
> exactly, your reading is wrong — say so instead of adjusting the answers.

**Why it worked.** This is the highest-value prompt in the whole build. It surfaced two things I
would otherwise have got wrong: that budget is per person and must **not** be multiplied by group
size, and that `≤` (not `<`) is what makes the ₹150 dish pass a ₹150 budget.

---

## 3. Force the ambiguity into the open instead of letting it be guessed

> Before you write a plan: list every place the statement is ambiguous or silent, and tell me
> what you'd assume for each. Don't quietly pick one — I need to defend these to a jury.

**Why it worked.** It produced the one real gap: the statement defines what VEGAN, VEGETARIAN and
NO_RESTRICTION residents accept, but never says what a **NON_VEGETARIAN resident** accepts. That's
now a documented assumption I can speak to, rather than a line of code someone finds in the review.

---

## 4. Give constraints, not just a goal

> Constraints, not suggestions:
> - No backend, no database, no network calls, no file upload. Static front end only.
> - All contract logic in `src/domain` as plain TypeScript. Zero React imports in that folder.
> - The exclusion strings are output, not copy. Never reword them anywhere.
> - No router, no state library, no UI kit. If a dependency isn't defensible in one sentence,
>   don't add it.

**Why it worked.** The guide penalises over-engineering, so the constraints are mostly *subtraction*.
"Zero React imports in `src/domain`" is the one that paid off most — it's a rule I can grep for, and
it's what makes the engine testable headlessly and cheap to modify live.

---

## 5. Ask for the choice, then decide it myself

Rather than let the model pick the stack, I had it lay out the trade-off and I chose.

> Give me two or three stack options for this. For each: why it fits, what it costs, and what a
> jury would object to. Recommend one. I'll pick.

**Why it worked.** I chose Vite over Next.js because the interview includes a live modification and
HMR speed matters more than server features I'd never use. That's a decision I can explain because
I made it — which is exactly what "code ownership" is being graded on.

---

## 6. Tests before implementation, written from the rubric

> Write the test file first. One `describe` block per required acceptance criterion, named after
> the criterion. Assert exact arrays for the exclusion reasons, not substring matches. Then write
> the engine until it's green.

**Why it worked.** Naming the blocks after the criteria means the test output *is* the evidence —
I can run it in front of the jury and they can read the rubric off the screen. Exact-array asserts
matter because reason **order** is contractual; a substring match would have passed a wrong ordering.

---

## 7. Ask for the edge cases rather than listing them myself

> Enumerate every edge case in this spec before writing more tests — normalization, diet matrix,
> exact-vs-substring allergen matching, budget boundary, reason ordering when one resident fails
> two ways, search scope and count stability, and every invalid-input permutation. Then test all
> of them.

**Why it worked.** It found cases I hadn't thought of: a `MILK` allergy must **not** match a
`MILKSHAKE` tag (the statement says tags are authoritative — no inference), and searching `peanut`
must return nothing because D04 is excluded and search only ever sees compatible dishes.

---

## 8. Send the model the actual screenshot

When the first UI came out uneven, I didn't describe the problem — I pasted the screenshot.

> Here's a screenshot. The group and dishes tables are different sizes and it doesn't look
> professional. Make them consistent. Also strip every line of text that exists to explain the
> implementation rather than help the user — I want this to read as a client-usable product.

**Why it worked.** The screenshot carried defects I hadn't even noticed and wouldn't have described:
prices truncated to `11`, `VEGETARIAN` clipped to `VEGETARI`, and eight red REMOVE links shouting
over the data. Showing beats telling — one image replaced a paragraph of guesswork.

---

## 9. Have the model grade its own output against a standard

> Load the design guidance and audit what you just built against it. List what you'd flag as
> generic or wrong before I do.

**Why it worked.** It found three things in my own code that violated the guidance it had just
loaded: coloured left-edge stripes used as accents, an uppercase tracked label above every section
(a well-known AI tell), and a muted grey that only hit 3.5:1 contrast against the background. All
three were fixed. Asking the model to critique itself against an external standard is far more
productive than asking "is this good?".

---

## What I'd do differently

- **Give the constraints earlier.** I set the "no backend, no extra dependencies" rules in the
  planning prompt, but I set the *visual* constraints only after seeing a bad screenshot. If I'd
  said "this is a tool, not a landing page" up front, I'd have skipped the display-font detour.
- **Ask for the failure modes, not just the feature.** Prompt 7 was worth more than prompt 4.
  Asking "what will break" consistently returned more than asking "build this".
- **Stop accepting prose.** Every prompt that demanded a specific artefact — an exact array, a
  derivation, a named test block — produced something I could check. The vaguer ones produced
  text I had to re-read.
