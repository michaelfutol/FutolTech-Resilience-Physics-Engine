# Dependency Advisory Classification

**Reviewed:** 2026-09-05  
**Branch:** `lum-rpe-takeover`  
**Repository checkpoint reviewed:** `edab3d686351b519f8fe7d9d04dfff0c5fb1e236`

## Scope

This review classifies the currently visible direct dependency risk before any new real-time physics dependency is introduced. It is not a substitute for a fresh `npm audit` from a network-enabled build environment.

## Direct package finding

`package.json` pins `next` at **16.2.10** and `eslint-config-next` at **16.2.10**.

Public security advisories published in July 2026 identify multiple Next.js issues affecting the 16.0.0–16.2.10 line, including authentication/authorization bypass, denial of service, SSRF/open-redirect conditions, and Server Action information-exposure/resource-consumption cases. The referenced patched release is **16.2.11**.

Classification:
- origin: **direct dependency (`next`)**;
- severity: includes **high** advisories;
- reachability: configuration-dependent for several advisories, but the application uses the App Router, so the vulnerable version must not be dismissed as irrelevant;
- remediation: upgrade `next` and matching `eslint-config-next` to **16.2.11 or later compatible patched release**, regenerate the lockfile, then run the full CI gate;
- current action: **do not install Rapier yet**; keep the new-physics dependency gate closed until the Next.js patch and fresh package audit are verified.

## Other currently pinned graphics packages

Public package-security indexes checked during this review did not show a direct known vulnerability affecting `three@0.185.1` or the current `@react-three/drei@10.7.7` release. This does not prove the transitive graph is clean.

## Required verification gate

Before Rapier or another new physics dependency is added:

1. update Next.js and its matching lint configuration to a patched compatible version;
2. regenerate `package-lock.json` with the package manager rather than editing integrity fields manually;
3. run a fresh `npm audit` and record remaining direct/transitive advisories;
4. run install, lint, strict TypeScript/test compilation, automated tests, and production build;
5. preserve any remaining advisory with explicit reachability/risk notes instead of using `npm audit fix --force` blindly.

Until those steps pass, Rapier remains blocked. The Genesis Null House and Fast Smoke visualization may advance because they add no dependency and make no structural-capacity or CFD claim.
