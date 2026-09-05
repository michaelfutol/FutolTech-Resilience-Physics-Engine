# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`

## Current truth

RPE has a trustworthy Phase 2 data/cost/candidate spine, a completed Phase 3 Genesis first-mechanics path, and an active Phase 4 Small House Wind System. Phase 4 now includes a validated staged-house viewer, an explicit primary-support readiness gate, and the first hand-checkable analytical support-response benchmark.

The older Typhoon playback remains conceptual and is not promoted to calculated physics.

### Phase 2
- Data spine, deterministic costing, immutable A0→draft→candidate derivation, catalog/upgrade UI migration, persistence, and automated verification are implemented.
- Final manual Phase 2 browser visual acceptance remains a separate outstanding gate before recording the Phase 2 exit checkpoint.

### Dependencies and QA
- Canonical app remains on Next.js / `eslint-config-next` `16.3.4` and `@react-three/rapier@2.2.0`.
- Browser QA uses isolated pinned `playwright@1.62.1`; browser-tooling evidence remains separate from application dependency evidence.
- Normal CI continues to gate install, lint, strict TypeScript, automated tests, and production build.

## Phase 3 Genesis — EXIT GATE SATISFIED

Panel 001 has explicit analytical wind inputs, calculated connection demand/capacity, release/debris-dynamics gates, Rapier debris, genuine collision evidence, and separately gated post-release center-of-mass aerodynamic force over a declared fixed-step interval.

Evidence boundaries remain explicit: analytical calculations are not solver/CFD evidence; Rapier observations are `rpe_simulation`; browser checks are `browser_qa`; none are physical-test evidence.

## Phase 4 Small House Wind System — ACTIVE

### Staged-house foundation
Implemented and accepted:
- versioned `SmallHouseWindSpecimenInput`;
- locked stage sequence `empty_envelope → primary_supports → floor_ring_frame → walls → roof → connections → bracing → anchorage → storm_protection`;
- stable object identity;
- explicit center/size/orientation;
- unknown material/mass/connection capacity preserved as `null`;
- immutable stage materialization;
- empty envelope remains `N/A / no_physical_specimen`;
- geometry-only physical stages remain `DECLARED_COMPONENTS_ONLY`;
- staged `Small House` browser viewer with `VISIBLE ≠ ADEQUATE` boundary;
- connection records remain topology only and do not invent physical joint coordinates.

### Primary-support readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE

Added a dedicated `rpe_input_review` contract that:
- references a validated active `primary_support` by stable ID;
- preserves staged center, size, rotation, material ID, mass, provenance, and verification state;
- requires an explicit local longitudinal axis;
- requires all six DOFs at both ends to be explicitly `free` or `restrained` with provenance;
- keeps E, area, principal moments, strength, material, and mass unknown unless explicitly supplied;
- explicitly prevents rendered box dimensions from silently becoming section area or second moment;
- returns no reaction, displacement, stress, buckling, capacity, PASS/FAIL, or whole-house performance result.

Readiness validation evidence:
- Normal RPE CI run `33941591924` passed.
- Production browser run `33941591888` passed Genesis and Phase 4 acceptance.
- Browser artifact ID `9962015647`.

### First calculated primary-support benchmark — COMPLETE FOR ISOLATED FORMULA SCOPE

Implemented `linear_elastic_euler_bernoulli_cantilever_tip_load` as an `rpe_analytical` benchmark only.

Required before calculation:
- reviewable primary-support identity;
- exact fixed–free six-DOF end idealization;
- explicit E;
- explicit selected principal I;
- explicit signed free-end transverse point load P;
- provenance and verification state for all calculation-driving values.

Calculated outputs only:
- `V = |P|`;
- `M = |P|L`;
- `δ = PL³/(3EI)`.

Length L comes only from the explicitly declared local longitudinal-axis dimension. The benchmark does not derive section properties from rendered geometry.

Explicit exclusions:
- no strength/capacity verdict;
- no PASS/FAIL;
- no shear-deformation correction;
- no P-Δ/geometric nonlinearity;
- no connection slip/joint flexibility;
- no material nonlinearity;
- no solver/CFD authority;
- no whole-house load-path claim.

Hand-check regression fixture: L=3 m, P=1000 N, E=10 GPa, I=1×10^-4 m^4 → V=1000 N, M=3000 N·m, δ=0.009 m.

Production-browser synthetic fixture: L=2.7 m with the same P/E/I → V=1000 N, M=2700 N·m, δ=0.006561 m; capacity remains `NOT_EVALUATED`.

Validation evidence:
- Normal RPE CI run `33941910807` passed install, lint, strict TypeScript, automated tests, and production build.
- Production browser run `33941910817` passed both Genesis and Phase 4 suites.
- Browser artifact `browser-acceptance-190ad3b4bf63f81d53005b3f6b6cfee98c0e4abe`, artifact ID `9962116271`.

## Evidence doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, browser visualization/QA, and future physical tests remain separate evidence layers. A green software or browser test does not promote a model to solver, code-compliance, CFD, material-test, or physical-test evidence.

## Open gates / limitations
- Final Phase 2 manual browser visual acceptance remains outstanding.
- Phase 4 still has no whole-house wind performance result.
- The cantilever benchmark is an isolated formula benchmark, not a structural design/capacity check.
- Existing Phase 4 connection records still lack physical joint-coordinate semantics.
- No global frame stiffness/load distribution, racking, uplift/sliding system result, contact mechanics, impact/damage model, structural-solver result, CFD result, or physical-test evidence has been inferred.

## Exact next gated task

Define and test the first **floor/ring-frame member readiness contract**. It must reference an active staged `floor_ring_frame_member` by stable ID, preserve its geometry/orientation/provenance, require an explicit local longitudinal axis and endpoint-role semantics, and keep joint coordinates/material/stiffness/loads/global frame response unknown until explicitly introduced. Do not infer physical joint locations from member centers and do not calculate whole-frame behavior in this readiness batch.
