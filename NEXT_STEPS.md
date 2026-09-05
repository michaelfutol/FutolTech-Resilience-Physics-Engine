# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — is active. The gated progression now stands at:

**empty envelope ✅ → primary supports ✅ → floor/ring frame ✅ → walls ✅ → roof ✅ → connections ✅ → bracing topology-readiness ✅ → anchorage interface-readiness ✅ → storm protection 🔵 → controlled A/B house comparison**

The exact next layer is now **Storm Protection restraint topology-readiness**.

## What is complete before Storm Protection

### Primary supports
- Reviewable staged support identity and geometry.
- Explicit local longitudinal axis and 12 end-restraint DOFs.
- No inferred section properties.
- First transparent `rpe_analytical` Euler–Bernoulli cantilever benchmark only.
- No capacity/PASS/FAIL or whole-house claim.

### Floor/ring frame
- Reviewable ring-member identity, geometry/orientation, and endpoint-role semantics.
- No inferred physical joint coordinates.
- No global frame stiffness/load distribution or racking calculation.

### Walls
- Reviewable wall identity/local normal/exposed face/exposure class.
- Geometry-only face area is allowed from explicitly declared local normal.
- Effective wind area, pressure coefficients, net pressure, stiffness, strength, and fastener capacity remain undefined.

### Roof
- Reviewable rotated roof geometry and exposure semantics.
- `synthetic-roof-west` preserves `rotationRad.z = 0.35` and geometry-only face `9.840000 m²` for the explicit local-y normal.
- Roof zone, effective wind area, Cp/internal pressure, suction/uplift, panel mechanics, and connection demand/capacity remain undefined.

### Connections — COMPLETE FOR JOINT-LOCATION INPUT-REVIEW SCOPE
- Stable connection topology is preserved without inventing a physical joint point.
- Missing joint point remains `location_unknown` even when visible geometry suggests a plausible intersection or midpoint.
- Explicit finite caller-declared global X/Y/Z + provenance/verification can reach `review_ready`.
- Connector path/shape, bearing area, stiffness/slip, fasteners/welds, demand/capacity assessment, utilization, PASS/FAIL, load transfer, and global frame mechanics remain unavailable.
- Normal CI run `33949048522` passed on the clean Connection checkpoint.
- Production-browser run `33949048519` passed; browser artifact ID `9964232114`.

### Bracing topology-readiness — COMPLETE FOR CURRENT TOPOLOGY SCOPE
- A visible diagonal member is **not** accepted as a complete brace load path merely because it looks connected in the 3D scene.
- The readiness contract requires two distinct explicit active brace-end connection records.
- The current canonical synthetic fixture intentionally provides only one explicit connection for `synthetic-brace-north-west`.
- Therefore the correct production result is `load_path_incomplete`, with `1 / 2` explicit selected brace ends.
- No second end, physical joint point, axial force, tension/compression state, stiffness, effective length, slenderness, buckling model, racking contribution, demand, capacity, utilization, PASS/FAIL, or load-path adequacy is inferred.
- A QA-only augmented unit-test fixture with a separately declared second brace-end connection can reach `review_ready_topology`, but mechanics still remain unavailable.
- RPE CI run `33949445089` passed install, lint, strict TypeScript, all regressions, and production build.
- Production-browser run `33949445200` passed Genesis + Phase 4 acceptance; browser artifact ID `9964350351`.

### Anchorage interface-readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- An active staged `anchor` is referenced by stable ID and preserved exactly from the staged specimen.
- Review requires an explicit active anchor-to-`primary_support` topology connection; marker position, proximity, rendered touching geometry, or apparent ground contact cannot create the interface.
- Canonical browser case: `synthetic-anchor-nw → synthetic-connection-anchor-nw → synthetic-support-nw`.
- The staged `materialId`, `massKg`, and connection `capacityN` remain UNKNOWN where the fixture declares `null`.
- Physical attachment point, bolt/rod type and diameter, embedment, base plate, weld/fastener details, pedestal/footing, concrete strength, soil model, bearing/friction, uplift/shear reactions, sliding/overturning resistance, pullout/breakout, demand/capacity, utilization, and PASS/FAIL remain unavailable.
- RPE CI run `33950699730` passed install, lint, strict TypeScript, all regressions, and production build.
- Production-browser run `33950699741` passed Genesis + Phase 4 acceptance; browser artifact ID `9964743865`.

