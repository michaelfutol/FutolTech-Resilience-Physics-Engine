# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

The canonical branch is active in Phase 3 Genesis. Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B comparison, rigid-body release gating, explicit debris initial-condition gating, gated Rapier activation, deterministic ordered simulation-event ledger, and the live Rapier evidence callback path are implemented.

The first collision-target gate is now complete: `src/types/genesisCollisionTarget.ts` and `src/lib/genesis/collisionTarget.ts` define and validate a provenance-bearing box target using only explicit object identity, center coordinates, dimensions, source note, and verification state. The contract does not infer mass, material, friction, restitution, stiffness, capacity, impact force/energy, damage, or other contact mechanics from geometry. Regression coverage is included in the explicit `npm test` command.

Implementation checkpoint `bc24311d9decfe580074c49581e565d52e7e02fb` passed RPE CI run 131: dependency install, lint, strict TypeScript, automated tests, and production build all succeeded.

## Immediate execution order

1. **Viewport target inputs:** expose explicit target object ID, center (x/y/z), box dimensions (x/y/z), provenance/source note, and verification state in Genesis Panel 001. Blank/partial input must remain invalid; no defaults should create a target.
2. **Validated target only:** call the collision-target validator and render/instantiate a visible target only when the complete explicit contract is valid.
3. **Same Rapier world:** when Panel 001 simulation is active, place the validated fixed target in the same Rapier `Physics` world as the released panel. Do not add hidden floors or obstacles.
4. **Declared identity in evidence:** a genuine panel↔declared-target `onCollisionEnter` may record the target's explicit `objectId` as `otherObjectId`; do not manufacture identity for any other collider.
5. **Live collision acceptance:** perform browser acceptance of a real collision event and expose the ordered ledger.
6. **Context-reset acceptance:** change any explicit panel/dynamics/target input after a collision and verify the previous collision observation is not retained in the new run context.
7. **No invented contact mechanics:** friction, restitution, impact force/energy, damage, material response, or constitutive behavior remain undefined unless separately declared and justified.
8. **No invented post-release wind model:** define a separate time/load/aerodynamic contract before applying continuing wind force or aerodynamic torque to debris.
9. **Phase 2 browser acceptance:** independently verify the remaining Phase 2 manual UI acceptance path and record the Phase 2 exit SHA only after it actually passes.
10. **Later simulation comparison:** add synchronized A/B simulation/replay only after the single-panel live collision record is deterministic and reviewable.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
