# RPE Engine Bridge Architecture

Status: architectural contract / planned integration

## Principle

RPE is the authoritative engineering orchestration layer. External visualization, physics, CFD, structural-analysis, and rendering engines may consume or return data, but they must not silently become the source of engineering truth.

The core rule is:

**One specimen identity → many engine views/results → one traceable RPE record.**

## Engine roles

### Browser / Three.js / React Three Fiber
- Always-available interactive RPE viewport.
- Fast inspection, controls, smoke/streamline visualization, pressure/load arrows, result overlays, and A/B comparison.
- Must remain usable even if no desktop bridge is available.

### Rapier.js
- Preferred first real-time rigid-body layer for Phase 3.
- Detached panels, debris, collisions, rotation, translation, and simple breakable restraints.
- Not the solver of record for nonlinear RC/frame engineering behavior.

### Project Chrono
- Future advanced multibody/contact option.
- Reserved for problems that exceed the practical rigid-body scope of the browser engine.

### OpenSees / OpenSeesPy
- Primary open-source structural-response bridge.
- Frame response, cyclic/nonlinear behavior, seismic time history, hinge/yield states, residual drift, and research workflows.

### CalculiX
- Detailed finite-element bridge for selected component/continuum problems where appropriate.

### OpenFOAM
- Primary CFD bridge.
- Wind velocity/pressure fields, suction zones, edge/corner effects, wakes, vortices, and flow through openings.

### Blender / Bonsai
- Optional open-BIM and high-quality visualization bridge.
- IFC inspection/authoring support through Bonsai/IfcOpenShell workflows.
- Geometry cleanup, procedural asset work, camera animation, explanatory simulations, and presentation-quality rendering.
- Blender physics may support visual experimentation, but engineering capacity claims must remain tied to declared RPE/manual/solver evidence.

### Unreal Engine
- Optional high-fidelity real-time visualization/digital-twin bridge.
- Interactive typhoon, rain, flood, debris, walkthrough, VR/immersive, and client/public educational experiences.
- Unreal is a consumer of RPE specimen and result state, not the structural/CFD solver of record.

## Shared exchange concept

All bridges should converge on a versioned RPE exchange package instead of implementing private one-off translations.

Preferred durable ingredients:
- IFC for BIM identity/semantics where available;
- GLB/glTF for portable display geometry;
- JSON manifest for RPE IDs, transforms, material references, assembly references, result channels, units, provenance, and hashes;
- solver-native or open result files as attachments where needed (for example VTK/CSV/text databases), referenced by the manifest rather than copied into visual meshes.

## Minimum bridge manifest requirements

Every exchange package must identify:
- schema version;
- specimen ID and revision/candidate ancestry;
- coordinate system, units, up axis, and handedness;
- RPE object ID for every exported object;
- source BIM GUID when available;
- material/assembly IDs rather than only display colors;
- geometry asset reference and hash;
- result dataset reference and hash when present;
- originating engine and version;
- export/import timestamp;
- verification/provenance state;
- limitations/warnings.

## Mutation rule

External-engine changes must never silently rewrite A0.

If Blender, Unreal, BIM, or another engine changes geometry/material/assembly identity and that change is brought back into RPE, it must become one of:
- an explicit temporary draft;
- a new imported specimen;
- a derived candidate such as A1/A2;
- a visualization-only override clearly excluded from engineering state.

## Visualization-result rule

A visualization engine may interpolate or render an existing result field, but it may not manufacture an engineering result without labeling the result as visual/approximate.

Examples:
- Blender rendering an OpenFOAM pressure field: allowed and traceable.
- Unreal animating OpenSees storey drift: allowed and traceable.
- Blender cloth/rigid-body animation being presented as proof that a window survives 340 kph: not allowed.

## v1.0 scope boundary

RPE v1.0 does not require full live bidirectional Blender or Unreal integration.

For v1.0:
- the browser viewport remains mandatory;
- IFC/Open BIM import is mandatory for the supported subset;
- the exchange contract must remain compatible with future Blender/Unreal bridges;
- Blender/Bonsai may be used as an authoring/inspection/render route;
- Unreal integration is an optional v1.x enhancement unless required by a benchmark or deployment use case.

This keeps the build finite while preventing future engine integrations from forcing a redesign of specimen identity, provenance, and result mapping.
