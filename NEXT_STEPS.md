# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

The canonical branch is past the dependency gate and active in Phase 3 Genesis. Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B comparison, rigid-body release gating, explicit debris initial-condition gating, gated Rapier activation, and the deterministic ordered simulation-event ledger are implemented.

The repository now also has `liveSimulationEvidence.ts`, a pure immutable bridge intended for the actual Rapier callback path. It creates a reviewable activation snapshot and appends explicit collision-enter observations only through the existing ordered ledger contract. It cannot bypass blocked release/dynamics gates. `GenesisEventLedgerPanel.tsx` is ready to display the ordered analytical→simulation sequence and explicitly states that collision events do not establish impact mechanics or engineering authority.

Implementation checkpoint `d9a5f3f3f92a30dd85e4aa62577ed2102f6188ed` passed RPE CI run 126: install, lint, strict TypeScript, automated tests, and build all succeeded.

## Immediate execution order

1. **Actual callback wiring:** in the Genesis `Viewport3D` dynamic-panel path, initialize live evidence when both gates are ready and append only Rapier `onCollisionEnter` callbacks using `recordGenesisRapierCollisionEnter`.
2. **Explicit object identity only:** populate `otherObjectId` only from explicitly modeled/caller-known scene objects. `null` is acceptable when identity is unavailable; do not manufacture an object identity.
3. **Mount evidence UI:** render `GenesisEventLedgerPanel` from the current immutable ledger snapshot so analytical and simulation stages are visibly ordered.
4. **No invented collision target:** do not add hidden geometry, contact properties, friction, restitution, or arbitrary launch conditions merely to manufacture a collision.
5. **No invented post-release wind model:** define a separate time/load/aerodynamic contract before applying continuing wind force or aerodynamic torque to debris.
6. **Phase 2 browser acceptance:** independently verify the remaining manual UI acceptance path and record the Phase 2 exit SHA only after it actually passes.
7. **Genesis acceptance:** demonstrate `Null House → Fast Smoke → panel → calculated action → connection demand/capacity → gated release → explicit rigid-body simulation → observed collision/debris event ledger`, preserving provenance and limitations.
8. **Later simulation comparison:** add synchronized A/B simulation/replay only after the single-panel live event record is deterministic and reviewable.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
