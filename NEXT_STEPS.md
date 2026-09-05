# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — remains active. The current progression is:

**topology/staging spine ✅ → primary-support isolated formula ✅ → wall/roof exposure readiness ✅ → connection location review ✅ → bracing topology ✅ → anchorage interface ✅ → storm-protection topology ✅ → controlled A/B input audit ✅ → single-surface analytical wind action ✅ → controlled multi-surface load set 🔵**

The exact next layer is **controlled multi-surface analytical load aggregation**.

Phase 4 is not complete. The locked roadmap still requires traceable house-level pressure/load vectors and, through later explicitly sourced mechanics/solver gates, connection demand/capacity state, uplift/sliding reactions, racking indicators, failure sequence, detached debris, and residual state where supported.

## Newly completed — Single-surface analytical wind action

The first Phase 4 pressure/load-vector contract is complete for one active staged `wall_panel` or `roof_panel`.

Required explicit inputs are:
- stable surface component ID;
- declared local axis used only to report geometry-only face area;
- air density `ρ`;
- wind speed `V`;
- caller-supplied effective wind area `A_eff`;
- explicit signed coefficient;
- explicit finite global action direction vector;
- separate provenance and verification states.

The transparent first-slice path is:
- `q = 0.5ρV²`;
- signed surface pressure `qC`;
- scalar surface force `qA_effC`;
- global force vector = scalar force × normalized explicit global action direction.

Canonical wall QA case:
- `synthetic-wall-north`;
- geometry-only local-z face area = `7.140000 m²`;
- declared `A_eff = 5.000000 m²`;
- `ρ = 1.2 kg/m³`;
- `V = 20 m/s`;
- signed coefficient `C = -0.8`;
- explicit direction `(0,0,2)` normalized to `(0,0,1)`;
- `q = 240 Pa`;
- `qC = -192 Pa`;
- scalar force `-960 N`;
- global force vector `(0,0,-960) N`.

Permanent boundary:
- evidence layer = `rpe_analytical`;
- **RPE_ANALYTICAL / NON-CFD / NON-CODE-COMPLIANCE**;
- geometry-only face area is never substituted for `A_eff`;
- rendered rotation never manufactures the action direction;
- no code pressure coefficient/zone, internal pressure, gust/topographic/shielding factor, tributary load path, connection demand, support reaction, uplift/sliding resistance, racking result, PASS/FAIL, or adequacy is inferred.

Evidence:
- RPE CI run `33959585363` passed install, lint, strict TypeScript, all regressions, and production build.
- Production Chromium run `33959585360` passed retained Genesis + Phase 4 acceptance.
- Browser artifact ID `9967518320`.

## Exact next gated batch — Controlled multi-surface analytical load set

The next gate should reuse the proven single-surface calculator rather than create a second aerodynamic formula path.

### First-slice scope

Accept a caller-declared set of **two or more unique active wall/roof surface action records**. Each record must independently satisfy the single-surface contract. The aggregation layer may then perform only deterministic algebra on those already-proven global force vectors.

Required behavior:
- require at least two surface-action records;
- require unique `surfaceComponentId` values in the first schema; duplicate load patches on one surface are not silently combined;
- run every record through `calculateSmallHouseSurfaceWindAction`;
- if any individual action is blocked/invalid, block the load set and identify the failed surface rather than summing partial data;
- preserve each surface result and its provenance;
- sort/canonicalize output by stable surface ID so input array order is not engineering meaning;
- calculate the algebraic sum of the explicit global force vectors only;
- optionally report resultant vector magnitude as pure vector algebra, clearly not a reaction or capacity demand;
- keep structural result `N/A` and evidence layer `rpe_analytical`.

### Permanent anti-inference rules

The multi-surface sum must not be labeled or reused as:
- a support or foundation reaction;
- anchorage uplift/sliding demand;
- frame base shear from a structural model;
- racking demand;
- connection/joint force;
- center-of-pressure moment or torque;
- load-path distribution;
- CFD pressure integration;
- code-compliance wind load;
- whole-house resistance, adequacy, or PASS/FAIL.

No moment/torque may be calculated until explicit force application points and a justified moment reference contract exist.

### Canonical first regression target

Use two explicit wall actions at the `walls` stage so no future roof data is read early. A suitable QA pair is:
- north wall: the accepted `-960 N` global Z action;
- east wall: a separately declared explicit X-directed action with its own `A_eff`, coefficient, direction, provenance, and verification.

The test should hand-check both individual actions and the exact vector sum. Reversing input array order must produce the same canonical load-set result.

### Required browser proof

1. Multi-surface panel visibly identifies itself as **RPE_ANALYTICAL / NON-CFD / NON-CODE-COMPLIANCE**.
2. Both selected stable surface IDs and their explicit inputs/results are visible.
3. The vector sum matches the hand calculation.
4. The panel explicitly says `REACTION: N/A`, `MOMENT/TORQUE: N/A`, `CONNECTION DEMAND: N/A`, and `PASS/FAIL: N/A`.
5. Lowering below wall activation clears/blocks the load set.

Only after this aggregation gate is accepted should we define how analytical surface actions are mapped to explicitly declared load-application points or structural solver nodes.

## Following Phase 4 order

After multi-surface aggregation:

1. Define explicit surface force application points / mapping semantics before any moment or structural distribution.
2. Build a traceable structural load-case adapter rather than inferring tributary paths from scene geometry.
3. Define connection, bracing, anchorage, and storm-restraint mechanics only when their required physical/mechanical inputs are explicit.
4. Reuse the controlled A/B invariant engine when corresponding analytical/solver evidence exists so exactly one structural variable changes.
5. Generate the locked roadmap outputs before declaring Phase 4 complete.

## Engine integration ladder

Locked separately in `docs/ENGINE_INTEGRATION_LADDER.md`:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

OpenSees-class structural coupling and one OpenFOAM CFD workflow remain required RPE v1.0 gates.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
