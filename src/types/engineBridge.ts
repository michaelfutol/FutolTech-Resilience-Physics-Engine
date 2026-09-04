export type RpeEngineId =
  | "rpe-browser"
  | "rapier"
  | "project-chrono"
  | "opensees"
  | "calculix"
  | "openfoam"
  | "blender"
  | "unreal";

export type RpeBridgeRole =
  | "interactive_viewer"
  | "rigid_body"
  | "structural_solver"
  | "finite_element_solver"
  | "cfd_solver"
  | "bim_authoring"
  | "content_renderer"
  | "immersive_visualization";

export interface RpeBridgeCoordinateSystem {
  lengthUnit: "m" | "mm";
  upAxis: "Y" | "Z";
  handedness: "left" | "right";
}

export interface RpeBridgeObjectRef {
  rpeObjectId: string;
  sourceBimGuid: string | null;
  objectType: string;
  materialIds: string[];
  assemblyId: string | null;
  geometryAssetRef: string | null;
  geometryHash: string | null;
}

export interface RpeBridgeResultRef {
  id: string;
  kind:
    | "displacement"
    | "stress"
    | "strain"
    | "pressure"
    | "velocity"
    | "reaction"
    | "failure_state"
    | "damage_state"
    | "custom";
  sourceEngine: RpeEngineId;
  sourceEngineVersion: string;
  assetRef: string;
  assetHash: string;
  units: string;
  verificationStatus: "unverified" | "provisional" | "verified";
}

export interface RpeEngineBridgeManifest {
  schemaVersion: "1.0";
  specimenId: string;
  parentSpecimenId: string | null;
  exportedAtIso: string;
  sourceEngine: RpeEngineId;
  sourceEngineVersion: string;
  roles: RpeBridgeRole[];
  coordinateSystem: RpeBridgeCoordinateSystem;
  objects: RpeBridgeObjectRef[];
  results: RpeBridgeResultRef[];
  limitations: string[];
  provenanceNotes: string[];
}
