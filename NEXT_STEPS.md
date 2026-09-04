# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

The canonical branch is past the dependency gate. Next.js and matching ESLint configuration are on 16.3.4, a clean audit gate was recorded, and `@react-three/rapier@2.2.0` is installed. Genesis includes Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B comparison, a rigid-body release eligibility gate, an explicit debris-dynamics initial-condition gate, explicit rigid-body UI inputs, and gated Rapier activation.

Panel 001 becomes dynamic only when analytical release is `release_ready` and debris dynamics are `simulation_ready`. Rapier consumes explicit panel mass, gravity, initial linear velocity, and initial angular velocity. No analytical panel force is converted into an impulse, launch velocity, continuing wind force, or aerodynamic model.

## Immediate execution order

1. **Collision/evidence sequence:** add deterministic collision/debris event logging after Rapier activation. Preserve analytical threshold, release eligibility, simulation readiness/activation, and collision events as distinct ordered evidence stages.
2. **No invented post-release wind model:** define a separate time/load/aerodynamic contract before applying any continuing wind force or aerodynamic torque to debris.
3. **Simulation observability:** expose simulation event state/provenance without promoting Rapier motion to manual/code, solver, CFD, or physical-test evidence.
4. **Phase 2 browser acceptance:** independently verify assembly alternatives, quantity override, unit-rate override, derived cost, upgrade Apply, Reset, Create Candidate, refresh persistence, saved lineage, invalid-workspace warnings, and Genesis mode switching; then record the Phase 2 exit SHA.
5. **Genesis acceptance:** demonstrate `Null House → Fast Smoke → panel → calculated action → connection demand/capacity → gated release → explicit rigid-body simulation → recorded collision/debris events`, preserving provenance and limitations.
6. **Later simulation comparison:** add synchronized A/B simulation/replay only after the single-panel event record is deterministic and reviewable.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
