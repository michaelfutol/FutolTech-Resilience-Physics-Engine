# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — remains active. The current progression is:

**topology/staging spine ✅ → primary-support isolated formula ✅ → wall/roof exposure readiness ✅ → connection location review ✅ → bracing topology ✅ → anchorage interface ✅ → storm-protection topology ✅ → controlled A/B input audit ✅ → analytical surface wind action 🔵**

The exact next layer is **Phase 4 analytical surface wind action**.

Phase 4 is **not** complete merely because the A/B invariant audit passed. The locked roadmap still requires house-level pressure/load vectors, connection demand/capacity state, uplift/sliding reactions, racking indicators, failure sequence, detached debris, and residual state where supported.

## Newly completed — Controlled A/B specimen difference

The first stable-ID A/B contract is complete for **input-control evidence only**.

Canonical QA pair:
- Case A = canonical `SYNTHETIC_PHASE4_HOUSE`.
- Case B = the same validated specimen plus exactly one declared connection record, `synthetic-connection-storm-west-second-end`, from `synthetic-storm-strap-west` to `synthetic-anchor-nw`.
- Added connection capacity remains `null` / UNKNOWN.

The comparator proves:
- specimen metadata unchanged;
- envelope unchanged;
- component records unchanged;
- component geometry unchanged;
- every pre-existing connection record unchanged;
- exactly the declared connection record added.

It rejects missing declared differences, geometry/property drift, unrelated connection edits/additions, and multiple simultaneous variables. Stable-ID sorting means array ordering alone is not treated as an engineering change.

Evidence boundary:
- state: `controlled_input_difference`;
- evidence layer: `rpe_input_review`;
- mechanics available: NO;
- performance comparison: NO;
- winner/strength ranking: NOT AVAILABLE.

Canonical evidence:
- RPE CI run `33959003440` passed install, lint, strict TypeScript, full regressions, and production build.
- Production Chromium run `33959003346` passed retained Genesis + Phase 4 acceptance.
- Browser artifact ID `9967337114`.

## Exact next gated batch — Analytical surface wind action

The next step begins the actual Phase 4 pressure/load-vector path without skipping directly to whole-house mechanics.

### First-slice scope

Reference **one active staged wall or roof panel** by stable ID and require all aerodynamic/action-driving quantities explicitly. The first contract should calculate a transparent `rpe_analytical` surface action only when every required input is present.

Required explicit inputs:
- active wall/roof panel ID;
- air density `ρ`;
- wind speed `V`;
- effective wind area `A_eff` supplied explicitly and kept distinct from geometry-only panel face area;
- explicit signed coefficient basis for the first analytical action;
- explicit finite global action direction vector;
- source/provenance note;
- verification state.

First transparent calculation path:
- dynamic pressure: `q = 0.5ρV²`;
- signed scalar surface action from the explicitly supplied coefficient basis;
- global force vector using the explicit direction vector.

### Permanent anti-inference rules

The first surface-action gate must **not** silently create:
- code pressure coefficients;
- roof/wall zones;
- internal pressure coefficient;
- gust, topographic, shielding, or directionality factors;
- effective wind area from rendered dimensions;
- wind direction from the camera or scene;
- surface normal/action direction from apparent geometry unless a later contract explicitly authorizes that derivation;
- tributary load path;
- connection demand;
- support reactions;
- uplift/sliding resistance;
- PASS/FAIL or code-compliance result.

The browser must label this output **RPE_ANALYTICAL / NON-CFD / NON-CODE-COMPLIANCE**.

### Required regression/browser proof

1. Stage before the selected panel exists → blocked.
2. Missing/wrong-kind panel → blocked.
3. Missing or non-finite `ρ`, `V`, `A_eff`, coefficient, or direction vector → blocked.
4. Non-positive `ρ`, `V`, or `A_eff` → blocked.
5. Direction vector must be explicit, finite, non-zero, and normalized deterministically before use.
6. Geometry-only panel face area remains separately reported and never becomes `A_eff` automatically.
7. Transparent numerical fixture reproduces `q`, scalar action, and force-vector components within tolerance.
8. No downstream joint reaction, connection demand/capacity, structural adequacy, CFD, or code-compliance field becomes available.
9. Real Chromium proves the live panel and stale-stage invalidation.

Only after this first surface action is accepted should RPE expand to multiple surfaces and later distribute loads into explicit structural/load-path mechanics.

## Following Phase 4 order

After the first surface-action gate:

1. Extend to controlled multi-surface house loading with each surface input traceable.
2. Define connection mechanics only after joint coordinates and all demand/capacity-driving quantities are explicit.
3. Define bracing, anchorage, and storm-restraint mechanics through their own sourced input contracts.
4. Reuse the controlled A/B invariant engine when analytical/solver evidence is available so only one structural variable changes.
5. Generate the roadmap-required house-level outputs before declaring Phase 4 complete.

## Engine integration ladder

Locked separately in `docs/ENGINE_INTEGRATION_LADDER.md`:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

OpenSees-class structural coupling and one OpenFOAM CFD workflow remain required RPE v1.0 gates.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
