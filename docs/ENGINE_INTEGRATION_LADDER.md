# RPE Engine Integration Ladder

**Status:** Canonical architecture companion to `ROADMAP.md`  
**Branch:** `lum-rpe-takeover`  
**Doctrine:** RPE is the engineering orchestrator and evidence ledger. External engines remain distinct evidence-producing layers; visualization never becomes independent proof of capacity.

## Integration ladder

| Order | Engine / bridge | Primary RPE role | Roadmap phase | v1.0 status |
| --- | --- | --- | --- | --- |
| 1 | React Three Fiber / Three.js | Browser geometry, controls, result visualization, fast smoke/streamlines | Foundation / Phase 3+ | ACTIVE / REQUIRED |
| 2 | Rapier.js (`@react-three/rapier`) | Real-time rigid-body release, debris, contact and collision | Phase 3 | ACTIVE / REQUIRED |
| 3 | IFC + IfcOpenShell | Durable BIM exchange, semantic parsing, object identity and property mapping | Phase 6 | REQUIRED |
| 4 | Blender + Bonsai | Optional open-BIM authoring/inspection; later offline visualization/render bridge | Phase 6+ | BIM route REQUIRED AS SUPPORTED OPTION; photoreal rendering OPTIONAL |
| 5 | OpenSees / OpenSeesPy | Structural frame response, nonlinear/cyclic analysis, seismic time history and research workflows | Phase 7 | REQUIRED |
| 6 | CalculiX | Selected detailed finite-element checks where frame idealization is insufficient | Phase 7 | SUPPORTED TARGET / use where justified |
| 7 | OpenFOAM | CFD pressure/velocity fields, roof-edge/corner suction, wake, openings and later internal-pressure interaction | Phase 8 | REQUIRED |
| 8 | Project Chrono | Advanced multibody/contact/constraint mechanics beyond the lightweight Rapier path | Later advanced layer | OPTIONAL / v1.x-v2 |
| 9 | Unreal Engine | Immersive real-time digital-twin / presentation layer consuming RPE result packages | Future visualization bridge | OPTIONAL / not engineering source of truth |
| 10 | BlueQubit | Multi-constraint optimization only after classical data, constraints and objective functions are trustworthy | v2+ | DEFERRED |

## Canonical orchestration architecture

```text
BIM / IFC source
      |
      v
RPE canonical specimen + provenance
      |
      +--> manual / code calculation evidence
      |
      +--> OpenSees / CalculiX structural solver adapters
      |
      +--> OpenFOAM CFD adapter
      |
      +--> Rapier real-time released-body / debris path
      |
      v
Normalized RPE result package + hashes + limitations
      |
      +--> Three.js / React Three Fiber browser review
      +--> Blender offline visualization/render bridge
      +--> Unreal immersive visualization bridge (future)
```

RPE must preserve the identity of the original specimen and every solver idealization. A solver result is never allowed to silently overwrite the source BIM/RPE object definition.

## Evidence boundaries

### Three.js / React Three Fiber
A visualization and interaction layer. It may display calculated or solver-derived results but does not independently validate structural capacity.

### Rapier
Produces `rpe_simulation` rigid-body/contact evidence. Rapier collision or motion is not automatically structural-analysis, CFD, code-compliance, or physical-test evidence.

### IFC / IfcOpenShell
Provides geometry and semantics where actually present in the source BIM. Missing stiffness, strength, density, reinforcement, connection properties, restraints, or provenance remain missing until explicitly supplied and validated.

### OpenSees / OpenSeesPy
Primary structural solver target. RPE must record solver version, node/element idealization, boundary conditions, material/section models, damping, convergence settings, inputs and result hashes.

### CalculiX
Used only for selected problems that justify a more detailed FE idealization. Its mesh/material/contact assumptions must remain visible and separate from the canonical RPE object model.

### OpenFOAM
Primary CFD target. RPE must keep `Fast Smoke Mode` distinct from `CFD Smoke Mode`. OpenFOAM-derived pressure and velocity fields must retain mesh, turbulence/model assumptions, boundary conditions and run provenance.

### Blender / Bonsai
May author/inspect IFC and later render synchronized RPE/solver results. Blender physics or visuals do not become the structural or CFD solver of record unless a future benchmark explicitly defines and validates such a use.

### Unreal Engine
Optional immersive consumer of RPE scene/result packages. It is never the canonical engineering database or default solver of record.

### Project Chrono
Potential later advanced rigid/multibody layer. It should be added only when a benchmark demonstrates a need that Rapier cannot satisfy adequately.

### BlueQubit
Optimization comes after trustworthy classical models. It must never optimize unknown or fabricated engineering properties merely because an optimization engine is available.

## v1.0 mandatory engine gates

RPE v1.0 may not be declared complete until all of the following are demonstrated:

1. A supported IFC/BIM import can become a validated RPE specimen without silent property invention.
2. At least one structural benchmark is exported to and solved by a structural solver, then re-imported and synchronized in RPE with traceable metadata.
3. At least one simple-building wind case receives an OpenFOAM-derived pressure/velocity field mapped back to stable RPE surface identities and compared with the simplified analytical model.
4. Rapier remains the tested real-time released-component/debris path for the browser test chamber.
5. Solver/CFD/Rapier/manual/browser/physical-test evidence remain distinguishable in result records and reports.

## Current position

Current active build remains **Phase 4 — Small House Wind System**. The present support/ring/wall/roof/connection semantic gates are intentional prerequisites for later solver translation:

- stable IDs;
- explicit geometry/orientation;
- explicit local axes;
- explicit restraints;
- explicit physical joint locations rather than inferred intersections;
- explicit provenance/verification;
- unknown properties kept unknown.

This prevents the future OpenSees/CalculiX/OpenFOAM adapters from receiving visually plausible but structurally ambiguous input.

## Permanent rule

> Add an engine because a benchmark requires a capability—not because the engine is impressive.

The engine must plug into the RPE specimen/result/evidence contracts. RPE must not be redesigned around whichever external solver was integrated most recently.
