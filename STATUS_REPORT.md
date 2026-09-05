# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`  
**Engine ladder:** `docs/ENGINE_INTEGRATION_LADDER.md`

## Current truth

RPE has a trustworthy Phase 2 data/cost/candidate spine, a completed Phase 3 Genesis first-mechanics path, and an active Phase 4 Small House Wind System.

Phase 4 has progressed through:

**empty envelope ✅ → primary supports ✅ → floor/ring frame ✅ → walls ✅ → roof ✅ → connections ✅ → bracing topology-readiness ✅ → anchorage interface-readiness ✅ → storm protection 🔵 → controlled A/B comparison**

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

### Primary supports — COMPLETE FOR CURRENT ISOLATED FORMULA SCOPE
- Explicit support identity, local axis, and all 12 end-restraint DOFs.
- Rendered box dimensions do not become section properties automatically.
- First analytical benchmark is the deliberately narrow Euler–Bernoulli fixed-free tip-load case with explicit E, selected I, signed P, and provenance.
- Response is limited to `V=|P|`, `M=|P|L`, `δ=PL³/(3EI)`.
- Strength/capacity remains `NOT_EVALUATED`.
- Browser evidence: run `33941910817`, artifact ID `9962116271`.

### Floor/ring frame — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- Explicit member identity, geometry/orientation, local axis, and endpoint roles.
- No physical joint point is inferred from rendered geometry.
- No frame stiffness/load distribution/racking calculation is claimed.
- CI run `33942392860` and browser run `33942392870` passed.

### Walls — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- Explicit wall panel identity/local normal/exposed face/exposure class.
- Geometry-only face area may be derived from the explicit normal axis.
- Effective wind area, Cp/internal pressure, net pressure, stiffness/strength, and fastener capacity remain undefined.
- Browser artifact ID `9962401294`.

### Roof — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- Explicit roof identity, rotated geometry, local normal, exposed face, and exposure class.
- `synthetic-roof-west` preserves `rotationRad.z = 0.35`; local-y geometry-only face is `9.840000 m²`.
- Roof zone, effective wind area, pressure coefficients, uplift/suction, panel mechanics, and connection demand/capacity remain undefined.
- Final browser artifact ID `9962552182`.

### Connections — COMPLETE FOR CURRENT JOINT-LOCATION INPUT-REVIEW SCOPE
- `topology known` is explicitly separated from `physical joint point known`.
- Missing joint point remains `location_unknown`; no midpoint, visible intersection, nearest face, touching point, or center-to-center location is inferred.
- Explicit finite caller-declared global X/Y/Z with provenance/verification can reach `review_ready`.
- Connector path/shape, bearing area, stiffness/slip, fasteners/welds, demand/capacity assessment, utilization, PASS/FAIL, load transfer, and global frame mechanics remain unavailable.
- Clean checkpoint CI run `33949048522` passed.
- Production-browser run `33949048519` passed; artifact ID `9964232114`.

### Bracing topology-readiness — COMPLETE FOR CURRENT TOPOLOGY SCOPE
- A diagonal-looking component is not accepted as a complete brace merely because it is visible in the 3D scene.
- Two distinct explicit active brace-end connection records are required for `review_ready_topology`.
- The current canonical synthetic `synthetic-brace-north-west` intentionally has only one explicit bracing connection, therefore its correct result is `load_path_incomplete` with `1 / 2` selected explicit brace ends.
- The contract never manufactures a second connection or physical joint point from geometry.
- Axial force, tension/compression state, axial stiffness, effective length, slenderness, buckling, racking contribution, demand, capacity, utilization, PASS/FAIL, and load-path adequacy all remain unavailable.
- A QA-only augmented test fixture with a separately declared second brace-end connection can reach topology review only; mechanics still remain unavailable.
- RPE CI run `33949445089` passed install, lint, strict TypeScript, all regressions, and production build.
- Production-browser run `33949445200` passed Genesis + Phase 4 acceptance; browser artifact ID `9964350351`.

