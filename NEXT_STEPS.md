# Next Steps

## Current roadmap position

The Phase 3 Genesis exit gate is satisfied. RPE has crossed from one-panel analytical action into calculated connection release, physically simulated Rapier debris, explicit collision evidence, and explicitly gated post-release center-of-mass aerodynamic force over a declared fixed-step application window.

Phase 4 — **Small House Wind System** — is now active.

The first Phase 4 foundation is already implemented as a versioned system contract with the locked progression:

**empty envelope → primary supports → floor/ring frame → walls → roof → connections → bracing → anchorage → storm protection**

The contract preserves stable object identity and explicit provenance while allowing material identity, mass, and connection capacity to remain unknown (`null`). Geometry alone never creates a capacity or performance claim.

## Exact next gated batch

Build a reviewable staged-house chamber driven from the validated Phase 4 contract.

Requirements:
- Add a dedicated Phase 4 small-house view/mode rather than repurposing the conceptual Phase 1 playback.
- Use a clearly labeled synthetic software-QA house fixture first; do not silently adopt Dignity production dimensions or engineering properties.
- Let the user select/review each roadmap construction stage in order.
- The `empty_envelope` stage must show the transparent envelope and report `N/A / no_physical_specimen`.
- At later stages, instantiate only the components and connections returned by `materializeSmallHouseWindStage`.
- Expose component IDs, kinds, activation stages, verification states, and whether material/mass/capacity remain unknown.
- Do not label visible geometry PASS/FAIL or structurally adequate merely because it exists.
- Keep Fast Smoke / wind visualization separate from structural mechanics unless an explicit small-house wind-action contract is introduced.
- Add deterministic browser QA proving stage progression and empty-envelope semantics before introducing whole-house wind loads.

## After the viewer gate

Introduce Phase 4 mechanics in the same order as the topology:

1. **Primary supports** — explicit geometry, mass/material state, restraint/support assumptions, and provenance; no hidden stiffness/strength.
2. **Floor/ring frame** — explicit member relationships and connection identities.
3. **Walls and roof** — explicit panel geometry/orientation/exposure and connection mapping.
4. **Connections** — demand/capacity only from declared/sourced inputs; unknown remains unverified.
5. **Bracing and anchorage** — explicit load-path relationships before calculating racking/uplift/sliding response.
6. **Storm protection** — separate optional structural variable, not a decorative overlay.
7. **Controlled A/B comparison** — same house geometry, one declared structural variable changed, with automated proof that unrelated geometry/inputs are unchanged.

Do not jump directly to a complete animated house failure sequence. Phase 4 must remain reviewable member-by-member and gate-by-gate.

## Phase 3 evidence retained

- Genesis Browser Acceptance run `33938570653` passed the live force/collision production-browser gate.
- Evidence artifact ID `9961013065` records opt-in blocking, readiness, full-step application, partial terminal application, force-window completion, genuine collision, identity match, stale collision reset, stale force-evidence reset, and zero console/page errors.
- RPE CI run `33938665291` passed after preserving the legacy collision activation error contract and adding a distinct aerodynamic force-application activation error.
- Clean helper-removal CI run `33938717530` passed.
- Phase 4 foundation CI run `33938835927` passed.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately. Phase 3 completion and Phase 4 progress do not silently close that gate.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate layers under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
