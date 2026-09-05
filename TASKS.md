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
- [ ] Define aerodynamic torque only in a future separately justified contract; do not infer it from current drag force or ordinary `r×F` statics.

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

### Analytical surface wind action — COMPLETE FOR CURRENT SINGLE-SURFACE SCOPE
- [x] Define a Phase 4 surface wind-action contract referencing one active staged wall or roof panel by stable ID.
- [x] Require explicit finite air density, wind speed, effective wind area, signed coefficient basis, global action direction, provenance, and verification; no defaults.
- [x] Keep geometry-only panel face area distinct from caller-declared effective wind area.
- [x] Calculate only `q = 0.5ρV²`, signed scalar surface action, and explicit global force vector.
- [x] Do not infer code pressure coefficients, roof/wall zones, internal pressure, gust/topographic factors, shielding, tributary load paths, joint reactions, or connection demand.
- [x] Require global action direction explicitly rather than silently deriving it from rendered panel normal/scene geometry.
- [x] Add regressions proving missing/invalid inputs block calculation and unrelated geometry cannot manufacture aerodynamic inputs.
- [x] Wire the synthetic north-wall QA case into the browser with `RPE_ANALYTICAL / NON-CFD / NON-CODE-COMPLIANCE` labeling.
- [x] Production-browser acceptance proves `240 Pa → -192 Pa → -960 N → (0,0,-960) N` while downstream mechanics remain unavailable.
- [x] Confirm RPE CI `33959585363`, production Chromium `33959585360`, browser artifact `9967518320`.

### Controlled multi-surface analytical load set — COMPLETE FOR CURRENT VECTOR-ALGEBRA SCOPE
- [x] Reuse the accepted single-surface calculator for every load-set record; no second aerodynamic formula path.
- [x] Require at least two unique active wall/roof surface IDs; duplicate surface IDs are blocked in schema `0.1.0`.
- [x] Block the entire set if any individual action is invalid/not ready; never publish a partial sum.
- [x] Preserve/canonicalize individual results by stable surface ID so array order is not engineering meaning.
- [x] Calculate only algebraic global force-vector sum and pure Euclidean magnitude.
- [x] Canonical QA pair: north `(0,0,-960) N` + east `(480,0,0) N` → `(480,0,-960) N`, magnitude `1073.313 N`.
- [x] Keep reaction, base shear, uplift/sliding, racking, connection demand, moment/torque, load-path distribution, and PASS/FAIL unavailable.
- [x] Label live evidence `RPE_ANALYTICAL / VECTOR ALGEBRA ONLY / NON-CFD / NON-CODE-COMPLIANCE`.
- [x] Prove lowering below wall activation blocks the full load set and clears the vector sum.
- [x] Confirm core RPE CI `33960418016`, permanent RPE CI `33960633262`, production Chromium `33960633248`, browser artifact `9967837588`.

### Explicit surface force-application points — COMPLETE FOR CURRENT MAPPING SCOPE
- [x] Define mapping contract from one ready analytical surface action to a caller-declared global application point.
- [x] Require exact stable surface ID match, finite `(x,y,z)` point, provenance, and verification.
- [x] Preserve the source force vector exactly; mapping does not mutate or recalculate aerodynamic action.
- [x] Never infer geometric centroid, rendered panel center, center of pressure, joint, support, anchor, nearest frame member, or solver node.
- [x] Keep moment unavailable until a separate explicit reference-point contract exists.
- [x] Keep reaction, base shear, uplift/sliding, racking, connection demand, load-path distribution, and PASS/FAIL unavailable.
- [x] Add regressions for invalid coordinates, ID mismatch, blocked source action, geometry non-inference, copying/no aliasing, and exact force preservation.
- [x] Wire deliberately non-centroid north-wall QA point `(0.370,1.230,-2.410) m` while rendered center remains `(0,1.650,-2.250) m`.
- [x] Production browser proves `APPLICATION POINT BASIS: CALLER_DECLARED_GLOBAL_POINT`, no inferred point, center of pressure/solver node/moment/reaction/PASS-FAIL unavailable, and stale-stage clearing.
- [x] Confirm RPE CI `33961159081`, production Chromium `33961159089`, browser artifact `9967997190`.