### Anchorage interface-readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- An active staged `anchor` is referenced by stable ID and preserved exactly from the validated stage snapshot.
- An explicit active anchor-to-`primary_support` connection is required; no interface is inferred from marker centers, midpoint, nearest faces, rendered touching/intersection, or apparent ground contact.
- Canonical production-browser case: `synthetic-anchor-nw → synthetic-connection-anchor-nw → synthetic-support-nw` reaches `review_ready_interface` only.
- The canonical anchor material, mass, and topology capacity remain UNKNOWN because the staged fixture declares them `null`.
- Physical attachment point, bolt/rod type or diameter, embedment, base plate, weld/fastener details, pedestal/footing, concrete strength, soil model, bearing/friction, uplift/shear reactions, sliding/overturning resistance, pullout/breakout, demand/capacity, utilization, and PASS/FAIL remain UNKNOWN / NOT EVALUATED.
- `mechanicsAvailable` and capacity-assessment availability remain false; this gate is `rpe_input_review`, not structural-response evidence.
- RPE CI run `33950699730` passed install, lint, strict TypeScript, all regressions, and production build.
- Production-browser run `33950699741` passed Genesis + Phase 4 staged-house acceptance; browser artifact ID `9964743865`.

### Storm Protection restraint topology-readiness — CURRENT GATE
- Canonical staged members `synthetic-storm-strap-west` / `synthetic-storm-strap-east` are `storm_protection_member` markers with material and mass deliberately unknown.
- Each canonical strap currently has only one explicit storm-protection relationship, from the strap to its associated roof panel.
- No second/lower restraint connection to a support, anchor, ground interface, or other structural endpoint is declared.
- Therefore the correct first canonical result must be `restraint_path_incomplete`, not a completed tie-down/restraint path.
- The upcoming gate must not infer a second end, physical attachment point, tension/preload, stiffness, slack/elongation, member strength, fastener details, roof uplift demand, restraint force, load sharing, capacity, utilization, PASS/FAIL, or whole-house improvement from visible strap geometry.

## Engine integration ladder

The architecture is explicitly locked in `docs/ENGINE_INTEGRATION_LADDER.md`:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

RPE remains the canonical specimen/evidence orchestrator. Solver, CFD, rigid-body, BIM, and visualization layers must not silently overwrite one another's evidence meaning.

OpenSees-class structural coupling and one OpenFOAM CFD workflow are mandatory RPE v1.0 gates.

## Open gates / limitations
- Final Phase 2 manual browser visual acceptance remains outstanding.
- Phase 4 still has no whole-house wind performance result.
- No bracing structural mechanics/adequacy result exists yet; the current canonical brace is intentionally topology-incomplete.
- No anchorage uplift/sliding/overturning mechanics exist; Anchorage currently proves interface identity only.
- No storm-protection structural mechanics or complete canonical restraint path exists yet.
- No global frame/load-path solver result, OpenSees result, CalculiX result, OpenFOAM CFD result, or physical-test evidence has yet been generated for the Phase 4 house.

## Exact next gated task — Storm Protection restraint topology-readiness

Define and test a separate `storm_protection_member` topology-readiness contract. Require two distinct explicit active incident connection records before the member can be considered a topology-complete restraint. Preserve the current canonical west strap as intentionally incomplete because it has only the explicit roof-side relationship `synthetic-connection-storm-west → synthetic-roof-west` and no second restraint endpoint.

Visible strap extent, crossing, proximity, or apparent contact with roof/walls/supports/anchors/ground must never manufacture the missing second end. Keep physical attachment coordinates, fastener details, tension/preload, slack/elongation, stiffness, member strength, wind/uplift demand, load sharing, capacity, utilization, PASS/FAIL, and whole-house improvement unavailable in this first gate.

Only after this topology gate is unit-tested and accepted in real Chromium should storm-restraint mechanics or controlled A/B benefit calculations be defined.

## Evidence doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, browser visualization/QA, and future physical tests remain separate evidence layers. A green software or browser test does not promote a model to solver, code-compliance, CFD, material-test, or physical-test evidence.
