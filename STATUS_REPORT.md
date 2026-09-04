# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** finite RPE v1.0 plan locked on 2026-09-04.

## Current truth

**Installed stack:** React / Next.js 16, Three.js / React Three Fiber v9, Drei, Tailwind CSS, TypeScript.  
**Planned real-time mechanics candidate:** Rapier.js — not yet installed/integrated.  
**Future engineering/visual bridges:** OpenSees/OpenSeesPy, OpenFOAM, CalculiX, IfcOpenShell, Blender/Bonsai. Unreal Engine is a future immersive visualization/digital-twin bridge, not an engineering-truth source and is not yet implemented.

The application remains a **scripted visual simulation shell plus a now-substantial deterministic Phase 2 data/cost/prototype core**. It is not yet a force-based, CFD, nonlinear structural, or validated physical simulation engine.

## Phase 2 implementation state

### Data spine
- Product, Assembly, CostRate, Specimen and verification/provenance structures are active.
- Runtime catalog validation is active and covered by automated tests.
- Unknown engineering properties remain explicit `null`/unverified values; no defaults are invented.
- Wall backing and outer cladding are separate costed specimen layers.

### Deterministic costing
- Pure assembly and specimen costing functions are implemented.
- Material quantity, waste, labor, equipment, and installation remain separately traceable.
- Currency and engineering-quantity rounding policy prevents floating-point residue from leaking into displayed/reconciled totals.
- Local unit-rate overrides do not mutate the library.
- Quantity/takeoff overrides are implemented in the costing core and remain separate from structural specimen ancestry.
- Invalid/missing rates, incompatible currency, invalid/duplicate quantities, and quantity overrides for unselected assemblies fail loudly.
- Curated A0 total is checked by automated tests and itemized reconciliation.

### Immutable prototype workflow
- A0 remains immutable.
- Temporary draft state, assembly substitution diff, Reset, and explicit Create Candidate workflow are implemented.
- Derived candidate records preserve `parentSpecimenId`, applied upgrades and changed selections.
- Automated tests verify A0 is not silently mutated.
- Procurement price/quantity context is explicitly distinct from structural candidate identity.

### UI migration
- Product/Assembly-driven selectors now replace the primary legacy material/cost display.
- Compatible assembly alternatives, traceable baseline-vs-draft cost delta, local unit-rate override, and `[Unverified]` labels are visible.
- Quantity override backend exists but the visible quantity-edit control is still pending.
- Legacy Phase 1 UpgradeOption/UpgradeRule and related Material/CostItem paths remain temporarily for scripted-demo continuity and must still be migrated/retired.

## CI state

The previous head failed strict TypeScript because `page.tsx` referenced the old `clearCostRateOverrides` hook name after price and quantity overrides were unified into cost context. That mismatch was repaired without discarding the new backend.

Verified checkpoint `45013897736cbab0164f20974f39a826e5f706ee` passed:
- dependency install;
- lint;
- strict TypeScript;
- automated catalog/costing/immutability tests;
- production build.

Subsequent documentation-only synchronization commits should not change application behavior; final branch CI must still be checked after the documentation checkpoint.

## Phase status

| Area | State |
|---|---|
| Phase 0 repo foundation | Complete |
| Phase 1 visual MVP shell | Complete |
| Phase 1.5 UI refinement | Complete |
| Finite RPE v1.0 roadmap | Locked and mirrored to Drive |
| Phase 2A data spine/integrity | Substantially complete; upgrade-reference migration remains |
| Phase 2B deterministic costing | Core complete and tested |
| Phase 2C immutable prototype derivation | Core complete and tested |
| Phase 2D catalog/cost UI | Active; quantity UI + legacy upgrade migration remain |
| Phase 2E verification | Active; core CI green, UI regression/final checkpoint remain |
| Phase 3 Genesis Test Chamber | Not started; correctly gated behind Phase 2 |
| BIM/IFC import | Not started |
| Structural solver coupling | Not started |
| OpenFOAM CFD coupling | Not started |
| Physical validation | Future evidence/calibration track |

## Engineering doctrine

RPE development follows:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculations, conventional engineering solvers, RPE visualization/physics, Blender/Unreal presentation layers, and future physical tests are separate evidence layers. None may silently stand in for another.

## Immediate gated work

1. Expose tested quantity/takeoff overrides in the Phase 2 UI with clear library-vs-effective quantity provenance.
2. Migrate legacy fixed upgrade options/rules into the Phase 2 assembly/candidate model and validate upgrade references.
3. Add UI-level regression coverage for assembly selection, rate override, quantity override, Reset, and Create Candidate.
4. Retire legacy Material/CostItem/Upgrade placeholder paths after equivalent Phase 2 behavior exists.
5. Run the full CI gate and record the Phase 2 exit checkpoint.
6. Only then begin Phase 3 Genesis Test Chamber: Null House → smoke visualization → one physical panel → calculated wind action → breakable connection → detached rigid-body debris.

## Permanent benchmark targets

- `RPE-WIN-001` — Window Assembly Extreme Wind Test.
- `RPE-RC-001` — RC Column–Footing Lateral Pull.
- `RPE-MAS-001` — 4 m × 4 m CHB Wall Strengthening Comparison.
- `RPE-RC-002` — 2-Storey RC Earthquake Response.
