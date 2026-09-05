from pathlib import Path

path = Path("tests/small-house-structural-load-case-adapter.test.ts")
text = path.read_text(encoding="utf-8")
replacements = {
    'import type { SmallHouseWindSystemInput } from "../src/types/smallHouseWind";':
        'import type { SmallHouseWindSpecimenInput } from "../src/types/smallHouseWind";',
    'function readyFixture(specimen: SmallHouseWindSystemInput = SYNTHETIC_PHASE4_HOUSE) {':
        'function readyFixture(specimen: SmallHouseWindSpecimenInput = SYNTHETIC_PHASE4_HOUSE) {',
    '  wall.geometry.center.x = 88;\n  wall.geometry.center.y = -42;\n  wall.geometry.center.z = 17;':
        '  wall.centerM.x = 88;\n  wall.centerM.y = -42;\n  wall.centerM.z = 17;',
}
for old, new in replacements.items():
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"expected exactly one anchor, found {count}: {old!r}")
    text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
