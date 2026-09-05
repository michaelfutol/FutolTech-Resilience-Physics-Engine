# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — is active. The gated progression now stands at:

**empty envelope ✅ → primary supports ✅ → floor/ring frame ✅ → walls ✅ → roof ✅ → connections ✅ → bracing topology-readiness ✅ → anchorage interface-readiness ✅ → storm protection topology-readiness ✅ → controlled A/B specimen difference 🔵**

The exact next layer is now **Controlled A/B specimen difference**.

## Completed Phase 4 topology/readiness spine

### Primary supports
- Reviewable staged support identity and geometry.
- Explicit local longitudinal axis and 12 end-restraint DOFs.
- First transparent `rpe_analytical` Euler–Bernoulli cantilever benchmark only.
- No capacity/PASS/FAIL or whole-house claim.

### Floor/ring frame
- Reviewable ring-member identity, geometry/orientation, and endpoint roles.
- No inferred physical joint coordinates or global frame mechanics.

### Walls and roof
- Explicit panel identities, geometry/orientation, local normals, exposed faces, and exposure classes.
- Geometry-only face areas are allowed from declared geometry.
- Effective wind area, pressure coefficients, net pressure, stiffness/strength, and fastener mechanics remain separate future gates.

### Connections
- Topology is separated from physical joint location.
- Missing joint coordinates stay unknown until explicitly supplied with provenance.
- Production-browser artifact ID `9964232114`.

### Bracing topology-readiness
- A diagonal-looking member is not a complete brace path by appearance.
- Canonical `synthetic-brace-north-west` remains `load_path_incomplete`, `1 / 2` explicit ends.
- No mechanics or adequacy is inferred.
- Production-browser artifact ID `9964350351`.

### Anchorage interface-readiness
- Canonical browser case `synthetic-anchor-nw → synthetic-connection-anchor-nw → synthetic-support-nw` establishes interface identity only.
- Physical attachment point, bolt/embedment/baseplate, footing/soil, reactions, resistance, capacity, and PASS/FAIL remain unavailable.
- Production-browser run `33950699741` passed; artifact ID `9964743865`.
- Final clean-head Anchorage run `33950979454` passed; artifact ID `9964831153`.

### Storm Protection restraint topology-readiness — COMPLETE
- Canonical `synthetic-storm-strap-west` has only one explicit relationship, to `synthetic-roof-west`, so its honest state is `restraint_path_incomplete`, `1 / 2` selected ends.
- Two distinct explicit connection records are required, and their opposite endpoint components must also be distinct; duplicate records to the same roof cannot fake a complete restraint path.
- Visible strap extent/crossing/touching never creates a missing endpoint or physical attachment point.
- Tension, preload, stiffness, slack/elongation, wind/uplift demand, restraint force, load sharing, member/connection capacity, utilization, PASS/FAIL, and whole-house benefit remain unavailable.
- QA-only augmented fixture may add one explicit second end to `synthetic-anchor-nw` and reach `review_ready_topology`; mechanics still remain unavailable.
- RPE CI run `33951312722` passed.
- Production-browser run `33951312736` passed; artifact ID `9964940298`.

## Exact next gated batch — Controlled A/B specimen difference

The first A/B batch is an **input-control audit**, not a performance comparison.

### Canonical A/B pair

- **Variant A:** the canonical `SYNTHETIC_PHASE4_HOUSE` unchanged.
- **Variant B:** a deep-cloned equivalent specimen with exactly one additional explicit topology record:
  - connection ID: `synthetic-connection-storm-west-second-end`;
  - activation stage: `storm_protection`;
  - from: `synthetic-storm-strap-west`;
  - to: `synthetic-anchor-nw`;
  - capacity remains `null`;
  - provenance states that it is a QA-only second restraint-end topology declaration.

No component geometry, identity, orientation, material, mass, envelope value, or unrelated connection record may change.

### Required comparison behavior

- Validate both specimens independently before comparison.
- Compare canonicalized specimen content by stable IDs rather than relying on array order.
- Prove envelope equality.
- Prove the component-ID set is identical.
- Prove every component field is identical.
- Prove every pre-existing connection record is identical.
- Identify exactly one allowed structural-variable difference: the declared added connection record.
- Reject zero differences, more than one difference, undeclared additions/removals, component mutations, geometry drift, property drift, or unrelated connection edits.
- Preserve exact before/after evidence and provenance of the declared difference.

### Evidence/result boundary

A successful first A/B audit may say only:

**`controlled_input_difference` — exactly one declared topology variable changed; all required invariants held.**

It must not say:
- Variant B is stronger;
- Variant B resists more wind;
- uplift is reduced;
- failure is delayed;
- the house is safer or code-compliant;
- resilience improved by any percentage.

Those claims require later mechanics/solver/test evidence.

### Required regression/browser proof

1. Canonical A vs exact clone → reject as `no_difference`.
2. Canonical A vs QA Variant B → accept exactly one declared connection addition.
3. Variant B plus any component geometry mutation → reject uncontrolled comparison.
4. Variant B plus material/mass/orientation mutation → reject.
5. Variant B plus unrelated connection edit/addition/removal → reject.
6. Pure array reordering with identical stable-ID content → no structural difference.
7. Result reports zero component changes and exactly one connection change for the canonical A/B pair.
8. No mechanics/performance/PASS-FAIL field becomes available.
9. Real browser shows the invariant audit and explicit non-performance warning.

Only after this input-difference gate is accepted should RPE connect a controlled A/B pair to future explicit analytical/solver mechanics.

## After the controlled-difference gate

Continue deliberately:

1. Build explicit connection/bracing/anchorage/storm-restraint mechanics contracts only when all driving physical quantities are sourced.
2. Add solver adapters through the locked engine ladder rather than replacing missing mechanics with visual heuristics.
3. Reuse the controlled A/B invariant engine when analytical/OpenSees/OpenFOAM evidence becomes available, so only the intended structural variable changes between specimens.
4. Reach the Phase 4 exit gate without claiming more evidence than exists.

## Engine integration ladder

The solver/physics roadmap is locked in `docs/ENGINE_INTEGRATION_LADDER.md`:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

OpenSees-class structural coupling and an OpenFOAM CFD workflow are required before RPE v1.0 may be declared complete.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately. Phase 3 completion and Phase 4 progress do not silently close it.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate layers under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
