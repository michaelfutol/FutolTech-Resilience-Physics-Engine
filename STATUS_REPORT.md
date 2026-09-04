# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Finite roadmap:** locked in `ROADMAP.md` and mirrored to Google Drive.  
**Latest verified code checkpoint:** `efcf319faaf0d4ab9832bbeb45be4cba9b6d1e75` — full CI green.

## Current truth

RPE is now a **functional Phase 2 prototype/costing workspace built on a scripted visual simulation shell**.

It is **not yet a real force-based physics engine**. The current timed Typhoon playback remains conceptual/scripted; wind forces, structural deformation, connection failure, rigid-body debris, CFD, nonlinear structural response, and physical-test calibration begin in later gated phases.

### Current installed application stack
- Next.js 16 / React 19 / TypeScript;
- Three.js / React Three Fiber / Drei;
- Tailwind CSS;
- GitHub Actions CI on Node 22.

### Planned engine bridges
- Rapier: first browser rigid-body mechanics layer — not installed yet;
- OpenSees/OpenSeesPy: structural/nonlinear/seismic solver bridge;
- CalculiX: selected detailed finite-element problems;
- OpenFOAM: CFD wind field/pressure bridge;
- IfcOpenShell + Blender/Bonsai: BIM/open-BIM authoring, inspection, geometry and high-quality render bridge;
- Unreal Engine: optional immersive real-time/digital-twin presentation bridge;
- Project Chrono: future advanced contact/multibody mechanics.

Blender and Unreal are presentation/authoring consumers of traceable RPE state and solver results. They are not permitted to silently become engineering-truth sources. See `docs/ENGINE_BRIDGES.md` and `src/types/engineBridge.ts`.

## Phase 2 checkpoint

### Data and catalog integrity
- Product, Assembly, CostRate, Specimen, UpgradeDefinition and verification/provenance structures are active.
- Wall backing and outer cladding are separate assembly slots.
- Missing/unvalidated engineering properties remain explicit `null` / unverified values.
- Catalog validation checks product/assembly/rate/specimen/upgrade references, unit/category compatibility, parent ancestry, dates, non-negative values, allowances, and upgrade readiness mappings.

### Deterministic costing
- Assembly and specimen costing are pure/deterministic functions.
- Material quantities, waste, labor, equipment, and installation are separately traceable.
- Money and engineering quantities use explicit rounding policy so floating-point residue does not leak into reconciled totals.
- Local price overrides and takeoff/quantity overrides are non-destructive cost/procurement context.
- Library quantity remains visible separately from effective quantity.
- Cost context does not alter structural specimen ancestry.
- Curated unverified A0 sample currently reconciles to **₱22,810** from sample rates; this is a test/library result, not procurement truth.

### Prototype derivation
- A0 is immutable.
- Structural edits occur in a temporary draft.
- Ready upgrade definitions modify actual assembly selections; fixed peso modifiers are no longer used in the active upgrade flow.
- `Create Candidate` produces A1/A2 ancestry with `parentSpecimenId`, applied upgrade IDs and changed assembly selections.
- Conflicting upgrade definitions are resolved deterministically rather than leaving contradictory ancestry.
- Derived candidates persist in a versioned browser-local workspace and are revalidated against the current catalog on reload.
- Model Builder shows saved candidate lineage and warns when stale/invalid local records are rejected.

### UI migration
- Product/Assembly selectors drive the active prototype editor.
- Quantity/takeoff and unit-rate overrides are visible with provenance behavior.
- A0-vs-draft/local cost delta is visible.
- `[Unverified]` state is visible.
- Assembly-backed upgrade paths are visible; incomplete upgrades are explicitly blocked as `needs_definition`.
- Active application code no longer depends on legacy `Material`, `CostItem`, fixed `UpgradeOption`, or `UpgradeRule` paths.
- Model Builder reads from the same assembly-selection source of truth as costing/derivation.

### Verification
Automated coverage includes:
- catalog/reference validation;
- deterministic costing and A0 itemized reconciliation;
- local price and quantity overrides;
- A0 immutability / Reset / candidate derivation;
- deterministic assembly-upgrade application;
- browser-workspace serialization/parsing/revalidation helpers;
- end-to-end Phase 2 workflow: A0 → real assembly upgrades → recalculated cost → A1 → persist → reload → revalidate.

Checkpoint `efcf319faaf0d4ab9832bbeb45be4cba9b6d1e75` passed:
- dependency install;
- lint;
- strict TypeScript;
- automated tests;
- production build.

One earlier candidate-persistence implementation failed lint because React detected synchronous state hydration inside an effect. The rule was not suppressed; workspace hydration was changed to asynchronous/cancellable execution and the full gate then passed.

## Known dependency hygiene item

Current `npm ci` output reports **8 dependency advisories: 1 moderate and 7 high**. The exact direct/transitive packages and practical relevance to RPE have not yet been classified. We will not run `npm audit fix --force` blindly. A deliberate dependency-audit pass is required before introducing the first new physics dependency such as Rapier.

## Phase status

| Area | State |
|---|---|
| Phase 0 repo foundation | Complete |
| Phase 1 visual MVP shell | Complete |
| Phase 1.5 UI refinement | Complete |
| Finite RPE v1.0 roadmap | Locked and Drive-mirrored |
| Phase 2A data spine/integrity | Code/data gate complete |
| Phase 2B deterministic costing | Complete and tested |
| Phase 2C immutable prototype derivation | Complete and tested |
| Phase 2D catalog/cost/upgrade UI | Implemented |
| Phase 2E verification | Automated gate green; manual browser visual acceptance still required |
| Phase 3 Genesis Test Chamber | Next gated development phase |
| BIM/IFC import | Not started |
| Structural solver coupling | Not started |
| OpenFOAM CFD coupling | Not started |
| Physical validation | Future evidence/calibration track |

## Engineering doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE physics, Blender/Unreal visualization, and future physical tests are separate evidence layers. None may silently stand in for another.

## Immediate gate to Genesis

1. Perform manual browser visual acceptance of Phase 2 interactions: assembly selection, rate override, quantity override, upgrade Apply, Reset, Create Candidate, refresh persistence, and candidate lineage.
2. Run deliberate dependency-advisory investigation; do not force-upgrade packages blindly.
3. Record the final Phase 2 exit checkpoint.
4. Begin Phase 3 without pretending CFD already exists:
   - versioned Genesis scene/wind types;
   - Null House envelope with result `N/A`;
   - Fast Smoke visualization;
   - transparent simplified analytical wind model with explicit assumptions/units;
   - one panel and explicit connection state;
   - Rapier rigid-body release only after dependency audit;
   - complete event/provenance log.

## Permanent benchmark targets

- `RPE-WIN-001` — Window Assembly Extreme Wind Test.
- `RPE-RC-001` — RC Column–Footing Lateral Pull.
- `RPE-MAS-001` — 4 m × 4 m CHB Wall Strengthening Comparison.
- `RPE-RC-002` — 2-Storey RC Earthquake Response.
