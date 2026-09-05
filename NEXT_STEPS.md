# Next Steps

## Current roadmap position

Phase 3 — Genesis Test Chamber — has satisfied its roadmap exit gate.

Phase 4 — **Small House Wind System** — remains active. Current progression:

**topology/staging ✅ → isolated primary-support formula ✅ → wall/roof exposure readiness ✅ → connection/bracing/anchorage/storm topology ✅ → controlled A/B input audit ✅ → single-surface wind action ✅ → multi-surface vector set ✅ → explicit force application point ✅ → explicit ordinary `r×F` moment ✅ → structural load-case / solver-node mapping ✅ → structural model + boundary-condition readiness 🔵**

The exact next layer is **structural model / boundary-condition readiness**. This remains an input-evidence gate, not a solver result.

Phase 4 is not complete. The locked roadmap still requires explicit structural-model evidence and then actual engineering-solver results before RPE can claim reactions, displacements, member forces, load-path response, connection demand, uplift/sliding reaction, or racking response.

## Newly completed — Explicit force moment about a declared reference point

RPE now computes ordinary statics force moment only after both a caller-declared force application point and a separately caller-declared global reference point exist.

Canonical north-wall QA:
- `F = (0,0,-960) N`;
- application point `r_app = (0.370,1.230,-2.410) m`;
- reference point `r_ref = (0.100,0.200,-2.000) m`;
- lever arm `r = (0.270,1.030,-0.410) m`;
- `M_ref = r × F = (-988.800,259.200,0) N·m`;
- `|M_ref| = 1022.208 N·m`.

Permanent boundary:
- evidence layer = `rpe_analytical`;
- ordinary `r×F` is **not aerodynamic torque / free couple**;
- no global-origin default is allowed;
- no support moment, reaction, solver response, connection demand, load-path distribution, or PASS/FAIL is inferred.

Evidence:
- RPE CI `33966843019` — success;
- Production Chromium `33966843040` — success;
- Browser artifact `9969727754`.

The earlier CI run `33966651039` remains visible because an exact floating-point equality assertion saw `0.27` versus `0.2699999999999996`. The mechanics contract was not changed; the regression was repaired with a tight numerical tolerance.

## Newly completed — Structural load-case / solver-node adapter

RPE can now translate already-accepted analytical force/application/moment evidence into one explicit structural nodal-load input record without pretending that a structural analysis has run.

Required explicit adapter inputs:
- stable surface component ID;
- load-case ID;
- solver-node ID;
- solver-node global coordinate;
- coordinate basis `global_cartesian_xyz_m`;
- provenance and verification.

Critical mapping rule:
- the solver-node coordinate must coincide with the explicit reference point used to calculate the source `r×F` moment;
- RPE will not attach a moment calculated about one point to another node without an explicit load-transfer transformation;
- nearest-node / scene-geometry inference is prohibited.

Canonical QA mapping:
- surface: `synthetic-wall-north`;
- load case: `LC-WIND-QA-001`;
- solver node: `NODE-WIND-NORTH-QA-001`;
- node coordinate: `(0.100,0.200,-2.000) m`;
- mapped force: `(0,0,-960) N`;
- mapped nodal moment: `(-988.8,259.2,0) N·m`.

Permanent boundary:
- evidence layer = `solver_input_mapping`;
- **SOLVER EXECUTED: NO**;
- reactions, displacements, rotations, member forces, connection demands, base shear, racking response, and PASS/FAIL remain `N/A`.

Evidence:
- clean core adapter RPE CI `33967371220` — success;
- permanent browser-head RPE CI `33967553863` — success;
- Production Chromium `33967553834` — success;
- Browser artifact `9969940359`.

The earlier adapter CI run `33967204105` remains visible: its new regression used two wrong TypeScript schema names/paths (`SmallHouseWindSystemInput` and `.geometry.center`) before being repaired to the real specimen schema (`SmallHouseWindSpecimenInput` and `.centerM`). The adapter mechanics did not change.

## Exact next gated batch — Structural model / boundary-condition readiness

The next contract must define a **solver-ready model input** without executing the solver yet.

### First-slice model scope

Use a deliberately small, synthetic static structural QA model so the software contract can be proved before whole-house mechanics are introduced. The model must explicitly declare:
- model ID and intended solver target;
- global coordinate basis and consistent units;
- stable node IDs with finite global coordinates;
- every node's six DOF restraint states explicitly, with no restraint defaults;
- stable element IDs and explicit node connectivity;
- element formulation/type;
- explicit local/orientation vector or transformation basis where required;
- all element properties required by that formulation, including material and section stiffness terms;
- explicit load-case identities;
- provenance and verification for mechanics-driving data.

For the first canonical QA model, the already-mapped node `NODE-WIND-NORTH-QA-001 @ (0.100,0.200,-2.000) m` should exist exactly in the structural model and load case `LC-WIND-QA-001` should be declared exactly. A second support node and a simple two-node elastic 3D element may be used as a **synthetic software-verification submodel**, not as adopted Dignity geometry or whole-house performance evidence.

### Required validation

The readiness layer should reject:
- duplicate node, element, or load-case IDs;
- missing element endpoint nodes;
- zero-length elements;
- missing/non-finite mechanics properties;
- missing/implicit DOF restraint states;
- invalid or degenerate orientation vectors;
- adapter node/load-case identities absent from the model;
- adapter node coordinates inconsistent with the model node;
- stale or incompatible adapter evidence.

### Evidence boundary

Successful readiness should report an input-review state such as `solver_model_ready` while still declaring:
- `SOLVER EXECUTED: NO`;
- reactions `N/A`;
- displacements/rotations `N/A`;
- element forces `N/A`;
- base shear `N/A`;
- connection demand `N/A`;
- racking response `N/A`;
- capacity/utilization/PASS-FAIL `N/A`.

No software/browser readiness test may be described as an OpenSees result.

## Following Phase 4 order

After structural model readiness:

1. Build the explicit OpenSees/OpenSeesPy translation/execution gate for the accepted synthetic model and compare solver results with independent hand checks where feasible.
2. Only then expose reactions, nodal displacements/rotations, and element-force results as `solver_result` evidence.
3. Expand from the synthetic isolated submodel toward the explicit Small House frame/load path without silently converting rendered topology into solver topology.
4. Define connection, bracing, anchorage, and storm-restraint mechanics when their required physical/mechanical inputs are explicit.
5. Reuse controlled A/B invariants only when corresponding analytical/solver evidence exists and exactly one declared structural variable changes.
6. Add required Phase 4 failure/debris/residual-state layers and later CFD evidence before Phase 4/v1.0 exit.

## Engine integration ladder

Locked separately in `docs/ENGINE_INTEGRATION_LADDER.md`:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

OpenSees-class structural coupling and one OpenFOAM CFD workflow remain required RPE v1.0 gates.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately.

## Evidence boundary

Manual/code calculations, RPE analytical calculations, solver-input mapping/model readiness, engineering solver results, RPE simulation, browser QA/visualization, and future physical tests remain separate under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
