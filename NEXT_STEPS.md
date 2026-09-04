# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

The canonical branch is past the dependency gate. Next.js and matching ESLint configuration are on 16.3.4, a clean audit gate was recorded, and `@react-three/rapier@2.2.0` is installed. Genesis includes Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B comparison, a rigid-body release eligibility gate, an explicit debris-dynamics initial-condition gate, explicit rigid-body UI inputs, gated Rapier activation, and a tested deterministic ordered simulation-event ledger.

The ledger preserves analytical events separately from `rpe_simulation` events and orders rigid-body release gate → debris-dynamics gate → simulation activation → optional collision-enter records. It rejects collision records before activation and does not infer impact force, energy, damage, friction, restitution, material response, solver evidence, or physical-test evidence.

CI test execution now explicitly includes the pre-existing release-to-simulation integration regression in addition to the new ledger tests.

## Immediate execution order

1. **Live collision/evidence wiring:** connect the ordered event ledger to the Genesis Rapier path and collision-enter callback; expose the ordered sequence in the UI.
2. **No invented collision target:** do not add hidden geometry, contact properties, or arbitrary launch conditions merely to manufacture a collision event. Record only collisions Rapier actually reports against explicitly modeled objects.
3. **No invented post-release wind model:** define a separate time/load/aerodynamic contract before applying any continuing wind force or aerodynamic torque to debris.
4. **Simulation observability:** preserve event identity/provenance without promoting Rapier motion to manual/code, solver, CFD, or physical-test evidence.
5. **Phase 2 browser acceptance:** independently verify assembly alternatives, quantity override, unit-rate override, derived cost, upgrade Apply, Reset, Create Candidate, refresh persistence, saved lineage, invalid-workspace warnings, and Genesis mode switching; then record the Phase 2 exit SHA.
6. **Genesis acceptance:** demonstrate `Null House → Fast Smoke → panel → calculated action → connection demand/capacity → gated release → explicit rigid-body simulation → recorded collision/debris events`, preserving provenance and limitations.
7. **Later simulation comparison:** add synchronized A/B simulation/replay only after the single-panel event record is deterministic and reviewable.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
