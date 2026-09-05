# Next Steps

## Current Genesis gate

The post-release aerodynamic path now has three deliberately separate layers before live Rapier coupling:

1. **RPE analytical result** — explicit post-release air-relative drag calculation with caller-supplied interval, density, relative air velocity, projected area, drag coefficient, body identity, and provenance.
2. **RPE simulation application plan** — explicit opt-in, ready dynamics, matching body identity, center-of-mass constant force, no aerodynamic torque.
3. **Deterministic physics-step scheduler** — maps the declared force interval to each future physics step and prevents a terminal partial step from extending the declared duration.

The scheduler is pure: it does not mutate Rapier, advance time, infer torque, reuse pre-release force, or create engineering properties.

## Exact next gated batch

Wire those already-tested contracts into the live Genesis Panel 001 Rapier path, but only under the following rules:

- Add explicit user opt-in for post-release aerodynamic force application; default remains off.
- Reuse only the already validated aerodynamic result and force-application plan. Do not invent density, Cd, area, exposure interval, force direction, or body identity.
- Use a deterministic physics-step clock appropriate to the Rapier integration path.
- For every physics step, call the tested scheduler and apply only `effectiveForceN` while `shouldApplyForce` is true.
- On the terminal partial step, preserve only the declared active-duration impulse; do not apply the full force for the entire coarse step.
- Apply force at center of mass only. Aerodynamic torque remains explicitly unmodeled.
- Never convert the pre-release panel action into an impulse or continuing load.
- Extend the run/evidence context key so changed aerodynamic/application inputs invalidate stale application observations.
- Add ordered `rpe_simulation` evidence for application activation/state without claiming solver, CFD, code, material-test, or physical-test authority.
- Add unit/integration tests before browser acceptance.
- Run normal RPE CI and the real Chromium Genesis acceptance; retain and repair any failed check instead of weakening criteria.

## Acceptance criteria for that batch

The gate closes only when tests demonstrate:

- application is blocked when explicit opt-in is off;
- application is blocked when dynamics/aerodynamic/body-identity/provenance gates are not ready;
- no force is applied before the declared window;
- full-step force is preserved inside the window;
- the terminal partial step preserves `F × activeDuration` rather than extending the load;
- no force is applied after the declared interval;
- no aerodynamic torque is introduced;
- changing a relevant explicit run/aerodynamic input clears stale force-application evidence;
- normal CI passes; and
- real browser QA passes without console/page errors.

## Independent outstanding gate

Final Phase 2 manual browser visual acceptance remains open and must be recorded separately; Phase 3 software progress does not silently close it.
