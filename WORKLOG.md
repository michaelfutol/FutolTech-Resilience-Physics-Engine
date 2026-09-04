# Worklog

## [2026-09-04] - Genesis Analytical Wind Foundation
- Re-read the locked roadmap, status, tasks, next steps, worklog, active branch, and latest CI before coding.
- Confirmed canonical active branch `lum-rpe-takeover` at `bd45e6bb4e8d485a0d14b776d38af78a3221151f`; its latest CI run was green before this batch.
- Added versioned Genesis evidence/input/result types separating manual/code, solver, RPE analytical, RPE simulation, and physical-test layers.
- Added pure kph→m/s conversion and simplified analytical dynamic-pressure calculation `q = 0.5ρV²`.
- Added pure panel action `F = qAC` with exposed area and pressure coefficient supplied explicitly by the caller.
- Added deterministic connection demand/capacity assessment; missing capacity remains `null` and returns `unverified` rather than PASS.
- Locked Null House structural result type to `N/A / no_physical_specimen`.
- Added automated tests using synthetic arithmetic fixtures only; no test number is adopted as a real material, site, code, or connection property.
- Updated `package.json` and `tsconfig.tests.json` so Genesis tests run in the normal CI gate.
- Code checkpoint `effa98b6f4b40199737c148c0fbc83b62dfd2ad0` passed dependency install, lint, strict TypeScript/test compilation, automated tests, and production build in GitHub Actions run 85.
- Rapier was intentionally not installed. Dependency-advisory classification remains a gate.
- Manual Phase 2 browser acceptance remains outstanding and was not falsely marked complete.

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

## [2026-09-04] - Finite RPE v1.0 Roadmap Locked
- Replaced the open-ended roadmap with a finite 12-phase build plan and explicit RPE v1.0 completion gates.
- Locked the core doctrine: `CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY`.
- Defined the first real mechanics milestone as the Genesis Test Chamber: Null House, smoke/wind visualization, one-panel wind loading, breakable connection, and detached debris.
- Defined the Dignity housing family as Studio Core, 1BR, 2BR, and 3BR maximum standard model.
- Added BIM/IFC import, OpenSees/CalculiX structural coupling, OpenFOAM CFD coupling, multi-hazard layers, and permanent engineering benchmark families as gated later phases.
- Defined RPE v1.0 release/freeze criteria and explicitly deferred nonessential v2.0 features so the build has a real finish line.

## Earlier work
Historical Phase 0/1/1.5 implementation and UI-refinement entries remain preserved in Git history. No engineering evidence from those scripted visual stages is promoted to calculated physics by this checkpoint.
