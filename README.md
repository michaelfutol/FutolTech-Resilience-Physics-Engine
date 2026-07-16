# FutolTech Resilience Physics Engine

## Overview
FutolTech Resilience Physics Engine is a visual simulation and costing workspace for low-cost Filipino housing systems.

**What the engine is for:**
It is an early discovery and visualization tool to model simple structures, apply hazard scenarios, show likely failure sequences, and export visual documentation. Users can build or upload simple 3D structures, assign real materials and connections, and test them against various hazard scenarios to see likely failure points and costed upgrade paths.

**What it is not:**
This is not a replacement for licensed engineering design, NSCP checks, STAAD/ETABS, or physical testing.

## First MVP Target
The first working version demonstrates a simple flow:
Create/load a 3m x 3m test house → assign materials and connections → choose hazard category → run visual failure sequence → show event timeline → identify likely weak points → suggest next improvement → show rough cost impact placeholder → export report/video later.

## First Demo Structure
**Demo 01 — 3m x 3m Sawali Test House**
- 3m x 3m test module
- 1x1 inch / 25x25x1.5mm tubular frame
- Hardiflex backing wall
- Sawali or bamboo outer cladding
- Simple light roof
- Slab-on-grade or raised RC base option
- Screw/bolt/strap placeholders

## Planned Features
- Visual simulation of wind, rain, and debris.
- Costed upgrade paths based on failure points.
- Upload support for GLB/GLTF, and later OBJ/IFC/SketchUp.

## Tech Stack
- **Current Stack:** React / Next.js, Three.js / React Three Fiber, Drei, Tailwind CSS, TypeScript. (Current state is UI shell, scripted event playback, rule-based recommendation placeholders, static conceptual 3D structure. It is not yet a real force-based or deformation-based physics engine).
- **Planned Visual Physics Candidates:** Rapier.js or cannon-es (not yet installed).

**DISCLAIMER:** Conceptual simulation only. Final structural design must be verified by licensed engineering review, code-based analysis, and physical testing.

## Simulation Timeline Example
00:00 — Wind loading begins
00:04 — Sawali outer cladding starts vibrating
00:09 — Hardiflex screws show stress at windward wall
00:14 — Roof edge uplift begins
00:19 — Frame racking exceeds limit
00:25 — First connection failure detected
00:31 — Model marked failed
