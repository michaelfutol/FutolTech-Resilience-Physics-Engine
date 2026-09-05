import type { GenesisVector3 } from "../../types/genesis";
import type { GenesisAerodynamicForceApplicationPlan } from "../../types/genesisForceApplication";

export type GenesisAerodynamicForceStepState =
  | "before_window"
  | "active_full_step"
  | "active_partial_step"
  | "complete";

/**
 * Pure scheduling result for one future physics step. This object does not
 * mutate Rapier and does not advance simulation time.
 */
export interface GenesisAerodynamicForceStepEvaluation {
  evidenceLayer: "rpe_simulation";
  bodyId: string;
  state: GenesisAerodynamicForceStepState;
  shouldApplyForce: boolean;
  elapsedSeconds: number;
  physicsStepSeconds: number;
  activeDurationSeconds: number;
  activeFractionOfPhysicsStep: number;
  effectiveForceN: GenesisVector3 | null;
  expectedImpulseNs: GenesisVector3;
  reason: string;
}

function validateFinite(name: string, value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  return value;
}

function validateVector(name: string, vector: GenesisVector3): GenesisVector3 {
  validateFinite(`${name}.x`, vector.x);
  validateFinite(`${name}.y`, vector.y);
  validateFinite(`${name}.z`, vector.z);
  return vector;
}

function scale(vector: GenesisVector3, factor: number): GenesisVector3 {
  return {
    x: vector.x * factor,
    y: vector.y * factor,
    z: vector.z * factor,
  };
}

const ZERO_VECTOR: GenesisVector3 = { x: 0, y: 0, z: 0 };

/**
 * Evaluates the force that a fixed-duration center-of-mass application plan
 * should contribute during one physics step.
 *
 * If the declared duration ends part-way through a physics step, the returned
 * effective force is proportionally scaled so integrating it across the whole
 * step preserves F * activeDuration. This avoids silently extending the load
 * beyond the caller-declared interval.
 */
export function evaluateGenesisAerodynamicForceStep(
  plan: GenesisAerodynamicForceApplicationPlan,
  elapsedSeconds: number,
  physicsStepSeconds: number,
): GenesisAerodynamicForceStepEvaluation {
  validateFinite("elapsedSeconds", elapsedSeconds);
  validateFinite("physicsStepSeconds", physicsStepSeconds);
  validateFinite("plan.durationSeconds", plan.durationSeconds);
  validateFinite("plan.startOffsetSeconds", plan.startOffsetSeconds);
  validateVector("plan.forceN", plan.forceN);

  if (elapsedSeconds < 0) {
    throw new Error("elapsedSeconds must be greater than or equal to zero");
  }
  if (physicsStepSeconds <= 0) {
    throw new Error("physicsStepSeconds must be greater than zero");
  }
  if (plan.startOffsetSeconds < 0) {
    throw new Error("plan.startOffsetSeconds must be greater than or equal to zero");
  }
  if (plan.durationSeconds <= 0) {
    throw new Error("plan.durationSeconds must be greater than zero");
  }

  const windowStart = plan.startOffsetSeconds;
  const windowEnd = windowStart + plan.durationSeconds;

  if (elapsedSeconds < windowStart) {
    return {
      evidenceLayer: "rpe_simulation",
      bodyId: plan.bodyId,
      state: "before_window",
      shouldApplyForce: false,
      elapsedSeconds,
      physicsStepSeconds,
      activeDurationSeconds: 0,
      activeFractionOfPhysicsStep: 0,
      effectiveForceN: null,
      expectedImpulseNs: { ...ZERO_VECTOR },
      reason: "Declared aerodynamic force window has not started.",
    };
  }

  const remainingSeconds = Math.max(0, windowEnd - elapsedSeconds);
  if (remainingSeconds === 0) {
    return {
      evidenceLayer: "rpe_simulation",
      bodyId: plan.bodyId,
      state: "complete",
      shouldApplyForce: false,
      elapsedSeconds,
      physicsStepSeconds,
      activeDurationSeconds: 0,
      activeFractionOfPhysicsStep: 0,
      effectiveForceN: null,
      expectedImpulseNs: { ...ZERO_VECTOR },
      reason: "Declared aerodynamic force interval is complete; no further force may be applied.",
    };
  }

  const activeDurationSeconds = Math.min(physicsStepSeconds, remainingSeconds);
  const activeFractionOfPhysicsStep = activeDurationSeconds / physicsStepSeconds;
  const effectiveForceN = scale(plan.forceN, activeFractionOfPhysicsStep);
  const expectedImpulseNs = scale(plan.forceN, activeDurationSeconds);
  const partial = activeDurationSeconds < physicsStepSeconds;

  return {
    evidenceLayer: "rpe_simulation",
    bodyId: plan.bodyId,
    state: partial ? "active_partial_step" : "active_full_step",
    shouldApplyForce: true,
    elapsedSeconds,
    physicsStepSeconds,
    activeDurationSeconds,
    activeFractionOfPhysicsStep,
    effectiveForceN,
    expectedImpulseNs,
    reason: partial
      ? "Declared aerodynamic interval ends within this physics step; effective force is scaled to preserve only the explicitly modeled active-duration impulse."
      : "Declared aerodynamic force is active for the complete physics step.",
  };
}
