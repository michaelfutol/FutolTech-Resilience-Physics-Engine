# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — is active. The gated progression now stands at:

**empty envelope ✅ → primary supports ✅ → floor/ring frame ✅ → walls ✅ → roof ✅ → connections ✅ → bracing topology-readiness ✅ → anchorage 🔵 → storm protection → controlled A/B house comparison**

The exact next layer is now **Anchorage readiness**.

## What is complete before Anchorage

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
- One-shot patch run `33949368220` remains intentionally visible as a tooling failure: the GitHub bot was correctly refused permission to modify a workflow file. The patch itself and `git diff --check` passed. The write boundary was repaired without escalating token permissions; run `33949425974` then succeeded.

## Exact next gated batch — Anchorage readiness

Define a separate **anchorage topology/interface readiness contract** before any uplift, sliding, overturning, soil, footing, pedestal, or anchor-capacity calculation.

### Required first-slice behavior

- Reference an active staged `anchor` component by stable object ID at the `anchorage` stage or later.
- Preserve the staged anchor marker's geometry/orientation/material/mass/provenance exactly as declared.
- Reference the explicit active anchor-to-support topology relationship by connection ID.
- Confirm the opposite endpoint is the intended active support; do not infer an attachment from proximity or rendered touching geometry.
- Require explicit provenance/verification for the readiness review.
- Keep the physical attachment point UNKNOWN until a later explicit coordinate/interface contract supplies it.
- Return input-review evidence only; do not calculate structural adequacy.

### Permanent anti-inference rules for the first Anchorage gate

A visible anchor marker, support, pedestal-looking object, or ground plane must **not** silently create any of the following:
- bolt/rod type or diameter;
- embedded length;
- base plate geometry;
- weld or fastener details;
- pedestal dimensions/material;
- footing dimensions/depth;
- concrete strength;
- soil bearing/friction/passive resistance;
- pull-out/cone breakout/bond model;
- shear/sliding/friction model;
- uplift reaction;
- overturning resistance;
- anchor demand/capacity;
- utilization or PASS/FAIL.

The current synthetic fixture's `capacityN: null` must remain `null`.

### Required regression/browser proof

1. Stage before `anchorage` → readiness blocked.
2. Missing/non-active anchor ID → blocked.
3. Active non-anchor component → blocked.
4. Missing/non-active or unrelated attachment connection → blocked.
5. Explicit anchor→support topology relationship → reviewable topology/interface identity only.
6. Material, mass, connection capacity, and physical attachment point remain UNKNOWN where the specimen says `null`/undeclared.
7. No uplift/sliding/overturning/capacity/PASS-FAIL inputs or results appear.
8. Lowering below `anchorage` invalidates retained review state.

Only after this interface gate is unit-tested and accepted in real Chromium should RPE define anchorage mechanics.

## After Anchorage readiness

Continue in roadmap order:

1. Define anchorage mechanics only when actual attachment geometry, support/base interface, material properties, ground/foundation model, loads, and applicable failure modes are explicitly sourced.
2. Add storm-protection restraint as a separate optional structural variable, including the future pedestal-lock / sling / Spiderweb concepts only through explicit connection and capacity data.
3. Add controlled A/B house comparison with automated proof that unrelated geometry and inputs are unchanged.
4. Reach Phase 4 exit: same house geometry runs controlled A/B tests with only one structural variable changed.

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
