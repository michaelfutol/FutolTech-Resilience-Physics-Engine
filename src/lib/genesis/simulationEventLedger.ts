import type {
  GenesisDebrisDynamicsGateResult,
  GenesisEvidenceEvent,
  GenesisRigidBodyGateResult,
} from "../../types/genesis";

export type GenesisSimulationEventType =
  | "rigid_body_release_gate"
  | "debris_dynamics_gate"
  | "simulation_activation"
  | "collision_enter";

export type GenesisSimulationEventStatus = "ready" | "blocked" | "active" | "recorded";

export interface GenesisCollisionRecord {
  panelId: string;
  otherObjectId: string | null;
  sourceNote: string;
}

export interface GenesisSimulationEvidenceEvent {
  sequence: number;
  eventType: GenesisSimulationEventType;
  evidenceLayer: "rpe_simulation";
  status: GenesisSimulationEventStatus;
  message: string;
  values: Record<string, number | string | null>;
  sourceNotes: string[];
}

export type GenesisOrderedEvidenceEvent = GenesisEvidenceEvent | GenesisSimulationEvidenceEvent;

function requireText(name: string, value: string): string {
  if (value.trim() === "") {
    throw new Error(`${name} must be non-empty`);
  }
  return value;
}

export function buildGenesisOrderedEventLedger(
  analyticalEvents: GenesisEvidenceEvent[],
  releaseGate: GenesisRigidBodyGateResult,
  dynamicsGate: GenesisDebrisDynamicsGateResult,
  collisions: GenesisCollisionRecord[] = [],
): GenesisOrderedEvidenceEvent[] {
  const ledger: GenesisOrderedEvidenceEvent[] = analyticalEvents.map((event) => ({ ...event }));
  let sequence = ledger.length + 1;

  ledger.push({
    sequence: sequence++,
    eventType: "rigid_body_release_gate",
    evidenceLayer: "rpe_simulation",
    status: releaseGate.canRelease ? "ready" : "blocked",
    message: releaseGate.reason,
    values: {
      state: releaseGate.state,
      massKg: releaseGate.massKg,
      demandN: releaseGate.demandN,
      capacityN: releaseGate.capacityN,
    },
    sourceNotes: [releaseGate.provenance.rigidBodySourceNote],
  });

  ledger.push({
    sequence: sequence++,
    eventType: "debris_dynamics_gate",
    evidenceLayer: "rpe_simulation",
    status: dynamicsGate.canSimulate ? "ready" : "blocked",
    message: dynamicsGate.reason,
    values: {
      state: dynamicsGate.state,
    },
    sourceNotes: [dynamicsGate.provenance.dynamicsSourceNote],
  });

  const activated = releaseGate.canRelease && dynamicsGate.canSimulate;
  ledger.push({
    sequence: sequence++,
    eventType: "simulation_activation",
    evidenceLayer: "rpe_simulation",
    status: activated ? "active" : "blocked",
    message: activated
      ? "Rapier rigid-body simulation is eligible to activate from explicit release and dynamics inputs."
      : "Rapier rigid-body simulation remains blocked by an upstream simulation gate.",
    values: {
      releaseState: releaseGate.state,
      dynamicsState: dynamicsGate.state,
    },
    sourceNotes: [
      releaseGate.provenance.rigidBodySourceNote,
      dynamicsGate.provenance.dynamicsSourceNote,
    ],
  });

  if (!activated && collisions.length > 0) {
    throw new Error("Cannot record a collision before simulation activation");
  }

  for (const collision of collisions) {
    ledger.push({
      sequence: sequence++,
      eventType: "collision_enter",
      evidenceLayer: "rpe_simulation",
      status: "recorded",
      message: "Rapier reported a collision-enter event. No impact force, energy, damage, or material response is inferred from this event alone.",
      values: {
        panelId: requireText("panelId", collision.panelId),
        otherObjectId: collision.otherObjectId,
      },
      sourceNotes: [requireText("sourceNote", collision.sourceNote)],
    });
  }

  return ledger;
}
