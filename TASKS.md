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
### Staged specimen / viewer
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
- [x] Preserve support center/size/rotation/material/mass/provenance from the staged specimen rather than duplicating geometry.
- [x] Require explicit local longitudinal axis and all 12 end-restraint DOF states; no restraint defaults.
- [x] Keep unknown E, area, principal moments, strength, material, and mass explicit rather than deriving them from rendered geometry.
- [x] Prove a rendered rectangular box does not silently become section area or second moment.
- [x] Browser-test readiness inputs, unknown-property display, and stage-removal invalidation.
- [x] Add first calculated primary-support mechanics path: isolated linear-elastic Euler–Bernoulli fixed–free tip-load benchmark.
- [x] Require explicit E, selected principal I, signed tip load, and provenance before the benchmark runs.
- [x] Calculate only transparent formula response `V=|P|`, `M=|P|L`, `δ=PL³/(3EI)`.
- [x] Keep strength/capacity `NOT_EVALUATED`; no PASS/FAIL, P-Δ, shear deformation, connection slip, solver, CFD, or whole-house load-path claim.
- [x] Unit-test the hand-check fixture and browser-test the synthetic Phase 4 fixture result.
- [x] Confirm normal CI run `33941910807` and browser run `33941910817` green; browser artifact ID `9962116271`.

### Floor/ring-frame readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- [x] Define floor/ring-frame member readiness contract referencing staged `floor_ring_frame_member` IDs.
- [x] Require explicit member longitudinal axis and endpoint-role semantics.
- [x] Preserve staged geometry/orientation/provenance without inventing material/stiffness.
- [x] Deliberately keep joint coordinates unavailable in schema v0.1.0; no rendered intersection or center-to-center point may become a joint.
- [x] Keep E/A/I/strength/load transfer/global frame response unavailable.
- [x] Browser-test readiness and invalidation below the floor/ring stage.
- [x] Confirm clean-head CI run `33942392860` and browser run `33942392870` green.

### Wall geometry/exposure readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- [x] Define wall-panel geometry/exposure readiness referencing active staged `wall_panel` IDs.
- [x] Require explicit local normal axis, exposed-face sign, exposure class, provenance, and verification.
- [x] Permit geometric box-face area from the declared normal axis only; never promote it to effective wind area.
- [x] Keep wind velocity/density/Cp/internal pressure/net pressure, stiffness/strength, and fastener capacity undefined.
- [x] Browser-test synthetic wall geometry-only face area `7.140000 m²` and stage invalidation.
- [x] Confirm clean-head CI run `33942823443` and browser run `33942823436` green; browser artifact ID `9962401294`.

### Roof geometry/exposure readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- [x] Define roof-panel geometry/exposure readiness referencing active staged `roof_panel` IDs.
- [x] Preserve explicit rotated roof geometry/orientation.
- [x] Require explicit local normal axis, exposed-face sign, exposure class, provenance, and verification.
- [x] Permit geometry-only face area from the declared normal axis while keeping roof zone/effective wind area undefined.
- [x] Keep pressure coefficients, net pressure, uplift force, panel mechanics, and connection demand/capacity undefined.
- [x] Browser-test `synthetic-roof-west`: rotation `0.35 rad`, local-y geometry-only face `9.840000 m²`, uplift calculation unavailable, and stage invalidation.
- [x] Confirm final clean-head CI run `33943309011` and browser run `33943309015` green; browser artifact ID `9962552182`.

### Connections — COMPLETE FOR CURRENT JOINT-LOCATION INPUT-REVIEW SCOPE
- [x] Define a separate connection joint-location readiness contract referencing an active staged connection by stable ID.
- [x] Preserve original `fromComponentId`, `toComponentId`, capacity state, provenance, and verification state from the staged specimen.
- [x] Require explicit finite caller-supplied global joint point plus provenance/verification; no coordinate defaults.
- [x] Prove a missing joint point stays unresolved even when component boxes visibly intersect or a center-to-center midpoint looks plausible.
- [x] Keep connector path/axis/shape, stiffness, slip, fastener count, demand/capacity assessment, PASS/FAIL, load transfer, and whole-house response unavailable in this location-readiness gate.
- [x] Add deterministic unit tests and production-browser acceptance.
- [x] Confirm CI run `33949048522` and browser run `33949048519` green; browser artifact ID `9964232114`.

