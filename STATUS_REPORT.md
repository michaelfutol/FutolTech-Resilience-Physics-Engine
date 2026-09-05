# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`  
**Engine ladder:** `docs/ENGINE_INTEGRATION_LADDER.md`

## Current truth

RPE has a trustworthy Phase 2 data/cost/candidate spine, a completed Phase 3 Genesis first-mechanics path, and an active Phase 4 Small House Wind System.

Current Phase 4 progression:

**staged topology ✅ → primary-support isolated formula ✅ → wall/roof exposure readiness ✅ → connection location review ✅ → bracing topology ✅ → anchorage interface ✅ → storm-protection topology ✅ → controlled A/B input audit ✅ → single-surface analytical wind action ✅ → controlled multi-surface load set ✅ → explicit force-application points 🔵**

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

The stable-ID comparator proves exactly one declared connection-record difference while specimen metadata, envelope, every component record/geometry, and all pre-existing connections remain invariant. Successful evidence is `rpe_input_review` only: mechanics, performance ranking, winner, and benefit claims remain unavailable.

Evidence:
- RPE CI `33959003440`.
- Production Chromium `33959003346`.
- Browser artifact `9967337114`.

### Single-surface analytical wind action — COMPLETE FOR CURRENT ANALYTICAL SCOPE

One active wall/roof panel may receive a transparent analytical action only from explicit inputs: stable surface ID, air density, wind speed, caller-supplied effective wind area, signed coefficient, explicit global action direction, provenance, and verification.

Canonical north-wall QA case:
- geometry-only face area `7.140000 m²`;
- declared `A_eff = 5.000000 m²`;
- `ρ = 1.2 kg/m³`;
- `V = 20 m/s`;
- `C = -0.8`;
- explicit direction `(0,0,2)` → normalized `(0,0,1)`;
- `q = 240 Pa`;
- `qC = -192 Pa`;
- scalar force `-960 N`;
- global force vector `(0,0,-960) N`.

Permanent boundary: **RPE_ANALYTICAL / NON-CFD / NON-CODE-COMPLIANCE**. Geometry never becomes `A_eff`, rendered orientation never manufactures force direction, and no code coefficient/zone, internal pressure, tributary path, reaction, connection demand, racking result, or PASS/FAIL is inferred.

Evidence:
- RPE CI `33959585363`.
- Production Chromium `33959585360`.
- Browser artifact `9967518320`.

### Controlled multi-surface analytical load set — COMPLETE FOR CURRENT VECTOR-ALGEBRA SCOPE

The load-set contract reuses the accepted single-surface calculator for two or more unique active wall/roof surfaces. Every surface must independently be `analytical_ready`; one blocked/invalid surface blocks the complete set and no partial sum is produced. Duplicate surface IDs are prohibited in schema `0.1.0`, and output is canonicalized by stable surface ID so caller array order is not engineering meaning.

Canonical two-wall QA case:
- north wall vector `(0,0,-960) N`;
- east wall vector `(480,0,0) N`;
- algebraic global vector sum `(480,0,-960) N`;
- pure vector magnitude `1073.313 N`.

Permanent boundary: **RPE_ANALYTICAL / VECTOR ALGEBRA ONLY / NON-CFD / NON-CODE-COMPLIANCE**. The sum is explicitly **not** a reaction, structural-model base shear, uplift/sliding demand, racking demand, connection demand, moment/torque, load-path distribution, CFD integration, code wind load, or adequacy verdict. No moment is calculated because no explicit force-application points or moment reference exist yet.

Evidence:
- Core regression/CI gate `33960418016` passed.
- Permanent clean-head RPE CI `33960633262` passed.
- Production Chromium `33960633248` passed retained Genesis + Phase 4 acceptance.
- Browser artifact `9967837588`.

### Current gate — explicit surface force-application points

The next bridge is to attach each already-valid analytical surface force vector to an **explicit caller-declared global application point** while keeping the force itself unchanged.

First-slice rules:
- reference an already-valid surface-action result by stable surface ID;
- require an explicit finite global application point plus provenance/verification;
- do not infer centroid, center of pressure, panel center, joint, support, or solver node from rendered geometry;
- preserve the original force vector exactly;
- application-point identity is mapping evidence only, not load-path distribution;
- no moment/torque until a separate explicit reference-point contract is approved;
- no reaction, connection demand, base shear, racking, or PASS/FAIL.

After this mapping gate, RPE may define a traceable structural load-case adapter instead of inferring tributary paths from scene geometry.

## Why Phase 4 remains open

The locked roadmap still needs house-level evidence for pressure/load vectors, connection demand/capacity state, uplift/sliding reactions, racking indicators, failure sequence, detached-component debris, and residual state where supported. Multi-surface vector aggregation alone does not satisfy those mechanics/solver requirements.

## Engine integration ladder

Locked architecture:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

OpenSees-class structural coupling and one OpenFOAM CFD workflow remain mandatory RPE v1.0 gates.

## Open gates / limitations

- Final Phase 2 manual browser visual acceptance remains outstanding.
- No Phase 4 whole-house structural wind performance result exists yet.
- No global frame/load-path solver result exists yet.
- Bracing, anchorage, and storm-restraint structural mechanics remain intentionally unavailable until their physical inputs are explicit.
- No OpenSees, CalculiX, OpenFOAM, or physical-test evidence has yet been generated for the Phase 4 house.

## Evidence doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, browser visualization/QA, and future physical tests remain separate evidence layers. A green software/browser test does not promote a model to solver, code-compliance, CFD, material-test, or physical-test evidence.
