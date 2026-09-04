# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

The canonical branch is active in Phase 3 Genesis. Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B comparison, rigid-body release gating, explicit debris initial-condition gating, gated Rapier activation, deterministic ordered simulation-event ledger, and the live Rapier evidence callback path are implemented.

The explicit collision-target integration gate is now implemented. Genesis Panel 001 exposes blank-by-default target object ID, center, box dimensions, source note, and verification state. `validateGenesisCollisionTargetInput` must accept the complete contract before a target exists. A validated target is rendered visibly and, during an active run, is instantiated as a fixed Rapier rigid body in the same physics world as the released panel. No hidden floor or obstacle is added.

Runtime target identity is carried only through narrow RPE metadata generated from the validated target contract. The collision callback resolves `otherObjectId` only when that metadata matches the currently validated target; otherwise identity remains unresolved. Target inputs are part of the live evidence context key so changed target/run inputs do not inherit prior collision observations.

Implementation checkpoint `78ccb43123c29aedff83b2e6145be96cbbd25c53` passed RPE CI run 133: dependency install, lint, strict TypeScript, automated tests, and production build all succeeded.

## Immediate execution order

1. **Live collision browser acceptance:** enter a complete target plus explicit wind/panel/release/dynamics inputs that cause a genuine Rapier panel↔target collision and verify the ordered ledger records the declared target ID from the real callback.
2. **Context-reset browser acceptance:** after that collision, change one explicit panel, dynamics, or target input and verify the prior collision observation is absent from the changed run context.
3. **Evidence-boundary review:** confirm the UI does not present Rapier contact response as impact force, impact energy, damage, material response, manual/code evidence, structural-solver evidence, CFD evidence, or physical-test evidence.
4. **No invented contact mechanics:** do not add friction, restitution, constitutive response, impact-force/energy, or damage calculations unless separately declared, justified, and provenance-bearing.
5. **No invented post-release wind model:** define a separate time/load/aerodynamic contract before applying continuing wind force or aerodynamic torque to debris.
6. **Phase 2 browser acceptance:** independently verify the remaining Phase 2 manual UI acceptance path and record the Phase 2 exit SHA only after it actually passes.
7. **Later simulation comparison:** add synchronized A/B simulation/replay only after the single-panel live collision record is browser-verified and reviewable.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
