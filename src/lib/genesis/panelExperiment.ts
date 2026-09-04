import {
  GENESIS_SCHEMA_VERSION,
  type GenesisConnectionInput,
  type GenesisEvidenceEvent,
  type GenesisPanelExperimentResult,
  type GenesisRectangularPanelInput,
  type GenesisWindInput,
} from "../../types/genesis";
import {
  assessConnectionDemand,
  calculateAnalyticalPanelWind,
} from "./wind";

function requirePositive(name: string, value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite number greater than zero`);
  }
  return value;
}

export function calculateRectangularPanelAreaM2(
  widthM: number,
  heightM: number,
): number {
  return requirePositive("widthM", widthM) * requirePositive("heightM", heightM);
}

export function calculateGenesisPanelExperiment(
  wind: GenesisWindInput,
  panel: GenesisRectangularPanelInput,
  connection: GenesisConnectionInput,
): GenesisPanelExperimentResult {
  const exposedAreaM2 = calculateRectangularPanelAreaM2(
    panel.widthM,
    panel.heightM,
  );

  const windResult = calculateAnalyticalPanelWind(wind, {
    id: panel.id,
    exposedAreaM2,
    pressureCoefficient: panel.pressureCoefficient,
    sourceNote: panel.sourceNote,
    verificationState: panel.verificationState,
  });

  const connectionAssessment = assessConnectionDemand(
    windResult.panelForceN,
    connection,
  );

  const experimentState =
    connectionAssessment.state === "unverified"
      ? "unverified_connection"
      : connectionAssessment.state === "exceeded"
        ? "threshold_exceeded"
        : "within_capacity";

  return {
    schemaVersion: GENESIS_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    panel: {
      id: panel.id,
      widthM: panel.widthM,
      heightM: panel.heightM,
      exposedAreaM2,
      pressureCoefficient: panel.pressureCoefficient,
    },
    wind: windResult,
    connection: connectionAssessment,
    experimentState,
    provenance: {
      windSourceNote: wind.sourceNote,
      panelSourceNote: panel.sourceNote,
      connectionSourceNote: connection.sourceNote,
      windVerificationState: wind.verificationState,
      panelVerificationState: panel.verificationState,
      connectionVerificationState: connection.verificationState,
    },
  };
}

export function buildGenesisEvidenceLog(
  experiment: GenesisPanelExperimentResult,
): GenesisEvidenceEvent[] {
  const commonSources = [
    experiment.provenance.windSourceNote,
    experiment.provenance.panelSourceNote,
    experiment.provenance.connectionSourceNote,
  ];

  const connectionEventStatus =
    experiment.connection.state === "unverified"
      ? "unverified"
      : experiment.connection.state === "exceeded"
        ? "threshold_exceeded"
        : "within_capacity";

  const releaseEvent =
    experiment.connection.state === "exceeded"
      ? {
          status: "blocked" as const,
          message:
            "Analytical threshold exceeded. Mechanical release and debris are not simulated until the rigid-body physics gate is implemented.",
        }
      : experiment.connection.state === "within_capacity"
        ? {
            status: "not_triggered" as const,
            message:
              "Connection demand did not exceed the supplied capacity; release is not triggered by the analytical gate.",
          }
        : {
            status: "blocked" as const,
            message:
              "Connection capacity is unverified, so release/debris simulation is blocked rather than inferred.",
          };

  return [
    {
      sequence: 1,
      eventType: "wind_input",
      evidenceLayer: "rpe_analytical",
      status: "recorded",
      message: "Explicit wind and panel assumptions accepted for analytical evaluation.",
      values: {
        speedMps: experiment.wind.speedMps,
        directionDegrees: experiment.wind.assumptions.directionDegrees,
        airDensityKgPerM3: experiment.wind.assumptions.airDensityKgPerM3,
        exposedAreaM2: experiment.panel.exposedAreaM2,
        pressureCoefficient: experiment.panel.pressureCoefficient,
      },
      sourceNotes: commonSources,
    },
    {
      sequence: 2,
      eventType: "dynamic_pressure",
      evidenceLayer: "rpe_analytical",
      status: "recorded",
      message: "Dynamic pressure calculated from the explicit wind speed and air density.",
      values: {
        dynamicPressurePa: experiment.wind.dynamicPressurePa,
      },
      sourceNotes: [experiment.provenance.windSourceNote],
    },
    {
      sequence: 3,
      eventType: "panel_force",
      evidenceLayer: "rpe_analytical",
      status: "recorded",
      message: "Signed panel force calculated from q × A × C.",
      values: {
        panelForceN: experiment.wind.panelForceN,
      },
      sourceNotes: [
        experiment.provenance.windSourceNote,
        experiment.provenance.panelSourceNote,
      ],
    },
    {
      sequence: 4,
      eventType: "connection_assessment",
      evidenceLayer: "rpe_analytical",
      status: connectionEventStatus,
      message: "Equivalent connection demand compared with the supplied capacity, if any.",
      values: {
        demandN: experiment.connection.demandN,
        capacityN: experiment.connection.capacityN,
        state: experiment.connection.state,
      },
      sourceNotes: [experiment.provenance.connectionSourceNote],
    },
    {
      sequence: 5,
      eventType: "release_gate",
      evidenceLayer: "rpe_analytical",
      status: releaseEvent.status,
      message: releaseEvent.message,
      values: {
        experimentState: experiment.experimentState,
      },
      sourceNotes: commonSources,
    },
  ];
}
