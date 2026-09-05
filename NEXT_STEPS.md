# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — remains active. The current progression is:

**topology/staging spine ✅ → primary-support isolated formula ✅ → wall/roof exposure readiness ✅ → connection location review ✅ → bracing topology ✅ → anchorage interface ✅ → storm-protection topology ✅ → controlled A/B input audit ✅ → single-surface analytical wind action ✅ → controlled multi-surface load set ✅ → explicit force-application points 🔵**

The exact next layer is **explicit analytical surface force-application-point mapping**.

Phase 4 is not complete. The locked roadmap still requires traceable house-level pressure/load vectors and, through later explicitly sourced mechanics/solver gates, connection demand/capacity state, uplift/sliding reactions, racking indicators, failure sequence, detached debris, and residual state where supported.

## Newly completed — Controlled multi-surface analytical load set

The first multi-surface Phase 4 load set is complete for deterministic vector algebra only.

Contract behavior:
- accepts two or more unique active wall/roof surface-action records;
- reuses `calculateSmallHouseSurfaceWindAction` for every action rather than introducing a second aerodynamic path;
- requires every individual action to be analytically ready;
- blocks the whole set if any action is invalid/blocked and never sums partial data;
- prohibits duplicate `surfaceComponentId` records in schema `0.1.0`;
- preserves each individual result and provenance;
- canonicalizes output by stable surface ID so caller array order has no engineering meaning;
- calculates only the algebraic sum of the already-proven explicit global force vectors and its Euclidean magnitude;
- keeps structural result `N/A` and evidence layer `rpe_analytical`.

Canonical two-wall QA fixture:
- `synthetic-wall-north`: `(0,0,-960) N`;
- `synthetic-wall-east`: `(480,0,0) N`;
- algebraic vector sum: `(480,0,-960) N`;
- resultant vector magnitude: `1073.313 N`.

Permanent boundary:
- **RPE_ANALYTICAL / VECTOR ALGEBRA ONLY / NON-CFD / NON-CODE-COMPLIANCE**;
- vector sum is not a support/foundation reaction;
- not a structural-model base shear;
- not anchorage uplift/sliding demand;
- not racking or connection demand;
- not load-path distribution;
- not CFD pressure integration;
- not code-compliance wind load;
- not whole-house resistance/adequacy/PASS-FAIL;
- moment/torque remains `N/A` because force application points and a moment reference have not yet been defined.

Evidence:
- Core regression/CI run `33960418016` passed.
- Permanent RPE CI run `33960633262` passed install, lint, strict TypeScript, all regressions, and production build.
- Production Chromium run `33960633248` passed retained Genesis + Phase 4 browser acceptance.
- Browser artifact ID `9967837588`.

## Exact next gated batch — Explicit force-application points

The next gate must add **location semantics**, not structural distribution. Every already-valid analytical surface force remains unchanged; the new contract only records where that force is explicitly declared to act in global coordinates.

### First-slice scope

For one ready single-surface action, require:
- stable surface component ID matching the analytical action;
- explicit finite global application point `(x,y,z)` in metres;
- source/provenance note;
- verification state.

The result should preserve:
- the original analytical surface action and force vector exactly;
- the explicit application point exactly;
- `evidenceLayer = rpe_analytical`;
- `structuralResult = N/A`.

### Permanent anti-inference rules

The mapping contract must **not** infer or substitute:
- rendered panel center;
- geometric centroid;
- center of pressure;
- connection/joint location;
- support/anchor location;
- nearest frame member;
- solver node;
- tributary/load-path destination.

The application point is caller-declared mapping evidence only.

### Moment/torque rule

Even after a force application point exists, **do not calculate moment/torque yet**. Moment requires a separately explicit, justified reference point/axis contract. The first application-point gate therefore keeps:
- `MOMENT/TORQUE: N/A`;
- `REACTION: N/A`;
- `BASE SHEAR: N/A`;
- `CONNECTION DEMAND: N/A`;
- `RACKING: N/A`;
- `PASS/FAIL: N/A`.

### Required regression proof

1. Missing/non-finite application coordinates are rejected.
2. Surface ID must match the underlying ready surface action.
3. A blocked/non-ready surface action cannot receive a valid mapping result.
4. Changing rendered geometry cannot silently change the explicit application point.
5. Returned mapping data is copied rather than aliased.
6. Force vector remains byte/value-equivalent to the accepted analytical surface action.
7. No moment, reaction, structural distribution, or adequacy field becomes available.

### Required browser proof

Use the accepted north-wall QA action and explicitly declare a global QA application point that is deliberately **not identical to the rendered wall center**, so Chromium can prove the point was not inferred from geometry.

The live panel must visibly show:
- stable surface ID;
- original force vector `(0,0,-960) N`;
- caller-declared application point;
- `APPLICATION POINT BASIS: CALLER_DECLARED_GLOBAL_POINT`;
- `CENTER OF PRESSURE: N/A`;
- `SOLVER NODE: N/A`;
- `MOMENT/TORQUE: N/A`;
- `REACTION: N/A`;
- `PASS/FAIL: N/A`.

Lowering below wall activation must clear/block the mapping together with its source surface action.

## Following Phase 4 order

After application-point mapping:

1. Define an explicit moment-reference contract only if moment/resultant reporting is justified.
2. Define traceable structural node/load-case mapping semantics; never infer tributary paths from scene geometry.
3. Couple validated load cases to an engineering structural solver layer such as OpenSees-class analysis before calling any vector sum a structural response.
4. Define connection, bracing, anchorage, and storm-restraint mechanics only when their physical/mechanical inputs are explicit.
5. Reuse the controlled A/B invariant engine when corresponding analytical/solver evidence exists so exactly one structural variable changes.
6. Generate the locked roadmap outputs before declaring Phase 4 complete.

## Engine integration ladder

Locked separately in `docs/ENGINE_INTEGRATION_LADDER.md`:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

OpenSees-class structural coupling and one OpenFOAM CFD workflow remain required RPE v1.0 gates.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
