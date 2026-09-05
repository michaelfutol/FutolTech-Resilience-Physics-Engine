# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`

## Current truth

RPE has a trustworthy Phase 2 data/cost/candidate spine, a completed Phase 3 Genesis first-mechanics path, and an active Phase 4 Small House Wind System. Phase 4 has now progressed cleanly through **primary supports → floor/ring frame → walls → roof** at deliberately narrow, reviewable evidence gates.

The older Typhoon playback remains conceptual and is not promoted to calculated physics.

### Phase 2
- Data spine, deterministic costing, immutable A0→draft→candidate derivation, catalog/upgrade UI migration, persistence, and automated verification are implemented.
- Final manual Phase 2 browser visual acceptance remains a separate outstanding gate before recording the Phase 2 exit checkpoint.

### Dependencies and QA
- Canonical app remains on Next.js / `eslint-config-next` `16.3.4` and `@react-three/rapier@2.2.0`.
- Browser QA uses isolated pinned `playwright@1.62.1` with `npm audit --audit-level=high`; the harness remains outside committed application dependencies.
- Normal CI gates install, lint, strict TypeScript, automated tests, and production build.
- Production-browser acceptance runs both the retained Genesis suite and the Phase 4 staged-house suite.

## Phase 3 Genesis — EXIT GATE SATISFIED

Panel 001 has explicit analytical wind inputs, calculated connection demand/capacity, release/debris-dynamics gates, Rapier debris, genuine collision evidence, and separately gated post-release center-of-mass aerodynamic force over a declared fixed-step interval.

Evidence boundaries remain explicit: analytical calculations are not solver/CFD evidence; Rapier observations are `rpe_simulation`; browser checks are `browser_qa`; none are physical-test evidence.

## Phase 4 Small House Wind System — ACTIVE

### Staged-house foundation — COMPLETE FOR CURRENT VIEWER SCOPE
- Versioned `SmallHouseWindSpecimenInput` and locked stage order:
  `empty_envelope → primary_supports → floor_ring_frame → walls → roof → connections → bracing → anchorage → storm_protection`.
- Stable object identities and explicit center/size/orientation.
- Unknown material/mass/connection capacity remain `null`.
- Immutable stage materialization.
- Empty envelope remains `N/A / no_physical_specimen`; geometry-only physical stages remain `DECLARED_COMPONENTS_ONLY`.
- `Small House` browser viewer keeps `VISIBLE ≠ ADEQUATE` explicit.
- Existing connection records remain topology-only and do not provide physical joint coordinates.

### Primary supports — COMPLETE FOR CURRENT ISOLATED FORMULA SCOPE
- `rpe_input_review` readiness references a validated active support by stable ID.
- Explicit local longitudinal axis and all 12 end-restraint DOF states are required; no defaults.
- Rendered box dimensions do not silently become section area or second moment.
- First calculated benchmark is `linear_elastic_euler_bernoulli_cantilever_tip_load` with explicit E, selected I, signed P, and provenance.
- Calculated response is limited to `V=|P|`, `M=|P|L`, `δ=PL³/(3EI)`.
- Strength/capacity remains `NOT_EVALUATED`; no PASS/FAIL, P-Δ, shear deformation, connection slip, solver, CFD, or whole-house claim.
- Browser evidence: run `33941910817`, artifact ID `9962116271`.

### Floor/ring frame readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- References an active staged `floor_ring_frame_member` by stable ID.
- Requires explicit member longitudinal axis and semantic End A / End B roles with provenance.
- Schema v0.1.0 deliberately accepts **no physical joint coordinates**; both endpoints remain unknown.
- No E/A/I/strength, load-transfer model, global frame stiffness, reactions, racking, or whole-house response is inferred.
- Clean-head CI run `33942392860` passed.
- Production-browser run `33942392870` passed.

### Wall geometry / exposure readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- References an active staged `wall_panel` by stable ID and preserves its declared geometry/orientation/provenance.
- Requires explicit local panel-normal axis, exposed-face sign, exposure class, provenance, and verification state.
- A **geometric box-face area** may be calculated from the explicitly declared local normal axis, but it is never promoted to effective wind area.
- Synthetic north-wall browser fixture with `local_z` normal reports `7.140000 m² — GEOMETRY ONLY`.
- Effective wind area, wind velocity, density, external/internal pressure coefficients, net pressure, panel stiffness, strength, and fastener capacity remain undefined.
- Clean-head CI run `33942823443` passed.
- Production-browser run `33942823436` passed; artifact ID `9962401294`.

### Roof geometry / exposure readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- References an active staged `roof_panel` by stable ID and preserves rotated roof geometry/orientation/provenance.
- Requires explicit local panel-normal axis, exposed-face sign, exposure class, provenance, and verification state.
- Synthetic `synthetic-roof-west` preserves `rotationRad.z = 0.35`; declaring `local_y` as the panel normal reports `9.840000 m² — GEOMETRY ONLY`.
- `roofZone`, effective wind area, external/internal pressure coefficients, net pressure, uplift force, panel stiffness/strength, and connection demand/capacity remain undefined.
- `upliftCalculationAvailable` remains false; no wind-resistance or capacity claim is made.
- Initial Roof CI run `33942967313` retained one honest regression failure: binary floating-point produced `9.839999999999998` against an exact `9.84` assertion. The calculation contract was unchanged; the test was repaired with a tight `1e-12` tolerance.
- Corrective Roof CI run `33943033552` passed install, lint, strict TypeScript, all tests, and build.
- Roof browser patch run `33943182691` retained an honest patch-plumbing failure because a text anchor matched twice; no browser acceptance code was changed by that failed run. The patch was repaired using a unique multiline anchor.
- Repaired patch run `33943267515` passed and landed the Roof browser checks.
- Final clean-head RPE CI run `33943309011` passed.
- Final production-browser run `33943309015` passed both Genesis and Phase 4 suites; browser artifact `browser-acceptance-fa202ad17bf2a691186a28ecae15940b064a07a3`, artifact ID `9962552182`.

## Evidence doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, browser visualization/QA, and future physical tests remain separate evidence layers. A green software or browser test does not promote a model to solver, code-compliance, CFD, material-test, or physical-test evidence.

## Open gates / limitations
- Final Phase 2 manual browser visual acceptance remains outstanding.
- Phase 4 still has no whole-house wind performance result.
- Existing Phase 4 connection records establish object relationships only and still lack explicit physical joint-location semantics.
- No global frame/load-path calculation may use inferred member intersections or center-to-center connector geometry.
- No connection stiffness, fastener count, connector geometry/path, demand/capacity, PASS/FAIL, bracing mechanics, anchorage uplift/sliding result, solver result, CFD result, or physical-test evidence has been inferred.

## Exact next gated task

Define and test the first **connection joint-location readiness contract**.

It must reference an active staged connection by stable ID at the `connections` stage or later, preserve the original `fromComponentId`, `toComponentId`, capacity/provenance state, and require an explicit caller-supplied finite global joint point with provenance/verification before the location is reviewable. The system must prove that no plausible member-box intersection or center-to-center point is inferred when that coordinate is absent.

This first connection-location batch must **not** calculate connection demand/capacity, stiffness, slip, connector path, fastener count, load transfer, PASS/FAIL, or whole-house response. Those remain later explicit mechanics gates.
