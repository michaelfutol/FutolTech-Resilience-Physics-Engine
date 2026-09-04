# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

## Current checkpoint

Genesis now includes the tested analytical foundation plus a viewport **Null House / Fast Smoke** path. The Null House is an empty envelope only and reports `N/A / no physical specimen`. Fast Smoke is browser visualization only and is explicitly non-CFD.

## Immediate execution order

1. **Dependency remediation gate:** `next@16.2.10` is in currently documented vulnerable ranges. Upgrade `next` and matching `eslint-config-next` to a compatible patched release (minimum identified fix 16.2.11), regenerate `package-lock.json`, run a fresh `npm audit`, classify remaining advisories, and run the full CI gate. Do not force-upgrade blindly.
2. **Phase 2 browser acceptance:** in a real browser, verify assembly alternatives, quantity override, unit-rate override, derived cost, assembly-backed upgrade Apply, Reset, Create Candidate, refresh persistence, saved lineage, invalid-workspace warnings, and the new Genesis mode switch.
3. **Final Phase 2 checkpoint:** after browser acceptance and dependency remediation, record the exit SHA.
4. **One-panel analytical action batch:** render one physical panel and feed it only the tested analytical result `q = 0.5ρV²`, `F = qAC` with caller-supplied/provenanced density, area, and coefficient. Do not infer any material property or capacity.
5. **Connection mechanics batch:** show demand/capacity state. Null capacity stays unverified. Only after the dependency gate is green may Rapier be introduced for released/debris rigid-body motion.
6. **Genesis acceptance:** demonstrate `Null House → Fast Smoke → panel → calculated action → connection demand/capacity → release (when supported) → debris`, with synchronized provenance/event records.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
