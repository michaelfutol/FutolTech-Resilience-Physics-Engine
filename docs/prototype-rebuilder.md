# Prototype Rebuilder

The Prototype Rebuilder is the core recommendation engine of the FutolTech Resilience Physics Engine (RPE). 

While the Physics Simulator tests the current structure to identify failures, the Prototype Rebuilder analyzes those failures and recommends the next best architectural or structural upgrade.

## Functionality

When a specimen fails a simulation run, the Rebuilder:
1. Maps identified weak points (e.g., `roof_uplift`, `frame_racking`) to possible upgrade solutions.
2. Formulates a new recommended specimen configuration (e.g., A0 -> A1).
3. Estimates the added cost and expected performance improvement.

### Recommendation Sequence Example
- **A0 fails** (frame racking, roof uplift)
  - Recommended **A1**:
    - Add diagonal bracing
    - Add roof tie-down straps
    - Improve screw spacing
- **If A1 fails** (frame still weak under extreme load)
  - Recommended **A2**:
    - Upgrade frame size (e.g., 38x38x1.5mm steel tube)
- **If A2 fails** (material family limit reached)
  - Recommended **B0**:
    - Switch wall material system (e.g., double ficem insulated wall)
    - Upgrade to RC frame / hybrid frame

## Optimization Layer Progression
The intelligence behind the Rebuilder will evolve in phases. For details, see [Optimization Layer](optimization-layer.md).
