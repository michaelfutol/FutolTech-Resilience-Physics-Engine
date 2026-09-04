# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

Genesis analytical foundation is now implemented and CI-verified at `effa98b6f4b40199737c148c0fbc83b62dfd2ad0`.

This is an **RPE analytical** layer only. It is not code-complete wind design, CFD, a structural solver, rigid-body simulation, or physical validation.

## Immediate execution order

1. **Dependency audit gate:** classify the currently reported npm advisories by direct/transitive origin and practical reachability. Do not force-upgrade blindly.
2. **Phase 2 browser acceptance:** in a real browser, verify assembly alternatives, quantity override, unit-rate override, derived cost, assembly-backed upgrade Apply, Reset, Create Candidate, refresh persistence, saved lineage, and invalid-workspace warnings. Record defects rather than assuming compile/tests imply UI correctness.
3. **Final Phase 2 checkpoint:** after browser acceptance and dependency classification, update the repository record with the exit SHA.
4. **Genesis Null House + Fast Smoke batch:**
   - render a semi-transparent Null House envelope as a boundary/volume reference only;
   - surface structural result `N/A / no physical specimen`;
   - add Fast Smoke/streamlines as visualization only and label it explicitly non-CFD;
   - wire scene controls to versioned Genesis wind inputs without hidden engineering defaults.
5. **One-panel analytical action batch:** render one physical panel and feed it only the tested analytical result `q = 0.5ρV²`, `F = qAC` with caller-supplied/provenanced inputs.
6. **Connection mechanics batch:** show demand/capacity state. Null capacity stays unverified. Only after dependency audit may Rapier be introduced for released/debris rigid-body motion.
7. **Genesis acceptance:** demonstrate `Null House → smoke → panel → calculated action → connection demand/capacity → release (when supported) → debris`, with synchronized event/provenance records.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
