# Tasks

## Phase 0: Repo Foundation
- [x] Initial repository setup and folder structure.
- [x] Create project documentation (README, ROADMAP, MVP scope, etc.).
- [x] Set up sample JSON data files.
- [x] Establish agent instructions and reporting formats.
- [x] Lock a finite RPE v1.0 roadmap with explicit completion gates.
- [x] Mirror the finite roadmap to Google Drive for durable planning continuity.

## Phase 1: Visual MVP Shell
- [x] Initialize React / Next.js project in root.
- [x] Build the engineering-cockpit layout shell.
- [x] Set up Three.js / React Three Fiber conceptual viewport.
- [x] Load Demo 01 sample data into application state.
- [x] Implement scripted Typhoon Index 300 event playback.
- [x] Add export/run-mode/prototype-rebuilder placeholders.

## Phase 1.5: UI Refinement
- [x] Document and implement token-based Test Bench visual language.
- [x] Audit and clean the Phase 1 UI shell.

## Phase 2A: Data Spine and Integrity
- [x] Separate Product/Material Library from Assembly Library.
- [x] Add `CostRate` data separate from permanent product identity.
- [x] Add Specimen Configuration with assembly selections and ancestry fields.
- [x] Curate an initial Dignity 3×3 m product/assembly/rate dataset.
- [x] Keep unknown/unvalidated engineering properties explicit `null` / unverified.
- [x] Add and harden runtime catalog/reference validation.
- [x] Add GitHub Actions CI: install, lint, strict TypeScript, tests, production build.
- [x] Wire Product / Assembly / CostRate loaders into the application.
- [x] Fix A0 lookup regression.
- [x] Add automated catalog-validation tests to CI.
- [x] Add Phase 2 `UpgradeDefinition` reference/category/readiness validation.
- [x] Separate wall backing and outer cladding into distinct assembly slots.

## Phase 2B: Deterministic Costing Engine
- [x] Implement pure `calculateAssemblyCost` and `calculateSpecimenCost` functions.
- [x] Apply material waste exactly once and only to material quantity.
- [x] Keep material/labor/equipment/installation separately traceable.
- [x] Add explicit currency/money/quantity rounding policy.
- [x] Support source rates plus non-destructive local unit-rate overrides.
- [x] Support non-destructive quantity/takeoff overrides.
- [x] Preserve library quantity and effective quantity separately.
- [x] Reject missing rates, incompatible currencies, invalid/duplicate overrides, and overrides for unselected assemblies.
- [x] Verify curated A0 itemized reconciliation in automated tests.
- [x] Wire calculated costs and local cost context into the UI.

## Phase 2C: Immutable Prototype Derivation
- [x] Keep A0 immutable.
- [x] Add temporary structural draft state.
- [x] Implement assembly/substitution diff against A0.
- [x] Implement deterministic assembly-backed upgrade application.
- [x] Replace conflicting upgrade ancestry deterministically.
- [x] Add explicit `Create Candidate` action for A1/A2.
- [x] Record `parentSpecimenId`, applied upgrade IDs, and changed assembly manifest.
- [x] Verify Reset restores original A0.
- [x] Keep procurement price/quantity context separate from structural ancestry.
- [x] Persist derived candidates in a versioned browser-local workspace.
- [x] Revalidate persisted candidates against the current immutable catalog on reload.
- [x] Show saved candidate lineage and rejected-workspace warnings in Model Builder.

## Phase 2D: Catalog / Cost / Upgrade UI
- [x] Replace primary legacy Material/CostItem display with Product/Assembly controls.
- [x] Add compatible assembly alternative dropdowns.
- [x] Add visible quantity/takeoff override controls with library-vs-effective provenance.
- [x] Add visible unit-cost override controls with provenance behavior.
- [x] Display `[Unverified]` engineering/assembly state visibly.
- [x] Display A0 baseline vs draft/local-context cost delta and itemized allowances.
- [x] Replace fixed-peso upgrade UI with assembly-backed upgrade definitions.
- [x] Show blocked `needs_definition` upgrades rather than inventing missing engineering definitions.
- [x] Retire legacy `Material`, `CostItem`, fixed `UpgradeOption`, and `UpgradeRule` paths from active application code.
- [x] Drive Model Builder from the same assembly selections used by costing/derivation.

## Phase 2E: Verification and Checkpoint
- [x] Unit/reference/cost/derivation tests run in CI.
- [x] Candidate-workspace persistence tests run in CI.
- [x] End-to-end workflow regression: A0 → real upgrade → cost → A1 → persist → reload → revalidate.
- [x] Lint, strict TypeScript, automated tests, and production build green at checkpoint `efcf319faaf0d4ab9832bbeb45be4cba9b6d1e75`.
- [x] Document Blender / Unreal / solver-neutral engine-bridge architecture without making them engineering truth sources.
- [ ] Perform manual browser visual acceptance of assembly selectors, quantity/rate overrides, upgrade Apply, Reset, Create Candidate, refresh persistence, and candidate lineage.
- [ ] Record final Phase 2 exit checkpoint after visual acceptance.

