# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`; GitHub is the implementation source of truth and Google Drive is the durable planning mirror.

Immediate execution order:

1. **Phase 2D quantity UI:** expose the already-tested quantity/takeoff override backend in the Product/Assembly panel. Show library quantity, effective override quantity, waste basis, source note, and an explicit clear/reset action. Keep this as procurement/cost context, not specimen ancestry.
2. **Phase 2 upgrade migration:** replace legacy fixed `UpgradeOption` / `UpgradeRule` behavior with assembly/candidate changes in the Phase 2 model; then add upgrade-reference validation.
3. **Phase 2D legacy retirement:** remove legacy `Material`, `CostItem`, and fixed upgrade UI/data paths only after their required behavior has an equivalent Phase 2 path.
4. **Phase 2E UI regression coverage:** test assembly selection, local unit-rate override, quantity override, Reset, Create Candidate, and A0 immutability at the UI/state boundary.
5. Run full CI: dependency install, lint, strict TypeScript, automated tests, production build. Record a final Phase 2 exit checkpoint only when all pass.
6. Begin Phase 3 Genesis Test Chamber only after Phase 2 exit criteria pass.
7. Genesis order is fixed: Null House → smoke/wind visualization → one physical panel → calculated wind action → breakable connection → detached rigid-body debris.
8. Do not jump ahead to BIM/IFC, OpenSees, OpenFOAM, Blender/Unreal bridge implementation, or multi-hazard expansion until the simpler preceding gate is reproducible and recorded.
