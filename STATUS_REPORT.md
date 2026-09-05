# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`

## Current truth

RPE now has a trustworthy Phase 2 data/cost/candidate spine, a completed Phase 3 Genesis first-mechanics path, and an active Phase 4 Small House Wind System foundation. The older Typhoon playback remains conceptual and is not promoted to calculated physics.

### Phase 2
- Data spine, deterministic costing, immutable A0→draft→candidate derivation, catalog/upgrade UI migration, persistence, and automated verification are implemented.
- Final manual Phase 2 browser visual acceptance remains a separate outstanding gate before recording the Phase 2 exit checkpoint.

### Dependencies and browser QA
- Canonical application dependencies remain on the remediated graph: Next.js / `eslint-config-next` `16.3.4`, `@react-three/rapier@2.2.0`.
- Canonical `npm ci` reports zero vulnerabilities in the successful browser workflow.
- The isolated browser harness uses pinned `playwright@1.62.1` outside committed application metadata and runs `npm audit --audit-level=high`; the successful live-force browser run reported zero vulnerabilities.

## Phase 3 Genesis — EXIT GATE SATISFIED

The roadmap Phase 3 exit gate requires one panel to respond to a declared wind model, fail its connection from calculated demand, and become physically simulated debris after release. That software/mechanics gate is now satisfied.

Implemented and verified:
- Null House remains `N/A / no_physical_specimen`; Fast Smoke remains explicitly NON-CFD visualization.
- Panel 001 uses explicit caller-supplied analytical inputs for `q = 0.5ρV²` → `F = qAC`.
- Equivalent connection demand/capacity, A/B analytical comparison, rigid-body release gating, and explicit debris initial-condition gating are implemented.
- Rapier activation occurs only after release + dynamics gates are ready.
- Explicit collision-target identity/geometry/provenance is validated and instantiated in the same physics world as Panel 001.
- Genuine Rapier collision-enter evidence records only the validated target identity and stale collision evidence resets when explicit run context changes.
- Post-release aerodynamics is a separate `rpe_analytical` contract requiring explicit interval, density, relative air-velocity vector, projected area, drag coefficient, body identity, provenance, and verification state.
- Live aerodynamic application is explicit opt-in only. The force-application gate requires ready dynamics, a ready aerodynamic result, matching body identity, and provenance.
- `GenesisAerodynamicForceDriver` uses a fixed `1/60 s` Rapier physics step, clears persistent external force before every step, calls the tested deterministic scheduler, and applies only the scheduler-returned center-of-mass force while the declared window is active.
- A terminal partial physics step scales effective force so integrated impulse preserves only `F × activeDuration`; the load window is not silently extended.
- Aerodynamic torque remains explicitly unmodeled. No pre-release panel force is converted into a launch impulse or continuing debris load.
- Ordered `rpe_simulation` evidence records full-step application, partial terminal application, completion, and collision observations without promoting them to solver, CFD, code, material-test, or physical-test authority.

### Phase 3 validation evidence
- Live-force browser acceptance commit: `949a710076e4682729c2b300020fd772cfe95940`.
- Genesis Browser Acceptance run `33938570653` passed production build and real headless Chromium execution.
- Browser evidence artifact: `genesis-browser-acceptance-949a710076e4682729c2b300020fd772cfe95940`, artifact ID `9961013065`.
- Browser evidence confirmed: opt-in default blocked, dynamics prerequisite blocking, force application ready, active full fixed step, partial terminal step, completed force window, genuine collision, target identity match, evidence-boundary visibility, stale collision reset, stale aerodynamic-application reset, zero console errors, and zero page errors.
- Compatibility-repair RPE CI run `33938665291` passed install, lint, strict TypeScript, all automated tests, and production build.
- Clean-head RPE CI run `33938717530` passed after removing the one-shot live-force patch helper.

## Phase 4 Small House Wind System — ACTIVE

The first Phase 4 foundation is implemented and green:
- versioned `SmallHouseWindSpecimenInput` contract;
- explicit stage sequence matching the locked roadmap: `empty_envelope → primary_supports → floor_ring_frame → walls → roof → connections → bracing → anchorage → storm_protection`;
- stable global object identity for envelope/components/connections;
- explicit box geometry for the initial supported subset;
- material identity, mass, and connection capacity may remain `null` rather than being invented;
- component kinds are constrained to the correct construction stage;
- connections cannot reference missing components or activate before both endpoints exist;
- deterministic stage materialization returns copies rather than mutating the source specimen;
- empty-envelope stage preserves `N/A / no_physical_specimen`; later stages state only `DECLARED_COMPONENTS_ONLY` and make no performance claim.

Phase 4 contract CI run `33938835927` passed install, lint, strict TypeScript, automated tests, and production build.

## Evidence doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, browser visualization/QA, and future physical tests remain separate evidence layers. A green software test does not promote a model to solver, code-compliance, CFD, material-test, or physical-test evidence.

## Open gates / limitations
- Final Phase 2 manual browser visual acceptance remains outstanding as an independent project gate.
- Phase 4 currently has a topology/staging contract only; no whole-house wind performance result is claimed yet.
- No aerodynamic torque, detailed contact mechanics, impact force/energy, damage model, friction/restitution, solver authority, CFD authority, or physical-test authority has been inferred.

## Exact next gated task

Expose the Phase 4 staged small-house contract in the test chamber as a reviewable stage viewer. The viewer must be driven from a validated `SmallHouseWindSpecimenInput`, show the empty envelope as `N/A`, progressively instantiate only explicitly declared components/connections, preserve object identity/provenance, and make no structural-performance claim merely because geometry is visible. After that visual/data gate passes, introduce the first explicit primary-support mechanics rather than jumping directly to a complete house or decorative failure animation.
