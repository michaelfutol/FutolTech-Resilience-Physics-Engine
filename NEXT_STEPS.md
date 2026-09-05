# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — is active and has now crossed four topology layers with explicit, reviewable evidence boundaries:

**primary supports → floor/ring frame → walls → roof**

The locked full progression remains:

**empty envelope → primary supports → floor/ring frame → walls → roof → connections → bracing → anchorage → storm protection**

The exact next layer is now **Connections**.

## What is complete before Connections

### 1. Primary supports
- Reviewable staged support identity and geometry.
- Explicit local longitudinal axis and 12 end-restraint DOFs.
- No inferred section properties.
- First transparent `rpe_analytical` Euler–Bernoulli cantilever benchmark only.
- No capacity/PASS/FAIL or whole-house claim.

### 2. Floor/ring frame
- Reviewable active ring-member identity, geometry/orientation, and endpoint-role semantics.
- Schema v0.1.0 deliberately accepts no joint coordinates.
- No global frame stiffness/load distribution or racking calculation.

### 3. Walls
- Reviewable wall-panel identity, explicit local normal, exposed-face sign, and exposure class.
- Geometric box-face area may be calculated only from the explicitly declared local normal.
- Synthetic browser fixture reports `7.140000 m² — GEOMETRY ONLY`.
- Effective wind area, pressure coefficients, net pressure, stiffness, and fastener capacity remain undefined.

### 4. Roof
- Reviewable roof-panel identity and rotated geometry/orientation.
- Explicit local normal, exposed-face sign, and exposure class.
- `synthetic-roof-west` preserves `rotationRad.z = 0.35` and reports `9.840000 m² — GEOMETRY ONLY` for the explicit local-y normal.
- Roof zone, effective wind area, Cp/internal pressure, net suction/uplift, panel mechanics, and connection demand/capacity remain undefined.
- Final clean-head CI run `33943309011` passed.
- Final production-browser run `33943309015` passed Genesis + Phase 4 acceptance; browser artifact ID `9962552182`.

Two Roof failures remain intentionally visible in history:
- `33942967313`: exact floating-point test assertion failed at `9.839999999999998` vs mathematical `9.84`; the contract remained unchanged and the test was repaired with a tight numerical tolerance.
- `33943182691`: one-shot browser-patch anchor matched two identical strings; it failed before changing the acceptance script and was repaired with a unique multiline anchor.

## Exact next gated batch — connection joint-location readiness

Define a separate **connection joint-location readiness contract** before any global frame/load-path or connection mechanics calculation.

### Required contract behavior

- Reference an active connection by its stable `connection.id` from a validated `connections` or later stage snapshot.
- Preserve the staged connection's:
  - `fromComponentId`;
  - `toComponentId`;
  - activation stage;
  - current `capacityN` state;
  - source note;
  - verification state.
- Require a caller-supplied explicit global joint point `{x,y,z}` in metres.
- Require finite coordinates, non-empty provenance, and supported verification state for that joint point.
- Confirm both endpoint component IDs are active in the same validated snapshot.
- Return an input-review state only; this batch does not establish mechanical adequacy.

### Permanent anti-inference rule

When no explicit joint point is supplied, RPE must **not** create one from any of the following:
- component centers;
- midpoint between component centers;
- nearest box faces;
- apparent box intersection;
- rendered touching geometry;
- assumed framing convention;
- visual coincidence in the Three.js scene.

A visually plausible joint is still **UNKNOWN** until explicitly declared with provenance.

### Keep these fields unknown in the first connection-location batch

- connector axis/path/shape;
- bearing/contact area;
- fastener type/count/spacing;
- weld length/size;
- connection stiffness;
- rotational/translational slip;
- friction/restitution;
- connection demand;
- connection capacity assessment;
- utilization;
- PASS/FAIL;
- load-transfer distribution;
- global frame stiffness/reactions/racking;
- whole-house wind performance.

The existing topology `capacityN` value should simply be preserved from the staged record. If it is `null`, it remains `null`; this readiness layer must not generate a capacity.

### Required regression/browser proof

1. Connection stage not yet active → readiness blocked.
2. Missing connection ID → blocked/rejected.
3. Explicit wrong/non-active connection → blocked.
4. Missing joint point → unresolved / calculation unavailable.
5. Non-finite joint coordinate → rejected.
6. Explicit finite joint point + provenance → `review_ready`.
7. Returned endpoint IDs exactly match the staged connection record.
8. No inferred midpoint/intersection field appears.
9. No demand/capacity/PASS/FAIL calculation becomes available.
10. Lowering the stage below `connections` invalidates the retained joint-location review.

Only after this location gate is unit-tested and real-browser accepted should RPE define connection mechanics.

## After connection location readiness

Continue in roadmap order:

1. Connection mechanics inputs only when explicit joint location and required mechanical properties are sourced.
2. Bracing load-path relationships and explicit member/joint identities.
3. Anchorage/uplift/sliding relationships with explicit attachment/ground interface data.
4. Storm-protection restraint as a separate optional structural variable.
5. Controlled A/B house comparison with automated proof that unrelated geometry and inputs are unchanged.

Do not jump directly to a complete animated house-failure sequence.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately. Phase 3 completion and Phase 4 progress do not silently close it.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate layers under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
