from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


path = Path("src/components/Viewport3D.tsx")
text = path.read_text()

import_line = 'import WallPanelExposureReadinessPanel from "@/components/WallPanelExposureReadinessPanel";\n'
if import_line not in text:
    text = replace_once(
        text,
        'import FloorRingFrameReadinessPanel from "@/components/FloorRingFrameReadinessPanel";\n',
        'import FloorRingFrameReadinessPanel from "@/components/FloorRingFrameReadinessPanel";\n' + import_line,
        "floor-ring readiness import",
    )

panel_line = '          <WallPanelExposureReadinessPanel snapshot={phase4Snapshot} />\n\n'
if panel_line not in text:
    text = replace_once(
        text,
        '          <FloorRingFrameReadinessPanel snapshot={phase4Snapshot} />\n\n',
        '          <FloorRingFrameReadinessPanel snapshot={phase4Snapshot} />\n\n' + panel_line,
        "floor-ring readiness panel",
    )

path.write_text(text)
