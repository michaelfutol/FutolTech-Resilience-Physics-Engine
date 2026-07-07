# FutolTech Resilience Physics Engine

## Overview
FutolTech Resilience Physics Engine is a visual simulation and costing workspace for low-cost Filipino housing systems.

## Purpose
The engine is intended to be a discovery and visualization tool where users can build or upload simple 3D structures, assign real materials and connections, test them against simulated environmental hazards (like typhoon, rain, debris, flood, heat, and seismic events), and visualize likely failure points and costed upgrade paths.

## What It Is Not
**Disclaimer**: This project is conceptual only and is not a replacement for licensed engineering design, National Structural Code of the Philippines (NSCP) checks, STAAD/ETABS analysis, or physical testing. It should not be used for final structural design or safety certification.

## First MVP Target
The initial minimum viable product focuses on establishing the workflow:
1. Create or load the test model
2. Assign materials and connections
3. Choose a hazard category
4. Run a visual failure sequence
5. Display an event timeline
6. Identify likely weak points
7. Suggest the next improvement step
8. Show a rough cost impact placeholder
9. Export a report/video

## First Demo Structure
**Demo 01 — 3m x 3m Sawali Test House**
- 3m x 3m test module
- 1x1 inch / 25x25x1.5mm tubular frame
- Hardiflex backing wall
- Sawali or bamboo outer cladding
- Simple light roof
- Slab-on-grade or raised RC base option
- Screw/bolt/strap placeholders

*Note*: The baseline is not expected to pass extreme typhoon loading. Its purpose is to reveal likely first failure points.

## Planned Features
- Visual model builder and importer
- Editable material and connection library
- Hazard scenario testing
- Failure map visualization
- Costed upgrade paths
- Export options for videos, screenshots, and summary reports

## Suggested Future Tech Stack
- Frontend: React or Vue.js
- 3D Viewer: Three.js or Babylon.js
- Physics/Simulation Backend: Future integration with open-source solvers
- Data/State Management: Redux or similar, standard JSON structures
