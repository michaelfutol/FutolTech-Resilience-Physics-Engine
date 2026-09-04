# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

The canonical branch is active in Phase 3 Genesis. Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B comparison, rigid-body release gating, explicit debris initial-condition gating, gated Rapier activation, deterministic ordered simulation-event ledger, and the live Rapier evidence callback path are implemented.

`Viewport3D` now derives a base live-evidence snapshot from the current analytical/release/dynamics state, keeps only actual collision observations as state, wires `RigidBody.onCollisionEnter` through `recordGenesisRapierCollisionEnter`, and renders `GenesisEventLedgerPanel`. Collision context is keyed to the explicit Genesis inputs so observations from an old input context are not shown after the inputs change.

Implementation commit `97a9a07c755c7d9f8a1ed700143e124c49708d0e` failed RPE CI run 128 at lint because of synchronous state updates inside an effect. The failure was not bypassed. Repair commit `808b55747359aa73011c8b18c6e62e218f08f749` removed that pattern; RPE CI run 129 passed install, lint, strict TypeScript, automated tests, and build.

## Immediate execution order

1. **Explicit collision-target contract:** define a typed, provenance-bearing Genesis target object with explicit object identity and geometry inputs. No material/contact properties should be implied by geometry alone.
2. **Visible caller-declared target only:** add one visible collision object to the Genesis scene only when those explicit target inputs are supplied. Do not add a hidden floor or obstacle.
3. **Live collision acceptance:** use the existing Rapier callback bridge to record a genuine collision event and expose the declared target identity in `otherObjectId` when known.
4. **Context-reset acceptance:** change an explicit Genesis input after a collision and verify the previous collision observation is not retained in the new run context.
5. **No invented contact mechanics:** friction, restitution, impact force/energy, damage, material response, or contact constitutive behavior remain undefined unless separately declared and justified.
6. **No invented post-release wind model:** define a separate time/load/aerodynamic contract before applying continuing wind force or aerodynamic torque to debris.
7. **Phase 2 browser acceptance:** independently verify the remaining Phase 2 manual UI acceptance path and record the Phase 2 exit SHA only after it actually passes.
8. **Later simulation comparison:** add synchronized A/B simulation/replay only after the single-panel live collision record is deterministic and reviewable.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
