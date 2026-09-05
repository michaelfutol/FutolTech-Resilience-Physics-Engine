"use client";

import { useMemo } from "react";

import { calculateSmallHouseMultiSurfaceWindLoadSet } from "@/lib/smallHouseWind/multiSurfaceWindLoadSet";
import { calculateSmallHouseSurfaceWindAction } from "@/lib/smallHouseWind/surfaceWindAction";
import {
  SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,
  type SmallHouseMultiSurfaceWindLoadSetInput,
} from "@/types/smallHouseMultiSurfaceWindLoadSet";
import {
  SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  type SmallHouseSurfaceWindActionInput,
} from "@/types/smallHouseSurfaceWindAction";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

const QA_SURFACE_INPUT: SmallHouseSurfaceWindActionInput = {
  schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  surfaceComponentId: "synthetic-wall-north",
  surfaceNormalAxis: "local_z",
  airDensityKgPerM3: 1.2,
  windSpeedMps: 20,
  effectiveWindAreaM2: 5,
  signedPressureCoefficient: -0.8,
  globalActionDirection: { x: 0, y: 0, z: 2 },
  airDensitySourceNote: "Synthetic QA air-density input only",
  airDensityVerificationState: "unverified",
  windSpeedSourceNote: "Synthetic QA wind-speed input only",
  windSpeedVerificationState: "unverified",
  effectiveAreaSourceNote:
    "Synthetic QA effective-area input deliberately distinct from box-face area",
  effectiveAreaVerificationState: "unverified",
  coefficientSourceNote:
    "Synthetic QA signed coefficient only; not a code-derived pressure coefficient",
  coefficientVerificationState: "unverified",
  directionSourceNote: "Synthetic QA explicit global action direction only",
  directionVerificationState: "unverified",
  sourceNote: "Synthetic Phase 4 single-surface browser QA only",
  verificationState: "unverified",
};

const QA_EAST_SURFACE_INPUT: SmallHouseSurfaceWindActionInput = {
  schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  surfaceComponentId: "synthetic-wall-east",
  surfaceNormalAxis: "local_x",
  airDensityKgPerM3: 1.2,
  windSpeedMps: 20,
  effectiveWindAreaM2: 4,
  signedPressureCoefficient: 0.5,
  globalActionDirection: { x: 5, y: 0, z: 0 },
  airDensitySourceNote: "Synthetic QA east-wall air-density input only",
  airDensityVerificationState: "unverified",
  windSpeedSourceNote: "Synthetic QA east-wall wind-speed input only",
  windSpeedVerificationState: "unverified",
  effectiveAreaSourceNote: "Synthetic QA east-wall effective-area input only",
  effectiveAreaVerificationState: "unverified",
  coefficientSourceNote: "Synthetic QA east-wall signed coefficient only",
  coefficientVerificationState: "unverified",
  directionSourceNote: "Synthetic QA explicit east-wall global action direction only",
  directionVerificationState: "unverified",
  sourceNote: "Synthetic Phase 4 east-wall surface action for multi-surface browser QA only",
  verificationState: "unverified",
};

const QA_MULTI_SURFACE_INPUT: SmallHouseMultiSurfaceWindLoadSetInput = {
  schemaVersion: SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,
  surfaceActions: [QA_SURFACE_INPUT, QA_EAST_SURFACE_INPUT],
  sourceNote: "Synthetic Phase 4 two-wall vector aggregation browser QA only",
  verificationState: "unverified",
};

function scalar(value: number | null, decimals = 6): string {
  return value === null ? "N/A" : value.toFixed(decimals);
}

function vector(
  value: { x: number; y: number; z: number } | null,
  decimals = 3,
): string {
  if (!value) return "N/A";
  return `(${value.x.toFixed(decimals)}, ${value.y.toFixed(decimals)}, ${value.z.toFixed(decimals)})`;
}

export default function SmallHouseSurfaceWindActionPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const result = useMemo(
    () => calculateSmallHouseSurfaceWindAction(snapshot, QA_SURFACE_INPUT),
    [snapshot],
  );
  const multiSurfaceResult = useMemo(
    () => calculateSmallHouseMultiSurfaceWindLoadSet(snapshot, QA_MULTI_SURFACE_INPUT),
    [snapshot],
  );

  return (
    <div className="mt-4 border-t border-sky-950 pt-3">
      <div className="font-semibold text-sky-200">Analytical surface wind action</div>
      <div className="mt-1 rounded border border-sky-900/70 bg-sky-950/30 px-2 py-1 text-[10px] font-semibold tracking-wide text-sky-200">
        RPE_ANALYTICAL · NON-CFD · NON-CODE-COMPLIANCE
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Single-surface QA calculation only. Density, speed, effective area,
        signed coefficient, and global action direction are explicit inputs.
        Rendered geometry does not supply the effective area or force direction.
      </p>

      <div className="mt-3 rounded border border-sky-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>
          Surface action state: <strong>{result.state}</strong>
        </div>
        <div>
          Evidence layer: <strong>{result.evidenceLayer}</strong>
        </div>
        <div>
          Structural result: <strong>{result.structuralResult}</strong>
        </div>

        {result.state === "analytical_ready" ? (
          <>
            <div className="mt-3 font-semibold text-slate-200">Explicit QA inputs</div>
            <div>
              Surface ID: <strong>{result.surface?.id}</strong>
            </div>
            <div>
              Surface kind: <strong>{result.surface?.kind}</strong>
            </div>
            <div>
              Surface normal axis for geometry report: <strong>{result.surfaceNormalAxis}</strong>
            </div>
            <div>
              Geometry-only face area: <strong>{scalar(result.geometricFaceAreaM2)} m²</strong>
            </div>
            <div>
              Effective wind area A_eff: <strong>{scalar(result.effectiveWindAreaM2)} m²</strong>
            </div>
            <div>
              Air density ρ: <strong>{scalar(result.airDensityKgPerM3, 3)} kg/m³</strong>
            </div>
            <div>
              Wind speed V: <strong>{scalar(result.windSpeedMps, 3)} m/s</strong>
            </div>
            <div>
              Signed coefficient: <strong>{scalar(result.signedPressureCoefficient, 3)}</strong>
            </div>
            <div>
              Explicit direction input: <strong>{vector(QA_SURFACE_INPUT.globalActionDirection)}</strong>
            </div>
            <div>
              Normalized global action direction: <strong>{vector(result.normalizedGlobalActionDirection)}</strong>
            </div>

            <div className="mt-3 font-semibold text-slate-200">Transparent analytical result</div>
            <div>
              q = 0.5ρV²: <strong>{scalar(result.dynamicPressurePa, 3)} Pa</strong>
            </div>
            <div>
              Signed surface pressure qC: <strong>{scalar(result.signedSurfacePressurePa, 3)} Pa</strong>
            </div>
            <div>
              Scalar surface force qA_effC: <strong>{scalar(result.scalarSurfaceForceN, 3)} N</strong>
            </div>
            <div>
              Global force vector: <strong>{vector(result.globalForceVectorN)} N</strong>
            </div>

            <div className="mt-3 font-semibold text-slate-200">Downstream structural mechanics</div>
            <div>Connection demand: <strong>N/A</strong></div>
            <div>Connection capacity assessment: <strong>N/A</strong></div>
            <div>Support reactions: <strong>N/A</strong></div>
            <div>Uplift reaction: <strong>N/A</strong></div>
            <div>Sliding reaction: <strong>N/A</strong></div>
            <div>Racking indicator: <strong>N/A</strong></div>
            <div>PASS/FAIL: <strong>N/A</strong></div>

            <div className="mt-3 text-amber-300">
              Geometry-only area 7.140000 m² ≠ declared A_eff 5.000000 m².
              No Cp/code zone, CFD pressure, tributary load path, reaction, or
              structural adequacy is inferred.
            </div>
          </>
        ) : (
          <div className="mt-2 text-amber-300">
            Calculation unavailable at this stage. Future wall data is not read backward into the current snapshot.
          </div>
        )}

        <div className="mt-2 text-slate-500">{result.reason}</div>
      </div>

      <div className="mt-4 font-semibold text-cyan-200">Controlled multi-surface analytical load set</div>
      <div className="mt-1 rounded border border-cyan-900/70 bg-cyan-950/30 px-2 py-1 text-[10px] font-semibold tracking-wide text-cyan-200">
        RPE_ANALYTICAL · VECTOR ALGEBRA ONLY · NON-CFD · NON-CODE-COMPLIANCE
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Two unique explicit surface-action records are independently calculated by the accepted single-surface contract, then only their global force vectors are algebraically summed. No force application point or structural load path is defined here.
      </p>

      <div className="mt-3 rounded border border-cyan-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>
          Multi-surface load-set state: <strong>{multiSurfaceResult.state}</strong>
        </div>
        <div>
          Evidence layer: <strong>{multiSurfaceResult.evidenceLayer}</strong>
        </div>
        <div>
          Structural result: <strong>{multiSurfaceResult.structuralResult}</strong>
        </div>

        {multiSurfaceResult.state === "analytical_ready" ? (
          <>
            <div className="mt-3 font-semibold text-slate-200">Canonical stable-ID surface results</div>
            {multiSurfaceResult.surfaceResults.map((surfaceResult) => (
              <div key={surfaceResult.surface?.id ?? "unknown"} className="mt-2 rounded border border-slate-800 bg-slate-950/40 p-2">
                <div>
                  Load-set surface ID: <strong>{surfaceResult.surface?.id}</strong>
                </div>
                <div>
                  Effective area: <strong>{scalar(surfaceResult.effectiveWindAreaM2)} m²</strong>
                </div>
                <div>
                  Signed coefficient: <strong>{scalar(surfaceResult.signedPressureCoefficient, 3)}</strong>
                </div>
                <div>
                  Surface global force vector: <strong>{vector(surfaceResult.globalForceVectorN)} N</strong>
                </div>
              </div>
            ))}

            <div className="mt-3 font-semibold text-slate-200">Pure vector aggregation</div>
            <div>
              Algebraic global force-vector sum: <strong>{vector(multiSurfaceResult.globalForceVectorSumN)} N</strong>
            </div>
            <div>
              Resultant vector magnitude: <strong>{scalar(multiSurfaceResult.resultantForceMagnitudeN, 3)} N</strong>
            </div>

            <div className="mt-3 font-semibold text-slate-200">Structural interpretation deliberately unavailable</div>
            <div>REACTION: <strong>N/A</strong></div>
            <div>BASE SHEAR: <strong>N/A</strong></div>
            <div>UPLIFT REACTION: <strong>N/A</strong></div>
            <div>SLIDING REACTION: <strong>N/A</strong></div>
            <div>RACKING DEMAND: <strong>N/A</strong></div>
            <div>CONNECTION DEMAND: <strong>N/A</strong></div>
            <div>MOMENT/TORQUE: <strong>N/A</strong></div>
            <div>LOAD-PATH DISTRIBUTION: <strong>N/A</strong></div>
            <div>PASS/FAIL: <strong>N/A</strong></div>

            <div className="mt-3 font-semibold text-amber-300">
              VECTOR SUM ≠ REACTION / BASE SHEAR / STRUCTURAL DEMAND. No moment is calculated because no explicit force-application points or reference point exist in this contract.
            </div>
          </>
        ) : (
          <div className="mt-2 text-amber-300">
            Multi-surface aggregation unavailable at this stage. No partial vector sum is retained when an individual surface action is blocked.
          </div>
        )}

        <div className="mt-2 text-slate-500">{multiSurfaceResult.reason}</div>
      </div>
    </div>
  );
}
