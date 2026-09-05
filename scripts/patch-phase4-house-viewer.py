from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


path = Path("src/components/Viewport3D.tsx")
text = path.read_text()

if '"phase4_house"' in text:
    print("Phase 4 staged-house viewer already wired.")
    raise SystemExit(0)

text = replace_once(
    text,
    'import GenesisEventLedgerPanel from "@/components/GenesisEventLedgerPanel";\n',
    'import GenesisEventLedgerPanel from "@/components/GenesisEventLedgerPanel";\n'
    'import SmallHouseWindStageScene from "@/components/SmallHouseWindStageScene";\n'
    'import { SYNTHETIC_PHASE4_HOUSE } from "@/data/smallHouseWind/syntheticPhase4House";\n'
    'import { materializeSmallHouseWindStage } from "@/lib/smallHouseWind/systemContract";\n'
    'import type { SmallHouseWindStage } from "@/types/smallHouseWind";\n',
    "Phase 4 imports",
)

text = replace_once(
    text,
    'type ViewMode = "conceptual" | "genesis_null" | "genesis_panel";\n',
    'type ViewMode = "conceptual" | "genesis_null" | "genesis_panel" | "phase4_house";\n',
    "ViewMode",
)

text = replace_once(
    text,
    'const NULL_HOUSE_RESULT: GenesisNullHouseResult = {\n',
    'const PHASE4_STAGES: SmallHouseWindStage[] = [\n'
    '  "empty_envelope",\n'
    '  "primary_supports",\n'
    '  "floor_ring_frame",\n'
    '  "walls",\n'
    '  "roof",\n'
    '  "connections",\n'
    '  "bracing",\n'
    '  "anchorage",\n'
    '  "storm_protection",\n'
    '];\n\n'
    'const NULL_HOUSE_RESULT: GenesisNullHouseResult = {\n',
    "Phase 4 stages",
)

text = replace_once(
    text,
    '  const [viewMode, setViewMode] = useState<ViewMode>("conceptual");\n',
    '  const [viewMode, setViewMode] = useState<ViewMode>("conceptual");\n'
    '  const [phase4Stage, setPhase4Stage] = useState<SmallHouseWindStage>("empty_envelope");\n',
    "Phase 4 stage state",
)

text = replace_once(
    text,
    '  const liveEvidenceInputKey = [\n',
    '  const phase4Snapshot = useMemo(\n'
    '    () => materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, phase4Stage),\n'
    '    [phase4Stage],\n'
    '  );\n\n'
    '  const liveEvidenceInputKey = [\n',
    "Phase 4 snapshot",
)

canvas_anchor = '''        {viewMode === "genesis_panel" && panelGeometryReady && panelWidthM !== null && panelHeightM !== null ? (
          <GenesisPanelScene
            widthM={panelWidthM}
            heightM={panelHeightM}
            directionDegrees={smokeEnabled ? directionDegrees : null}
            experiment={panelExperiment}
            releaseGate={releaseGate}
            dynamicsGate={dynamicsGate}
            collisionTarget={collisionTarget}
            aerodynamicForcePlan={aerodynamicForceApplicationPlan}
            runContextKey={liveEvidenceInputKey}
            onCollisionEnter={handlePanelCollisionEnter}
            onAerodynamicForceStep={handleAerodynamicForceStep}
          />
        ) : viewMode === "genesis_panel" ? (
          <GenesisNullHouse directionDegrees={smokeEnabled ? directionDegrees : null} />
        ) : null}
'''
text = replace_once(
    text,
    canvas_anchor,
    canvas_anchor + '\n        {viewMode === "phase4_house" && <SmallHouseWindStageScene snapshot={phase4Snapshot} />}\n',
    "Phase 4 canvas scene",
)

text = replace_once(
    text,
    '          <button type="button" className="rounded border border-amber-700 px-2 py-1 text-xs" onClick={() => setViewMode("genesis_panel")}>Panel 001</button>\n',
    '          <button type="button" className="rounded border border-amber-700 px-2 py-1 text-xs" onClick={() => setViewMode("genesis_panel")}>Panel 001</button>\n'
    '          <button type="button" className="rounded border border-emerald-700 px-2 py-1 text-xs" onClick={() => setViewMode("phase4_house")}>Small House</button>\n',
    "Phase 4 view button",
)

