import {
  GENESIS_SCHEMA_VERSION,
  type GenesisConnectionInput,
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
  };
}
