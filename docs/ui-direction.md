# UI Direction

**Goal**: Transition the functional MVP to a refined "engineering cockpit + disaster test lab + cost decision board".

## Target Aesthetic
- **Backgrounds**: Dark slate / deep navy. Needs to look like a serious, technical engineering workstation, not generic SaaS or a video game.
- **Panels**: Off-white or muted light grey for readability in dense text areas (like right-panel settings and cost sheets).
- **Accents (Forces)**: Muted, clear blue for wind, rain, and debris forces.
- **Accents (Failure)**: Warning orange and stark red to highlight structural distress, racking, and connection failure.
- **Typography**: Clean, sans-serif, practical, readable at small sizes (lots of tabular data).

## Core Layout Areas
1. **Left Panel (Model Tree)**: Breakdown of the structural hierarchy.
2. **Center (Viewport)**: High-performance 3D area, central focus of the app.
3. **Right Panel (Command & Control)**: Run settings, dynamic results, upgrade toggles, and total cost logic.
4. **Bottom Panel (Timeline)**: A granular slider/timeline tracking seconds of structural integrity before and during collapse.

---
**Implementation Note (Phase 1.5):** The UI tokens (`src/lib/ui/tokens.ts`) and layout structure described above have been implemented in the React components. However, advanced visualization features like dynamic stress heatmaps, accurate physics deformations, and fully interactive material catalogs remain future design targets.
