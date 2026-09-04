# FutolTech Resilience Physics Engine (RPE) — Finite Build Roadmap

**Roadmap version:** 1.0  
**Locked:** 2026-09-04  
**Active development branch:** `lum-rpe-takeover`

## Mission

Build a traceable engineering simulation environment where a structure can be defined once, tested against hazards, compared with manual calculations and engineering solvers, visualized clearly, and later calibrated against physical tests.

RPE development follows:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

RPE must never present a visual animation as independent proof of structural capacity. Every engineering result must identify its basis, assumptions, solver, data quality, and verification state.

---

# Definition of RPE v1.0 DONE

RPE v1.0 is complete when all of the following are true:

1. A user can create or import a simple BIM/IFC building specimen.
2. RPE preserves object identity for structural members, panels, openings, connections, assemblies, and materials.
3. The material/assembly/cost library is traceable and supports verified, provisional, and user-supplied values without mixing them.
4. A baseline specimen remains immutable; design changes create explicit derived candidates such as A1, A2, and A3.
5. The browser test chamber can visualize wind flow, pressure, load paths, deformation/failure state, detached debris, and synchronized result plots.
6. At least one wind workflow is cross-checked against manual/code calculation and an engineering/physics solver.
7. At least one earthquake workflow for a simple RC structure is cross-checked against manual/code calculation and a structural solver.
8. A result report records specimen version, inputs, assumptions, equations/method, solver, outputs, limitations, and provenance.
9. The Dignity housing family supports Studio, 1BR, 2BR, and 3BR configurations without changing the core resilience doctrine.
10. The repository has automated tests/CI and the application can be deployed reproducibly.
11. Benchmark cases are repeatable and saved as permanent RPE test specimens.
12. Future physical test results can be attached to a benchmark and compared against RPE predictions without changing the original prediction record.

Anything beyond these requirements belongs to RPE v1.x or v2.0 and is not required to declare v1.0 complete.

---

# PHASE 0 — Repository Foundation — COMPLETE

Goal: establish a durable project record.

Completed foundation:
- repository and documentation structure;
- Next.js / React application foundation;
- Three.js / React Three Fiber viewport;
- sample hazard/specimen/material datasets;
- project status, worklog, tasks, roadmap, and agent-development rules.

Exit gate: project can be continued from the repository without relying on one chat thread.

---

# PHASE 1 — Visual MVP and Engineering Cockpit — COMPLETE

Goal: prove the interface and workflow before implementing real physics.

Completed:
- engineering cockpit layout;
- static conceptual 3D specimen;
- scripted Typhoon Index event playback;
- run-mode placeholders;
- upgrade/rebuilder placeholders;
- export placeholders;
- UI refinement and token system.

Important limitation: Phase 1 playback is scripted, not calculated physics.

---

# PHASE 2 — Data Spine, Costing, and Immutable Prototypes — ACTIVE

Goal: make the project data model trustworthy before adding physics.

## Phase 2A — Catalog foundation
- Product library.
- Assembly library with explicit BOM/components.
- Cost-rate library separated from product identity.
- Specimen assembly selections and ancestry.
- Runtime reference validation.
- Unknown engineering properties remain `null` / `unverified`.

## Phase 2B — Deterministic costing
- Pure assembly-cost calculation.
- Pure specimen-cost calculation.
- Material waste separated from labor/equipment/installation.
- User price overrides do not overwrite library values.
- Itemized totals are reproducible.

## Phase 2C — Candidate derivation
Required workflow:

A0 baseline → temporary draft → review differences → **Create Candidate** → A1.

A0 must remain immutable.

## Phase 2D — UI migration
- Replace legacy Material/CostItem UI paths.
- Assembly/material selectors.
- Local quantity/rate overrides.
- Baseline vs candidate cost delta.
- Verification/provenance badges.

## Phase 2E — Automated tests and CI
- catalog validation tests;
- costing tests;
- immutability tests;
- deterministic result tests;
- GitHub CI: install, lint, strict TypeScript, test, build.

Exit gate: A0 can be loaded, costed, edited as a draft, saved as A1, reset, and reproduced without silent data mutation.

---

# PHASE 3 — Genesis Test Chamber / First Real Mechanics

Goal: cross the line from scripted animation into calculated physical interaction.

## 3.1 Null House
Start with a semi-transparent envelope representing house volume only.

No walls, roof, frame, mass, stiffness, or connections.

Wind passes through. Result must be **N/A / no physical specimen**, not PASS.

## 3.2 Smoke / wind-tunnel visualization
- visible streamlines, smoke ribbons, or particles;
- wind direction and speed controls;
- visual stagnation, separation, wake, and edge flow;
- visualization remains clearly distinguished from CFD unless fed by CFD data.

