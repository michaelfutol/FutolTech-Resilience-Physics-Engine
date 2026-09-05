import type { GenesisVector3, GenesisVerificationState } from "./genesis";

export const SMALL_HOUSE_WIND_SCHEMA_VERSION = "0.1.0" as const;

export type SmallHouseWindStage =
  | "empty_envelope"
  | "primary_supports"
  | "floor_ring_frame"
  | "walls"
  | "roof"
  | "connections"
  | "bracing"
  | "anchorage"
  | "storm_protection";

export type SmallHouseStructuralComponentKind =
  | "primary_support"
  | "floor_ring_frame_member"
  | "wall_panel"
  | "roof_panel"
  | "brace"
  | "anchor"
  | "storm_protection_member";

export interface SmallHouseEnvelopeInput {
  id: string;
  centerM: GenesisVector3;
  sizeM: GenesisVector3;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseStructuralComponentInput {
  id: string;
  kind: SmallHouseStructuralComponentKind;
  activationStage: Exclude<SmallHouseWindStage, "empty_envelope" | "connections">;
  centerM: GenesisVector3;
  sizeM: GenesisVector3;
  materialId: string | null;
  massKg: number | null;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseConnectionInput {
  id: string;
  activationStage: Exclude<
    SmallHouseWindStage,
    "empty_envelope" | "primary_supports" | "floor_ring_frame" | "walls" | "roof"
  >;
  fromComponentId: string;
  toComponentId: string;
  capacityN: number | null;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseWindSpecimenInput {
  schemaVersion: typeof SMALL_HOUSE_WIND_SCHEMA_VERSION;
  id: string;
  label: string;
  envelope: SmallHouseEnvelopeInput;
  components: SmallHouseStructuralComponentInput[];
  connections: SmallHouseConnectionInput[];
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseWindStageSnapshot {
  schemaVersion: typeof SMALL_HOUSE_WIND_SCHEMA_VERSION;
  specimenId: string;
  stage: SmallHouseWindStage;
  envelope: SmallHouseEnvelopeInput;
  components: SmallHouseStructuralComponentInput[];
  connections: SmallHouseConnectionInput[];
  structuralResult: "N/A" | "DECLARED_COMPONENTS_ONLY";
  reason: "no_physical_specimen" | "physical_components_declared_no_performance_claim";
}
