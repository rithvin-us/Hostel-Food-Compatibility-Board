# Changelog

All notable changes to the Hostel Food Compatibility Board project are documented in this file.

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
![Baseline Interface](./docs/baseline_ui.png)
> *Note: The baseline UI featured standard grey surface styling and text-only verdict tallies.*

---

### 2. Refined Analytics-Driven Interface (Version 1.1.0)

The refined interface introduces an interactive Analytics & Insights layer above the Verdict Matrix while elevating overall visual engagement:
- **Group Harmony Gauge**: Instant visual indicator of group menu compatibility.
- **Exclusion Root-Cause Bars**: Color-coded visualization distinguishing dietary, allergen, and budget constraints.
- **Resident Constraint Cards**: Per-resident breakdown of dietary and allergen rejections.
- **Smart Recommendation Card**: Proactive suggestion box highlighting the smallest change needed to unlock more compatible food options.

#### Refined UI Visual Layout
```
+-----------------------------------------------------------------------------------+
| 🎉 Universal Feast Unlocked! 100% of menu dishes compatible for every resident.   |
+---------------------------------------------------+-------------------------------+
|  GROUP HARMONY INDEX                              |  EXCLUSION ROOT-CAUSE         |
|  [ SVG Circular Gauge: 40% ]                      |  Dietary:   40% [====    ]    |
|  Status: Moderate Friction                        |  Allergen:  40% [====    ]    |
|  2 / 5 Dishes Compatible                          |  Budget:    20% [==      ]    |
+---------------------------------------------------+-------------------------------+
|  RESIDENT CONSTRAINTS                             |  💡 SMART RECOMMENDATION      |
|  Asha:  [Diet: 2]                                 |  Increasing budget by ₹10    |
|  Dev:   [Allergen: 1]                             |  unlocks Tomato Pasta!        |
+---------------------------------------------------+-------------------------------+
```

---

## [1.0.0] - 2026-08-02

### Initial Release
- Core domain engine (`compatibility.ts`, `validate.ts`, `search.ts`, `rules.ts`, `normalize.ts`).
- Full contract implementation for resident diets, allergen tags, and budget per person limits.
- 123 unit and UI integration tests.
- Documentation suite (`DESIGN.md`, `PROMPT_LIBRARY.md`, `TEST_EVIDENCE.md`).
