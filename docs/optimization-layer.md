# Optimization Layer Roadmap

The intelligence driving the Prototype Rebuilder will scale in capability over time.

## 1. Rule-Based Recommender (Current MVP Target)
A simple, classical logic approach linking identified weak points to specific predefined upgrades.
- `roof uplift` -> recommend `add roof straps`
- `frame racking` -> recommend `add diagonal bracing`
- `screw pull-through` -> recommend `improve screw pattern`

## 2. Classical Optimizer (Future Phase)
A programmatic search algorithm that ranks combinations of available upgrades based on weighted parameters:
- Lowest cost
- Highest risk reduction
- Available local materials
- Lowest weight
- Best repairability

## 3. Simulated Annealing (Future Phase)
A more complex heuristic search for finding good approximations to the global optimum when evaluating vast combinations of architectural geometries and material selections.

## 4. QUBO / Quantum Optimizer (Long-term Vision)
Integration with BlueQubit or a quantum computing layer. The Quantum optimizer translates decisions into binary variables:
- `x1` = add diagonal bracing
- `x2` = upgrade tube size
- `x3` = switch wall material

It then searches for the mathematically optimal combination under defined constraints (Budget, Weight, Hazard target, U-value, etc.). 
*Note: Quantum computing is strictly for the optimization layer, not for simulating physics.*
