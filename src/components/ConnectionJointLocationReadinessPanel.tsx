"use client";

import { useMemo, useState } from "react";

import { assessConnectionJointLocationReadiness } from "@/lib/smallHouseWind/connectionJointLocationReadiness";
import {
  CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION,
  type ConnectionJointLocationReadinessInput,
} from "@/types/connectionJointLocationReadiness";
import type { GenesisVerificationState } from "@/types/genesis";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

type VerificationText = "" | GenesisVerificationState;

function parseFinite(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ConnectionJointLocationReadinessPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const [connectionId, setConnectionId] = useState("");
  const [jointX, setJointX] = useState("");
  const [jointY, setJointY] = useState("");
  const [jointZ, setJointZ] = useState("");
  const [jointSource, setJointSource] = useState("");
  const [jointVerification, setJointVerification] = useState<VerificationText>("");
  const [sourceNote, setSourceNote] = useState("");
  const [verification, setVerification] = useState<VerificationText>("");

  const activeConnections = useMemo(() => snapshot.connections, [snapshot]);

  const result = useMemo(() => {
    if (
      connectionId.trim() === "" ||
      sourceNote.trim() === "" ||
      verification === ""
    ) {
      return null;
    }

    const allBlank =
      jointX.trim() === "" && jointY.trim() === "" && jointZ.trim() === "";
    const x = parseFinite(jointX);
    const y = parseFinite(jointY);
    const z = parseFinite(jointZ);
    const allCoordinatesReady = x !== null && y !== null && z !== null;

    if (!allBlank && !allCoordinatesReady) return null;
    if (
      allCoordinatesReady &&
      (jointSource.trim() === "" || jointVerification === "")
    ) {
      return null;
    }

    const normalizedJointVerification: GenesisVerificationState | null =
      allCoordinatesReady && jointVerification !== "" ? jointVerification : null;

    const input: ConnectionJointLocationReadinessInput = {
      schemaVersion: CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION,
      connectionId,
      jointPointM: allCoordinatesReady ? { x, y, z } : null,
      jointPointSourceNote: allCoordinatesReady ? jointSource : null,
      jointPointVerificationState: normalizedJointVerification,
      sourceNote,
      verificationState: verification,
    };

    try {
      return assessConnectionJointLocationReadiness(snapshot, input);
    } catch {
      return null;
    }
  }, [
    snapshot,
    connectionId,
    jointX,
    jointY,
    jointZ,
    jointSource,
    jointVerification,
    sourceNote,
    verification,
  ]);

  return (
    <div className="mt-4 border-t border-orange-950 pt-3">
      <div className="font-semibold text-orange-200">
        Connection joint-location readiness
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Topology known does not mean physical joint point known. RPE will not infer a midpoint, box intersection, nearest face, touching point, or center-to-center location. Connection mechanics remain unavailable in this gate.
      </p>

      <label className="mt-2 block text-slate-300">
        Active connection
        <select
          aria-label="Connection component relationship"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={connectionId}
          onChange={(event) => setConnectionId(event.target.value)}
        >
          <option value="">required; no default</option>
          {activeConnections.map((connection) => (
            <option key={connection.id} value={connection.id}>
              {connection.id}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-2 block text-slate-300">
        Readiness source note
        <input
          aria-label="Connection readiness source note"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={sourceNote}
          onChange={(event) => setSourceNote(event.target.value)}
          placeholder="required provenance for this review"
        />
      </label>
      <label className="mt-2 block text-slate-300">
        Readiness verification
        <select
          aria-label="Connection readiness verification"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={verification}
          onChange={(event) => setVerification(event.target.value as VerificationText)}
        >
          <option value="">required; no default</option>
          <option value="verified">verified</option>
          <option value="provisional">provisional</option>
          <option value="unverified">unverified</option>
        </select>
      </label>

      <div className="mt-3 rounded border border-orange-950 bg-slate-950/50 p-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-orange-300">
          Optional explicit global joint point — blank means UNKNOWN
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <label className="text-slate-300">
            X (m)
            <input aria-label="Connection joint X (m)" inputMode="decimal" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={jointX} onChange={(event) => setJointX(event.target.value)} placeholder="blank = unknown" />
          </label>
          <label className="text-slate-300">
            Y (m)
            <input aria-label="Connection joint Y (m)" inputMode="decimal" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={jointY} onChange={(event) => setJointY(event.target.value)} placeholder="blank = unknown" />
          </label>
          <label className="text-slate-300">
            Z (m)
            <input aria-label="Connection joint Z (m)" inputMode="decimal" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={jointZ} onChange={(event) => setJointZ(event.target.value)} placeholder="blank = unknown" />
          </label>
        </div>
        <label className="mt-2 block text-slate-300">
          Joint-point source note
          <input aria-label="Connection joint source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={jointSource} onChange={(event) => setJointSource(event.target.value)} placeholder="required only when X/Y/Z are supplied" />
        </label>
        <label className="mt-2 block text-slate-300">
          Joint-point verification
          <select aria-label="Connection joint verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={jointVerification} onChange={(event) => setJointVerification(event.target.value as VerificationText)}>
            <option value="">required only for supplied X/Y/Z</option>
            <option value="verified">verified</option>
            <option value="provisional">provisional</option>
            <option value="unverified">unverified</option>
          </select>
        </label>
      </div>

      <div className="mt-3 rounded border border-orange-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>Connection location state: <strong>{result?.state ?? "NOT EVALUATED"}</strong></div>
        <div className="mt-1">Structural result: <strong>{result?.structuralResult ?? "N/A"}</strong></div>
        <div>Connection mechanics: <strong>NO</strong></div>
        {result?.connection && (
          <>
            <div className="mt-2">Connection ID: <strong>{result.connection.id}</strong></div>
            <div>From component: <strong>{result.connection.fromComponentId}</strong></div>
            <div>To component: <strong>{result.connection.toComponentId}</strong></div>
            <div>Stored topology capacity: <strong>{result.connection.capacityN === null ? "UNKNOWN" : `${result.connection.capacityN} N`}</strong></div>
          </>
        )}
        <div className="mt-2">
          Physical global joint point: <strong>{result?.jointPointM ? `(${result.jointPointM.x}, ${result.jointPointM.y}, ${result.jointPointM.z}) m — CALLER DECLARED` : "UNKNOWN"}</strong>
        </div>
        <div>Coordinate basis: <strong>{result?.coordinateBasis ?? "UNKNOWN"}</strong></div>
        <div>Inferred joint point: <strong>NONE — PROHIBITED</strong></div>
        <div>Connector path / axis / shape / bearing area: <strong>UNKNOWN / NOT DEFINED</strong></div>
        <div>Stiffness / slip / fasteners / welds: <strong>UNKNOWN / NOT DEFINED</strong></div>
        <div>Demand / capacity assessment / utilization / PASS-FAIL / load transfer: <strong>UNKNOWN / NOT EVALUATED</strong></div>
        {result && <div className="mt-2 text-slate-500">{result.reason}</div>}
      </div>
    </div>
  );
}
