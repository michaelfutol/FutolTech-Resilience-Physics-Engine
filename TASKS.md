# Tasks

## Phase 0: Repo Foundation
- [x] Initial repository setup and folder structure.
- [x] Create project documentation (README, ROADMAP, MVP scope, etc.).
- [x] Set up sample JSON data files (`materials`, `specimens`, `hazards`).
- [x] Add missing sample JSON data files (`failure-events`, `cost-items`).
- [x] Establish agent instructions and reporting formats.

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
- [x] Add GitHub Actions CI baseline: install, lint, TypeScript, build.
- [ ] Add automated catalog-validation test execution to CI.
- [ ] Add upgrade-reference validation after upgrade schema is migrated into the Phase 2 model.

## Phase 2B: Costing Engine
- [ ] Implement pure `calculateAssemblyCost` function.
- [ ] Implement pure `calculateSpecimenCost` function.
- [ ] Apply material waste exactly once and only where intended.
- [ ] Keep labor/equipment/installation separate and traceable.
- [ ] Support library rate vs supplier quote vs user override without overwriting source data.
- [ ] Add deterministic costing tests.

## Phase 2C: Prototype Derivation
- [ ] Keep A0 immutable.
- [ ] Add temporary draft configuration state.
- [ ] Implement upgrade/substitution diff against A0.
- [ ] Add explicit `Create Candidate` action to create A1.
- [ ] Record `parentSpecimenId`, applied upgrades, and manifest differences.
- [ ] Verify Reset restores original A0.

## Phase 2D: Catalog / Cost UI
- [ ] Replace legacy material manifest with Product/Assembly-driven controls.
- [ ] Add approved alternative dropdowns.
- [ ] Add quantity override controls.
- [ ] Add unit-cost override controls with clear provenance labels.
- [ ] Display unverified engineering properties visibly as `[Unverified]`.
- [ ] Retire legacy `Material` and `CostItem` UI/data paths when migration is complete.

## Phase 2E: Phase 2 Verification
- [ ] Add unit/reference/cost/derivation tests.
- [ ] Confirm displayed totals equal itemized totals.
- [ ] Run lint, strict TypeScript, tests, and production build in CI.
- [ ] Update README/STATUS/ROADMAP and checkpoint Phase 2.

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

## Phase 5: Engineering Solver Coupling
- [ ] Define manual-calculation trace format for every benchmark test.
- [ ] Add conventional-solver comparison interface.
- [ ] Plan OpenSees nonlinear structural coupling.
- [ ] Plan OpenFOAM CFD coupling.
- [ ] Plan CalculiX / other FEA integration where appropriate.

## Permanent Validation Doctrine
- [ ] For each serious benchmark: CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY.
- [ ] Preserve discrepancies; investigate them rather than hiding or averaging them away.
- [ ] Keep physical-test data as a separate evidence layer when future destructive tests become available.
