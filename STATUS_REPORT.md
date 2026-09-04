# Status Report

**Repository:** `michaelfutol/FutolTech-Resilience-Physics-Engine`  
**Active branch:** `lum-rpe-takeover`  
**Roadmap:** locked in `ROADMAP.md`

## Current truth

RPE remains a Phase 2 prototype/costing workspace on top of a scripted visual shell, with Phase 3 Genesis now containing a separate analytical mechanics foundation plus a Null House/Fast Smoke scene path. Scripted Typhoon playback remains conceptual and is not promoted to calculated physics.

### Phase 2
- Data spine, deterministic costing, immutable A0→draft→candidate derivation, catalog/upgrade UI migration, persistence, and automated verification are implemented.
- Manual browser visual acceptance is still required before recording the final Phase 2 exit checkpoint.

### Dependency gate
- The direct application dependency `next@16.2.10` is within multiple July 2026 advisory ranges fixed in 16.2.11.
- The repository must upgrade Next.js and matching `eslint-config-next`, regenerate the lockfile, run a fresh package audit, and pass full CI before Rapier is introduced.
- No forced dependency rewrite or manual lockfile-integrity edit is allowed.
- See `docs/DEPENDENCY_ADVISORY_CLASSIFICATION.md`.

### Phase 3 Genesis
- Versioned Genesis wind/panel/connection/result types remain the evidence contract.
- Pure analytical wind helpers remain separate from visualization.
- The viewport now has an explicit **Genesis Null House** mode: a semi-transparent empty envelope only, with structural result `N/A / no_physical_specimen`.
- Fast Smoke uses browser-drawn streamlines and is labeled **NON-CFD**.
- Wind speed and direction have no hidden defaults; the smoke view remains disabled until the user supplies both values.
- Smoke speed is currently visualization metadata only; it does not create pressure, force, capacity, PASS/FAIL, CFD, or solver evidence.
- Rapier remains gated.

## Engineering doctrine

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code calculation, engineering solvers, RPE analytical calculations, RPE simulation, visualization, and future physical tests remain separate evidence layers.

## Exact next gated task

Patch Next.js to a compatible fixed release (minimum identified fix: 16.2.11), regenerate the lockfile in a network-enabled environment, run fresh package audit + full CI, and complete Phase 2 browser acceptance. Only after that gate may Rapier be added. In parallel with no new dependency, the next Genesis code batch is one physical panel wired to the existing tested analytical `q = 0.5ρV²` and `F = qAC` path using caller-supplied/provenanced inputs.
