# Prompt Library

A curated collection of production-ready, detailed prompts used to engineer the Hostel Food Compatibility Board.

The core prompt engineering methodology follows a strict sequence:
**Establish Spec Grounding → Verify Against Oracles → Enforce Hard Constraints → Drive Test Coverage → Conduct Self-Audits.**

---

## 1. Spec-First Context Grounding

### Refined Prompt

> Two core documents are located in this project: the problem statement specification (`.docx`) and the evaluation guide (`.pdf`). Read both thoroughly before proposing any architecture or code. Treat the problem statement as a strict contract — quote and confirm the exact rules for resident diets, allergen matching, budget constraints, reason ordering, search scope, state validation, and reset behavior back to me — and treat the evaluation guide as the rubric against which all deliverables will be evaluated.

### Rationale & Strategy
Explicitly commanding the model to ingest all specification files before generating proposals prevents hallucinated requirements or generic implementations. Forcing the model to quote exact contractual rules back establishes a verified baseline before any code is written.

---

## 2. Oracle & Spec Verification

### Refined Prompt

> The specification defines expected reference outputs (e.g., compatible dishes `D01, D02`, and dish `D03` excluded due to `DIET:Asha, ALLERGEN:Mira:MILK`). Derive these exact exclusion strings step-by-step directly from the stated rules and present your complete derivation. If your interpretation of the rules fails to reproduce the reference outputs exactly, report the discrepancy immediately instead of adjusting the reference answers.

### Rationale & Strategy
Using provided test vectors as verification oracles forces mathematical and logical precision. This prompt ensures critical details — such as budget being calculated per person rather than multiplied across the group, and boundary operators (`≤` vs `<`) — are locked down correctly prior to implementation.

---

## 3. Proactive Ambiguity Discovery

### Refined Prompt

> Prior to drafting the technical implementation plan, identify every area where the problem statement is ambiguous, silent, or open to interpretation. List these edge cases along with a defensible recommended assumption for each. Do not make implicit decisions — present all assumptions clearly so they can be reviewed and validated.

### Rationale & Strategy
Models tend to quietly fill specification gaps with default assumptions. Requiring an explicit breakdown of underspecified areas brings implicit assumptions into the open (such as clarifying acceptance matrices for unlisted diet categories), making the codebase fully defensible during review.

---

## 4. Hard Architectural & Scope Constraints

### Refined Prompt

> Enforce the following non-negotiable architectural constraints across the codebase:
> - **Static Client-Side Only**: Zero backend services, databases, external API calls, or file upload handlers.
> - **Clean Domain Isolation**: Place all contract and domain rules inside `src/domain` as pure TypeScript. Zero UI framework imports allowed in this layer.
> - **Contractual Formatting**: Exclusion reason strings are precise system outputs; never reword or alter them.
> - **Minimalist Dependencies**: No external routing libraries, heavy state management systems, or bulky UI kits. Every added dependency must be defensible in a single sentence.

### Rationale & Strategy
Subtracting unnecessary complexity early prevents over-engineering. Enforcing total decoupling of domain logic from the presentation layer guarantees that core business rules remain 100% unit-testable and easy to maintain.

---

## 5. Tech Stack Trade-Off Evaluation

### Refined Prompt

> Evaluate 2 to 3 candidate tech stack architectures for this application. For each option, detail: architectural suitability, runtime performance, build complexity, and potential review objections. Recommend the optimal stack for rapid development and live demonstration, then wait for explicit confirmation before scaffolding.

### Rationale & Strategy
Rather than delegating stack selection entirely to AI, this prompt requires a structured trade-off matrix. It ensures decisions (e.g., selecting Vite over SSR frameworks for instant HMR and simple static deployment) are deliberate and fully understood.

---

## 6. Rubric-Driven Test-Driven Development (TDD)

### Refined Prompt

> Write the complete test suite prior to writing implementation code. Organize the tests with one `describe` block per required acceptance criterion, named explicitly after that criterion. Assert exact array equality for exclusion reason strings — including strict ordering — rather than loose substring matches. Once tests are defined, construct the domain engine until all tests pass.

### Rationale & Strategy
Structuring unit tests directly around evaluation criteria turns test execution into automated evidence of compliance. Strict array assertions ensure order-dependent business rules are fully validated.

---

## 7. Exhaustive Edge Case Enumeration & Coverage

### Refined Prompt

> Enumerate all edge case permutations across the specification before extending test coverage — including case normalization, diet hierarchy bounds, exact vs. partial allergen tag matching (e.g., ensuring `MILK` does not match `MILKSHAKE`), exact budget threshold boundary conditions, multi-reason ordering tie-breaks, search filter stability, and invalid state handling. Write dedicated tests for every identified edge case.

### Rationale & Strategy
Proactively asking the model to probe for potential failure modes reveals subtle edge cases (such as exact token matching vs partial substring matches, or search filters returning strictly compatible items) before they manifest as bugs.

---

## 8. Visual & Layout Polishing

### Refined Prompt

> Audit the user interface layout and visual presentation against production web standards. Ensure table alignment, container proportions, dynamic card layouts, typography hierarchy, and spacing grids remain balanced and consistent across viewports. Remove any internal debug text, developer notes, or redundant interactive controls to ensure a sleek, professional client-facing product.

### Rationale & Strategy
Providing clear visual layout directives ensures the interface achieves high visual density and polish while removing developer artifacts or unrefined UI elements.

---

## 9. Automated Design System & Code Quality Audit

### Refined Prompt

> Ingest the design guidelines and code quality standards for this project. Perform an automated audit of the implemented codebase and user interface against these standards. Identify any anti-patterns, contrast standard non-compliances, improper visual visual hierarchy, or unhandled component states, and apply precise code refinements to resolve them.

### Rationale & Strategy
Benchmarking the implementation against an explicit design system and coding standard empowers the model to perform rigorous self-correction, elevating both code quality and visual design consistency.
