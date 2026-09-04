# Genesis Analytical Wind Foundation

## Scope

This checkpoint begins Phase 3 with a deliberately small, solver-neutral analytical layer. It does **not** claim CFD, structural-solver, rigid-body, or physical-test validation.

The evidence sequence remains:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

The functions in `src/lib/genesis/wind.ts` belong only to the **RPE analytical** layer.

## Implemented

- exact kph → m/s conversion;
- simplified dynamic pressure `q = 0.5 ρV²`;
- panel force `F = q A C`;
- explicit connection demand/capacity assessment;
- versioned Genesis input/result types;
- explicit evidence-layer and verification-state labels;
- Null House structural result type locked to `N/A / no_physical_specimen`.

## Non-negotiable input policy

RPE supplies no hidden engineering defaults in this foundation. Air density, exposed area, pressure coefficient, and any connection capacity must be supplied by the caller with provenance/verification state. A missing connection capacity remains `null` and produces `unverified`, never a false PASS.

The numerical values used in unit tests are synthetic arithmetic fixtures only. They are not adopted material, wind-code, site, or connection properties.

## Not yet implemented

- code-specific wind coefficients or design combinations;
- terrain/topography/internal-pressure rules;
- CFD pressure fields;
- load distribution into a structural system;
- structural deformation or nonlinear response;
- breakable rigid-body connection mechanics;
- Rapier integration;
- physical-test calibration.

These remain separate gated evidence/mechanics layers.
