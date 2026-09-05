# Tasks

## Permanent gates
- [x] Lock finite RPE v1.0 roadmap.
- [x] Preserve `CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY`.
- [x] Keep manual/code, solver, RPE analytical, RPE simulation, browser QA/visualization, and future physical-test evidence distinct.
- [x] Require explicit provenance/verification state for engineering/simulation inputs where the contract requires them.
- [x] Never invent missing material, code, aerodynamic, contact, or engineering properties.
- [x] Lock external-engine roles in `docs/ENGINE_INTEGRATION_LADDER.md`.

## Phase 2
- [x] Deterministic catalog validation/costing/candidate derivation/persistence foundation.
- [x] Automated regression coverage and CI.
- [ ] Complete final manual Phase 2 browser visual acceptance and record the exit checkpoint.

## Dependency / QA toolchain
- [x] Remediate canonical Next.js dependency gate and regenerate lockfile through package-manager automation.
- [x] Install and gate `@react-three/rapier@2.2.0`.
- [x] Isolate browser acceptance tooling from committed application dependencies.
- [x] Upgrade isolated browser harness to pinned Playwright 1.62.1 and keep its audit gate separate from application dependency evidence.

## Phase 3 — Genesis analytical and simulation foundation — EXIT GATE COMPLETE
- [x] Null House `N/A / no_physical_specimen` contract.
- [x] Fast Smoke explicitly NON-CFD.
- [x] Explicit analytical wind/panel path `q = 0.5ρV²` → `F = qAC`.
- [x] Connection demand/capacity assessment with unknown capacity remaining unverified.
- [x] A/B analytical comparison.
- [x] Rigid-body release and debris-dynamics gates.
- [x] Rapier activation only from explicit ready inputs.
- [x] Ordered analytical→simulation event ledger.
- [x] Explicit collision-target contract and genuine Chromium collision evidence.
- [x] Explicit post-release aerodynamic analytical contract.
- [x] Explicit opt-in center-of-mass aerodynamic force application with fixed-step scheduler.
- [x] Partial terminal force step preserves only the declared active-duration impulse.
- [x] Real Chromium force-application and stale-context acceptance.
- [ ] Define aerodynamic torque only in a future separately justified contract; do not infer it from current drag force.

## Phase 4 — Small House Wind System — ACTIVE

### Staged specimen / viewer — COMPLETE FOR CURRENT TOPOLOGY SCOPE
- [x] Define versioned small-house wind topology/staging types.
- [x] Lock stage order: empty envelope → primary supports → floor/ring frame → walls → roof → connections → bracing → anchorage → storm protection.
- [x] Preserve stable object identity across envelope, structural components, and connections.
- [x] Preserve unknown material identity, mass, and connection capacity as explicit `null`.
- [x] Require explicit finite component orientation rather than assuming rotation.
- [x] Validate positive geometry, component-kind/stage consistency, connection references, and endpoint activation order.
- [x] Add deterministic immutable stage materialization.
- [x] Preserve `N/A / no_physical_specimen` for empty envelope and avoid performance claims for geometry-only stages.
- [x] Add staged Small House viewer driven by validated specimen data.
- [x] Show identity, provenance, explicit orientation, and unknown material/mass/capacity without inferring adequacy.
- [x] Keep connection topology visible without inventing physical joint coordinates/connector geometry.
- [x] Browser-test ordered stage progression, `N/A` semantics, orientation, unknown properties, and stale-stage clearing.

### Primary-support gate — COMPLETE FOR CURRENT ISOLATED FORMULA SCOPE
- [x] Define explicit primary-support mechanics readiness/input contract referencing a validated staged component by stable ID.
- [x] Require explicit local longitudinal axis and all 12 end-restraint DOF states; no restraint defaults.
- [x] Keep unknown E, area, principal moments, strength, material, and mass explicit rather than deriving them from rendered geometry.
- [x] Add first calculated mechanics path: isolated linear-elastic Euler–Bernoulli fixed–free tip-load benchmark.
- [x] Require explicit E, selected principal I, signed tip load, and provenance before the benchmark runs.
- [x] Calculate only `V=|P|`, `M=|P|L`, `δ=PL³/(3EI)`.
- [x] Keep strength/capacity `NOT_EVALUATED`; no PASS/FAIL, P-Δ, shear deformation, connection slip, solver, CFD, or whole-house load-path claim.
- [x] Confirm browser artifact ID `9962116271`.

