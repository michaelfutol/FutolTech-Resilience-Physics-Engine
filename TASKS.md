# Tasks

## Completed foundation
- [x] Phase 0 repository foundation and durable project records.
- [x] Phase 1 engineering cockpit / scripted visual MVP shell.
- [x] Phase 1.5 UI refinement and token system.
- [x] Lock finite RPE v1.0 roadmap and validation doctrine.
- [x] Lock canonical RPE plugin/scientific orchestration skill: **GitHub → OpenAI Developers → Supabase → Vercel → Data Analytics → PostHog → Figma → Codex Security**.
- [x] Treat Figma as maintained architecture/state/sequence/ERD/timeline/system-diagram infrastructure and Data Analytics as a core scientific-analysis layer.

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

## Cross-Cutting Dependency / Security Hygiene
- [x] Classify the direct Next.js advisory gate.
- [x] Upgrade `next` + matching `eslint-config-next` to `16.3.4`.
- [x] Regenerate `package-lock.json` without hand-editing integrity data.
- [x] Run fresh canonical-application dependency audit and record clean audit gate.
- [x] Install `@react-three/rapier@2.2.0` only after the dependency gate became green.
- [ ] Classify and replace/upgrade the temporary Playwright browser harness version that currently reports one high advisory during its isolated no-save install. Do not confuse this with the clean committed application dependency graph.

## Phase 3 — Genesis Test Chamber
- [x] Define versioned Genesis wind, panel, connection, evidence-layer and result types.
- [x] Add tested kph↔m/s conversion.
- [x] Add simplified analytical dynamic pressure `q = 0.5ρV²` with caller-supplied density.
- [x] Add panel action `F = qAC` with caller-supplied area and coefficient.
- [x] Add deterministic connection demand/capacity assessment; unknown capacity remains `unverified`.
- [x] Lock Null House result to `N/A / no_physical_specimen`.
- [x] Add Null House viewport and NON-CFD Fast Smoke requiring explicit wind input.
- [x] Add one panel wired to analytical wind action and explicit equivalent connection state.
- [x] Add deterministic A/B analytical comparison path and tests.
- [x] Add deterministic rigid-body release eligibility gate and tests.
- [x] Add explicit debris-dynamics gate; no gravity/velocity/spin is silently invented.
- [x] Wire explicit mass/gravity/initial linear/angular velocity into Genesis UI.
- [x] Instantiate a Rapier rigid body only on `release_ready` + `simulation_ready`.
- [x] Add deterministic ordered simulation-event ledger for release gate → dynamics gate → activation → optional collision-enter records.
- [x] Ensure release-to-simulation integration regression is executed by CI.
- [x] Add immutable live-simulation evidence bridge for Rapier collision-enter observations with upstream activation enforcement.
- [x] Add reusable ordered Genesis evidence-ledger UI component.
- [x] Add and execute live-simulation-evidence regression tests in CI.
- [x] Wire the live evidence bridge into the actual Rapier `onCollisionEnter` callback and mount the ledger component in Genesis UI.
- [x] Define and test an explicit provenance-bearing collision-target contract: box identity, center, dimensions, source note, verification state only; no inferred contact/engineering properties.
- [x] Wire explicit collision-target inputs into `Viewport3D`, validate before rendering, and instantiate the validated fixed target in the same Rapier world as released Panel 001.
- [x] Carry target identity through tested narrow runtime metadata and accept it only when it matches the currently validated explicit target.
- [x] Add an executable synthetic browser-QA fixture plus documented live acceptance procedure without promoting fixture geometry into collision evidence.
- [x] Add a reproducible headless-Chromium production-build acceptance workflow and evidence artifact.
- [x] Verify a genuine live Rapier collision callback with declared target identity and confirm changed explicit target input clears the prior collision observation. Accepted on commit `510dc5c3b9892f40e82428e8aea64e3d2251b75b`, browser run `33935187278`, artifact `9959936762`.
- [ ] Define a provenance-bearing post-release aerodynamic loading/time contract before applying continuing wind force or aerodynamic torque to debris.
- [ ] Add tests proving post-release aerodynamic loading cannot run with missing time/aerodynamic inputs and cannot reuse pre-release force as an unstated impulse.
- [ ] Wire the post-release aerodynamic model only after the pure contract/calculation gate passes.
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