### Bracing topology-readiness — COMPLETE FOR CURRENT TOPOLOGY SCOPE
- [x] Define a bracing topology-readiness contract referencing an active staged `brace` by stable ID.
- [x] Require two distinct caller-selected active connection records explicitly incident to the selected brace before topology can become `review_ready_topology`.
- [x] Prove visible diagonal geometry never creates a missing second brace end or physical joint location.
- [x] Keep axial force, tension/compression state, stiffness, effective length, slenderness, buckling, racking contribution, demand/capacity, utilization, PASS/FAIL, and load-path adequacy unavailable.
- [x] Preserve current canonical `synthetic-brace-north-west` as intentionally topology-incomplete: one explicit incident connection → `load_path_incomplete`, `1 / 2` selected ends.
- [x] Add QA-only augmented test fixture proving two separately declared ends can reach topology review while mechanics remain unavailable.
- [x] Wire Bracing review into the Small House chamber without adding a fake second end.
- [x] Production-browser acceptance proves incomplete-load-path semantics and invalidation below `bracing`.
- [x] Confirm RPE CI run `33949445089` and browser run `33949445200` green; browser artifact ID `9964350351`.

### Anchorage interface-readiness — COMPLETE FOR CURRENT INPUT-REVIEW SCOPE
- [x] Define anchorage topology/interface readiness referencing an active staged `anchor` by stable ID.
- [x] Preserve anchor geometry/orientation/material/mass/provenance exactly from the stage snapshot.
- [x] Require an explicit active anchor-to-primary-support topology connection; do not infer attachment from marker position, proximity, visible touching, or ground-plane coincidence.
- [x] Confirm the opposite endpoint is an active `primary_support`.
- [x] Preserve `materialId`, `massKg`, and topology `capacityN` as UNKNOWN when the staged specimen says `null`.
- [x] Keep physical attachment point, bolt/rod properties, embedment, base plate, weld/fastener details, pedestal/footing, concrete/soil properties, reactions, uplift/sliding/overturning resistance, pullout/breakout, demand/capacity, utilization, and PASS/FAIL unavailable.
- [x] Wire the Anchorage panel into the Small House chamber with explicit provenance/verification review inputs only.
- [x] Add deterministic unit tests and production-browser acceptance including invalidation below `anchorage`.
- [x] Confirm RPE CI run `33950699730` and browser run `33950699741` green; browser artifact ID `9964743865`.

### Storm-protection restraint topology-readiness — COMPLETE FOR CURRENT TOPOLOGY SCOPE
- [x] Define a storm-protection restraint topology contract referencing an active staged `storm_protection_member` by stable ID.
- [x] Require two distinct explicit active connection records incident to the selected restraint member and two distinct active opposite endpoint components before topology can become review-ready.
- [x] Prove visible strap/line geometry cannot manufacture a missing second restraint endpoint or physical attachment point.
- [x] Preserve canonical `synthetic-storm-strap-west` as intentionally incomplete: one explicit roof-side relationship to `synthetic-roof-west` → `restraint_path_incomplete`, `1 / 2` selected ends.
- [x] Reject two different connection records that both terminate at the same opposite component as a fake two-ended path.
- [x] Keep tension/preload, stiffness, elongation/slack, fastener/attachment details, member strength, wind/uplift demand, load sharing, capacity, utilization, PASS/FAIL, and whole-house improvement unavailable.
- [x] Add a QA-only augmented fixture with a separately declared second restraint-end relationship to `synthetic-anchor-nw`; topology may become `review_ready_topology` while mechanics remain unavailable.
- [x] Wire the Storm Protection review panel into the Small House chamber without adding a fake second end.
- [x] Add deterministic regressions and real production-browser acceptance, including invalidation below `storm_protection`.
- [x] Confirm RPE CI run `33951312722` and production-browser run `33951312736` green; browser artifact ID `9964940298`.