### Floor/ring-frame readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- [x] Define member readiness using stable staged IDs, explicit axis, and endpoint roles.
- [x] Preserve geometry/orientation/provenance without inventing material/stiffness or physical joint coordinates.
- [x] Keep E/A/I/strength/load transfer/global frame response unavailable.

### Wall geometry/exposure readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- [x] Define wall-panel geometry/exposure readiness with explicit local normal, exposed-face sign, exposure class, provenance, and verification.
- [x] Permit geometry-only face area from declared geometry only; never promote it to effective wind area.
- [x] Keep wind velocity/density/Cp/internal pressure/net pressure, stiffness/strength, and fastener capacity undefined.
- [x] Confirm browser artifact ID `9962401294`.

### Roof geometry/exposure readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- [x] Define roof-panel geometry/exposure readiness and preserve rotated roof geometry/orientation.
- [x] Permit geometry-only face area while keeping roof zone/effective wind area undefined.
- [x] Keep pressure coefficients, net pressure, uplift force, panel mechanics, and connection demand/capacity undefined.
- [x] Confirm browser artifact ID `9962552182`.

### Connections — COMPLETE FOR CURRENT JOINT-LOCATION INPUT-REVIEW SCOPE
- [x] Separate topology from physical joint point.
- [x] Require explicit finite caller-supplied global joint point plus provenance/verification; no coordinate defaults.
- [x] Prove missing joint point stays unresolved even when rendered component boxes appear to intersect.
- [x] Keep connector path/axis/shape, stiffness, slip, fastener count, demand/capacity, PASS/FAIL, load transfer, and whole-house response unavailable.
- [x] Confirm browser artifact ID `9964232114`.

### Bracing topology-readiness — COMPLETE FOR CURRENT TOPOLOGY SCOPE
- [x] Require two distinct explicit active brace-end connection records before `review_ready_topology`.
- [x] Prove visible diagonal geometry never creates a missing second brace end or physical joint location.
- [x] Preserve canonical `synthetic-brace-north-west` as `load_path_incomplete`, `1 / 2` ends.
- [x] Keep axial force, stiffness, buckling, racking contribution, demand/capacity, utilization, PASS/FAIL, and adequacy unavailable.
- [x] Confirm browser artifact ID `9964350351`.

### Anchorage interface-readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- [x] Require explicit active anchor-to-primary-support topology; no inferred interface from proximity/touching/ground coincidence.
- [x] Keep attachment point, bolt/embedment/base plate, footing/soil, reactions/resistance, demand/capacity, utilization, and PASS/FAIL unavailable.
- [x] Confirm production-browser artifact ID `9964743865`; clean-head artifact `9964831153`.

### Storm-protection restraint topology-readiness — COMPLETE FOR CURRENT TOPOLOGY SCOPE
- [x] Require two distinct explicit incident connections and two distinct active opposite endpoint components before topology review.
- [x] Preserve canonical `synthetic-storm-strap-west` as one-ended: `restraint_path_incomplete`, `1 / 2` ends.
- [x] Reject duplicate records to the same opposite endpoint as a fake complete path.
- [x] Keep physical attachment coordinates, tension/preload, stiffness/slack, wind/uplift demand, load sharing, capacity, utilization, PASS/FAIL, and whole-house benefit unavailable.
- [x] Confirm production-browser artifact ID `9964940298`; final clean-head Storm artifact `9965015712`.

### Controlled A/B specimen difference — COMPLETE FOR CURRENT INPUT-CONTROL SCOPE
- [x] Define deterministic comparison contract for two validated Small House specimen definitions.
- [x] Compare stable-ID canonicalized content so array reordering alone is not a structural difference.
- [x] Require identical specimen metadata, envelope, component records/geometry, and all pre-existing connection records except the one caller-declared structural variable.
- [x] Canonical QA pair: A = canonical house; B = same house plus only `synthetic-connection-storm-west-second-end` from `synthetic-storm-strap-west` to `synthetic-anchor-nw`.
- [x] Reject missing declared change, geometry drift, component/property drift, unrelated connection edits/additions, and multiple variables.
- [x] Preserve successful result as `controlled_input_difference` / `rpe_input_review` only.
- [x] Keep mechanics, performance comparison, structural result, winner/ranking, and benefit claim unavailable.
- [x] Add deterministic regression coverage and production-browser acceptance including stage invalidation.
- [x] Confirm RPE CI run `33959003440` and production-browser run `33959003346` green; browser artifact ID `9967337114`.

