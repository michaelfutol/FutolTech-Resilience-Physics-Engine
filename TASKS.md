# Tasks

## Phase 0: Repo Foundation
- [x] Initial repository setup and folder structure.
- [x] Create project documentation (README, ROADMAP, MVP scope, etc.).
- [x] Set up sample JSON data files (`materials`, `specimens`, `hazards`).
- [x] Add missing sample JSON data files (`failure-events`, `cost-items`).
- [x] Establish agent instructions and reporting formats.
- [x] Lock a finite RPE v1.0 roadmap with explicit completion gates.
- [x] Mirror the finite roadmap to Google Drive for durable planning continuity.

## Phase 1: Visual MVP Shell
- [x] Initialize React / Next.js project in root.
- [x] Build the layout shell (Top bar, Left model tree panel, Center 3D viewport, Right settings panel, Bottom timeline).
- [x] Setup Three.js / React Three Fiber placeholder in the viewport.
- [x] Load `Demo 01` sample from JSON into application state.
- [x] Implement scripted Typhoon Index 300 event playback.
- [x] Add editable upgrade placeholders and cost impact placeholders.
- [x] Add placeholder export buttons (video, screenshots, report, cost table).
- [x] Add simulation run-mode UI placeholder.
- [x] Document Prototype Rebuilder roadmap and rule-based recommendation placeholder.

## Phase 1.5: UI Refinement (Test Bench)
- [x] Document target engineering-cockpit aesthetic.
- [x] Document detailed Test Bench layout components.
- [x] Create design reference notes and Stitch prompts.
- [x] Implement CSS/layout structure.
- [x] Update components to the token-based aesthetic.

## Phase 2A: Data Spine and Integrity
- [x] Separate Product/Material Library from Assembly Library.
- [x] Add `CostRate` data separate from permanent product identity.
- [x] Add Specimen Configuration with assembly selections and ancestry fields.
- [x] Curate an initial Dignity 3×3 m product/assembly/rate dataset.
- [x] Mark unknown/unvalidated engineering properties as null/unverified rather than inventing values.
- [x] Add runtime catalog/reference validation.
- [x] Harden validation for order-independent references, parent specimens, unit compatibility, category-slot compatibility, dates, negative values, and allowances.
- [x] Add GitHub Actions CI baseline: install, lint, strict TypeScript, tests, build.
- [x] Wire Product / Assembly / CostRate loaders into the demo data layer.
- [x] Fix Phase 2A A0 lookup regression (`specimen-a0-dignity-3x3` vs legacy `A0`).
- [x] Add automated catalog-validation test execution to CI.
- [ ] Add upgrade-reference validation after upgrade schema is migrated into the Phase 2 model.

## Phase 2B: Costing Engine
- [x] Implement pure `calculateAssemblyCost` function.
- [x] Implement pure `calculateSpecimenCost` function.
- [x] Apply material waste exactly once and only to material quantity.
- [x] Keep labor/equipment/installation separate and traceable.
- [x] Support library/supplier rates plus explicit user overrides without overwriting source data.
- [x] Add deterministic costing tests.
- [x] Run costing against the curated A0 sample in automated validation.
- [x] Add explicit rounding policy for engineering quantities and currency totals.
- [x] Separate wall backing and outer cladding into distinct specimen/cost layers.
- [x] Add non-destructive local unit-rate overrides.
- [x] Add non-destructive quantity/takeoff overrides in the costing core with validation.
- [x] Reject missing rates, incompatible currencies, invalid quantities, duplicate quantity overrides, and overrides for unselected assemblies.
- [x] Wire traceable Phase 2B costing results and local unit-rate overrides into the UI.

## Phase 2C: Prototype Derivation
- [x] Keep A0 immutable.
- [x] Add temporary draft configuration state.
- [x] Implement assembly/substitution diff against A0.
- [x] Add explicit `Create Candidate` action to create A1.
- [x] Record `parentSpecimenId`, applied upgrades, and manifest differences in candidate derivation data.
- [x] Verify Reset restores original A0.
- [x] Add automated immutability / derivation tests.
- [x] Keep procurement price/quantity context separate from structural specimen ancestry.

## Phase 2D: Catalog / Cost UI
- [x] Replace the primary legacy material/cost display with Product/Assembly-driven controls.
- [x] Add assembly alternative dropdowns by compatible slot/category.
- [ ] Add quantity override controls to the visible UI; backend support is complete and tested.
- [x] Add unit-cost override controls with clear provenance behavior.
- [x] Display unverified engineering/assembly properties visibly as `[Unverified]`.
- [x] Display baseline vs draft/local-rate cost delta and itemized allowances.
- [ ] Migrate legacy fixed UpgradeOption / UpgradeRule placeholders into the Phase 2 assembly/candidate model.
- [ ] Retire legacy `Material`, `CostItem`, and fixed upgrade UI/data paths after migration is complete.