text = replace_once(
    text,
    '          {viewMode === "genesis_panel" && "Genesis Test Chamber — analytical gate + explicit Rapier initial conditions"}\n',
    '          {viewMode === "genesis_panel" && "Genesis Test Chamber — analytical gate + explicit Rapier initial conditions"}\n'
    '          {viewMode === "phase4_house" && "Phase 4 Test Chamber — staged small-house topology review"}\n',
    "Phase 4 title",
)

panel_anchor = '''      {viewMode === "genesis_null" && (
        <div className="absolute top-4 right-4 w-64 rounded border border-slate-700 bg-slate-950/90 p-3 text-xs text-slate-200 shadow-lg">
'''
phase4_panel = '''      {viewMode === "phase4_house" && (
        <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] overflow-y-auto rounded border border-emerald-900 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-lg">
          <div className="font-semibold text-emerald-300">Phase 4 · Small House Wind System</div>
          <p className="mt-1 text-slate-400">Synthetic software-QA geometry only. This is not a Dignity production dimension set and does not establish structural capacity, code compliance, wind resistance, or material performance.</p>

          <label className="mt-3 block text-slate-300">Construction stage
            <select
              aria-label="Phase 4 stage"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
              value={phase4Stage}
              onChange={(event) => setPhase4Stage(event.target.value as SmallHouseWindStage)}
            >
              {PHASE4_STAGES.map((stage) => (
                <option key={stage} value={stage}>{stage.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>

          <div className="mt-3 rounded border border-slate-800 bg-slate-900/60 p-2">
            <div>Fixture: <strong>{SYNTHETIC_PHASE4_HOUSE.label}</strong></div>
            <div className="mt-1">Stage: <strong>{phase4Snapshot.stage}</strong></div>
            <div className="mt-1">Structural result: <strong>{phase4Snapshot.structuralResult}</strong></div>
            <div className="mt-1">Reason: <code>{phase4Snapshot.reason}</code></div>
            <div className="mt-1">Declared components: <strong>{phase4Snapshot.components.length}</strong></div>
            <div className="mt-1">Declared topology connections: <strong>{phase4Snapshot.connections.length}</strong></div>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-slate-200">Active component identities</div>
            {phase4Snapshot.components.length === 0 ? (
              <p className="mt-1 text-slate-500">No physical component exists in this stage. Envelope only.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {phase4Snapshot.components.map((component) => (
                  <div key={component.id} className="rounded border border-slate-800 bg-slate-900/55 p-2">
                    <div className="font-mono text-[10px] text-slate-200">{component.id}</div>
                    <div className="mt-1 text-[10px] text-slate-400">{component.kind} · stage={component.activationStage} · verification={component.verificationState}</div>
                    <div className="mt-1 text-[10px] text-slate-500">rotation(rad)=({component.rotationRad.x}, {component.rotationRad.y}, {component.rotationRad.z})</div>
                    <div className="mt-1 text-[10px] text-slate-500">material={component.materialId ?? "UNKNOWN"} · mass={component.massKg === null ? "UNKNOWN" : `${component.massKg} kg`}</div>
                    <div className="mt-1 text-[10px] text-slate-600">{component.sourceNote}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-slate-200">Active connection topology</div>
            <p className="mt-1 text-[10px] text-slate-500">Connections list object relationships only. No joint coordinate is declared yet, so RPE deliberately does not draw a physical connection line between member centers.</p>
            {phase4Snapshot.connections.length === 0 ? (
              <p className="mt-1 text-slate-500">No connection topology is active in this stage.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {phase4Snapshot.connections.map((connection) => (
                  <div key={connection.id} className="rounded border border-slate-800 bg-slate-900/55 p-2 text-[10px]">
                    <div className="font-mono text-slate-200">{connection.id}</div>
                    <div className="mt-1 text-slate-400">{connection.fromComponentId} → {connection.toComponentId}</div>
                    <div className="mt-1 text-slate-500">stage={connection.activationStage} · capacity={connection.capacityN === null ? "UNKNOWN" : `${connection.capacityN} N`} · verification={connection.verificationState}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">VISIBLE ≠ ADEQUATE. This viewer is topology/geometry QA only. Whole-house wind actions, stiffness, reactions, racking, uplift, sliding, failure, and debris are not claimed by this stage viewer.</p>
        </div>
      )}

'''
text = replace_once(
    text,
    panel_anchor,
    phase4_panel + panel_anchor,
    "Phase 4 review panel",
)

path.write_text(text)
print("Viewport3D Phase 4 staged-house viewer wiring applied.")
