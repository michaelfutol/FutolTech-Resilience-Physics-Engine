export interface Specimen {
  id: string;
  name: string;
  dimensions: string;
  frame_type: string;
  wall_type: string;
  roof_type: string;
  base_type: string;
  cladding: string;
}

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
