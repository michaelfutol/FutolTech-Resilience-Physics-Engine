from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


viewport_path = Path("src/components/Viewport3D.tsx")
viewport = viewport_path.read_text()

if "aeroApplicationEnabled" not in viewport:
    viewport = replace_once(
        viewport,
        'import { Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";\n',
        'import { Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";\n',
        "Rapier import",
    )
    viewport = replace_once(
        viewport,
        'import { assessGenesisDebrisDynamicsGate } from "@/lib/genesis/debrisDynamicsGate";\n',
        'import { assessGenesisDebrisDynamicsGate } from "@/lib/genesis/debrisDynamicsGate";\nimport {\n  assessGenesisAerodynamicForceApplicationGate,\n  createGenesisAerodynamicForceApplicationPlan,\n} from "@/lib/genesis/aerodynamicForceApplication";\nimport type { GenesisAerodynamicForceApplicationPlan } from "@/types/genesisForceApplication";\nimport type { GenesisAerodynamicForceStepEvaluation } from "@/lib/genesis/aerodynamicForceWindow";\n',
        "force application imports",
    )
    viewport = replace_once(
        viewport,
        '  recordGenesisRapierCollisionEnter,\n  type GenesisLiveSimulationEvidenceSnapshot,\n} from "@/lib/genesis/liveSimulationEvidence";\n',
        '  recordGenesisAerodynamicForceApplication,\n  recordGenesisRapierCollisionEnter,\n  type GenesisLiveSimulationEvidenceSnapshot,\n} from "@/lib/genesis/liveSimulationEvidence";\nimport GenesisAerodynamicForceDriver, {\n  GENESIS_RAPIER_FIXED_STEP_SECONDS,\n} from "@/components/GenesisAerodynamicForceDriver";\n',
        "live evidence imports",
    )

    viewport = replace_once(
        viewport,
        '''  collisionTarget,\n  onCollisionEnter,\n}: {\n  widthM: number;\n  heightM: number;\n  releaseGate: GenesisRigidBodyGateResult;\n  dynamicsGate: GenesisDebrisDynamicsGateResult;\n  collisionTarget: GenesisCollisionTargetContract | null;\n  onCollisionEnter: (otherUserData: unknown) => void;\n}) {\n''',
        '''  collisionTarget,\n  aerodynamicForcePlan,\n  runContextKey,\n  onCollisionEnter,\n  onAerodynamicForceStep,\n}: {\n  widthM: number;\n  heightM: number;\n  releaseGate: GenesisRigidBodyGateResult;\n  dynamicsGate: GenesisDebrisDynamicsGateResult;\n  collisionTarget: GenesisCollisionTargetContract | null;\n  aerodynamicForcePlan: GenesisAerodynamicForceApplicationPlan | null;\n  runContextKey: string;\n  onCollisionEnter: (otherUserData: unknown) => void;\n  onAerodynamicForceStep: (evaluation: GenesisAerodynamicForceStepEvaluation) => void;\n}) {\n''',
        "DynamicPanel props",
    )
    viewport = replace_once(
        viewport,
        '    <Physics gravity={[gravity.x, gravity.y, gravity.z]}>\n',
        '    <Physics gravity={[gravity.x, gravity.y, gravity.z]} timeStep={GENESIS_RAPIER_FIXED_STEP_SECONDS}>\n      <GenesisAerodynamicForceDriver\n        rigidBodyRef={rigidBodyRef}\n        plan={aerodynamicForcePlan}\n        runContextKey={runContextKey}\n        onForceStepEvidence={onAerodynamicForceStep}\n      />\n',
        "fixed-step Physics bridge",
    )

    viewport = replace_once(
        viewport,
        '''  dynamicsGate,\n  collisionTarget,\n  onCollisionEnter,\n}: {\n  widthM: number;\n  heightM: number;\n  directionDegrees: number | null;\n  experiment: GenesisPanelExperimentResult | null;\n  releaseGate: GenesisRigidBodyGateResult | null;\n  dynamicsGate: GenesisDebrisDynamicsGateResult | null;\n  collisionTarget: GenesisCollisionTargetContract | null;\n  onCollisionEnter: (otherUserData: unknown) => void;\n}) {\n''',
        '''  dynamicsGate,\n  collisionTarget,\n  aerodynamicForcePlan,\n  runContextKey,\n  onCollisionEnter,\n  onAerodynamicForceStep,\n}: {\n  widthM: number;\n  heightM: number;\n  directionDegrees: number | null;\n  experiment: GenesisPanelExperimentResult | null;\n  releaseGate: GenesisRigidBodyGateResult | null;\n  dynamicsGate: GenesisDebrisDynamicsGateResult | null;\n  collisionTarget: GenesisCollisionTargetContract | null;\n  aerodynamicForcePlan: GenesisAerodynamicForceApplicationPlan | null;\n  runContextKey: string;\n  onCollisionEnter: (otherUserData: unknown) => void;\n  onAerodynamicForceStep: (evaluation: GenesisAerodynamicForceStepEvaluation) => void;\n}) {\n''',
        "GenesisPanelScene props",
    )
    viewport = replace_once(
        viewport,
        '''          dynamicsGate={dynamicsGate}\n          collisionTarget={collisionTarget}\n          onCollisionEnter={onCollisionEnter}\n''',
        '''          dynamicsGate={dynamicsGate}\n          collisionTarget={collisionTarget}\n          aerodynamicForcePlan={aerodynamicForcePlan}\n          runContextKey={runContextKey}\n          onCollisionEnter={onCollisionEnter}\n          onAerodynamicForceStep={onAerodynamicForceStep}\n''',
        "DynamicPanel prop forwarding",
    )

    viewport = replace_once(
        viewport,
        '  const [aeroVerificationText, setAeroVerificationText] = useState<TargetVerificationText>("");\n',
        '  const [aeroVerificationText, setAeroVerificationText] = useState<TargetVerificationText>("");\n  const [aeroApplicationEnabled, setAeroApplicationEnabled] = useState(false);\n  const [aeroApplicationBodyIdText, setAeroApplicationBodyIdText] = useState("");\n  const [aeroApplicationSourceNoteText, setAeroApplicationSourceNoteText] = useState("");\n  const [aeroApplicationVerificationText, setAeroApplicationVerificationText] = useState<TargetVerificationText>("");\n',
        "application UI state",
    )

    aero_result_anchor = '''  const postReleaseAerodynamicResult = useMemo(() => {\n    if (!postReleaseAerodynamicGate?.canCalculate || postReleaseAerodynamicGate.state !== "aerodynamic_ready") {\n      return null;\n    }\n    try {\n      return calculateGenesisPostReleaseAerodynamics(postReleaseAerodynamicGate);\n    } catch {\n      return null;\n    }\n  }, [postReleaseAerodynamicGate]);\n'''
    aero_application_logic = aero_result_anchor + '''\n  const aerodynamicForceApplicationGate = useMemo(() => {\n    if (!dynamicsGate || aeroApplicationVerificationText === "") return null;\n    try {\n      return assessGenesisAerodynamicForceApplicationGate(\n        dynamicsGate,\n        postReleaseAerodynamicGate,\n        postReleaseAerodynamicResult,\n        {\n          enabled: aeroApplicationEnabled,\n          bodyId: aeroApplicationBodyIdText,\n          sourceNote: aeroApplicationSourceNoteText,\n          verificationState: aeroApplicationVerificationText,\n        },\n      );\n    } catch {\n      return null;\n    }\n  }, [\n    dynamicsGate,\n    postReleaseAerodynamicGate,\n    postReleaseAerodynamicResult,\n    aeroApplicationEnabled,\n    aeroApplicationBodyIdText,\n    aeroApplicationSourceNoteText,\n    aeroApplicationVerificationText,\n  ]);\n\n  const aerodynamicForceApplicationPlan = useMemo<GenesisAerodynamicForceApplicationPlan | null>(() => {\n    if (\n      !aerodynamicForceApplicationGate?.canApply ||\n      aerodynamicForceApplicationGate.state !== "force_application_ready" ||\n      !postReleaseAerodynamicResult\n    ) {\n      return null;\n    }\n    try {\n      return createGenesisAerodynamicForceApplicationPlan(\n        aerodynamicForceApplicationGate,\n        postReleaseAerodynamicResult,\n      );\n    } catch {\n      return null;\n    }\n  }, [aerodynamicForceApplicationGate, postReleaseAerodynamicResult]);\n'''
    viewport = replace_once(
        viewport,
        aero_result_anchor,
        aero_application_logic,
        "aerodynamic result logic",
    )

    viewport = replace_once(
        viewport,
        '''    targetSourceNoteText,\n    targetVerificationText,\n  ].join("|");\n''',
        '''    targetSourceNoteText,\n    targetVerificationText,\n    aeroIntervalText,\n    aeroDensityText,\n    aeroRelativeXText,\n    aeroRelativeYText,\n    aeroRelativeZText,\n    aeroProjectedAreaText,\n    aeroDragCoefficientText,\n    aeroSourceNoteText,\n    aeroVerificationText,\n    aeroApplicationEnabled ? "enabled" : "disabled",\n    aeroApplicationBodyIdText,\n    aeroApplicationSourceNoteText,\n    aeroApplicationVerificationText,\n  ].join("|");\n''',
        "live evidence context key",
    )

    collision_handler_anchor = '''  const handlePanelCollisionEnter = (otherUserData: unknown) => {\n    if (!baseLiveEvidence) return;\n\n    const otherObjectId = resolveGenesisCollisionTargetObjectId(otherUserData, collisionTarget);\n    const sourceNote = otherObjectId\n      ? `Live Rapier onCollisionEnter callback from Genesis Panel 001 against declared collision target ${otherObjectId}. Collision observation only; no impact force, energy, damage, or contact-property claim.`\n      : "Live Rapier onCollisionEnter callback from Genesis Panel 001; the other collider was not resolved as the currently validated explicit Genesis collision target.";\n\n    setCollisionEvidenceState((current) => {\n      const startingSnapshot =\n        current.inputKey === liveEvidenceInputKey && current.snapshot\n          ? current.snapshot\n          : baseLiveEvidence;\n\n      try {\n        return {\n          inputKey: liveEvidenceInputKey,\n          snapshot: recordGenesisRapierCollisionEnter(startingSnapshot, {\n            panelId: "genesis-panel-001",\n            otherObjectId,\n            sourceNote,\n          }),\n        };\n      } catch {\n        return current;\n      }\n    });\n  };\n'''
    force_handler = collision_handler_anchor + '''\n  const handleAerodynamicForceStep = (evaluation: GenesisAerodynamicForceStepEvaluation) => {\n    if (!baseLiveEvidence || !aerodynamicForceApplicationPlan) return;\n\n    setCollisionEvidenceState((current) => {\n      const startingSnapshot =\n        current.inputKey === liveEvidenceInputKey && current.snapshot\n          ? current.snapshot\n          : baseLiveEvidence;\n\n      try {\n        return {\n          inputKey: liveEvidenceInputKey,\n          snapshot: recordGenesisAerodynamicForceApplication(startingSnapshot, {\n            bodyId: evaluation.bodyId,\n            state: evaluation.state,\n            elapsedSeconds: evaluation.elapsedSeconds,\n            physicsStepSeconds: evaluation.physicsStepSeconds,\n            activeDurationSeconds: evaluation.activeDurationSeconds,\n            activeFractionOfPhysicsStep: evaluation.activeFractionOfPhysicsStep,\n            effectiveForceN: evaluation.effectiveForceN,\n            expectedImpulseNs: evaluation.expectedImpulseNs,\n            sourceNote: `${aerodynamicForceApplicationPlan.provenance.sourceNote} Live fixed-step Rapier center-of-mass application observation; no aerodynamic torque, CFD authority, solver authority, or physical-test claim.`,\n          }),\n        };\n      } catch {\n        return current;\n      }\n    });\n  };\n'''
    viewport = replace_once(
        viewport,
        collision_handler_anchor,
        force_handler,
        "runtime evidence handlers",
    )

    viewport = replace_once(
        viewport,
        '''            dynamicsGate={dynamicsGate}\n            collisionTarget={collisionTarget}\n            onCollisionEnter={handlePanelCollisionEnter}\n''',
        '''            dynamicsGate={dynamicsGate}\n            collisionTarget={collisionTarget}\n            aerodynamicForcePlan={aerodynamicForceApplicationPlan}\n            runContextKey={liveEvidenceInputKey}\n            onCollisionEnter={handlePanelCollisionEnter}\n            onAerodynamicForceStep={handleAerodynamicForceStep}\n''',
        "scene live force props",
    )

    viewport = replace_once(
        viewport,
        '''              <select className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroVerificationText} onChange={(event) => setAeroVerificationText(event.target.value as TargetVerificationText)}>\n''',
        '''              <select aria-label="Aerodynamic verification state" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroVerificationText} onChange={(event) => setAeroVerificationText(event.target.value as TargetVerificationText)}>\n''',
        "aerodynamic verification select",
    )

    preview_anchor = '''                  <div className="pt-1 font-semibold text-amber-300">NOT APPLIED TO RAPIER — analytical evidence only</div>\n'''
    preview_replacement = '''                  <div className="pt-1 font-semibold text-amber-300">ANALYTICAL RESULT ONLY — live application still requires the explicit force-application gate below.</div>\n'''
    viewport = replace_once(
        viewport,
        preview_anchor,
        preview_replacement,
        "analytical preview disclaimer",
    )

    target_section_anchor = '''          <div className="mt-3 border-t border-slate-800 pt-2">\n            <div className="font-semibold text-purple-200">Collision target — explicit geometry/provenance only</div>\n'''
    application_ui = '''          <div className="mt-3 border-t border-slate-800 pt-2">\n            <div className="font-semibold text-cyan-200">Live aerodynamic force application — explicit opt-in</div>\n            <p className="mt-1 text-[10px] text-slate-500">Default is OFF. When ready, only the tested fixed-step scheduler output is applied at the rigid-body center of mass. Aerodynamic torque remains unmodeled.</p>\n            <label className="mt-2 flex items-center gap-2 text-slate-300">\n              <input aria-label="Enable post-release aerodynamic force" type="checkbox" checked={aeroApplicationEnabled} onChange={(event) => setAeroApplicationEnabled(event.target.checked)} />\n              Enable post-release aerodynamic force\n            </label>\n            <label className="mt-2 block text-slate-300">Force application body ID<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroApplicationBodyIdText} onChange={(event) => setAeroApplicationBodyIdText(event.target.value)} placeholder="required; must match aerodynamic body" /></label>\n            <label className="mt-2 block text-slate-300">Force application source note<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroApplicationSourceNoteText} onChange={(event) => setAeroApplicationSourceNoteText(event.target.value)} placeholder="required provenance" /></label>\n            <label className="mt-2 block text-slate-300">Force application verification state\n              <select aria-label="Force application verification state" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroApplicationVerificationText} onChange={(event) => setAeroApplicationVerificationText(event.target.value as TargetVerificationText)}>\n                <option value="">required; no default</option>\n                <option value="verified">verified</option>\n                <option value="provisional">provisional</option>\n                <option value="unverified">unverified</option>\n              </select>\n            </label>\n            <div className="mt-2 rounded border border-cyan-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">\n              <div>Force application gate: <strong>{aerodynamicForceApplicationGate?.state ?? "NOT EVALUATED"}</strong></div>\n              <div className="mt-1">Force application plan: <strong>{aerodynamicForceApplicationPlan ? "READY — LIVE COM FORCE" : "NONE"}</strong></div>\n              <div className="mt-1">Physics step: <strong>{GENESIS_RAPIER_FIXED_STEP_SECONDS.toFixed(6)} s fixed</strong></div>\n              <div className="mt-1">Aerodynamic torque: <strong>NOT MODELED</strong></div>\n              {aerodynamicForceApplicationGate && <div className="mt-1 text-slate-500">{aerodynamicForceApplicationGate.reason}</div>}\n            </div>\n          </div>\n\n''' + target_section_anchor
    viewport = replace_once(
        viewport,
        target_section_anchor,
        application_ui,
        "application UI insertion",
    )

    viewport_path.write_text(viewport)
    print("Viewport3D live aerodynamic force wiring applied.")