## Phase 2E: Phase 2 Verification
- [x] Add unit/reference/cost/derivation tests to CI.
- [x] Confirm deterministic calculated totals equal itemized totals for the curated A0 benchmark.
- [x] Run lint, strict TypeScript, tests, and production build successfully in CI after the latest cost-context repair.
- [ ] Add UI-level regression coverage for assembly selection, unit-rate override, quantity override, Reset, and Create Candidate interactions.
- [ ] Update README and final Phase 2 checkpoint after legacy upgrade paths are retired.
- [ ] Declare the Phase 2 exit gate passed only after the remaining UI migration and regression coverage are complete.

## Phase 3: Genesis Test Chamber — First Real Physics Milestone
- [ ] Create semi-transparent Null House envelope as a volume/boundary reference only.
- [ ] Add wind smoke/streamline visualization.
- [ ] Ensure wind passes through the Null House with no false PASS result; state should be N/A because no structure exists.
- [ ] Add one physical wall/panel specimen.
- [ ] Implement transparent wind-action calculation from stated assumptions.
- [ ] Add connection object(s) with explicit demand/capacity state.
- [ ] Add first breakable connection.
- [ ] On failure, detach panel and convert it to a free rigid body/debris object.
- [ ] Log the complete load/failure sequence.
- [ ] Add A/B comparison mode for identical hazard runs.

## Phase 4: Whole-House Hazard Expansion
- [ ] Add complete frame/roof/wall systems.
- [ ] Add uplift, racking, anchorage and storm-harness tests.
- [ ] Add driven-rain visualization and ingress model.
- [ ] Add debris profiles and secondary impact sequence.
- [ ] Add coastal storm-surge / buoyancy / hydrodynamic modules.
- [ ] Add historical-event profiles distinct from code speeds and RPE stress-test indices.

## Phase 5: Dignity Housing Family
- [ ] Lock Studio Core as the minimum model and first ₱50k research target.
- [ ] Add 1BR, 2BR, and 3BR controlled variants.
- [ ] Add elevated resilient base typology.
- [ ] Add site-screened slab/raft base typology.
- [ ] Preserve common resilience logic across all sizes.

## Phase 6: BIM / IFC Import
- [ ] Define supported IFC subset and import readiness report.
- [ ] Preserve object identity, geometry, material assignment, and relationships where available.
- [ ] Map missing simulation properties to explicit validation warnings rather than invented defaults.
- [ ] Import and save one simple Studio or 2-storey frame as an RPE specimen.
- [ ] Treat Blender/Bonsai as an optional authoring/inspection bridge, not an engineering-truth source.

## Phase 7: Structural Solver Coupling
- [ ] Define solver-neutral structural result schema.
- [ ] Add OpenSees/OpenSeesPy workflow for one benchmark.
- [ ] Add CalculiX path for selected detailed finite-element problems where appropriate.
- [ ] Preserve solver version, idealization, boundary conditions, materials, damping, convergence, source inputs, and result hashes.

## Phase 8: Wind CFD Coupling
- [ ] Define CFD result mapping to RPE surfaces.
- [ ] Add OpenFOAM workflow for one simple building.
- [ ] Keep Fast Smoke Mode distinct from CFD Smoke Mode.
- [ ] Compare simplified wind pressure and CFD pressure fields.

## Phase 9: Multi-Hazard Layers
- [ ] Add driven-rain ingress model.
- [ ] Add debris impact model and secondary debris behavior.
- [ ] Add flood/coastal hydrostatic, hydrodynamic, buoyancy, and saltwater-exposure layers.
- [ ] Keep each hazard independently parameterized and traceable.

## Phase 10: Engineering Benchmark Library
- [ ] RPE-WIN-001 — Window Assembly Extreme Wind Test.
- [ ] RPE-RC-001 — RC Column–Footing Lateral Pull.
- [ ] RPE-MAS-001 — 4 m × 4 m CHB Wall Strengthening Comparison.
- [ ] RPE-RC-002 — 2-Storey RC Earthquake Response.
- [ ] Make benchmark runs versioned, repeatable, and comparable side by side.

## Phase 11: Physical Validation and Calibration
- [ ] Freeze manual, solver, and RPE predictions before physical testing.
- [ ] Attach calibrated load/displacement/test evidence to selected benchmarks when feasible.
- [ ] Record discrepancies without overwriting original predictions.
- [ ] Calibrate only through new model/version records.

## Phase 12: RPE v1.0 Release and Freeze
- [ ] Reproducible deployment and passing CI/test suite.
- [ ] Stable specimen schema and migrations.
- [ ] Supported BIM/IFC import path.
- [ ] Deterministic costing and candidate derivation.
- [ ] Genesis/house wind mechanics.
- [ ] One structural-solver workflow.
- [ ] One CFD workflow.
- [ ] Wind and earthquake benchmark cases.
- [ ] Result-report export with provenance and limitations.
- [ ] Physical-calibration interface documented and implemented.
- [ ] Dignity Studio/1BR/2BR/3BR specimen family.
- [ ] Declare RPE v1.0 complete and feature-freeze except defects.

## Permanent Validation Doctrine
- [ ] For each serious benchmark: CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY.
- [ ] Preserve discrepancies; investigate them rather than hiding or averaging them away.
- [ ] Keep physical-test data as a separate evidence layer when future destructive tests become available.
