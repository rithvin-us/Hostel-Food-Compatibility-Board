# Changelog

All notable changes to the Hostel Food Compatibility Board project are documented in this file.

---

## [1.4.0] - 2026-08-02

### Added
- **CI (`.github/workflows/ci.yml`)**: runs `typecheck`, `test`, and `build` on every push and pull request to `main`.
- **`LICENSE`**: MIT.
- **Live deployment link**: added to `README.md` (top of file and Deploy section) — `https://hostel-food-compatibility-board.vercel.app`, confirmed live via the GitHub commit-status API against the latest `main` push.

---

## [1.3.0] - 2026-08-02

### Added
- **Tag-Chip Input (`src/components/TagInput.tsx`)**: Resident allergens and dish ingredient tags are now entered as removable chips — type a value, press Enter or `,` to commit it, Backspace on an empty draft removes the last chip — instead of one raw comma-separated text field. Pasting a comma-separated string still splits into one chip per segment, including blank ones, so `INVALID_INPUT` for a blank tag (e.g. `WHEAT,,TOMATO`) is still reachable exactly as before. Wraps the existing `onEdit(key, field, value)` flow unchanged — `src/state/useBoard.ts` still receives a single comma-joined string and still owns all splitting/normalization; this is a UI-layer change only.
- Wired into `GroupTable.tsx` (Allergens column) and `DishTable.tsx` (Ingredients column).

### Fixed
- **`README.md` encoding**: the file was UTF-16LE with no BOM (GitHub rendered it as a Targa image, not text). Rewritten as plain UTF-8 with the same content, plus the ₹ symbol restored where it had been silently dropped.

### Maintained & Verified
- Zero changes to `src/domain/*` or `src/state/useBoard.ts` — same split/normalize/validate pipeline as before, only the input widget changed.
- Test Suite: 128/128 tests passing, `tsc -b` clean, `vite build` clean.

---

## [1.2.0] - 2026-08-02

### Changed
- **Analytics Panel Visual Redesign (`src/components/AnalyticsPanel.tsx`, `src/styles/index.css`)**:
  - Replaced the SVG circular gauge, gradient banners, and ad hoc hex-coded bars/badges with visuals built entirely from the board's existing design tokens (`--pass` / `--block` / `--over`) and components (`.chip`, `.legend` / `.swatch`), so the analytics panel reads as part of the same instrument as the verdict matrix rather than a dashboard bolted on top of it.
  - Added **Compatibility Spectrum**: a full-width strip with one tick per dish, in the same order as the verdict matrix rows below it, so the aggregate view and the row-level detail stay visually correlated.
  - Replaced the circular gauge with a **linear Harmony Meter** that marks the 30 / 60 thresholds behind the status label directly on the track, so "Moderate Friction" vs. "High Harmony" is never a black box.
  - Replaced three separate progress bars with a single **stacked root-cause bar**. Diet and allergen share the board's existing `--block` red (both are "content mismatch" failures elsewhere on the board), but diet renders as a diagonal hazard stripe — negotiable — versus allergen's solid fill — non-negotiable — turning the fill pattern itself into information rather than decoration.
  - Replaced resident friction badges with ranked, magnitude-proportional **bar chart rows**, plus an auto-generated insight line naming the board's tightest constraint (e.g. "Asha clears the fewest dishes — 2 exclusions").
  - Restyled the Universal Feast banner and Next Unlock card to use the board's own pass-state styling instead of a gradient/emoji marketing banner.
  - Verified fully usable from ~320px mobile through tablet and desktop widths, including a dedicated narrow-viewport rule so the spectrum strip scrolls instead of collapsing to hairlines on boards with many dishes.
- **Prompt Library Expansion (`docs/PROMPT_LIBRARY.md`)**: Added Section 11 (*Design-System-Consistent Analytics Visualization Refactor*).

### Maintained & Verified
- **Zero domain changes**: `src/domain/analytics.ts` is untouched — the redesign consumes the same pure functions and computed values as before.
- **Zero third-party chart dependencies**: all visuals remain native CSS/DOM, no SVG gauge machinery.
- **Test Suite**: 128/128 tests passing, `tsc -b` clean.

---

## [1.1.0] - 2026-08-02

### Added
- **Pure Domain Analytics Module (`src/domain/analytics.ts`)**:
  - `computeHarmonyScore`: Computes Group Harmony Index (0–100%) and harmony status (`Universal Feast`, `High Harmony`, `Moderate Friction`, `Severe Friction`).
  - `computeExclusionBreakdown`: Calculates percentage and absolute breakdown of rejection causes (`DIET`, `ALLERGEN`, `OVER_BUDGET`).
  - `computeResidentFriction`: Calculates individual resident rejection friction scores without judgment.
  - `computeSmartUnlocker`: Generates actionable single-change recommendation insights (e.g., "Increasing budget by ₹10 unlocks 1 dish").