else:
    print("Viewport3D live aerodynamic force wiring already present.")


browser_path = Path("scripts/genesis-browser-acceptance.mjs")
browser = browser_path.read_text()

if "forceApplicationOptInDefaultBlocked" not in browser:
    browser = replace_once(
        browser,
        '''async function selectVerificationState(page, value) {\n''',
        '''async function selectAriaVerificationState(page, label, value) {\n  const locator = page.getByLabel(label, { exact: true });\n  if ((await locator.count()) !== 1) {\n    fail(`Expected exactly one select labeled ${label}; found ${await locator.count()}`);\n  }\n  await locator.selectOption(value);\n}\n\nasync function selectVerificationState(page, value) {\n''',
        "browser aria select helper",
    )

    old_fixture = '''  await fillLabel(page, "Gravity x", 0);\n  await fillLabel(page, "Gravity y", 0);\n  await fillLabel(page, "Gravity z", 0);\n  await fillLabel(page, "Initial linear velocity x", 1);\n  await fillLabel(page, "Initial linear velocity y", 0);\n  await fillLabel(page, "Initial linear velocity z", 0);\n  await fillLabel(page, "Initial angular velocity x", 0);\n  await fillLabel(page, "Initial angular velocity y", 0);\n  await fillLabel(page, "Initial angular velocity z", 0);\n\n  await fillLabel(page, "Target object ID", "synthetic-browser-target-001");\n  await fillLabel(page, "Target center x", 0.5);\n  await fillLabel(page, "Target center y", 0.5);\n  await fillLabel(page, "Target center z", 0);\n  await fillLabel(page, "Target box size x", 0.2);\n  await fillLabel(page, "Target box size y", 1);\n  await fillLabel(page, "Target box size z", 1);\n  await fillLabel(page, "Source note", "Synthetic browser-QA fixture only");\n  await selectVerificationState(page, "unverified");\n\n  await waitForBodyText(page, "Analytical state: THRESHOLD EXCEEDED");\n'''
    new_fixture = '''  await fillLabel(page, "Gravity x", 0);\n  await fillLabel(page, "Gravity y", 0);\n  await fillLabel(page, "Gravity z", 0);\n  // Keep one required linear-velocity component blank until every target/aero/application\n  // input is ready so the live simulation starts from one controlled context.\n  await fillLabel(page, "Initial linear velocity y", 0);\n  await fillLabel(page, "Initial linear velocity z", 0);\n  await fillLabel(page, "Initial angular velocity x", 0);\n  await fillLabel(page, "Initial angular velocity y", 0);\n  await fillLabel(page, "Initial angular velocity z", 0);\n\n  await fillLabel(page, "Target object ID", "synthetic-browser-target-001");\n  await fillLabel(page, "Target center x", 0.5);\n  await fillLabel(page, "Target center y", 0.5);\n  await fillLabel(page, "Target center z", 0);\n  await fillLabel(page, "Target box size x", 0.2);\n  await fillLabel(page, "Target box size y", 1);\n  await fillLabel(page, "Target box size z", 1);\n  await fillLabel(page, "Source note", "Synthetic browser-QA fixture only");\n  await selectVerificationState(page, "unverified");\n\n  await fillLabel(page, "Aero interval (s)", 0.025);\n  await fillLabel(page, "Aero air density (kg/m³)", 1);\n  await fillLabel(page, "Projected area (m²)", 1);\n  await fillLabel(page, "Drag coefficient Cd", 1);\n  await fillLabel(page, "Relative air velocity x", 0.2);\n  await fillLabel(page, "Relative air velocity y", 0);\n  await fillLabel(page, "Relative air velocity z", 0);\n  await fillLabel(page, "Aerodynamic source note", "Synthetic post-release aerodynamic browser fixture only");\n  await selectAriaVerificationState(page, "Aerodynamic verification state", "unverified");\n\n  await fillLabel(page, "Force application body ID", "genesis-panel-001");\n  await fillLabel(page, "Force application source note", "Synthetic live force-application browser fixture only");\n  await selectAriaVerificationState(page, "Force application verification state", "unverified");\n  await waitForBodyText(page, "Force application gate: blocked_not_enabled");\n  record.checks.forceApplicationOptInDefaultBlocked = true;\n\n  await page.getByLabel("Enable post-release aerodynamic force", { exact: true }).check();\n  await waitForBodyText(page, "Force application gate: blocked_dynamics_not_ready");\n  record.checks.forceApplicationStillBlockedBeforeDynamicsReady = true;\n\n  // Final required dynamics input activates the controlled live run.\n  await fillLabel(page, "Initial linear velocity x", 1);\n\n  await waitForBodyText(page, "Analytical state: THRESHOLD EXCEEDED");\n'''
    browser = replace_once(browser, old_fixture, new_fixture, "browser synthetic fixture")

    browser = replace_once(
        browser,
        '''  await waitForBodyText(page, "Collision target: synthetic-browser-target-001 — DECLARED");\n\n  record.checks.analyticalThresholdExceeded = true;\n''',
        '''  await waitForBodyText(page, "Collision target: synthetic-browser-target-001 — DECLARED");\n  await waitForBodyText(page, "Force application gate: force_application_ready");\n  await waitForBodyText(page, "Force application plan: READY — LIVE COM FORCE");\n\n  record.checks.analyticalThresholdExceeded = true;\n''',
        "browser force gate readiness",
    )

    browser = replace_once(
        browser,
        '''  record.checks.declaredTargetVisible = true;\n\n  await waitForBodyText(page, "collision_enter", 10000);\n''',
        '''  record.checks.declaredTargetVisible = true;\n  record.checks.forceApplicationReady = true;\n\n  await waitForBodyText(page, "aerodynamic_force_application", 10000);\n  await waitForBodyText(page, "state=active_full_step", 10000);\n  await waitForBodyText(page, "state=active_partial_step", 10000);\n  await waitForBodyText(page, "state=complete", 10000);\n  record.checks.forceApplicationActiveFullStepObserved = true;\n  record.checks.forceApplicationPartialTerminalStepObserved = true;\n  record.checks.forceApplicationCompleteObserved = true;\n\n  await waitForBodyText(page, "collision_enter", 10000);\n''',
        "browser force evidence observations",
    )

    browser = replace_once(
        browser,
        '''  if (!beforeResetText.includes("Collision-enter records are event observations only.")) {\n    fail("Evidence-boundary disclaimer is missing from the live ledger");\n  }\n''',
        '''  if (!beforeResetText.includes("Aerodynamic force-application records are RPE simulation observations")) {\n    fail("Aerodynamic force evidence-boundary disclaimer is missing from the live ledger");\n  }\n  if (!beforeResetText.includes("Collision-enter records likewise do not establish impact force")) {\n    fail("Collision evidence-boundary disclaimer is missing from the live ledger");\n  }\n''',
        "browser evidence boundary",
    )

    browser = replace_once(
        browser,
        '''  record.checks.staleCollisionClearedAfterInputChange = true;\n\n  await page.screenshot({ path: screenshotPath, fullPage: true });\n''',
        '''  record.checks.staleCollisionClearedAfterInputChange = true;\n\n  // Change a relevant force-application identity input to a blocked mismatch.\n  // This prevents a new application event and proves prior force evidence is not retained.\n  await fillLabel(page, "Force application body ID", "synthetic-mismatched-body");\n  await waitForBodyText(page, "Force application gate: blocked_body_mismatch");\n  await waitForBodyTextAbsent(page, "aerodynamic_force_application", 3000);\n  record.checks.staleForceApplicationEvidenceClearedAfterInputChange = true;\n\n  await page.screenshot({ path: screenshotPath, fullPage: true });\n''',
        "browser stale force evidence reset",
    )

    browser_path.write_text(browser)
    print("Genesis browser acceptance live aerodynamic force checks applied.")
else:
    print("Genesis browser acceptance live aerodynamic force checks already present.")
