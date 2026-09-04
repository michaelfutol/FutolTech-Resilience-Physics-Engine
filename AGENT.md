# RPE Development Instructions

## Role & Goal
This repository is the persistent development record for the FutolTech Resilience Physics Engine (RPE).
RPE is a visual simulation, comparison, costing, and engineering-development workspace for low-cost Filipino housing and controlled structural test specimens. It is NOT a replacement for licensed structural design, code checks, verified material properties, or physical testing.

## Engineering Doctrine
RPE development follows:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

Manual/code-based calculations, conventional engineering solvers, RPE visualization/physics, and future physical tests are separate evidence layers. Disagreement between layers must be investigated, not hidden or averaged away.

## Main Development Philosophy
- Do not use AI hype terms.
- Use grounded terms: working spec, test study, simulation flow, material library, hazard category, failure map, costed upgrade path, status report, worklog, next task.
- The project voice must remain practical, engineering-aware, and honest.
- Never invent engineering strengths/capacities to make a demo look complete. Unknown values remain null/unverified until a credible source, calculation basis, supplier certificate, calibration, or test supports them.

## Current Tech Stack
- **Installed:** React / Next.js, Three.js / React Three Fiber, Drei, Tailwind CSS, TypeScript.
- **Planned visual physics:** Rapier.js or cannon-es (not yet installed/integrated at takeover).
- **Future integrations:** Project Chrono / PyChrono, OpenSees, OpenFOAM, CalculiX / Code_Aster, Blender, BlueQubit as appropriate to the layer being solved.

## Repository-First Record Rule
1. GitHub is the code/source-of-truth record for RPE development.
2. Every meaningful implementation change must be committed to a named branch. Do not rely on chat-only or local-only work as the project record.
3. Never call a feature "complete" if its code has not been pushed to GitHub.
4. Record important architectural/engineering decisions in repository documentation alongside the code they affect.
5. Keep commits focused and descriptive enough that another developer/agent can reconstruct why a change was made.
6. Use CI checks for dependency install, lint, strict TypeScript, tests when available, and production build.
7. If CI fails, investigate and record the actual cause; do not bypass checks merely to obtain a green status.

## Hard Rules
1. Do not claim engineering accuracy beyond the implemented and validated model.
2. Do not remove previous work unless broken, obsolete, unsafe, or duplicated—and preserve the reason in history.
3. Keep manual assumptions, solver assumptions, visualization assumptions, and physical-test evidence distinguishable.
4. Any unvalidated simulation output must be labeled conceptual/preliminary as appropriate.
5. Never let a transparent/reference-only object (for example the Null House envelope) produce a false structural PASS result. No structure = N/A, not PASS.
6. Preserve A0 baseline specimens; upgrades should use draft/candidate lineage rather than silently mutating the original.
7. Material and cost provenance must remain traceable; user overrides must not overwrite library/source values.

## Required Reporting Behavior
After every meaningful task batch, keep these current:
- `STATUS_REPORT.md`
- `WORKLOG.md`
- `TASKS.md`
- `NEXT_STEPS.md`

When a major milestone is reached, add or update the relevant design/engineering documentation and include the exact branch/checkpoint in the status record.
