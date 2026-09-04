# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth; Google Drive is the durable planning mirror.

## Immediate execution order

1. **Phase 2 browser acceptance:** manually verify the visible workflow in a real browser: assembly alternatives, quantity override, unit-rate override, derived cost, assembly-backed upgrade Apply, Reset, Create Candidate, page refresh, persisted lineage, and validation warnings. Record defects rather than assuming UI correctness from compile/tests alone.
2. **Dependency audit gate:** investigate the current npm advisory report (1 moderate + 7 high). Identify direct versus transitive dependencies and whether each advisory is reachable/relevant. Do not use `npm audit fix --force` blindly.
3. **Final Phase 2 checkpoint:** after browser acceptance and dependency classification, run/confirm full CI and update STATUS/TASKS/WORKLOG with the final exit SHA.
4. **Begin Phase 3 Genesis Test Chamber** with pure data/mechanics foundations before installing a heavy solver:
   - define versioned Genesis scene, wind-input, panel, connection, and event-result types;
   - add tested kph↔m/s conversion and simplified dynamic-pressure calculation `q = 0.5 ρV²` with explicit units;
   - make coefficients/areas separate explicit inputs rather than hiding them in animation;
   - create semi-transparent Null House envelope and label its structural result `N/A`;
   - add Fast Smoke/streamline visualization as a visual aid, explicitly distinct from CFD;
   - add one panel that receives calculated analytical wind action;
   - add explicit connection demand/capacity state, with unknown real capacities kept null/unverified;
   - after dependency audit, add Rapier for detached-panel rigid-body/debris motion.
5. **Genesis acceptance:** demonstrate the exact sequence `Null House → smoke → panel → calculated force → connection threshold → release → debris`, with a synchronized event/provenance log and A/B replay path.
6. Only after Genesis is reproducible should work expand toward complete house mechanics, BIM/IFC, OpenSees, OpenFOAM, multi-hazard, Blender/Bonsai, or Unreal bridge execution.

## Engine-bridge boundary

The bridge contract is documented in `docs/ENGINE_BRIDGES.md` and typed in `src/types/engineBridge.ts`.

- Three.js/R3F remains the mandatory lightweight browser viewer.
- Blender/Bonsai is an optional BIM/authoring/render route.
- Unreal Engine is an optional immersive real-time/digital-twin presentation route.
- OpenSees/CalculiX/OpenFOAM/Rapier/Chrono have separate solver/mechanics roles.
- No visualization engine may silently manufacture engineering truth or rewrite A0.
