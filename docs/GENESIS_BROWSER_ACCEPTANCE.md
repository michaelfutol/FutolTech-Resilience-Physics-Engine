# Genesis Live Collision Browser Acceptance

This procedure verifies the **live Rapier callback path** for Genesis Panel 001. It is a QA acceptance procedure, not an engineering benchmark and not a source of adopted material, code, aerodynamic, connection, or site properties.

## Evidence boundary

The doctrine remains:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

The values below are synthetic UI/runtime fixtures only. Passing this procedure proves only that the declared analytical gate, explicit simulation gate, target identity bridge, and browser collision ledger are wired coherently. It does **not** establish impact force, impact energy, damage, material response, friction, restitution, solver agreement, CFD agreement, code compliance, or physical-test validation.

## Synthetic QA inputs

Enter these values manually in **Panel 001** mode:

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

The automated suite checks only that these synthetic inputs produce a deterministic analytical connection exceedance, `release_ready`, `simulation_ready`, and a valid explicit target contract. It intentionally does **not** assert that a collision occurred.

## Required browser acceptance observations

1. Confirm analytical calculation is present and the connection state is exceeded.
2. Confirm the release gate is `release_ready`.
3. Confirm the debris dynamics gate is `simulation_ready`.
4. Confirm Rapier reports `ACTIVE — RPE SIMULATION`.
5. Confirm the declared target is visible and identified exactly as `synthetic-browser-target-001`.
6. Observe the released panel in the live browser. A collision is accepted only if the real Rapier `onCollisionEnter` callback appends a collision-enter event.
7. Confirm the collision-enter ledger event records `synthetic-browser-target-001` as the other object ID. If Rapier reports no collision, record the browser acceptance as failed/incomplete; do not synthesize an event.
8. Change one explicit run input, for example target center X from `0.5` to `0.6`.
9. Confirm the previous collision-enter observation is absent from the changed input context. A later new collision callback may create a new observation for the new context.
10. Confirm the UI does not label the collision as force, energy, damage, material response, solver evidence, CFD evidence, code evidence, or physical-test evidence.

## Acceptance record

Do not mark the live collision gate complete from unit tests or CI alone. Record the browser environment/deployment, commit SHA, date, observed target ID, stale-context reset result, and any console/runtime errors in `WORKLOG.md` when the live procedure is actually performed.
