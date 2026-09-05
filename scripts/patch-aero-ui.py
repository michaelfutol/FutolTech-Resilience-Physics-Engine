from pathlib import Path

path = Path("src/components/Viewport3D.tsx")
text = path.read_text()

if "postReleaseAerodynamicGate" in text:
    print("Aerodynamic UI already patched; no changes needed.")
    raise SystemExit(0)


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    text = text.replace(old, new, 1)


replace_once(
    'import { assessGenesisDebrisDynamicsGate } from "@/lib/genesis/debrisDynamicsGate";\n',
    'import { assessGenesisDebrisDynamicsGate } from "@/lib/genesis/debrisDynamicsGate";\n'
    'import {\n'
    '  assessGenesisPostReleaseAerodynamicGate,\n'
    '  calculateGenesisPostReleaseAerodynamics,\n'
    '} from "@/lib/genesis/postReleaseAerodynamics";\n',
    "aerodynamics import",
)

replace_once(
    '  const [targetVerificationText, setTargetVerificationText] = useState<TargetVerificationText>("");\n',
    '  const [targetVerificationText, setTargetVerificationText] = useState<TargetVerificationText>("");\n'
    '  const [aeroIntervalText, setAeroIntervalText] = useState("");\n'
    '  const [aeroDensityText, setAeroDensityText] = useState("");\n'
    '  const [aeroRelativeXText, setAeroRelativeXText] = useState("");\n'
    '  const [aeroRelativeYText, setAeroRelativeYText] = useState("");\n'
    '  const [aeroRelativeZText, setAeroRelativeZText] = useState("");\n'
    '  const [aeroProjectedAreaText, setAeroProjectedAreaText] = useState("");\n'
    '  const [aeroDragCoefficientText, setAeroDragCoefficientText] = useState("");\n'
    '  const [aeroSourceNoteText, setAeroSourceNoteText] = useState("");\n'
    '  const [aeroVerificationText, setAeroVerificationText] = useState<TargetVerificationText>("");\n',
    "aerodynamics state",
)

replace_once(
    '  const targetSizeM = parseVector3(targetSizeXText, targetSizeYText, targetSizeZText);\n',
    '  const targetSizeM = parseVector3(targetSizeXText, targetSizeYText, targetSizeZText);\n'
    '  const aeroIntervalSeconds = parseInputNumber(aeroIntervalText);\n'
    '  const aeroDensityKgPerM3 = parseInputNumber(aeroDensityText);\n'
    '  const aeroRelativeAirVelocityMps = parseVector3(aeroRelativeXText, aeroRelativeYText, aeroRelativeZText);\n'
    '  const aeroProjectedAreaM2 = parseInputNumber(aeroProjectedAreaText);\n'
    '  const aeroDragCoefficient = parseInputNumber(aeroDragCoefficientText);\n',
    "aerodynamics parsing",
)

dynamics_anchor = '''  const dynamicsGate = useMemo<GenesisDebrisDynamicsGateResult | null>(() => {
    if (!releaseGate) return null;
    try {
      return assessGenesisDebrisDynamicsGate(releaseGate, {
        gravityMps2,
        initialLinearVelocityMps,
        initialAngularVelocityRadPerSec,
        sourceNote: "Interactive Genesis Panel 001 debris-dynamics input",
        verificationState: "unverified",
      });
    } catch {
      return null;
    }
  }, [releaseGate, gravityMps2, initialLinearVelocityMps, initialAngularVelocityRadPerSec]);
'''

aero_logic = dynamics_anchor + '''
  const postReleaseAerodynamicGate = useMemo(() => {
    if (!dynamicsGate || aeroVerificationText === "") return null;
    try {
      return assessGenesisPostReleaseAerodynamicGate(dynamicsGate, {
        bodyId: "genesis-panel-001",
        intervalSeconds: aeroIntervalText.trim() === "" ? null : aeroIntervalSeconds,
        airDensityKgPerM3: aeroDensityText.trim() === "" ? null : aeroDensityKgPerM3,
        relativeAirVelocityMps: aeroRelativeAirVelocityMps,
        projectedAreaM2: aeroProjectedAreaText.trim() === "" ? null : aeroProjectedAreaM2,
        dragCoefficient: aeroDragCoefficientText.trim() === "" ? null : aeroDragCoefficient,
        sourceNote: aeroSourceNoteText,
        verificationState: aeroVerificationText,
      });
    } catch {
      return null;
    }
  }, [
    dynamicsGate,
    aeroIntervalText,
    aeroIntervalSeconds,
    aeroDensityText,
    aeroDensityKgPerM3,
    aeroRelativeAirVelocityMps,
    aeroProjectedAreaText,
    aeroProjectedAreaM2,
    aeroDragCoefficientText,
    aeroDragCoefficient,
    aeroSourceNoteText,
    aeroVerificationText,
  ]);

  const postReleaseAerodynamicResult = useMemo(() => {
    if (!postReleaseAerodynamicGate?.canCalculate || postReleaseAerodynamicGate.state !== "aerodynamic_ready") {
      return null;
    }
    try {
      return calculateGenesisPostReleaseAerodynamics(postReleaseAerodynamicGate);
    } catch {
      return null;
    }
  }, [postReleaseAerodynamicGate]);
'''