### Analytical surface wind action — CURRENT GATE
- [ ] Define a Phase 4 surface wind-action contract referencing one active staged wall or roof panel by stable ID.
- [ ] Require explicit finite air density, wind speed, effective wind area, signed pressure/force coefficient basis, global action direction, provenance, and verification; no defaults.
- [ ] Keep geometry-only panel face area distinct from caller-declared effective wind area.
- [ ] Calculate only a transparent first-slice analytical action such as `q = 0.5ρV²`, signed scalar surface action from explicit coefficient inputs, and an explicit global force vector.
- [ ] Do not infer code pressure coefficients, roof/wall zones, internal pressure, gust/topographic factors, shielding, tributary load paths, joint reactions, or connection demand.
- [ ] Require the global action direction to be explicit and finite in the first slice rather than silently deriving it from rendered panel normal/scene geometry.
- [ ] Add regressions proving missing/invalid inputs block calculation and unrelated geometry cannot manufacture aerodynamic inputs.
- [ ] Wire one synthetic wall/roof QA case into the browser with strong `RPE_ANALYTICAL / NON-CFD / NON-CODE-COMPLIANCE` labeling.
- [ ] Production-browser acceptance must prove pressure/load vector output while downstream connection/reaction/capacity claims remain unavailable.

### Later Phase 4 mechanics layers
- [ ] Extend surface wind action to controlled multi-surface house loading only after the first surface contract is accepted.
- [ ] Add explicit connection mechanics only after joint location and all mechanics-driving quantities are sourced.
- [ ] Add bracing mechanics only after two-ended topology, physical joint locations, member section/material/stiffness, boundary conditions, and loads are explicit.
- [ ] Add anchorage mechanics only after attachment/foundation/ground interface and failure-mode data are explicit.
- [ ] Add storm-protection mechanics only after a two-ended restraint path, attachment geometry, member properties, loads, and failure modes are explicit.
- [ ] Connect controlled A/B specimen differences to explicit analytical/solver evidence only when corresponding mechanics gates exist.
- [ ] Produce the Phase 4 roadmap outputs: pressure/load vectors, connection demand/capacity, uplift/sliding reactions, racking indicators, failure sequence, detached debris, and residual state where supported.
- [ ] Reach Phase 4 exit only after the required house-level evidence exists and same-geometry A/B runs change exactly one declared structural variable.

## Failed-check record retained
- [x] Keep Genesis Browser Acceptance run `33936435595` visible: old selector matched two verification controls after aerodynamic UI expansion.
- [x] Keep Genesis Browser Acceptance run `33936534126` visible: first repair used an inaccessible exact-label selector and found zero target selects.
- [x] Keep RPE CI run `33938570631` visible: collision activation error text was unintentionally generalized; legacy assertions caught it.
- [x] Keep Phase 4 orientation intermediate RPE CI failure at commit `c089e0e4423a2853a50b41066e1320fd1fbbe437` visible; later tests/build were skipped rather than waived.
- [x] Keep Roof readiness RPE CI run `33942967313` visible: exact floating-point assertion expected `9.84` while raw multiplication returned `9.839999999999998`; contract unchanged, test repaired with `1e-12` tolerance.
- [x] Keep Roof Browser Acceptance Patch run `33943182691` visible: one-shot text anchor matched twice and failed before changing acceptance code; repaired with a unique multiline anchor.
- [x] Keep Bracing Readiness Patch run `33949368220` visible: deterministic patch and `git diff --check` passed, but GitHub correctly refused bot modification of a workflow file without workflow permission. No permission escalation was used; repaired run `33949425974` passed.

## Later mechanics gates — not to be invented early
- [ ] Contact-property contract, only if justified and explicitly sourced/supplied.
- [ ] Impact mechanics contract, only after required physical quantities/evidence are defined.
- [ ] Damage/failure model tied to solver/test/calibration evidence.
- [ ] Physical-test data ingestion and calibration loop.
- [ ] Controlled simplification only after calculate/solve/simulate/test/calibrate evidence supports it.
