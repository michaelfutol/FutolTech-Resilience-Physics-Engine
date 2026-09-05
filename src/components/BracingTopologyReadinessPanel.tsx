"use client";

import { useMemo, useState } from "react";

import { assessBracingTopologyReadiness } from "@/lib/smallHouseWind/bracingTopologyReadiness";
import {
  BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION,
  type BracingTopologyReadinessInput,
} from "@/types/bracingTopologyReadiness";
import type { GenesisVerificationState } from "@/types/genesis";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

type VerificationText = "" | GenesisVerificationState;

export default function BracingTopologyReadinessPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const [braceId, setBraceId] = useState("");
  const [endAConnectionId, setEndAConnectionId] = useState("");
  const [endBConnectionId, setEndBConnectionId] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [verification, setVerification] = useState<VerificationText>("");

  const activeBraces = useMemo(
    () => snapshot.components.filter((component) => component.kind === "brace"),
    [snapshot],
  );

  const incidentConnections = useMemo(() => {
    if (braceId.trim() === "") return [];
    return snapshot.connections.filter(
      (connection) =>
        connection.fromComponentId === braceId ||
        connection.toComponentId === braceId,
    );
  }, [snapshot, braceId]);

  const result = useMemo(() => {
    if (
      braceId.trim() === "" ||
      sourceNote.trim() === "" ||
      verification === ""
    ) {
      return null;
    }

    const input: BracingTopologyReadinessInput = {
      schemaVersion: BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION,
      braceId,
      endConnectionIds: [
        endAConnectionId.trim() === "" ? null : endAConnectionId,
        endBConnectionId.trim() === "" ? null : endBConnectionId,
      ],
      sourceNote,
      verificationState: verification,
    };

    try {
      return assessBracingTopologyReadiness(snapshot, input);
    } catch {
      return null;
    }
  }, [
    snapshot,
    braceId,
    endAConnectionId,
    endBConnectionId,
    sourceNote,
    verification,
  ]);

  const handleBraceChange = (nextBraceId: string) => {
    setBraceId(nextBraceId);
    setEndAConnectionId("");
    setEndBConnectionId("");
  };

  return (
    <div className="mt-4 border-t border-violet-950 pt-3">
      <div className="font-semibold text-violet-200">
        Bracing topology readiness
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Visible diagonal ≠ complete bracing load path. Two distinct explicit
        connection records are required before RPE can review a brace as a
        two-ended topology relationship. No joint point, stiffness, force,
        buckling, racking contribution, capacity, or adequacy is inferred here.
      </p>

      <label className="mt-2 block text-slate-300">
        Active brace
        <select
          aria-label="Bracing component"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={braceId}
          onChange={(event) => handleBraceChange(event.target.value)}
        >
          <option value="">required; no default</option>
          {activeBraces.map((brace) => (
            <option key={brace.id} value={brace.id}>
              {brace.id}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block text-slate-300">
          Explicit end A connection
          <select
            aria-label="Bracing end A connection"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={endAConnectionId}
            onChange={(event) => setEndAConnectionId(event.target.value)}
          >
            <option value="">UNKNOWN / not declared</option>
            {incidentConnections.map((connection) => (
              <option key={connection.id} value={connection.id}>
                {connection.id}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-slate-300">
          Explicit end B connection
          <select
            aria-label="Bracing end B connection"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={endBConnectionId}
            onChange={(event) => setEndBConnectionId(event.target.value)}
          >
            <option value="">UNKNOWN / not declared</option>
            {incidentConnections.map((connection) => (
              <option key={connection.id} value={connection.id}>
                {connection.id}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-2 block text-slate-300">
        Readiness source note
        <input
          aria-label="Bracing readiness source note"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={sourceNote}
          onChange={(event) => setSourceNote(event.target.value)}
          placeholder="required provenance for this review"
        />
      </label>

      <label className="mt-2 block text-slate-300">
        Readiness verification
        <select
          aria-label="Bracing readiness verification"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={verification}
          onChange={(event) =>
            setVerification(event.target.value as VerificationText)
          }
        >
          <option value="">required; no default</option>
          <option value="verified">verified</option>
          <option value="provisional">provisional</option>
          <option value="unverified">unverified</option>
        </select>
      </label>

      <div className="mt-3 rounded border border-violet-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>
          Bracing topology state: <strong>{result?.state ?? "NOT EVALUATED"}</strong>
        </div>
        <div className="mt-1">
          Structural result: <strong>{result?.structuralResult ?? "N/A"}</strong>
        </div>
        <div>
          Bracing mechanics: <strong>NO</strong>
        </div>
        {result?.brace && (
          <>
            <div className="mt-2">
              Brace ID: <strong>{result.brace.id}</strong>
            </div>
            <div>
              Brace material: <strong>{result.brace.materialId ?? "UNKNOWN"}</strong>
            </div>
            <div>
              Brace mass: <strong>{result.brace.massKg === null ? "UNKNOWN" : `${result.brace.massKg} kg`}</strong>
            </div>
          </>
        )}
        <div className="mt-2">
          Explicit incident connections: <strong>{result?.incidentConnections.length ?? incidentConnections.length}</strong>
        </div>
        <div>
          Explicit selected brace ends: <strong>{result?.topology.explicitSelectedEndCount ?? 0} / 2</strong>
        </div>
        <div>
          End A: <strong>{result?.selectedEndConnections[0]?.id ?? "UNKNOWN"}</strong>
        </div>
        <div>
          End B: <strong>{result?.selectedEndConnections[1]?.id ?? "UNKNOWN"}</strong>
        </div>
        <div>
          Opposite endpoint A: <strong>{result?.otherEndpointComponents[0]?.id ?? "UNKNOWN"}</strong>
        </div>
        <div>
          Opposite endpoint B: <strong>{result?.otherEndpointComponents[1]?.id ?? "UNKNOWN"}</strong>
        </div>
        <div>
          Physical joint locations: <strong>UNKNOWN / NOT REVIEWED IN THIS GATE</strong>
        </div>
        <div>
          Inferred joint locations: <strong>NONE — PROHIBITED</strong>
        </div>
        <div>
          Axial force / tension-compression / stiffness / effective length / slenderness / buckling: <strong>UNKNOWN / NOT EVALUATED</strong>
        </div>
        <div>
          Racking contribution / demand / capacity / utilization / PASS-FAIL / load-path adequacy: <strong>UNKNOWN / NOT EVALUATED</strong>
        </div>
        {result && (
          <div className="mt-2 text-slate-500">{result.reason}</div>
        )}
      </div>
    </div>
  );
}