### Controlled A/B specimen difference — CURRENT GATE
- [ ] Define a deterministic comparison contract for two validated Small House specimen definitions.
- [ ] Require identical schema/envelope/component geometry/identity/material/mass/orientation and all unrelated connection records unless the caller explicitly declares the one allowed structural variable.
- [ ] First QA pair: Variant A = canonical house; Variant B = same house plus exactly one explicit second Storm restraint-end topology relationship from `synthetic-storm-strap-west` to `synthetic-anchor-nw`.
- [ ] Prove the comparison detects exactly one connection-record addition and zero unrelated geometry/component/property mutations.
- [ ] Reject zero-difference pairs, multi-variable differences, geometry drift, component property drift, reordered/rewritten unrelated records, or undeclared mutations.
- [ ] Preserve result as `controlled_input_difference` / input-review evidence only; do not call Variant B stronger, safer, more resilient, code-compliant, or better-performing.
- [ ] Add deterministic regression tests and production-browser evidence for the controlled-difference audit.

### Later Phase 4 topology/mechanics layers
- [ ] Add explicit connection mechanics only after joint location and all mechanics-driving quantities are sourced.
- [ ] Add bracing mechanics only after two-ended topology, physical joint locations, member section/material/stiffness, boundary conditions, and loads are explicit.
- [ ] Add anchorage mechanics only after attachment/foundation/ground interface and failure-mode data are explicit.
- [ ] Add storm-protection mechanics only after a two-ended restraint path, attachment geometry, member properties, loads, and failure modes are explicit.
- [ ] Connect controlled A/B specimen differences to explicit analytical/solver evidence only when the corresponding mechanics gates exist.
- [ ] Reach Phase 4 exit: same house geometry runs controlled A/B tests with only one declared structural variable changed and the evidence layer is reported honestly.

## Failed-check record retained
- [x] Keep Genesis Browser Acceptance run `33936435595` visible: old selector matched two verification controls after aerodynamic UI expansion.
- [x] Keep Genesis Browser Acceptance run `33936534126` visible: first repair used an inaccessible exact-label selector and found zero target selects.
- [x] Keep RPE CI run `33938570631` visible: collision activation error text was unintentionally generalized; legacy assertions caught it.
- [x] Keep Phase 4 orientation intermediate RPE CI failure at commit `c089e0e4423a2853a50b41066e1320fd1fbbe437` visible; later tests/build were skipped rather than waived.
- [x] Keep Roof readiness RPE CI run `33942967313` visible: exact floating-point assertion expected `9.84` while raw multiplication returned `9.839999999999998`; contract unchanged, test repaired with `1e-12` tolerance.
- [x] Keep Roof Browser Acceptance Patch run `33943182691` visible: one-shot text anchor matched twice and failed before changing acceptance code; repaired with a unique multiline anchor.
- [x] Keep Bracing Readiness Patch run `33949368220` visible: deterministic patch and `git diff --check` passed, but GitHub correctly refused bot modification of a workflow file without workflow permission. No permission escalation was used; the write boundary was narrowed and repaired run `33949425974` passed.

## Later mechanics gates — not to be invented early
- [ ] Contact-property contract, only if justified and explicitly sourced/supplied.
- [ ] Impact mechanics contract, only after required physical quantities/evidence are defined.
- [ ] Damage/failure model tied to solver/test/calibration evidence.
- [ ] Physical-test data ingestion and calibration loop.
- [ ] Controlled simplification only after calculate/solve/simulate/test/calibrate evidence supports it.
