# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`

## Current truth

RPE has a trustworthy Phase 2 data/cost/candidate spine plus an active Phase 3 Genesis mechanics path. The older Typhoon playback remains conceptual and is not promoted to calculated physics.

### Phase 2
- Data spine, deterministic costing, immutable A0→draft→candidate derivation, catalog/upgrade UI migration, persistence, and automated verification are implemented.
- Manual browser visual acceptance remains a separate outstanding gate before the final Phase 2 exit checkpoint.

### Dependencies and browser QA
- Canonical application dependencies remain on the remediated graph: Next.js / `eslint-config-next` `16.3.4`, `@react-three/rapier@2.2.0`.
- Canonical `npm ci` reports zero vulnerabilities in the current browser workflow.
- The isolated browser harness now installs pinned `playwright@1.62.1` outside committed application metadata and runs `npm audit --audit-level=high`; the current audited harness reports zero vulnerabilities.
- The previous Playwright 1.55.0 high-advisory cleanup item is therefore closed. Browser-tooling evidence remains separate from application dependency evidence.

### Phase 3 Genesis mechanics
- Versioned Genesis wind/panel/connection/result types preserve evidence boundaries.
- Null House remains `N/A / no_physical_specimen`; Fast Smoke remains explicitly NON-CFD visualization.
- Panel 001 uses only explicit caller-supplied inputs for the analytical path `q = 0.5ρV²` → `F = qAC`.
- Equivalent connection demand/capacity, A/B analytical comparison, rigid-body release gate, debris-dynamics gate, collision-target contract, live Rapier activation, collision identity bridge, stale-context reset, and ordered analytical→simulation event ledger are implemented and tested.
- A real production Next.js / headless Chromium acceptance has already established the synthetic panel→declared-target collision wiring and stale-collision reset. This is software-path evidence only, not impact/damage/material validation.
- The post-release aerodynamic contract is now implemented as a distinct `rpe_analytical` calculation. It requires explicit interval, air density, relative air-velocity vector, projected area, drag coefficient, body ID, provenance, and verification state. It does not reuse pre-release panel force or manufacture an impulse.
- The aerodynamic force-application gate is implemented as a distinct, non-executing `rpe_simulation` plan. It requires explicit opt-in, a ready debris-dynamics gate, a ready aerodynamic result, matching body identity, and source provenance. It applies at center of mass and explicitly models no aerodynamic torque.
- New `evaluateGenesisAerodynamicForceStep` scheduling logic is implemented and tested. It maps the declared constant-force interval onto a future physics step without mutating Rapier. If the interval ends part-way through a physics step, the effective force is scaled so the integrated step impulse equals only `F × activeDuration`; the load is not silently extended to the full step.
- Live post-release aerodynamic force is **not yet applied to Rapier**. This remains deliberately gated behind the tested analytical contract, force-application plan, and fixed-step scheduling layer.

### Current validation checkpoint
- Scheduler implementation commit: `5e611c8c55830282bcba9f43fd93f30be24dfc73`.
- RPE CI run `33936435420` passed install, lint, strict TypeScript, automated tests, and production build.
- Adding the new aerodynamic UI had exposed a browser-harness selector regression. Genesis Browser Acceptance run `33936435595` failed because the old broad selector found two verification controls. The failure was retained and not waived.
- First selector repair `363c7beb94330d0279b088c3522bea9d60d7be72` kept normal RPE CI green, but Genesis Browser Acceptance run `33936534126` failed because `getByLabel` could not resolve the visually nested target select. That second failure was also retained and not waived.
- Repair commit `4bad29c6d44fd7f08abcead1298dc1c61f89bdc6` scopes the target verification selector from the unique collision-target Source-note control without weakening any physics or evidence acceptance criterion.
- RPE CI run `33936665268` passed all gates.
- Genesis Browser Acceptance run `33936665296` passed all gates. Evidence artifact: `genesis-browser-acceptance-4bad29c6d44fd7f08abcead1298dc1c61f89bdc6`, artifact ID `9960419250`.
- The isolated Playwright 1.62.1 harness audit in that successful browser run reported zero vulnerabilities.

## Evidence doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, browser visualization/QA, and future physical tests remain separate evidence layers. A green software test does not promote a model to solver, code-compliance, CFD, material-test, or physical-test evidence.

## Blockers
- Phase 2 manual browser visual acceptance is still outstanding as an independent project gate.
- No live post-release aerodynamic force coupling exists yet; this is an intentional implementation gate, not a missing assumed property.
- No aerodynamic torque, contact mechanics, impact force/energy, damage model, friction/restitution, solver authority, CFD authority, or physical-test authority has been inferred.

## Exact next gated task

Wire the already-tested force-application plan and fixed-step scheduler into the released Panel 001 Rapier path behind an explicit user opt-in and provenance-bearing aerodynamic contract. Apply only the scheduler-returned center-of-mass force during the declared interval, record the application state as `rpe_simulation` evidence, and browser-test that force starts/stops at the declared window and stale run context resets on any relevant explicit input change. Do **not** add aerodynamic torque, hidden coefficients, a pre-release impulse conversion, or derived material/contact properties in that batch.