## Cross-Cutting Dependency Hygiene
- [ ] Investigate current npm audit advisories deliberately (CI reports 1 moderate + 7 high); identify direct/transitive packages before changing dependencies.
- [ ] Do not use `npm audit fix --force` blindly.
- [ ] Resolve or explicitly risk-document relevant advisories before adding the first new physics dependency.

## Phase 3: Genesis Test Chamber — First Real Physics Milestone
- [ ] Define versioned Genesis scene/wind input/result types.
- [ ] Create semi-transparent Null House envelope as a volume/boundary reference only.
- [ ] State Null House result as **N/A**, not PASS, because no physical structure exists.
- [ ] Add Fast Smoke / streamline wind visualization.
- [ ] Add transparent simplified analytical wind-action calculation with stated assumptions and units.
- [ ] Add one physical wall/panel specimen.
- [ ] Add explicit connection object(s) with demand/capacity state; unknown capacities remain unverified/null.
- [ ] Add first breakable connection.
- [ ] Install/integrate Rapier only after dependency-audit gate.
- [ ] On failure, detach panel and convert it to free rigid-body/debris state.
- [ ] Log complete load → demand → threshold → release → debris sequence.
- [ ] Add A/B comparison mode for identical hazard runs.

## Phase 4: Whole-House Hazard Expansion
- [ ] Add complete frame/roof/wall systems.
- [ ] Add uplift, racking, anchorage and storm-harness tests.
- [ ] Add driven rain, debris sequence, coastal surge/buoyancy/hydrodynamics.
- [ ] Keep historical events, code design conditions, and RPE stress indices distinct.

## Phase 5: Dignity Housing Family
- [ ] Lock Studio Core as minimum model / first ₱50k research target.
- [ ] Add 1BR, 2BR, and 3BR controlled variants.
- [ ] Add elevated resilient base typology.
- [ ] Add site-screened slab/raft base typology.

## Phase 6: BIM / IFC Import
- [ ] Define supported IFC subset and import-readiness report.
- [ ] Preserve identity, geometry, material assignment, and relationships where available.
- [ ] Missing simulation properties produce warnings, never invented defaults.
- [ ] Import one Studio or 2-storey frame as an RPE specimen.
- [ ] Keep Blender/Bonsai as optional authoring/inspection/render bridge.

## Phase 7: Structural Solver Coupling
- [ ] Define solver-neutral structural result schema.
- [ ] Add OpenSees/OpenSeesPy workflow for one benchmark.
- [ ] Add CalculiX for selected detailed finite-element problems where appropriate.
- [ ] Preserve solver version, idealization, boundary conditions, material model, damping, convergence, inputs, and hashes.

## Phase 8: Wind CFD Coupling
- [ ] Define CFD result mapping to RPE surfaces.
- [ ] Add OpenFOAM workflow for one simple building.
- [ ] Keep Fast Smoke Mode distinct from CFD Smoke Mode.
- [ ] Compare simplified analytical pressure with CFD pressure fields.

## Phase 9: Multi-Hazard Layers
- [ ] Driven-rain ingress.
- [ ] Debris impact and secondary debris.
- [ ] Flood/coastal hydrostatic, hydrodynamic, buoyancy, and saltwater exposure.

## Phase 10: Engineering Benchmark Library
- [ ] `RPE-WIN-001` — Window Assembly Extreme Wind Test.
- [ ] `RPE-RC-001` — RC Column–Footing Lateral Pull.
- [ ] `RPE-MAS-001` — 4 m × 4 m CHB Wall Strengthening Comparison.
- [ ] `RPE-RC-002` — 2-Storey RC Earthquake Response.
- [ ] Make benchmark runs versioned, repeatable, and side-by-side comparable.

## Phase 11: Physical Validation and Calibration
- [ ] Freeze manual, solver, and RPE predictions before physical testing.
- [ ] Attach calibrated test evidence when feasible.
- [ ] Record discrepancies without overwriting original predictions.
- [ ] Calibrate only through new model/version records.

## Phase 12: RPE v1.0 Release and Freeze
- [ ] Reproducible deployment and green CI/test suite.
- [ ] Stable specimen schema and migrations.
- [ ] Supported BIM/IFC import path.
- [ ] Deterministic costing and candidate derivation.
- [ ] Genesis/house wind mechanics.
- [ ] One structural-solver workflow.
- [ ] One CFD workflow.
- [ ] Wind and earthquake benchmark cases.
- [ ] Result/report export with provenance and limitations.
- [ ] Physical-calibration interface documented and implemented.
- [ ] Dignity Studio/1BR/2BR/3BR specimen family.
- [ ] Declare RPE v1.0 complete and feature-freeze except defects.

## Permanent Validation Doctrine
- [ ] For every serious benchmark: **CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**.
- [ ] Preserve discrepancies; investigate rather than hide or average them away.
- [ ] Keep manual/code, solver, RPE physics, visualization, and physical-test evidence as distinct layers.
