"use client";

import { useMemo } from "react";

import { calculateSmallHouseSurfaceWindAction } from "@/lib/smallHouseWind/surfaceWindAction";
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
    </div>
  );
}
