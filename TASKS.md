# Tasks

## Completed foundation
- [x] Phase 0 repository foundation and durable project records.
- [x] Phase 1 engineering cockpit / scripted visual MVP shell.
- [x] Phase 1.5 UI refinement and token system.
- [x] Lock finite RPE v1.0 roadmap and validation doctrine.

## Phase 2 — Data Spine, Costing, Immutable Prototypes
- [x] Product / Assembly / CostRate separation and runtime validation.
- [x] Unknown engineering properties remain explicit `null` / unverified.
- [x] Deterministic assembly/specimen costing with separated material/labor/equipment/installation.
- [x] Local rate and quantity/takeoff overrides remain non-destructive context.
- [x] A0 immutable → temporary draft → explicit candidate derivation.
- [x] Candidate persistence/revalidation and lineage display.
- [x] Assembly-backed upgrade flow; incomplete engineering definitions remain blocked.
- [x] Retire legacy Material/CostItem/fixed UpgradeRule paths from active application code.
- [x] Automated catalog/cost/derivation/persistence/workflow tests and CI.
- [ ] Perform manual browser visual acceptance: selectors, quantity/rate overrides, upgrade Apply, Reset, Create Candidate, refresh persistence, lineage, validation warnings.
- [ ] Record final Phase 2 exit checkpoint after browser acceptance.

## Cross-Cutting Dependency Hygiene
- [x] Classify the direct Next.js advisory gate.
- [x] Upgrade `next` + matching `eslint-config-next`; canonical branch is now on `16.3.4`.
- [x] Regenerate `package-lock.json` without hand-editing integrity data.
- [x] Run fresh dependency audit and remediate remaining advisories without force.
- [x] Record clean dependency-audit gate.
- [x] Install `@react-three/rapier@2.2.0` after the dependency gate became green.
- [x] Remove one-shot dependency maintenance/install workflows after use.

## Phase 3 — Genesis Test Chamber
- [x] Define versioned Genesis wind, panel, connection, evidence-layer and result types.
- [x] Add tested kph↔m/s conversion.
- [x] Add simplified analytical dynamic pressure `q = 0.5ρV²` with caller-supplied density and explicit units.
- [x] Add panel action `F = qAC` with caller-supplied area and coefficient.
- [x] Add deterministic connection demand/capacity assessment; unknown capacity remains `unverified`.
- [x] Lock Null House result type to `N/A / no_physical_specimen`.
- [x] Create semi-transparent Null House envelope in the viewport and expose the `N/A` result contract.
- [x] Add Fast Smoke / streamline visualization explicitly labeled non-CFD and disabled until explicit speed/direction input is supplied.
- [x] Add one panel wired to the analytical wind-action result.
- [x] Add explicit equivalent connection state and provenance/evidence sequence.
- [x] Add deterministic A/B analytical comparison path and tests.
- [x] Add deterministic rigid-body release eligibility gate and tests.
- [x] Add explicit debris-dynamics initial-condition gate; no gravity/velocity/spin is silently invented.
- [x] Install Rapier after dependency-audit gate.
- [x] Wire explicit panel mass plus gravity/initial linear velocity/initial angular velocity inputs into the Genesis UI.
- [x] On `release_ready` + `simulation_ready`, instantiate the panel as a Rapier rigid body using only explicit rigid-body inputs.
- [ ] Add collision/debris event logging while keeping RPE simulation distinct from analytical evidence.
- [ ] Define any post-release wind/aerodynamic loading explicitly before applying it to debris.
- [ ] Add synchronized A/B simulation/replay path.

## Later phases
- [ ] Whole-house hazard mechanics.
- [ ] Dignity Studio/1BR/2BR/3BR controlled family.
- [ ] BIM/IFC supported import subset.
- [ ] OpenSees/CalculiX structural-solver coupling.
- [ ] OpenFOAM CFD coupling.
- [ ] Multi-hazard layers.
- [ ] Permanent benchmark library (`RPE-WIN-001`, `RPE-RC-001`, `RPE-MAS-001`, `RPE-RC-002`).
- [ ] Physical-validation/calibration interface and later test evidence.
- [ ] RPE v1.0 reproducible release and freeze.

## Permanent Validation Doctrine
- [ ] For every serious benchmark: **CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**.
- [ ] Preserve discrepancies; investigate rather than hide or average them away.
- [ ] Keep manual/code, solver, RPE analytical/simulation, visualization, and physical-test evidence distinct.
