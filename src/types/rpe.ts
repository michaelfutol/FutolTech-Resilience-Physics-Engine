export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  dimensions?: string;
  engineeringProperties: {
    yieldStrengthMPa: number | null;
    tensileStrengthMPa: number | null;
    upliftResistanceKN: number | null;
    densityKgM3: number | null;
  };
}

export interface AssemblyComponent {
  productId: string;
  quantity: number;
  unit: string;
  wastePercent: number;
  role: string;
  installationNotes?: string;
}

export type AssemblyCategory =
  | "frame"
  | "wall"
  | "cladding"
  | "roof"
  | "floor"
  | "opening_protection"
  | "vent"
  | "connection"
  | "restraint"
  | "bracing";

export interface Assembly {
  id: string;
  name: string;
  category: AssemblyCategory;
  components: AssemblyComponent[];
  allowances: {
    labor: number;
    equipment: number;
    installation: number;
  };
  verificationStatus: "unverified" | "verified";
}

export interface CostRate {
  id: string;
  referenceId: string;
  currency: string;
  unitRate: number;
  geographicArea: string;
  effectiveDate: string;
  sourceNote: string;
  rateType: "library" | "supplier_quote" | "user_override";
  confidence: "low" | "medium" | "high";
  verificationStatus: "unverified" | "verified";
}

export interface CostRateOverride {
  referenceId: string;
  unitRate: number;
  sourceNote?: string;
}

export interface AssemblyQuantityOverride {
  assemblyId: string;
  componentIndex: number;
  quantity: number;
  sourceNote?: string;
}

export interface CostedComponent {
  componentIndex: number;
  productId: string;
  productName: string;
  role: string;
  unit: string;
  libraryQuantity: number;
  baseQuantity: number;
  quantityOverrideApplied: boolean;
  quantityOverrideSourceNote: string | null;
  wastePercent: number;
  quantityWithWaste: number;
  unitRate: number;
  currency: string;
  materialCost: number;
  rateType: CostRate["rateType"];
  rateId: string | null;
  sourceNote: string;
}

export interface AssemblyCostResult {
  assemblyId: string;
  assemblyName: string;
  components: CostedComponent[];
  materialSubtotal: number;
  laborCost: number;
  equipmentCost: number;
  installationCost: number;
  totalCost: number;
  currency: string;
}

export interface SpecimenAssemblyCost {
  slot: string;
  assembly: AssemblyCostResult;
}

export interface SpecimenCostResult {
  specimenId: string;
  assemblyCosts: SpecimenAssemblyCost[];
  materialSubtotal: number;
  laborSubtotal: number;
  equipmentSubtotal: number;
  installationSubtotal: number;
  totalCost: number;
  currency: string;
}

export interface Specimen {
  id: string;
  name: string;
  parentSpecimenId: string | null;
  appliedUpgradeIds: string[];
  assemblySelections: Record<string, string>;
  createdFromDraft: boolean;
  notes: string;
  verificationStatus: "unverified" | "verified";
}

export interface UpgradeAssemblyChange {
  slot: AssemblyCategory;
  assemblyId: string;
}

export interface UpgradeDefinition {
  id: string;
  name: string;
  targetFailureTypes: string[];
  expectedBenefit: string;
  priority: "low" | "medium" | "high";
  status: "ready" | "needs_definition";
  assemblyChanges: UpgradeAssemblyChange[];
  notes: string[];
}

export interface HazardEffect {
  wind_kph: number;
  rain: string;
  debris?: string[];
  effects?: string[];
}

export type Hazards = Record<string, HazardEffect>;

export interface FailureEvent {
  id: string;
  time: string;
  name: string;
  description: string;
  severity: string;
  type: string;
  target: string;
}

export type SimulationRunMode =
  | "fixed_duration"
  | "until_breaking_point"
  | "continue_after_failure";

export interface RunMode {
  id: SimulationRunMode;
  name: string;
  description: string;
  future?: boolean;
}

export interface RunSettings {
  mode: SimulationRunMode;
  durationSeconds: number;
  stopAtFirstCriticalFailure: boolean;
}
