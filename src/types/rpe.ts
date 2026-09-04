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

export interface Assembly {
  id: string;
  name: string;
  category: "frame" | "wall" | "roof" | "floor" | "opening_protection" | "vent" | "connection" | "restraint" | "bracing";
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

export interface CostedComponent {
  productId: string;
  productName: string;
  role: string;
  unit: string;
  baseQuantity: number;
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

  // Legacy fields (to be removed in Phase 2D)
  dimensions?: string;
  frame_type?: string;
  wall_type?: string;
  roof_type?: string;
  base_type?: string;
  cladding?: string;
}

// Legacy Material (to be removed in Phase 2D)
export interface Material {
  id: string;
  name: string;
  type: string;
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

export interface CostItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  placeholderCost: number;
  notes: string;
}

export interface UpgradeOption {
  id: string;
  name: string;
  targetWeakPoint: string;
  estimatedCostPhp: number;
  expectedBenefit: string;
  priority: "low" | "medium" | "high";
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

export interface UpgradeRule {
  failureType: string;
  recommendedUpgrades: string[];
  nextSpecimenId: string;
}

export interface RunSettings {
  mode: SimulationRunMode;
  durationSeconds: number;
  stopAtFirstCriticalFailure: boolean;
}

export interface PrototypeRecommendation {
  currentSpecimenId: string;
  nextSpecimenId: string;
  reason: string;
  recommendedUpgrades: string[];
  estimatedAddedCostPhp: number;
  materialFamilyChange?: boolean;
  notes: string[];
}