replace_once(dynamics_anchor, aero_logic, "dynamics gate")

ui_anchor = '''          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-purple-200">Collision target — explicit geometry/provenance only</div>
'''

aero_ui = '''          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-sky-200">Post-release aerodynamics — analytical preview only</div>
            <p className="mt-1 text-[10px] text-slate-500">This simplified quasi-steady drag result is NOT applied to Rapier yet. Post-release density, relative airflow, projected area, Cd, and integration interval are entered separately; no pre-release panel force is reused as an impulse.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block text-slate-300">Aero interval (s)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={aeroIntervalText} onChange={(event) => setAeroIntervalText(event.target.value)} placeholder="required; > 0" /></label>
              <label className="block text-slate-300">Aero air density (kg/m³)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={aeroDensityText} onChange={(event) => setAeroDensityText(event.target.value)} placeholder="required; no inheritance" /></label>
              <label className="block text-slate-300">Projected area (m²)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={aeroProjectedAreaText} onChange={(event) => setAeroProjectedAreaText(event.target.value)} placeholder="required; current state" /></label>
              <label className="block text-slate-300">Drag coefficient Cd<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={aeroDragCoefficientText} onChange={(event) => setAeroDragCoefficientText(event.target.value)} placeholder="required; caller supplied" /></label>
            </div>
            <VectorInputs label="Relative air velocity" unit="m/s" values={[aeroRelativeXText, aeroRelativeYText, aeroRelativeZText]} setters={[setAeroRelativeXText, setAeroRelativeYText, setAeroRelativeZText]} />
            <label className="mt-2 block text-slate-300">Aerodynamic source note<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroSourceNoteText} onChange={(event) => setAeroSourceNoteText(event.target.value)} placeholder="required provenance" /></label>
            <label className="mt-2 block text-slate-300">Aerodynamic verification state
              <select className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroVerificationText} onChange={(event) => setAeroVerificationText(event.target.value as TargetVerificationText)}>
                <option value="">required; no default</option>
                <option value="verified">verified</option>
                <option value="provisional">provisional</option>
                <option value="unverified">unverified</option>
              </select>
            </label>
            <div className="mt-2 rounded border border-sky-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
              <div>Aerodynamic gate: <strong>{postReleaseAerodynamicGate?.state ?? "NOT EVALUATED"}</strong></div>
              {postReleaseAerodynamicGate && <div className="mt-1 text-slate-500">{postReleaseAerodynamicGate.reason}</div>}
              {postReleaseAerodynamicResult && (
                <div className="mt-2 space-y-1">
                  <div>Relative air speed: <strong>{postReleaseAerodynamicResult.relativeAirSpeedMps.toFixed(4)} m/s</strong></div>
                  <div>Dynamic pressure: <strong>{postReleaseAerodynamicResult.dynamicPressurePa.toFixed(2)} Pa</strong></div>
                  <div>Drag magnitude: <strong>{postReleaseAerodynamicResult.dragForceMagnitudeN.toFixed(2)} N</strong></div>
                  <div>Drag vector: <strong>({postReleaseAerodynamicResult.dragForceN.x.toFixed(2)}, {postReleaseAerodynamicResult.dragForceN.y.toFixed(2)}, {postReleaseAerodynamicResult.dragForceN.z.toFixed(2)}) N</strong></div>
                  <div>Constant-force FΔt: <strong>({postReleaseAerodynamicResult.constantForceImpulseNs.x.toFixed(2)}, {postReleaseAerodynamicResult.constantForceImpulseNs.y.toFixed(2)}, {postReleaseAerodynamicResult.constantForceImpulseNs.z.toFixed(2)}) N·s</strong></div>
                  <div className="pt-1 font-semibold text-amber-300">NOT APPLIED TO RAPIER — analytical evidence only</div>
                </div>
              )}
            </div>
          </div>

''' + ui_anchor

replace_once(ui_anchor, aero_ui, "collision target UI")

path.write_text(text)
print("Viewport3D.tsx aerodynamic preview patch applied.")
