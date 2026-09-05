# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — is active. The staged-house data/viewer gate and the first primary-support mechanics gate are now complete for a deliberately narrow isolated-formula scope.

The locked topology progression remains:

**empty envelope → primary supports → floor/ring frame → walls → roof → connections → bracing → anchorage → storm protection**

## Completed primary-support gate

RPE now has two separate support layers:

1. **Primary-support readiness / `rpe_input_review`**
   - stable `primary_support` identity sourced from the validated stage snapshot;
   - center/size/orientation/material/mass/provenance preserved from the specimen;
   - explicit local longitudinal axis;
   - explicit 6-DOF state at both ends with no defaults;
   - caller-supplied property evidence only;
   - rendered box dimensions do **not** silently become area or second moment;
   - no reaction/displacement/stress/buckling/capacity result is produced by the readiness gate.

2. **Isolated cantilever formula benchmark / `rpe_analytical`**
   - exact fixed–free idealization only;
   - explicit E;
   - explicit selected principal I;
   - explicit signed free-end transverse point load P;
   - member length L taken only from the declared local longitudinal-axis dimension;
   - transparent formulas `V=|P|`, `M=|P|L`, `δ=PL³/(3EI)`;
   - linear-elastic, prismatic, small-deflection Euler–Bernoulli assumptions;
   - no shear deformation, P-Δ/geometric nonlinearity, connection slip, material nonlinearity, strength/capacity verdict, solver authority, CFD authority, or whole-house load-path claim.

Hand-check regression fixture:
- L = 3.0 m;
- P = 1000 N;
- E = 10 GPa;
- I = 1.0×10^-4 m^4;
- expected V = 1000 N;
- expected M = 3000 N·m;
- expected δ = 0.009 m.

Production-browser fixture uses the synthetic Phase 4 support with L = 2.7 m and the same P/E/I, producing V = 1000 N, M = 2700 N·m, δ = 0.006561 m while capacity remains `NOT_EVALUATED`.

Validation evidence:
- Normal RPE CI run `33941910807` passed install, lint, strict TypeScript, automated tests, and production build.
- Production browser run `33941910817` passed Genesis and Phase 4 acceptance.
- Browser artifact `browser-acceptance-190ad3b4bf63f81d53005b3f6b6cfee98c0e4abe`, artifact ID `9962116271`, preserves the QA record and screenshot.

## Exact next gated batch — floor/ring frame readiness

Define the first explicit **floor/ring-frame member readiness contract** before introducing global frame response.

Requirements:
- Reference an active `floor_ring_frame_member` by stable ID from a validated `floor_ring_frame` or later stage snapshot.
- Preserve its declared center, size, rotation, material ID, mass, source note, and verification state from the staged specimen.
- Require an explicit local longitudinal axis; do not infer member axis from the largest rendered box dimension.
- Introduce explicit endpoint-role labels (for example End A / End B semantic role) without inventing physical joint coordinates.
- Keep endpoint/joint coordinates explicitly unknown until a later contract supplies them with provenance.
- Keep E, A, I, strength, connection stiffness/capacity, loads, and support transfer assumptions unknown unless explicitly supplied.
- Do **not** calculate global ring-frame reactions, stiffness, racking, load distribution, connection demand, or whole-house wind response in this readiness batch.
- Reject wrong component kind/stage, missing identity, invalid axis, duplicate endpoint roles, unsupported verification state, or missing provenance where required.
- Add deterministic unit tests and production-browser acceptance.

## Why joint coordinates stay deferred

The existing Phase 4 connection records currently establish **topology only**—which objects are related. They deliberately do not state a physical joint point. RPE must not draw or calculate a member-center-to-member-center connection merely because it looks plausible.

The later **connections** gate will introduce physical joint/location semantics and mechanics assumptions explicitly. Only then may global frame/load-path calculations use those connections.

## After floor/ring-frame readiness

Continue in roadmap order:

1. Floor/ring member readiness.
2. Wall geometry/exposure readiness.
3. Roof geometry/exposure readiness.
4. Connection joint-location + mechanics readiness.
5. Bracing load-path relationships.
6. Anchorage/uplift/sliding relationships.
7. Storm-protection restraint as a separate structural variable.
8. Controlled A/B house comparison with automated proof that only one declared structural variable changed.

Do not jump directly to a complete animated house failure sequence.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately. Phase 3 completion and Phase 4 progress do not silently close it.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate layers under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