## 3.3 One-panel benchmark
Add one plywood/fiber-cement/GI panel with:
- geometry;
- mass;
- orientation;
- exposed area;
- connection locations;
- stated connection capacities.

Initial analytical wind action may use a declared pressure model such as dynamic pressure plus explicit coefficients.

## 3.4 Breakable connection
Pressure/load → connection demand → capacity exceeded → release.

## 3.5 Free debris
After release, the panel becomes a rigid/free body and can translate, rotate, and collide.

Preferred real-time rigid-body candidate: **Rapier.js**. Project Chrono remains a later advanced option.

Exit gate: one panel responds to a declared wind model, its connection can fail from calculated demand, and the detached panel becomes physically simulated debris.

---

# PHASE 4 — Small House Wind System

Goal: scale one-panel mechanics into a complete simple shelter.

Build progressively:

Empty envelope → primary supports → floor/ring frame → walls → roof → connections → bracing → anchorage → storm protection.

Required outputs:
- pressure/load vectors;
- connection demand/capacity state;
- uplift and sliding reactions;
- racking indicators;
- failure sequence;
- detached-component debris;
- residual state after load removal where supported.

Initial Dignity structural studies:
- coco lumber secondary framing;
- built-up/bundled 2×3 coco members where proposed;
- bamboo primary framing alternatives;
- light-steel/hybrid alternatives;
- elevated locked-pedestal base;
- deployable storm harness / Spiderweb restraint.

Exit gate: same house geometry can run controlled A/B tests with only one structural variable changed.

---

# PHASE 5 — Dignity Housing Family

Goal: develop a disciplined housing product family rather than unlimited custom models.

Standard residential range:
1. **Studio Core** — minimum model and first ₱50k research target.
2. **1 Bedroom**.
3. **2 Bedroom**.
4. **3 Bedroom** — maximum standard model in this family.

Design doctrine:
- smaller budget changes size/finish, not the minimum load-path/resilience logic;
- modules should expand without destroying the original core where practical;
- critical anchorage, bracing, roof connection, and storm-protection logic cannot be deleted merely to hit a price target.

Base typologies:
- **Elevated resilient base** — normally at least ~600 mm above ground, subject to site hazard requirements;
- **Grounded slab/raft base** — only for sites screened as suitable and not flood/storm-surge exposed.

Exit gate: Studio→3BR variants are represented as controlled parametric/specimen families sharing the same material/assembly architecture.

---

# PHASE 6 — BIM / IFC Import Pipeline

Goal: define the building once and reuse it across RPE and solvers.

Preferred open BIM path:
- IFC as the durable exchange format;
- IfcOpenShell for IFC parsing/semantics;
- Blender/Bonsai as an optional open-BIM authoring/inspection route;
- Revit, FreeCAD/BIM, or other IFC-capable tools may also author the source model.

Importer must preserve where available:
- object GUID/identity;
- member type and geometry;
- material assignment;
- layer/profile information;
- spatial relationships;
- opening/host relationships;
- connection metadata where explicitly modeled.

RPE must validate missing simulation properties instead of silently inventing them.

Example import readiness report:
- geometry: verified/imported;
- material identity: available/missing;
- density: available/missing;
- modulus: available/missing;
- strength: available/missing;
- connection properties: available/missing;
- provenance: available/missing.

Exit gate: a simple BIM/IFC Studio or 2-storey frame can be imported, mapped to RPE objects, checked for missing properties, and saved as a specimen.

---

# PHASE 7 — Structural Solver Coupling

Goal: separate browser visualization from engineering structural analysis.

Primary open-source structural solver target: **OpenSees/OpenSeesPy** for frame response, nonlinear/cyclic behavior, seismic time history, and research workflows.

Additional solver target: **CalculiX** for selected detailed finite-element problems where appropriate.

RPE acts as orchestrator:

BIM/RPE specimen → solver idealization → solver input → run → result import → synchronized visualization.

Required traceability:
- solver name/version;
- model idealization;
- boundary conditions;
- material model;
- damping;
- convergence settings;
- source inputs;
- result files/hash.

Exit gate: one structural benchmark can be run outside RPE in the solver and reproduced/visualized inside RPE with matching model metadata.

---

# PHASE 8 — Wind CFD Coupling

Goal: replace simplified pressure fields with calculated flow where needed.

Primary CFD target: **OpenFOAM**.

Capabilities:
- external pressure field;
- suction zones;
- corner/roof-edge flow;
- wake and vortices;
- flow through openings;
- later internal-pressure interaction.

Two wind visualization modes must remain distinct:

**Fast Smoke Mode** — browser visualization using simplified/analytical field.  
**CFD Smoke Mode** — streamlines derived from OpenFOAM velocity/pressure results.

Exit gate: one simple building has an OpenFOAM-derived pressure field mapped to RPE surfaces and compared with the simplified wind model.

---

