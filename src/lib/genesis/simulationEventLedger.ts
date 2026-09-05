import type {
  GenesisDebrisDynamicsGateResult,
  GenesisEvidenceEvent,
  GenesisRigidBodyGateResult,
  GenesisVector3,
} from "../../types/genesis";
import type { GenesisAerodynamicForceStepState } from "./aerodynamicForceWindow";

export type GenesisSimulationEventType =
  | "rigid_body_release_gate"
  | "debris_dynamics_gate"
  | "simulation_activation"
  | "aerodynamic_force_application"
  | "collision_enter";

export type GenesisSimulationEventStatus =
  | "ready"
  | "blocked"
  | "active"
  | "recorded"
  | "complete";

export interface GenesisCollisionRecord {
  panelId: string;
  otherObjectId: string | null;
  sourceNote: string;
}

export interface GenesisAerodynamicForceApplicationRecord {
  bodyId: string;
  state: GenesisAerodynamicForceStepState;
  elapsedSeconds: number;
  physicsStepSeconds: number;
  activeDurationSeconds: number;
  activeFractionOfPhysicsStep: number;
  effectiveForceN: GenesisVector3 | null;
  expectedImpulseNs: GenesisVector3;
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

function forceApplicationStatus(
  state: GenesisAerodynamicForceStepState,
): GenesisSimulationEventStatus {
  if (state === "active_full_step" || state === "active_partial_step") return "active";
  if (state === "complete") return "complete";
  return "recorded";
}

export function buildGenesisOrderedEventLedger(
  analyticalEvents: GenesisEvidenceEvent[],
  releaseGate: GenesisRigidBodyGateResult,
  dynamicsGate: GenesisDebrisDynamicsGateResult,
  collisions: GenesisCollisionRecord[] = [],
  aerodynamicForceApplications: GenesisAerodynamicForceApplicationRecord[] = [],
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

  if (!activated && (collisions.length > 0 || aerodynamicForceApplications.length > 0)) {
    throw new Error("Cannot record live simulation observations before simulation activation");
  }

  for (const application of aerodynamicForceApplications) {
    ledger.push({
      sequence: sequence++,
      eventType: "aerodynamic_force_application",
      evidenceLayer: "rpe_simulation",
      status: forceApplicationStatus(application.state),
      message:
        application.state === "active_partial_step"
          ? "Rapier center-of-mass aerodynamic force is active for only part of this fixed physics step; effective force is scaled to preserve the declared active-duration impulse."
          : application.state === "active_full_step"
            ? "Rapier center-of-mass aerodynamic force is active for the complete fixed physics step."
            : application.state === "complete"
              ? "The declared post-release aerodynamic force window is complete; no further aerodynamic force is applied."
              : "The declared post-release aerodynamic force window has not started; no aerodynamic force is applied.",
      values: {
        bodyId: requireText("bodyId", application.bodyId),
        state: application.state,
        elapsedSeconds: application.elapsedSeconds,
        physicsStepSeconds: application.physicsStepSeconds,
        activeDurationSeconds: application.activeDurationSeconds,
        activeFractionOfPhysicsStep: application.activeFractionOfPhysicsStep,
        effectiveForceX_N: application.effectiveForceN?.x ?? null,
        effectiveForceY_N: application.effectiveForceN?.y ?? null,
        effectiveForceZ_N: application.effectiveForceN?.z ?? null,
        expectedImpulseX_Ns: application.expectedImpulseNs.x,
        expectedImpulseY_Ns: application.expectedImpulseNs.y,
        expectedImpulseZ_Ns: application.expectedImpulseNs.z,
      },
      sourceNotes: [requireText("sourceNote", application.sourceNote)],
    });
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