## Exact next gated batch — Storm Protection restraint topology-readiness

Define a separate **storm-protection restraint topology-readiness contract** before any strap/sling tension, preload, stiffness, strength, load sharing, wind/uplift demand, capacity, or A/B performance claim.

### Canonical fixture truth

The current synthetic house has:
- `synthetic-storm-strap-west` and `synthetic-storm-strap-east` as staged `storm_protection_member` markers;
- each strap has `materialId: null` and `massKg: null`;
- `synthetic-storm-strap-west` has one explicit topology relationship only: `synthetic-connection-storm-west → synthetic-roof-west`;
- `synthetic-storm-strap-east` likewise has one explicit relationship only to `synthetic-roof-east`;
- no second/lower restraint endpoint is declared to a support, anchor, ground interface, or other structural component.

Therefore the honest first result for the canonical west strap must be **`restraint_path_incomplete`**, not a completed tie-down/restraint path.

### Required first-slice behavior

- Reference an active staged `storm_protection_member` by stable ID at `storm_protection` stage.
- Preserve its staged center/size/orientation/material/mass/source/verification exactly.
- Enumerate only explicit active topology relationships incident to the selected member.
- Require two distinct caller-selected incident connection records before topology can become review-ready.
- Keep both endpoint component identities explicit and active; never derive an endpoint from the rendered line/strap extent.
- Missing second end must remain missing even when the strap visibly crosses or appears to touch roof, wall, support, anchor, or ground geometry.
- Require readiness provenance/verification.
- Return topology-review evidence only; do not calculate structural adequacy or restraint effectiveness.

### Permanent anti-inference rules

Visible strap/sling geometry must **not** silently create:
- a second connection;
- attachment coordinates;
- clamp/fastener/bolt/weld details;
- strap section/material strength;
- initial tension or preload;
- slack/elongation;
- axial stiffness;
- force distribution/load sharing;
- roof uplift demand;
- restraint force;
- connection or member capacity;
- utilization or PASS/FAIL;
- whole-house wind-resistance improvement.

### Required regression/browser proof

1. Stage before `storm_protection` → blocked.
2. Missing/non-active storm-protection member → blocked.
3. Active wrong component kind → blocked.
4. Current west strap exposes exactly one explicit incident storm relationship.
5. Selecting that single relationship yields `restraint_path_incomplete` / `1 / 2`, not a completed restraint path.
6. No visible crossing/touching geometry generates the second end.
7. QA-only augmented fixture with a separately declared second incident connection can reach `review_ready_topology` while mechanics remain unavailable.
8. Material/mass/capacity remain UNKNOWN where the staged records say `null`.
9. No tension/preload/stiffness/load/capacity/PASS-FAIL controls or results appear.
10. Lowering below `storm_protection` invalidates retained restraint review.

Only after this topology gate is unit-tested and accepted in real Chromium should any storm-restraint mechanics be defined.

## After Storm Protection topology-readiness

Continue deliberately:

1. Define storm-restraint mechanics only when the complete two-ended path, physical attachment geometry, restraint material/section, stiffness/preload/slack model, loads, and failure modes are explicitly sourced.
2. Define anchorage/bracing/connection mechanics only through their own explicit mechanics gates; topology completion alone does not authorize them.
3. Add the controlled A/B house comparison with automated proof that unrelated geometry and inputs are unchanged.
4. Reach Phase 4 exit: same house geometry runs controlled A/B tests with only one declared structural variable changed.

Do not jump directly to a complete animated house-failure sequence.

## Engine integration ladder

The solver/physics roadmap is locked separately in `docs/ENGINE_INTEGRATION_LADDER.md`:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

OpenSees-class structural coupling and an OpenFOAM CFD workflow are required before RPE v1.0 may be declared complete. Current Phase 4 semantic/load-path work is intentional preparation for those adapters.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately. Phase 3 completion and Phase 4 progress do not silently close it.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate layers under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
