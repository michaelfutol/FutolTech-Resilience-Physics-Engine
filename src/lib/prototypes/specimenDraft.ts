import type { Specimen } from "../../types/rpe";

export interface SpecimenDraft {
  baselineSpecimenId: string;
  assemblySelections: Record<string, string>;
  appliedUpgradeIds: string[];
  notes: string;
}

export interface AssemblySelectionChange {
  slot: string;
  fromAssemblyId: string | null;
  toAssemblyId: string | null;
}

export interface SpecimenDraftDiff {
  assemblyChanges: AssemblySelectionChange[];
  addedUpgradeIds: string[];
  removedUpgradeIds: string[];
}

export interface CreateCandidateOptions {
  candidateId: string;
  candidateName?: string;
  verificationStatus?: Specimen["verificationStatus"];
}

export interface CandidateDerivationResult {
  candidate: Specimen;
  diff: SpecimenDraftDiff;
}

export function createSpecimenDraft(baseline: Specimen): SpecimenDraft {
  return {
    baselineSpecimenId: baseline.id,
    assemblySelections: { ...baseline.assemblySelections },
    appliedUpgradeIds: [...baseline.appliedUpgradeIds],
    notes: baseline.notes,
  };
}

export function setDraftAssembly(
  draft: SpecimenDraft,
  slot: string,
  assemblyId: string
): SpecimenDraft {
  if (!slot.trim()) throw new Error("Draft assembly slot cannot be empty");
  if (!assemblyId.trim()) throw new Error("Draft assembly ID cannot be empty");

  return {
    ...draft,
    assemblySelections: {
      ...draft.assemblySelections,
      [slot]: assemblyId,
    },
  };
}

export function setDraftUpgrades(
  draft: SpecimenDraft,
  appliedUpgradeIds: string[]
): SpecimenDraft {
  return {
    ...draft,
    appliedUpgradeIds: [...new Set(appliedUpgradeIds)],
  };
}

export function setDraftNotes(draft: SpecimenDraft, notes: string): SpecimenDraft {
  return {
    ...draft,
    notes,
  };
}

export function diffSpecimenDraft(
  baseline: Specimen,
  draft: SpecimenDraft
): SpecimenDraftDiff {
  assertDraftMatchesBaseline(baseline, draft);

  const slots = new Set([
    ...Object.keys(baseline.assemblySelections),
    ...Object.keys(draft.assemblySelections),
  ]);

  const assemblyChanges = [...slots]
    .sort()
    .map((slot) => ({
      slot,
      fromAssemblyId: baseline.assemblySelections[slot] ?? null,
      toAssemblyId: draft.assemblySelections[slot] ?? null,
    }))
    .filter((change) => change.fromAssemblyId !== change.toAssemblyId);

  const baselineUpgrades = new Set(baseline.appliedUpgradeIds);
  const draftUpgrades = new Set(draft.appliedUpgradeIds);

  const addedUpgradeIds = [...draftUpgrades]
    .filter((id) => !baselineUpgrades.has(id))
    .sort();
  const removedUpgradeIds = [...baselineUpgrades]
    .filter((id) => !draftUpgrades.has(id))
    .sort();

  return {
    assemblyChanges,
    addedUpgradeIds,
    removedUpgradeIds,
  };
}

export function createCandidateFromDraft(
  baseline: Specimen,
  draft: SpecimenDraft,
  options: CreateCandidateOptions
): CandidateDerivationResult {
  assertDraftMatchesBaseline(baseline, draft);

  const candidateId = options.candidateId.trim();
  if (!candidateId) throw new Error("Candidate ID cannot be empty");
  if (candidateId === baseline.id) {
    throw new Error("Candidate ID must differ from the baseline specimen ID");
  }

  const diff = diffSpecimenDraft(baseline, draft);

  const candidate: Specimen = {
    ...baseline,
    id: candidateId,
    name: options.candidateName?.trim() || `${baseline.name} — ${candidateId}`,
    parentSpecimenId: baseline.id,
    appliedUpgradeIds: [...draft.appliedUpgradeIds],
    assemblySelections: { ...draft.assemblySelections },
    createdFromDraft: true,
    notes: draft.notes,
    verificationStatus: options.verificationStatus ?? "unverified",
  };

  return {
    candidate,
    diff,
  };
}

function assertDraftMatchesBaseline(baseline: Specimen, draft: SpecimenDraft): void {
  if (draft.baselineSpecimenId !== baseline.id) {
    throw new Error(
      `Draft baseline ${draft.baselineSpecimenId} does not match specimen ${baseline.id}`
    );
  }
}