- **Interactive Analytics & Insights Panel (`src/components/AnalyticsPanel.tsx`)**:
  - SVG Circular Progress Gauge with dynamic status colors.
  - Universal Feast celebration banner triggered when 100% compatibility is achieved.
  - Visual horizontal bar charts for Diet, Allergen, and Budget friction distribution.
  - Resident friction badges and smart recommendation callout card.
- **Enhanced Visual Aesthetics & Styling (`src/styles/index.css`)**:
  - Added modern vibrant card styling, glassmorphic accents, gradient banners, and smooth SVG gauge animation transitions.
- **Domain Analytics Unit Tests (`src/domain/__tests__/analytics.test.ts`)**:
  - Comprehensive unit test suite (5 new tests) for all analytical functions.
- **Prompt Library Expansion (`docs/PROMPT_LIBRARY.md`)**:
  - Added Section 10 (*Data-Driven Analytics & Visual Engagement*).

### Fixed
- **TypeScript Build Compiler Error (`TS18048`)**: Resolved `reason is possibly undefined` under strict `tsc -b` build compilation in `src/domain/analytics.ts` by adding optional chaining (`const reason = dish?.reasons[0]`) and explicit guard checks.

### Maintained & Verified
- **Contractual Integrity**: 100% preservation of all problem statement rules, validation criteria, search scopes, and exact exclusion reason strings (`DIET:Asha`, `ALLERGEN:Mira:MILK`, `OVER_BUDGET`).
- **Zero Third-Party Chart Dependencies**: All gauge and bar chart visuals are built using native SVG and CSS.
- **Test Suite**: 128/128 tests passing cleanly across domain engine and React Testing Library UI integration tests.


---

## UI Evolution: Baseline vs. Refined Interface

### 1. Baseline Interface (Version 1.0.0)

The baseline interface focused strictly on contract verification and tabular output:
- Dual input tables for Group and Dishes.
- Topbar action controls for Budget, Check Compatibility, Load Sample, and Reset.
- Verdict Matrix displaying per-resident evidence cells and contracted reason strings.
- Simple Result list with search filtering.

#### Baseline UI Screenshot
![Baseline Interface](./screenshots/image.png)
> *Note: The baseline UI featured standard grey surface styling and text-only verdict tallies.*

---

### 2. Refined Analytics-Driven Interface (Version 1.1.0)

The refined interface introduces an interactive Analytics & Insights layer above the Verdict Matrix while elevating overall visual engagement:
- **Group Harmony Gauge**: Instant visual indicator of group menu compatibility.
- **Exclusion Root-Cause Bars**: Color-coded visualization distinguishing dietary, allergen, and budget constraints.
- **Resident Constraint Cards**: Per-resident breakdown of dietary and allergen rejections.
- **Smart Recommendation Card**: Proactive suggestion box highlighting the smallest change needed to unlock more compatible food options.

#### Refined UI Visual Layout
![Refined Analytics-Driven Interface](./screenshots/image%20copy.png)

---

### 3. Design-System-Unified Analytics (Version 1.2.0)

Version 1.1.0's analytics layer visualized the right data with the wrong visual language — a circular SVG gauge, gradient banners, and an ad hoc blue/red/amber palette unrelated to the `--pass` / `--block` / `--over` tokens the rest of the board already uses. Version 1.2.0 keeps every metric but rebuilds the visuals from the board's own vocabulary, and adds a per-dish overview and a synthesized insight line that 1.1.0 didn't have:
- **Compatibility Spectrum**: one tick per dish, ordered exactly as the Verdict Matrix rows below it.
- **Linear Harmony Meter**: replaces the donut with a track marked at the 30 / 60 status thresholds, so the label is derived visibly instead of asserted.
- **Stacked Root-Cause Bar**: one bar instead of three, diet marked with a diagonal hazard stripe (negotiable) against allergen's solid fill (non-negotiable) — same `--block` red the rest of the board already assigns to both.
- **Ranked Resident Bars**: magnitude-proportional, with an auto-generated insight line naming the tightest constraint.

#### Refined UI Visual Layout
![Design-System-Unified Analytics](./screenshots/image%20copy%202.png)

---

## [1.0.0] - 2026-08-02

### Initial Release
- Core domain engine (`compatibility.ts`, `validate.ts`, `search.ts`, `rules.ts`, `normalize.ts`).
- Full contract implementation for resident diets, allergen tags, and budget per person limits.
- 123 unit and UI integration tests.
- Documentation suite (`DESIGN.md`, `PROMPT_LIBRARY.md`, `TEST_EVIDENCE.md`).
