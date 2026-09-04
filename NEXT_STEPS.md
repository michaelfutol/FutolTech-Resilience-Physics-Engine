# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

The canonical branch is past the earlier dependency gate. Next.js and matching ESLint configuration are on 16.3.4, a clean audit gate was recorded, and `@react-three/rapier@2.2.0` is installed. Genesis includes Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B comparison, a rigid-body release eligibility gate, and an explicit debris-dynamics initial-condition gate.

## Immediate execution order

1. **Debris simulation wiring:** expose explicit panel mass, gravity vector, initial linear velocity, and initial angular velocity in the Genesis Panel UI. Blank values must remain missing; do not provide engineering defaults.
2. **Rapier activation gate:** only instantiate a released dynamic panel when analytical connection release is `release_ready` and debris dynamics are `simulation_ready`.
3. **No invented launch model:** do not convert panel force into an impulse or post-release wind force without a separately declared time/load/aerodynamic model. The first Rapier path should consume only explicit rigid-body initial conditions.
4. **Collision/evidence sequence:** record analytical threshold, release eligibility, simulation readiness, rigid-body activation, and collision/debris events as distinct evidence stages.
5. **Phase 2 browser acceptance:** independently verify assembly alternatives, quantity override, unit-rate override, derived cost, upgrade Apply, Reset, Create Candidate, refresh persistence, saved lineage, invalid-workspace warnings, and Genesis mode switching; then record the Phase 2 exit SHA.
6. **Genesis acceptance:** demonstrate `Null House → Fast Smoke → panel → calculated action → connection demand/capacity → gated release → explicit rigid-body simulation`, preserving provenance and limitations.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
