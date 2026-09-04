# Dependency Advisory Classification

**Reviewed:** 2026-09-05  
**Branch:** `lum-rpe-takeover`  
**Clean dependency checkpoint:** `996ab2e`

## Outcome

The dependency gate is now **clean at the recorded checkpoint**.

A network-enabled GitHub Actions maintenance run regenerated the dependency metadata with the package manager, applied only non-force audit fixes, and then ran a fresh `npm audit --json`.

Final recorded audit counts:
- info: **0**
- low: **0**
- moderate: **0**
- high: **0**
- critical: **0**
- total: **0**

Recorded dependency graph metadata after remediation:
- production: 80
- development: 381
- optional: 96
- peer: 2
- total: 498

## Framework remediation

The earlier review found that `next@16.2.10`, then `16.2.11`, still resolved to a graph containing known advisories in the current audit database.

The final remediation moved the matching framework pair to:
- `next`: **16.3.4**
- `eslint-config-next`: **16.3.4**

The lockfile was regenerated through npm rather than by hand-editing package versions or integrity hashes.

## Transitive advisories encountered and resolved

The intermediate audit identified advisories in:
- `brace-expansion` — high;
- `browserslist` — high;
- `fflate` — moderate;
- `js-yaml` — high;
- `nanoid` — high;
- `next` — high, through vulnerable `postcss` / `sharp` paths;
- `postcss` — high;
- `sharp` — high.

The remediation used:
1. an explicit compatible Next.js / eslint-config-next framework update;
2. `npm audit fix --package-lock-only --ignore-scripts` **without `--force`**;
3. a fresh audit to verify the resulting graph.

The final audit reported zero known vulnerabilities.

## Rapier gate

The security/audit portion of the Rapier dependency gate is now **open**, subject to one final requirement: the normal RPE CI suite must pass against the clean dependency checkpoint before a new physics dependency is introduced.

That CI suite must include:
- dependency install;
- lint;
- strict TypeScript;
- automated tests;
- production build.

After that verification, Rapier may be introduced as the first rigid-body mechanics layer. Its installation must itself be followed by another fresh audit and the same CI gate.

## Ongoing rule

Do not use `npm audit fix --force` as a shortcut. Future dependency changes must preserve a traceable package/lockfile update, fresh audit evidence, and passing CI before becoming an engineering-simulation dependency.
