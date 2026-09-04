# Worklog

## [2026-09-04] - Phase 2 Costing, Prototype, and CI Repair Checkpoint
- Completed automated catalog-validation execution in CI.
- Implemented deterministic assembly/specimen costing with explicit currency and engineering-quantity rounding so floating-point residue does not leak into reconciled totals.
- Added automated tests for material waste application, A0 itemized reconciliation, deterministic costing, missing rates, incompatible currency, local unit-rate overrides, and quantity/takeoff overrides.
- Separated wall backing and outer cladding into distinct specimen/cost layers; the A0 benchmark now includes both instead of silently omitting sawali cladding.
- Implemented immutable A0 → temporary draft → diff → explicit Create Candidate → A1 core and automated immutability/reset tests.
- Wired Product/Assembly-driven prototype selectors, traceable A0-vs-draft cost comparison, local unit-rate overrides, and visible `[Unverified]` status into the right-side UI.
- Added quantity/takeoff override support to the costing core. Quantity overrides preserve library quantity, effective quantity, waste basis and source note, and are intentionally treated as procurement/cost context rather than structural specimen ancestry.
- Added validation that rejects invalid/duplicate quantity overrides and quantity overrides for assemblies not selected by the specimen.
- Kept user price and quantity context separate from structural candidate identity; cost-context changes do not rewrite A0 or change candidate ancestry.
- Detected CI failure at branch head `6f899b68460239c70ec1e66da7f4b09d60a36555`: `page.tsx` still referenced the pre-refactor `clearCostRateOverrides` hook name.
- Repaired the prop contract without discarding the unified cost-context backend.
- Verified checkpoint `45013897736cbab0164f20974f39a826e5f706ee` passed dependency install, lint, strict TypeScript, automated tests, and production build.
- Synchronized `TASKS.md`, `STATUS_REPORT.md`, and `NEXT_STEPS.md` so remaining work is explicit rather than stale.
- Remaining Phase 2 gate: expose quantity override controls in the UI, migrate legacy fixed upgrade rules/options into the Phase 2 assembly/candidate model, add UI/state regression coverage, retire legacy Material/CostItem paths, and run the final Phase 2 CI checkpoint.

## [2026-09-04] - Finite RPE v1.0 Roadmap Locked
- Replaced the open-ended roadmap with a finite 12-phase build plan and explicit RPE v1.0 completion gates.
- Locked the core doctrine: `CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY`.
- Defined the first real mechanics milestone as the Genesis Test Chamber: Null House, smoke/wind visualization, one-panel wind loading, breakable connection, and detached debris.
- Defined the Dignity housing family as Studio Core, 1BR, 2BR, and 3BR maximum standard model.
- Defined two base typologies: elevated resilient base and site-screened slab/raft base.
- Added BIM/IFC import, OpenSees/CalculiX structural coupling, OpenFOAM CFD coupling, multi-hazard layers, and permanent engineering benchmark families as gated later phases.
- Added explicit benchmark targets: window extreme-wind test, RC column-footing lateral pull, 4×4 m CHB strengthening comparison, and 2-storey RC earthquake response.
- Defined RPE v1.0 release/freeze criteria and explicitly deferred nonessential v2.0 features so the build has a real finish line.
- Created Google Drive folder `FutolTech Resilience Physics Engine (RPE)` and mirrored the roadmap into `RPE v1.0 Finite Build Roadmap`.
- Repo remains the code/source-of-truth record; Drive is the durable planning mirror.

## [2026-07-14] - Phase 1.5: Checkpoint, Audit, and Final Warning Cleanups
- Spawned 2 audit agents: Codebase Health Auditor and Build & Lint Validator.
- **Found and fixed 3 critical bugs:**
  - `LeftPanel.tsx` line 39: broken string interpolation.
  - `TopBar.tsx` and `RightPanel.tsx`: dynamic `focus:` class pattern issues.
- **Fixed 4 warnings:**
  - `useDemoModel.ts`: wired `runSettings.durationSeconds` logic.
  - `BottomTimeline.tsx`: dynamic time duration formatting.
  - `globals.css`: stripped conflicting light-theme variables.
  - `RightPanel.tsx`: fixed unused destructured props and inline imports.
- Ran `npm run lint` (0 errors) and `npm run build` (compiled successfully).
- Committed checkpoint: `Kira Report #10: full audit, clean checkpoint`.

## [2026-07-08] - Phase 1.5: UI Token Refactor
- Created `src/lib/ui/tokens.ts` defining the RPE visual language (dark cockpit aesthetic).
- Refactored all 6 components (`TopBar`, `LeftPanel`, `RightPanel`, `BottomTimeline`, `Viewport3D`, `ExportPanel`) to use `rpeTokens`.
- Updated `page.tsx` root wrapper to use token-based styling.
- Updated design docs with implementation notes distinguishing built vs. future features.

## [2026-07-08] - Phase 1.5: UI Refinement Direction
- Documented RPE Test Bench layout strategy and target visual aesthetics (`docs/ui-direction.md`, `docs/rpe-test-bench-layout.md`).
- Prepared design templates and generated prompt assets for external tools like Stitch (`design/rpe-test-bench/*`).

## [2026-07-08] - Phase 1: Export Placeholders
- Drafted `docs/export-plan.md` defining future export targets.
- Built and integrated `ExportPanel` into the right sidebar.
- Wired export buttons to become active only post-simulation and connected them to placeholder alerts.
- Confirmed full completion of Phase 1 MVP Shell.

## [2026-07-08] - Phase 1: Interactive Simulation Playback
- Updated `failure-events.sample.json` with event timings and visual marker targets.
- Implemented `startSimulation`, `resetSimulation` handlers in `useDemoModel` with `setInterval` tracking elapsed time.
- Wired `TopBar` buttons to simulation state.
- Formatted `BottomTimeline` to visually track simulation progress and highlight active event.
- Built a visual marker system in `Viewport3D` using `@react-three/drei` `Html` markers mapping to failure targets.
- Added simulation completion report dynamically rendering in `RightPanel`.

## [2026-07-08] - Phase 1: Data Wiring
- Created TypeScript interfaces (`src/types/rpe.ts`).
- Implemented static data loading from JSON files (`src/lib/demo-data.ts`).
- Created custom React hook `useDemoModel` to serve data.
- Refactored `LeftPanel`, `RightPanel`, `BottomTimeline`, `Viewport3D`, and `TopBar` to display dynamic data.
- Verified compilation with zero linting errors (`npm run lint` & `npm run build`).

## [2026-07-08] - Phase 1: Next.js Initialization
- Initialized Next.js in the repository root (TypeScript, App Router, Tailwind CSS).
- Added `three`, `@react-three/fiber`, and `@react-three/drei` packages.
- Added missing `failure-events.sample.json` and `cost-items.sample.json`.
- Built the Visual MVP Shell layout comprising `TopBar`, `LeftPanel`, `RightPanel`, `Viewport3D`, and `BottomTimeline`.
- Verified layout structure and updated tracking documents (`STATUS_REPORT.md`, `WORKLOG.md`, `TASKS.md`, `NEXT_STEPS.md`).

## [2026-07-08] - Kira Takeover
- Inspected repository structure (`docs/`, `data/`, `src/`).
- Created `TAKEOVER_REPORT.md` summarizing existing work, missing files, and current MVP status.
- Created `AGENT.md` with explicit instructions and hard rules for development.
- Updated `AGENTS.md`, `TASKS.md`, `STATUS_REPORT.md`, and `NEXT_STEPS.md` to align with the Visual MVP Shell requirements.
