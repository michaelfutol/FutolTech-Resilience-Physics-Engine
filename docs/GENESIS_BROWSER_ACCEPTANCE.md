# Genesis Live Collision Browser Acceptance

This procedure verifies the **live Rapier callback path** for Genesis Panel 001. It is a QA acceptance procedure, not an engineering benchmark and not a source of adopted material, code, aerodynamic, connection, or site properties.

## Evidence boundary

The doctrine remains:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

The values below are synthetic UI/runtime fixtures only. Passing this procedure proves only that the declared analytical gate, explicit simulation gate, target identity bridge, and browser collision ledger are wired coherently. It does **not** establish impact force, impact energy, damage, material response, friction, restitution, solver agreement, CFD agreement, code compliance, or physical-test validation.

## Synthetic QA inputs

Enter these values in **Panel 001** mode:

| Input | Synthetic QA value |
| --- | ---: |
| Wind speed | 36 kph |
| Direction | 0° |
| Air density | 1 kg/m³ |
| Pressure coefficient C | 1 |
| Panel width | 1 m |
| Panel height | 1 m |
| Equivalent connection capacity | 1 N |
| Panel mass | 1 kg |
| Gravity | (0, 0, 0) m/s² |
| Initial linear velocity | (1, 0, 0) m/s |
| Initial angular velocity | (0, 0, 0) rad/s |
| Target object ID | `synthetic-browser-target-001` |
| Target center | (0.5, 0.5, 0) m |
| Target box size | (0.2, 1, 1) m |
| Target source note | `Synthetic browser-QA fixture only` |
| Target verification state | `unverified` |

Unit/regression tests check only that these synthetic inputs produce deterministic analytical connection exceedance, `release_ready`, `simulation_ready`, and a valid explicit target contract. Unit tests intentionally do **not** assert that a collision occurred. A live browser execution is required for the collision observation.

## Required browser acceptance observations

1. Confirm analytical calculation is present and the connection state is exceeded.
2. Confirm the release gate is `release_ready`.
3. Confirm the debris dynamics gate is `simulation_ready`.
4. Confirm Rapier reports `ACTIVE — RPE SIMULATION`.
5. Confirm the declared target is visible and identified exactly as `synthetic-browser-target-001`.
6. Observe the released panel in the live browser. A collision is accepted only if the real Rapier `onCollisionEnter` callback appends a collision-enter event.
7. Confirm the collision-enter ledger event records `synthetic-browser-target-001` as the other object ID. If Rapier reports no collision, record the browser acceptance as failed/incomplete; do not synthesize an event.
8. Change one explicit run input, for example target center X.
9. Confirm the previous collision-enter observation is absent from the changed input context. A later new collision callback may create a new observation for the new context.
10. Confirm the UI does not label the collision as force, energy, damage, material response, solver evidence, CFD evidence, code evidence, or physical-test evidence.

## Reproducible browser runner

The repository contains:

- `scripts/genesis-browser-acceptance.mjs` — drives the actual production UI in Chromium, enters the fixture, waits for a genuine `collision_enter`, checks target identity, then changes an explicit target input and verifies stale-event reset.
- `.github/workflows/genesis-browser-acceptance.yml` — builds/starts the production Next.js application and executes the Chromium acceptance runner, then uploads the JSON record and screenshot.

A workflow merely running in GitHub Actions is not enough by itself; acceptance requires the browser runner's recorded live callback checks to pass. Unit tests remain a separate evidence layer.

## Accepted checkpoint — 2026-09-05

The current single-panel live-collision gate **passed** with the synthetic QA fixture.

- **Tested commit:** `510dc5c3b9892f40e82428e8aea64e3d2251b75b`
- **Normal RPE CI run:** `33935187251` — passed install, lint, strict TypeScript, automated tests, and production build.
- **Genesis Browser Acceptance run:** `33935187278` — passed.
- **Browser environment:** production Next.js build on GitHub-hosted Ubuntu 24.04, headless Chromium driven by Playwright.
- **Artifact:** `genesis-browser-acceptance-510dc5c3b9892f40e82428e8aea64e3d2251b75b`, artifact ID `9959936762`.
- **Observed live target ID:** `synthetic-browser-target-001`.
- **Genuine Rapier `collision_enter`:** observed.
- **Target identity match:** passed.
- **Changed-input stale-context reset:** passed after changing explicit target center X.
- **Evidence-boundary disclaimer:** present.
- **Browser console errors:** none.
- **Browser page errors:** none.

This accepted checkpoint proves only the current browser/Rapier event pipeline and stale-context behavior for the synthetic fixture. It must not be cited as physical validation or as evidence of impact/aerodynamic/material capacity.

## Toolchain note

Canonical application `npm ci` reported zero vulnerabilities during the accepted run. The workflow's isolated, no-save Playwright harness installation reported one high advisory. That temporary browser-harness finding is tracked separately for security cleanup and does not alter the committed application dependency graph.
