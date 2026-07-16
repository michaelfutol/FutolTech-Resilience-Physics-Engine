# Tasks

## Phase 0: Repo Foundation
- [x] Initial repository setup and folder structure.
- [x] Create project documentation (README, ROADMAP, MVP scope, etc.).
- [x] Set up sample JSON data files (`materials`, `specimens`, `hazards`).
- [x] Add missing sample JSON data files (`failure-events`, `cost-items`).
- [x] Establish agent instructions and reporting formats (Kira Takeover).

## Phase 1: Visual MVP Shell
- [x] Initialize React / Next.js project in root.
- [x] Build the layout shell (Top bar, Left model tree panel, Center 3D viewport, Right settings panel, Bottom timeline).
- [x] Setup Three.js / React Three Fiber placeholder in the viewport.
- [x] Load `Demo 01` sample from JSON into the application state dynamically.
- [x] Implement a scripted 'Run' sequence for Typhoon Index 300 event timeline.
- [x] Add editable upgrade options and cost impact placeholders.
- [x] Add placeholder export buttons (video, screenshots, report, cost table).
- [x] Add simulation run modes UI placeholder.
- [x] Document Prototype Rebuilder roadmap and add simple rule-based recommendation.

## Phase 1.5: UI Refinement (Test Bench)
- [x] Document target UI aesthetic (engineering cockpit).
- [x] Document detailed Test Bench layout components.
- [x] Create design reference notes and Stitch prompts.
- [x] Implement new CSS and layout structure.
- [x] Update components to match new aesthetic.

## Phase 2: Material and Cost Library
- [ ] Separate materials into Material/Product Library and Assembly Library (frame, wall, roof, floor, opening protection, vent, connection).
- [ ] Implement Specimen Configuration assigning assemblies to A0/A1/A2.
- [ ] Make materials editable via controlled dropdown selection from approved alternatives.
- [ ] Implement separate quantity/unit-cost overrides for local prices.
- [ ] Connect costing: use quantity × unit rate plus labor, installation, and waste allowance. (Fixed upgrade modifiers are temporary UI placeholders only).
- [ ] Upgrade logic: Selecting an upgrade must automatically add or replace all affected manifest and cost items.
- [ ] Prototyping logic: Applying upgrades must produce a derived A1 candidate with ancestry, not mutate A0.
- [ ] Curate a small material/assembly test set relevant to Dignity Native Homes 3x3m specimen.
- [ ] Tag unknown/unvalidated engineering properties as placeholder/unverified (no inventing values).

## Phase 3: Failure Event Logic
- [ ] Code basic rules for likely failure points.

## Phase 4: Upload Support
- [ ] Support GLB/GLTF imports.

## Phase 5: Future Integrations (Do Not Build Yet)
- [ ] Documented intent for Project Chrono, OpenSees, OpenFOAM, CalculiX, Blender.
