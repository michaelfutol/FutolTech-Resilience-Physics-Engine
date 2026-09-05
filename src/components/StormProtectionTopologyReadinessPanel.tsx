"use client";

import { useMemo, useState } from "react";

import { assessStormProtectionTopologyReadiness } from "@/lib/smallHouseWind/stormProtectionTopologyReadiness";
import {
  STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION,
  type StormProtectionTopologyReadinessInput,
} from "@/types/stormProtectionTopologyReadiness";
import type { GenesisVerificationState } from "@/types/genesis";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

type VerificationText = "" | GenesisVerificationState;

export default function StormProtectionTopologyReadinessPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const [restraintMemberId, setRestraintMemberId] = useState("");
  const [endAConnectionId, setEndAConnectionId] = useState("");
  const [endBConnectionId, setEndBConnectionId] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [verification, setVerification] = useState<VerificationText>("");

  const activeRestraints = useMemo(
    () =>
      snapshot.components.filter(
        (component) => component.kind === "storm_protection_member",
      ),
    [snapshot],
  );

  const incidentConnections = useMemo(() => {
    if (restraintMemberId.trim() === "") return [];
    return snapshot.connections.filter(
      (connection) =>
        connection.fromComponentId === restraintMemberId ||
        connection.toComponentId === restraintMemberId,
    );
  }, [snapshot, restraintMemberId]);

  const result = useMemo(() => {
    if (
      restraintMemberId.trim() === "" ||
      sourceNote.trim() === "" ||
      verification === ""
    ) {
      return null;
    }

    const input: StormProtectionTopologyReadinessInput = {
      schemaVersion: STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION,
      restraintMemberId,
      endConnectionIds: [
        endAConnectionId.trim() === "" ? null : endAConnectionId,
        endBConnectionId.trim() === "" ? null : endBConnectionId,
      ],
      sourceNote,
      verificationState: verification,
    };

    try {
      return assessStormProtectionTopologyReadiness(snapshot, input);
    } catch {
      return null;
    }
  }, [
    snapshot,
    restraintMemberId,
    endAConnectionId,
    endBConnectionId,
    sourceNote,
    verification,
  ]);

  const handleRestraintChange = (nextId: string) => {
    setRestraintMemberId(nextId);
    setEndAConnectionId("");
    setEndBConnectionId("");
  };

  const endpointLabel = (index: 0 | 1) => {
    const component = result?.otherEndpointComponents[index];
    return component?.id ?? "UNKNOWN";
  };

  return (
    <div className="mt-4 border-t border-fuchsia-950 pt-3">
      <div className="font-semibold text-fuchsia-200">
        Storm Protection restraint topology readiness
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Visible strap ≠ complete restraint path. Two distinct explicit incident
        connection records to two distinct active opposite endpoint components
        are required for topology review. Rendered crossings, strap extent, or
        apparent touching never create an attachment point or missing end.
      </p>

      <label className="mt-2 block text-slate-300">
        Storm protection member
        <select
          aria-label="Storm protection member"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={restraintMemberId}
          onChange={(event) => handleRestraintChange(event.target.value)}
        >
          <option value="">required; no default</option>
          {activeRestraints.map((component) => (
            <option key={component.id} value={component.id}>
              {component.id}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-2 block text-slate-300">
        Explicit restraint End A connection
        <select
          aria-label="Storm restraint End A connection"
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

      <label className="mt-2 block text-slate-300">
        Explicit restraint End B connection
        <select
          aria-label="Storm restraint End B connection"
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

      <label className="mt-2 block text-slate-300">
        Readiness source note
        <input
          aria-label="Storm restraint readiness source note"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={sourceNote}
          onChange={(event) => setSourceNote(event.target.value)}
          placeholder="required provenance for this topology review"
        />
      </label>

      <label className="mt-2 block text-slate-300">
        Readiness verification
        <select
          aria-label="Storm restraint readiness verification"
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

      <div className="mt-3 rounded border border-fuchsia-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>
          Storm restraint topology state:{" "}
          <strong>{result?.state ?? "NOT EVALUATED"}</strong>
        </div>
        <div className="mt-1">
          Structural result: <strong>{result?.structuralResult ?? "N/A"}</strong>
        </div>
        <div>
          Storm protection mechanics: <strong>NO</strong>
        </div>
        <div className="mt-2">
          Explicit selected ends:{" "}
          <strong>{result?.topology.explicitSelectedEndCount ?? 0} / 2</strong>
        </div>
        <div>
          Explicit incident relationships:{" "}
          <strong>{result?.incidentConnections.length ?? 0}</strong>
        </div>

        {result?.restraintMember && (
          <>
            <div className="mt-2">
              Restraint member ID: <strong>{result.restraintMember.id}</strong>
            </div>
            <div>
              Restraint material:{" "}
              <strong>{result.restraintMember.materialId ?? "UNKNOWN"}</strong>
            </div>
            <div>
              Restraint mass:{" "}
              <strong>
                {result.restraintMember.massKg === null
                  ? "UNKNOWN"
                  : `${result.restraintMember.massKg} kg`}
              </strong>
            </div>
          </>
        )}

        <div className="mt-2">
          End A connection:{" "}
          <strong>{result?.selectedEndConnections[0]?.id ?? "UNKNOWN"}</strong>
        </div>
        <div>
          End A opposite component: <strong>{endpointLabel(0)}</strong>
        </div>
        <div>
          End B connection:{" "}
          <strong>{result?.selectedEndConnections[1]?.id ?? "UNKNOWN"}</strong>
        </div>
        <div>
          End B opposite component: <strong>{endpointLabel(1)}</strong>
        </div>
        <div>
          Physical attachment points: <strong>UNKNOWN / NOT DEFINED</strong>
        </div>
        <div>
          Inferred attachment points: <strong>NONE — PROHIBITED</strong>
        </div>
        <div>
          Tension / preload / stiffness / slack / elongation:{" "}
          <strong>UNKNOWN / NOT EVALUATED</strong>
        </div>
        <div>
          Wind-uplift demand / restraint force / load sharing:{" "}
          <strong>UNKNOWN / NOT EVALUATED</strong>
        </div>
        <div>
          Fasteners / attachments / member & connection capacity:{" "}
          <strong>UNKNOWN / NOT EVALUATED</strong>
        </div>
        <div>
          Utilization / PASS-FAIL / whole-house improvement:{" "}
          <strong>UNKNOWN / NOT EVALUATED</strong>
        </div>
        {result && <div className="mt-2 text-slate-500">{result.reason}</div>}
      </div>
    </div>
  );
}
