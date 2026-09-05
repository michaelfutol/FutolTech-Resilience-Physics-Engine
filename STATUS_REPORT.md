# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`  
**Engine ladder:** `docs/ENGINE_INTEGRATION_LADDER.md`

## Current truth

RPE has a trustworthy Phase 2 data/cost/candidate spine, a completed Phase 3 Genesis first-mechanics path, and an active Phase 4 Small House Wind System.

Current Phase 4 progression:

**staged topology ✅ → primary-support isolated formula ✅ → wall/roof exposure readiness ✅ → connection location review ✅ → bracing topology ✅ → anchorage interface ✅ → storm-protection topology ✅ → controlled A/B input audit ✅ → analytical surface wind action 🔵**

The older Typhoon playback remains conceptual and is not promoted to calculated physics.

## Dependencies and QA

- Canonical app: Next.js / `eslint-config-next` `16.3.4`, `@react-three/rapier@2.2.0`.
- Browser QA: isolated pinned `playwright@1.62.1` with separate `npm audit --audit-level=high`.
- Normal CI gates install, lint, strict TypeScript, automated tests, and production build.
- Production-browser acceptance retains Genesis and Phase 4 staged-house suites.

## Phase 3 Genesis — EXIT GATE SATISFIED

Panel 001 has explicit analytical wind inputs, calculated connection demand/capacity, release/debris-dynamics gates, Rapier debris, genuine collision evidence, and separately gated post-release center-of-mass aerodynamic force over a declared fixed-step interval.

Evidence boundaries remain explicit: analytical calculations are not solver/CFD evidence; Rapier observations are `rpe_simulation`; browser checks are `browser_qa`; none are physical-test evidence.

## Phase 4 Small House Wind System — ACTIVE

### Completed topology/readiness spine

- Stable versioned specimen, stage order, object identity, geometry, orientation, provenance, and explicit UNKNOWN/null mechanics inputs.
- Empty envelope stays `N/A / no_physical_specimen`.
- Primary support has one deliberately narrow Euler–Bernoulli cantilever benchmark only; no whole-house strength claim.
- Floor/ring frame preserves member/topology review without invented joints or frame mechanics.
- Wall/roof panels preserve geometry/exposure semantics and geometry-only areas; aerodynamic coefficients/effective area remain separate inputs.
- Connection topology is distinct from physical joint location; browser artifact `9964232114`.
- Bracing canonical path remains intentionally incomplete; browser artifact `9964350351`.
- Anchorage interface identity is explicit while physical anchor/foundation/soil mechanics remain unavailable; production artifact `9964743865`, clean-head artifact `9964831153`.
- Storm Protection canonical strap remains one-ended and `restraint_path_incomplete`; production artifact `9964940298`, clean-head artifact `9965015712`.

### Controlled A/B specimen difference — COMPLETE FOR CURRENT INPUT-CONTROL SCOPE

RPE now has a deterministic stable-ID A/B invariant comparator.

Canonical QA pair:
- Case A = canonical `SYNTHETIC_PHASE4_HOUSE`.
- Case B = the same specimen plus one declared QA-only connection record `synthetic-connection-storm-west-second-end`, from `synthetic-storm-strap-west` to `synthetic-anchor-nw`.
- Added connection capacity remains UNKNOWN (`null`).

The comparator requires all unrelated inputs to remain invariant:
- specimen metadata;
- envelope;
- component identity and every component field;
- component geometry/orientation;
- every pre-existing connection record.

It rejects missing declared changes, geometry/property drift, unrelated connection changes, and multiple simultaneous variables. Array order alone is ignored through stable-ID canonicalization.

Successful evidence is limited to:
- `state = controlled_input_difference`;
- `evidenceLayer = rpe_input_review`;
- mechanics unavailable;
- performance comparison unavailable;
- structural result `N/A`;
- no winner/strength ranking/benefit conclusion.

Evidence:
- RPE CI `33959003440` passed all permanent software gates.
- Production Chromium `33959003346` passed the retained Genesis + Phase 4 browser suite.
- Browser artifact ID `9967337114`.

### Analytical surface wind action — CURRENT GATE

The next Phase 4 bridge is a transparent single-surface wind action. It will reference one active wall/roof panel and require explicit aerodynamic/action inputs rather than deriving them from rendered geometry.

First-slice required inputs:
- stable wall/roof panel ID;
- air density;
- wind speed;
- explicitly supplied effective wind area;
- explicit signed coefficient basis;
- explicit finite global action direction;
- provenance and verification state.

Planned first transparent result:
- `q = 0.5ρV²`;
- signed scalar surface action from supplied coefficient inputs;
- global force vector from the explicit direction vector.

It will remain **RPE_ANALYTICAL / NON-CFD / NON-CODE-COMPLIANCE**. It must not infer code coefficients/zones, internal pressure, gust/topographic/shielding factors, tributary load paths, connection demand, support reactions, uplift/sliding resistance, or PASS/FAIL.

## Why Phase 4 remains open

The locked roadmap requires more than topology and an A/B input audit. Phase 4 still needs house-level evidence for:
- pressure/load vectors;
- connection demand/capacity state;
- uplift and sliding reactions;
- racking indicators;
- failure sequence;
- detached-component debris;
- residual state after load removal where supported.

Therefore the current A/B success does **not** close Phase 4.

## Engine integration ladder

Locked architecture:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

OpenSees-class structural coupling and one OpenFOAM CFD workflow remain mandatory RPE v1.0 gates.

## Open gates / limitations

- Final Phase 2 manual browser visual acceptance remains outstanding.
- No Phase 4 whole-house wind performance result exists yet.
- No global frame/load-path solver result exists yet.
- Bracing, anchorage, and storm-restraint structural mechanics remain intentionally unavailable until their physical inputs are explicit.
- No OpenSees, CalculiX, OpenFOAM, or physical-test evidence has yet been generated for the Phase 4 house.

## Evidence doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, browser visualization/QA, and future physical tests remain separate evidence layers. A green software/browser test does not promote a model to solver, code-compliance, CFD, material-test, or physical-test evidence.
