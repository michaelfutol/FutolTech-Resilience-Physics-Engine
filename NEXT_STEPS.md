# Next Steps

## Current roadmap position

The Phase 3 Genesis exit gate is satisfied. RPE has crossed from one-panel analytical action into calculated connection release, physically simulated Rapier debris, explicit collision evidence, and explicitly gated post-release center-of-mass aerodynamic force over a declared fixed-step application window.

Phase 4 — **Small House Wind System** — is active, and its first staged visual/data gate is now complete.

The validated Phase 4 contract and test-chamber viewer preserve the locked progression:

**empty envelope → primary supports → floor/ring frame → walls → roof → connections → bracing → anchorage → storm protection**

The viewer uses a clearly labeled synthetic software-QA house. It preserves stable object identity/provenance, explicit component orientation, unknown material/mass/capacity state, `N/A / no_physical_specimen` for the empty envelope, and `DECLARED_COMPONENTS_ONLY` for later geometry-only stages. Connection topology is listed without inventing joint coordinates. Visible geometry is explicitly not structural adequacy.

## Completed viewer/browser gate

- Staged-house viewer landed in the canonical test chamber.
- Deterministic Chromium QA traverses every roadmap stage, confirms stage-specific object counts/identities, verifies explicit rotated-member metadata, checks unknown engineering properties remain visible, confirms the empty envelope is `N/A`, and confirms higher-stage identities disappear when returning to the empty envelope.
- Workflow commit `135a874d40982e293fd0763e43531d0bf0b0b71e` runs both Genesis and Phase 4 browser acceptance against the production build using the isolated pinned Playwright 1.62.1 harness.
- RPE CI run `33939397709` passed.
- Browser run `33939397798` passed and produced artifact `browser-acceptance-135a874d40982e293fd0763e43531d0bf0b0b71e`, artifact ID `9961290314`.

## Exact next gated batch

Define the first explicit **primary-support mechanics readiness/input contract** before calculating any support response.

Requirements:
- Select/reference a `primary_support` by stable component ID from a validated `SmallHouseWindSpecimenInput` / `primary_supports` stage snapshot rather than duplicating or silently replacing its geometry.
- Preserve the component’s explicit center, size, orientation, material ID, mass, source note, and verification state from the validated specimen.
- Require caller-supplied support/restraint assumptions with explicit provenance and verification state; no restraint condition may be silently defaulted.
- Represent unknown material identity, mass, stiffness, strength, and capacity as missing/unverified rather than inventing values.
- Do not calculate reaction, displacement, stress, utilization, capacity, PASS/FAIL, or whole-house wind performance in this readiness batch.
- Reject missing component identity, wrong component kind/stage, non-finite restraint/input values, unsupported verification state, or absent provenance where the new contract requires it.
- Add deterministic regression coverage and include it in the actual `npm test` command.
- Expose the readiness result as a reviewable data gate before any solver or Rapier primary-support behavior is introduced.

## After the readiness gate

Only after all mechanics-driving quantities required by a chosen primary-support calculation are explicitly defined/sourced should RPE add that calculated mechanics path. Then proceed in topology order:

1. **Primary supports** — calculated mechanics from explicit inputs; keep manual/code calculation, solver results, and RPE analytical/simulation results distinct.
2. **Floor/ring frame** — explicit member relationships and connection identities.
3. **Walls and roof** — explicit panel geometry/orientation/exposure and connection mapping.
4. **Connections** — demand/capacity only from declared/sourced inputs; unknown remains unverified.
5. **Bracing and anchorage** — explicit load-path relationships before calculating racking/uplift/sliding response.
6. **Storm protection** — separate optional structural variable, not a decorative overlay.
7. **Controlled A/B comparison** — same house geometry, one declared structural variable changed, with automated proof that unrelated geometry/inputs are unchanged.

Do not jump directly to a complete animated house failure sequence.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately. Phase 3 completion and Phase 4 progress do not silently close that gate.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser QA/visualization, and future physical tests remain separate layers under:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**
