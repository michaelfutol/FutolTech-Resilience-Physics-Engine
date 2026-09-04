# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active takeover branch:** `lum-rpe-takeover`  
**Takeover date:** 2026-09-04  
**Takeover base:** `694fadb53ab6bb22a73854242dea71e2df1cee7a` — Phase 2A schemas, curated JSON libraries, and validation module.

## Current truth

**Installed stack:** React / Next.js 16, Three.js / React Three Fiber v9, Drei, Tailwind CSS, TypeScript.  
**Planned visual-physics candidate:** Rapier.js — not yet installed/integrated.  
**Future engineering/physics integrations:** Project Chrono, OpenSees/OpenSeesPy, OpenFOAM, CalculiX, Blender/Bonsai, IfcOpenShell, BlueQubit.

The application is currently an **engineering UI shell with scripted event playback**, rule-based recommendation placeholders, a static conceptual 3D structure, and an emerging deterministic data/costing core. It is **not yet a force-based, deformation-based, CFD, or nonlinear structural physics engine**.

## Finite roadmap lock — 2026-09-04

- `ROADMAP.md` now defines a finite 12-phase path through **RPE v1.0 Release and Freeze**.
- RPE v1.0 has explicit completion gates so the build cannot remain an endless prototype.
- The roadmap is mirrored in Google Drive under folder `FutolTech Resilience Physics Engine (RPE)` as document `RPE v1.0 Finite Build Roadmap`.
- GitHub remains the code and implementation source of truth. Google Drive is the durable planning/document mirror.
- Features not required for v1.0—such as city-scale CFD, complete general-purpose FEA replacement, full fracture mechanics, quantum optimization, and every code/material/hazard combination—are explicitly deferred to v1.x/v2.0+.

## Takeover progress — 2026-09-04

- Created `lum-rpe-takeover` from Phase 2A checkpoint `694fadb`.
- Hardened runtime catalog validation:
  - order-independent reference checks,
  - parent-specimen validation,
  - product/component unit compatibility,
  - specimen-slot/assembly-category compatibility,
  - ISO date validation,
  - negative engineering/cost/allowance guards.
- Added GitHub Actions CI using `npm ci`, lint, strict TypeScript, and production build.
- Detected and repaired the stale npm lockfile instead of bypassing CI.
- Moved CI to Node 22 to satisfy current dependency engine requirements.
- Fixed Phase 2A baseline lookup regression: the app previously searched only for legacy specimen ID `A0` while the curated dataset uses `specimen-a0-dignity-3x3`.
- Wired Product, Assembly, CostRate, and catalog validation loaders into `demo-data.ts` while preserving legacy Phase 1 loaders until UI migration is complete.
- Added traceable Phase 2B costing result types.
- Implemented pure `calculateAssemblyCost` and `calculateSpecimenCost` functions.
- Costing keeps material, waste, labor, equipment, and installation distinct. Explicit user rate overrides are applied at calculation time and do not mutate library rates.
- Automated costing tests and UI wiring are still pending.

## Verified implementation state

| Area | State |
|---|---|
| Phase 0 repo foundation | Complete |
| Phase 1 visual MVP shell | Complete |
| Phase 1.5 UI refinement | Complete |
| Finite RPE v1.0 roadmap | Locked and mirrored to Drive |
| Product / Assembly / CostRate schemas | Implemented in Phase 2A |
| Curated products / assemblies / rates / A0 specimen data | Implemented; values remain provisional/unverified where marked |
| Runtime catalog validation | Implemented and hardened |
| GitHub Actions CI | Added; dependency reproducibility repair recorded |
| Bottom-up costing core | Pure functions implemented; tests/UI integration pending |
| Draft A0 → A1 candidate derivation | Not yet implemented |
| Editable material/assembly UI | Not yet implemented |
| Real wind force calculation | Not yet implemented |
| Smoke / streamline wind visualization | Not yet implemented |
| Breakable connections / flying debris | Not yet implemented |
| Structural deformation solver | Not yet implemented |
| BIM/IFC import | Not yet implemented |
| Rain / coastal water physics | Not yet implemented |
| External solver coupling | Not yet implemented |

## Engineering doctrine

RPE development follows:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code-based calculations, conventional engineering solvers, RPE visualization/physics, and future physical tests are separate evidence layers. A visual simulation must never be presented as independent proof of structural capacity.

## Locked RPE v1.0 phase structure

0. Repository foundation — complete.
1. Visual MVP / engineering cockpit — complete.
2. Data spine, costing, and immutable prototypes — active.
3. Genesis Test Chamber / first real mechanics.
4. Small-house wind system.
5. Dignity housing family: Studio, 1BR, 2BR, 3BR.
6. BIM / IFC import pipeline.
7. Structural solver coupling: OpenSees/OpenSeesPy, selected CalculiX.
8. Wind CFD coupling: OpenFOAM.
9. Multi-hazard layers: driven rain, debris, flood/coastal water.
10. Engineering benchmark library.
11. Physical validation and calibration.
12. RPE v1.0 release and feature freeze.

## Permanent benchmark targets

- `RPE-WIN-001` — Window Assembly Extreme Wind Test.
- `RPE-RC-001` — RC Column–Footing Lateral Pull.
- `RPE-MAS-001` — 4 m × 4 m CHB Wall Strengthening Comparison.
- `RPE-RC-002` — 2-Storey RC Earthquake Response.

## Immediate roadmap

1. Add automated catalog and costing tests and make them part of CI.
2. Run the curated A0 specimen through the deterministic cost engine and verify itemized totals.
3. Implement immutable draft-candidate workflow: A0 baseline → draft changes → explicit Create Candidate → A1.
4. Retire legacy `Material` / `CostItem` UI paths after the new Product/Assembly model is wired through.
5. Only after Phase 2 passes its exit gate, build **Genesis Test Chamber**:
   - transparent Null House envelope,
   - smoke/streamline wind visualization,
   - add one physical panel,
   - calculate wind action from stated assumptions,
   - breakable connection,
   - detached panel becomes a free body / debris object.
6. Expand only after the one-panel mechanics are stable and testable.

## Historical checkpoint

Kira Report #10 (2026-07-14) remains part of repository history as the Phase 1.5 UI/audit checkpoint. The later Phase 2A commit `694fadb` superseded its stale statement that Phase 2 was blocked pending repository synchronization.