### Explicit force moment about declared reference point — COMPLETE FOR CURRENT ORDINARY-STATICS SCOPE
- [x] Define explicit global reference-point contract only after the surface force and application point are ready.
- [x] Require exact stable surface ID match, finite caller-declared reference `(x,y,z)`, provenance, and verification; never assume global origin.
- [x] Calculate only `r = r_app − r_ref`, `M_ref = r × F`, and Euclidean moment magnitude.
- [x] Canonical QA: `F=(0,0,-960) N`, `r_app=(0.37,1.23,-2.41) m`, `r_ref=(0.1,0.2,-2.0) m`, `r=(0.27,1.03,-0.41) m` → `M=(-988.8,259.2,0) N·m`, `|M|=1022.208 N·m`.
- [x] Prove equal translation of application/reference points preserves lever arm and moment within numerical tolerance.
- [x] Preserve zero force moment when reference equals application point without inventing an aerodynamic couple.
- [x] Keep `aerodynamicTorqueNm = null`; ordinary `r×F` is explicitly not aerodynamic torque/free couple.
- [x] Keep reaction, base shear, uplift/sliding, racking, connection demand, load-path distribution, solver response, support moment, and PASS/FAIL unavailable.
- [x] Production browser labels the gate `RPE_ANALYTICAL · ORDINARY STATICS r×F · NOT AERODYNAMIC TORQUE` and proves stale-stage clearing.
- [x] Confirm permanent RPE CI `33966843019`, production Chromium `33966843040`, browser artifact `9969727754`.

### Structural load-case / solver-node adapter — CURRENT GATE
- [ ] Define a traceable adapter that maps accepted analytical force/application-point/moment evidence to an explicitly caller-declared structural load-case identity and solver-node identity.
- [ ] Require explicit stable surface ID, load-case ID, solver-node ID, coordinate-system/basis declaration, provenance, and verification; no nearest-node or geometry-based inference.
- [ ] Preserve analytical source force/moment exactly and maintain source-evidence references; adapter must not recalculate aerodynamics or structural response.
- [ ] Explicitly distinguish `solver_input_mapping` from `solver_result`; mapping readiness alone must never create reactions, displacements, member forces, connection demands, or PASS/FAIL.
- [ ] Block stale stage/surface evidence, ID mismatches, missing node/load-case identities, unsupported coordinate basis, and incomplete provenance.
- [ ] Add regressions proving geometry proximity cannot select a solver node and that changing only node/load-case mapping changes only adapter metadata, not the analytical source result.
- [ ] Wire one synthetic explicit node/load-case mapping into browser QA with strong `INPUT MAPPING ONLY / NO SOLVER RESPONSE` labeling.

### Later Phase 4 mechanics layers
- [ ] Execute a structural solver/load-path gate only after model topology, nodes, element properties, restraints/boundary conditions, coordinate transformations, and load-case mappings are explicit and validated.
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
- [x] Keep force-moment RPE CI run `33966651039` visible: translation-invariance regression used strict deep equality and exposed normal IEEE-754 differences (`0.27` vs `0.2699999999999996`); mechanics contract stayed unchanged and the regression was repaired with a `1e-9` numerical tolerance before permanent green CI/browser acceptance.

## Later mechanics gates — not to be invented early
- [ ] Contact-property contract, only if justified and explicitly sourced/supplied.
- [ ] Impact mechanics contract, only after required physical quantities/evidence are defined.
- [ ] Damage/failure model tied to solver/test/calibration evidence.
- [ ] Physical-test data ingestion and calibration loop.
- [ ] Controlled simplification only after calculate/solve/simulate/test/calibrate evidence supports it.