# PHASE 9 — Multi-Hazard Layers

Goal: add hazards without turning them into decorative effects.

## Driven rain
- rain direction/intensity;
- breach-dependent ingress;
- wetted surfaces/interior exposure;
- water accumulation where modeled.

## Debris impact
- defined debris mass/geometry/velocity;
- impact event and affected component;
- detached building parts may themselves become debris.

## Flood / coastal water
- water depth;
- hydrostatic action;
- hydrodynamic drag;
- buoyancy/uplift;
- debris interaction;
- saltwater exposure metadata;
- later wave/scour modules where justified.

Site profiles may include Inland, Coastal, Mountain, River/Floodplain, or Custom, but each activated hazard must still expose its actual parameters.

Exit gate: hazards can be enabled independently and their assumptions/results remain separable and traceable.

---

# PHASE 10 — Engineering Benchmark Library

Goal: make RPE useful beyond one house design.

Initial permanent benchmark families:

## RPE-WIN-001 — Window Assembly Extreme Wind Test
Variable geometry/material/anchors with analytical/code wind pressure, later CFD, driven rain, and debris impact.

## RPE-RC-001 — RC Column–Footing Lateral Pull
Adjustable:
- column dimensions/height;
- concrete strength;
- vertical bars;
- ties;
- footing length/width/thickness/depth;
- soil assumptions;
- load height/direction/magnitude.

Compare manual calculation, conventional solver, RPE visualization, and later physical pull test.

## RPE-MAS-001 — 4 m × 4 m CHB Wall Comparison
Compare 4/5/6-inch CHB and strengthening strategies:
- baseline wall;
- horizontal stiffener/bond beam;
- central vertical stiffener;
- combined stiffeners;
- closer distributed horizontal/vertical reinforcement.

Hazard tests:
- out-of-plane wind;
- in-plane seismic;
- out-of-plane seismic;
- point load/impact.

## RPE-RC-002 — 2-Storey RC Earthquake Response
Earthquake input must not be defined by magnitude alone.
Required scenario data may include:
- ground-motion record or code/synthetic spectrum;
- magnitude metadata;
- distance/fault context where applicable;
- site class;
- PGA/record scaling;
- horizontal components;
- optional vertical component.

Compare drift, forces, hinge/yield states, residual deformation, and failure progression using structural-solver results.

Exit gate: benchmark runs are versioned, repeatable, and comparable side by side.

---

# PHASE 11 — Physical Validation and Calibration

Goal: close the loop between calculation, simulation, and reality.

When financially/practically feasible:
- construct selected benchmark specimens;
- use calibrated load measurement;
- measure displacement/deformation;
- record crack/failure sequence;
- record dimensions, moisture, material source/grade, and specimen variability;
- preserve test video/data and equipment calibration metadata.

Workflow:

1. Freeze manual prediction.
2. Freeze solver prediction.
3. Freeze RPE prediction.
4. Perform physical test.
5. Compare results.
6. Record discrepancy.
7. Calibrate a new model/version without overwriting the original prediction.

Exit gate: at least one benchmark contains an immutable pre-test prediction and linked actual test results.

---

# PHASE 12 — RPE v1.0 Release and Freeze

Goal: finish the build rather than allowing permanent prototype mode.

Release requirements:
- reproducible deployment;
- passing CI/test suite;
- stable specimen schema and migrations;
- BIM/IFC import for supported subset;
- deterministic costing and candidate derivation;
- Genesis/house wind mechanics;
- one structural-solver workflow;
- one CFD workflow;
- wind and earthquake benchmark cases;
- result-report export with provenance and limitations;
- documented physical-calibration interface;
- Dignity Studio/1BR/2BR/3BR specimen family.

At this point **RPE v1.0 is declared COMPLETE and feature-frozen except for defects**.

New capabilities such as advanced wave mechanics, detailed fracture, full RC continuum cracking, large urban CFD, GPU/HPC scaling, quantum optimization, or broad automatic code checking move to **RPE v2.0+**.

---

# Explicitly NOT required for RPE v1.0

To keep the project finishable, these are deferred unless they become necessary for a v1.0 acceptance gate:

- complete general-purpose finite-element replacement for commercial software;
- fully automatic engineering design approval;
- high-fidelity fracture for every material;
- full-fluid/structure interaction for every hazard;
- city-scale wind CFD;
- automatic modeling of every BIM object class;
- quantum optimization;
- photoreal Blender rendering inside the live browser;
- every Philippine code module;
- replacing professional engineering judgment.

---

# Product completion principle

RPE is finished when it provides a **credible, traceable, repeatable engineering test workflow**, not when every imaginable hazard or material has been simulated.

The permanent question for every new feature is:

> Does this feature help us calculate, solve, simulate, test, calibrate, compare, or explain a real engineering decision?

If not, it is not required for the core build.
