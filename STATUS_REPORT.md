# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`  
**Engine ladder:** `docs/ENGINE_INTEGRATION_LADDER.md`

## Current truth

RPE has a trustworthy Phase 2 data/cost/candidate spine, a completed Phase 3 Genesis first-mechanics path, and an active Phase 4 Small House Wind System.

Phase 4 has progressed through:

**empty envelope ✅ → primary supports ✅ → floor/ring frame ✅ → walls ✅ → roof ✅ → connections ✅ → bracing topology-readiness ✅ → anchorage interface-readiness ✅ → storm protection topology-readiness ✅ → controlled A/B specimen difference 🔵**

The older Typhoon playback remains conceptual and is not promoted to calculated physics.

### Phase 2
- Data spine, deterministic costing, immutable A0→draft→candidate derivation, catalog/upgrade UI migration, persistence, and automated verification are implemented.
- Final manual Phase 2 browser visual acceptance remains a separate outstanding gate.

### Dependencies and QA
- Canonical app remains on Next.js / `eslint-config-next` `16.3.4` and `@react-three/rapier@2.2.0`.
- Browser QA uses isolated pinned `playwright@1.62.1` with `npm audit --audit-level=high` outside committed application dependencies.
- Normal CI gates install, lint, strict TypeScript, automated tests, and production build.
- Production-browser acceptance runs the retained Genesis suite and Phase 4 staged-house suite.

## Phase 3 Genesis — EXIT GATE SATISFIED

Panel 001 has explicit analytical wind inputs, calculated connection demand/capacity, release/debris-dynamics gates, Rapier debris, genuine collision evidence, and separately gated post-release center-of-mass aerodynamic force over a declared fixed-step interval.

Evidence boundaries remain explicit: analytical calculations are not solver/CFD evidence; Rapier observations are `rpe_simulation`; browser checks are `browser_qa`; none are physical-test evidence.

## Phase 4 Small House Wind System — ACTIVE

### Staged-house foundation
- Versioned staged specimen and locked stage order through storm protection.
- Stable IDs plus explicit center/size/orientation.
- Unknown material/mass/capacity remain explicit `null`.
- Immutable stage materialization.
- `VISIBLE ≠ ADEQUATE` remains explicit in the Small House viewer.

### Primary supports
- Explicit support identity, axis, and restraint inputs.
- First isolated Euler–Bernoulli cantilever analytical benchmark only.
- No strength/capacity or whole-house claim.
- Browser artifact `9962116271`.

### Floor/ring frame
- Explicit member identity, geometry/orientation, axis, and endpoint roles.
- No inferred physical joints or global frame mechanics.

### Walls / roof
- Explicit geometry/exposure semantics with geometry-only areas.
- Effective wind area, pressure, stiffness/strength, and fastener mechanics remain separate future gates.
- Wall browser artifact `9962401294`; roof artifact `9962552182`.

### Connections
- Topology is separate from physical joint location.
- Missing joint location stays unknown until explicitly supplied.
- Browser artifact `9964232114`.

### Bracing topology-readiness
- Visible diagonal geometry cannot create a complete brace path.
- Canonical west brace remains `load_path_incomplete`, `1 / 2` explicit ends.
- No brace mechanics/adequacy is inferred.
- Browser artifact `9964350351`.

### Anchorage interface-readiness
- Canonical `synthetic-anchor-nw → synthetic-connection-anchor-nw → synthetic-support-nw` establishes interface identity only.
- Physical attachment point, bolt/embedment/base plate, footing/soil, reactions/resistance, capacity, and PASS/FAIL remain unavailable.
- Browser run `33950699741`, artifact `9964743865`.
- Final clean-head browser run `33950979454`, artifact `9964831153`.

### Storm Protection restraint topology-readiness — COMPLETE FOR CURRENT TOPOLOGY SCOPE
- Canonical `synthetic-storm-strap-west` is visible but has only one explicit storm relationship to `synthetic-roof-west`.
- Correct canonical result is `restraint_path_incomplete`, `1 / 2` selected ends.
- A complete topology review requires two distinct explicit incident connection records and two distinct active opposite endpoint components.
- Two duplicate connection records to the same roof are rejected rather than treated as a complete path.
- Visible strap extent, crossing, or apparent touching never creates a second end or physical attachment point.
- Material/mass/capacity remain unknown where the fixture declares `null`.
- Tension/preload, stiffness, slack/elongation, uplift demand, restraint force, load sharing, fasteners, member/connection capacity, utilization, PASS/FAIL, and whole-house benefit remain unavailable.
- QA-only augmented fixture can explicitly add a second end to `synthetic-anchor-nw` and reach topology review only.
- RPE CI run `33951312722` passed.
- Real production-browser run `33951312736` passed; artifact ID `9964940298`.

### Controlled A/B specimen difference — CURRENT GATE

The first A/B gate will audit **controlled input difference**, not structural performance.

Canonical pair:
- Variant A = `SYNTHETIC_PHASE4_HOUSE` unchanged.
- Variant B = exact deep-cloned house plus one declared QA-only connection record from `synthetic-storm-strap-west` to `synthetic-anchor-nw`.

The comparison must prove:
- envelope unchanged;
- component identity set unchanged;
- every component geometry/orientation/material/mass/provenance field unchanged;
- all pre-existing connection records unchanged;
- exactly one connection record added;
- no unrelated property mutation exists.

A successful result may say only `controlled_input_difference`. It must not say the changed house is stronger, safer, more resilient, code-compliant, or better under wind because no whole-house mechanics/solver evidence exists yet.

## Engine integration ladder

The architecture is locked in `docs/ENGINE_INTEGRATION_LADDER.md`:

**Three.js/R3F → Rapier → IFC/IfcOpenShell + Blender/Bonsai → OpenSees/OpenSeesPy → selected CalculiX → OpenFOAM → optional Chrono/Unreal → BlueQubit v2+**

RPE remains the canonical specimen/evidence orchestrator. Solver, CFD, rigid-body, BIM, and visualization layers must not silently overwrite one another's evidence meaning.

OpenSees-class structural coupling and one OpenFOAM CFD workflow are mandatory RPE v1.0 gates.

## Open gates / limitations
- Final Phase 2 manual browser visual acceptance remains outstanding.
- Phase 4 still has no whole-house wind performance result.
- Current canonical brace remains topology-incomplete and has no bracing mechanics result.
- Anchorage proves interface identity only; no uplift/sliding/overturning mechanics exist.
- Canonical storm strap remains topology-incomplete; no storm-restraint mechanics exist.
- Controlled A/B currently targets invariant input auditing only, not performance ranking.
- No global frame/load-path solver result, OpenSees result, CalculiX result, OpenFOAM CFD result, or physical-test evidence has yet been generated for the Phase 4 house.

## Exact next gated task — Controlled A/B specimen difference

Implement a deterministic stable-ID comparison contract for two validated small-house specimen definitions. Accept the canonical QA pair only when exactly one declared structural topology variable differs: one added second storm-restraint-end connection. Reject geometry drift, component mutations, unrelated connection changes, zero differences, or multiple differences.

The comparison output must report explicit invariants and the exact single changed record while keeping mechanics/performance fields unavailable.

## Evidence doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, browser visualization/QA, and future physical tests remain separate evidence layers. A green software or browser test does not promote a model to solver, code-compliance, CFD, material-test, or physical-test evidence.
