# RPE Test Bench Layout

## 1. Top Bar
- **Branding**: FutolTech RPE (Resilience Physics Engine).
- **Status**: Active specimen ID and name.
- **Hazards**: Current active hazard (e.g. Typhoon Index 300).
- **Controls**: Primary simulation controls (Run, Stop, Replay).
- **Actions**: Export functions (disabled until simulation completes).

## 2. Left Panel (Model Hierarchy)
A hierarchical, collapsible tree view of the active structure.
- **Site / Orientation**
- **Foundation / Base**: Columns, footings, anchors.
- **Frame**: Posts, beams, bracing.
- **Wall System**: Cladding, backing, fasteners.
- **Roof**: Trusses, purlins, roofing sheets, tie-downs.
- **Connections**: Specific joints and fastener groups.
- **Materials**: Summary of materials used.
- **Mass / Cost**: Baseline placeholders for weight and pricing.

## 3. Center Viewport (Test Chamber)
The 3D WebGL (Three.js/React Three Fiber) rendering area.
- **Model**: Interactive 3D representation of the active specimen.
- **Environment Visuals**: Arrows or particles representing wind direction, rain severity, and debris impacts.
- **Status Markers**: Dynamic labels floating over specific failure zones (e.g. "Uplift Warning", "Racking Failure").
- **UX**: Mouse orbit controls, zoom, pan.

## 4. Right Panel (Command & Control)
Context-sensitive panel that changes state based on simulation progress.

**Pre-Simulation (Setup)**:
- Run Settings (Mode: Fixed, Breaking Point, etc.).
- Hazard parameters (Wind Speed, Rain intensity, Debris type).
- Base material cost breakdown.

**Post-Simulation (Results)**:
- Baseline result (e.g. Failed, Passed).
- First identified critical failure point.
- List of weak points.
- Upgrade toggles (add bracing, change screws) with associated cost tags.
- Dynamic Total Added Cost calculator.
- Next Specimen Recommendation (Prototype Rebuilder output).
- Export & Report buttons.

## 5. Bottom Timeline (Event Log)
A horizontal scrubber/timeline tracking the chronological progression of the simulation.
- **Elapsed Time**: A running clock (e.g., 00:00 to 01:30).
- **Sequence**: Chronological blocks representing completed events, the currently active event, and future predicted events.
- **Failure Markers**: Distinct visual highlights (red/orange) on the timeline where thresholds are breached.

---
**Implementation Note (Phase 1.5):** The basic scaffolding and token-based styling for all 5 areas have been implemented. The timeline plays back static events, the left panel displays a static tree, the right panel controls settings, and the 3D viewport shows a static house with failure markers. Interactive dynamic dragging, physics interactions, and real-time stress values are future targets.
