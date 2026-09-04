import {
  GENESIS_SCHEMA_VERSION,
  type GenesisPanelABComparisonResult,
  type GenesisPanelComparisonCaseInput,
  type GenesisWindInput,
} from "../../types/genesis";
import { calculateGenesisPanelExperiment } from "./panelExperiment";

function requireLabel(label: string, caseName: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    throw new Error(`${caseName} label cannot be empty`);
  }
  return trimmed;
}

export function compareGenesisPanelCases(
  sharedWind: GenesisWindInput,
  caseA: GenesisPanelComparisonCaseInput,
  caseB: GenesisPanelComparisonCaseInput,
): GenesisPanelABComparisonResult {
  const labelA = requireLabel(caseA.label, "Case A");
  const labelB = requireLabel(caseB.label, "Case B");

  const experimentA = calculateGenesisPanelExperiment(
    sharedWind,
    caseA.panel,
    caseA.connection,
  );
  const experimentB = calculateGenesisPanelExperiment(
    sharedWind,
    caseB.panel,
    caseB.connection,
  );

  const capacityDelta =
    experimentA.connection.capacityN === null ||
    experimentB.connection.capacityN === null
      ? null
      : experimentB.connection.capacityN - experimentA.connection.capacityN;

  return {
    schemaVersion: GENESIS_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    sharedWind: {
      speedKph: sharedWind.speedKph,
      speedMps: experimentA.wind.speedMps,
      directionDegrees: sharedWind.directionDegrees,
      airDensityKgPerM3: sharedWind.airDensityKgPerM3,
      sourceNote: sharedWind.sourceNote,
    },
    caseA: {
      label: labelA,
      experiment: experimentA,
    },
    caseB: {
      label: labelB,
      experiment: experimentB,
    },
    deltasBMinusA: {
      exposedAreaM2:
        experimentB.panel.exposedAreaM2 - experimentA.panel.exposedAreaM2,
      pressureCoefficient:
        experimentB.panel.pressureCoefficient -
        experimentA.panel.pressureCoefficient,
      panelForceN: experimentB.wind.panelForceN - experimentA.wind.panelForceN,
      demandN:
        experimentB.connection.demandN - experimentA.connection.demandN,
      capacityN: capacityDelta,
    },
  };
}
