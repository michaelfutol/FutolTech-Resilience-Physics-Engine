from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


path = Path("src/components/Viewport3D.tsx")
text = path.read_text()

import_line = 'import RoofPanelExposureReadinessPanel from "@/components/RoofPanelExposureReadinessPanel";\n'
if import_line not in text:
    text = replace_once(
        text,
        'import WallPanelExposureReadinessPanel from "@/components/WallPanelExposureReadinessPanel";\n',
        'import WallPanelExposureReadinessPanel from "@/components/WallPanelExposureReadinessPanel";\n' + import_line,
        "wall readiness import",
    )

panel_line = '          <RoofPanelExposureReadinessPanel snapshot={phase4Snapshot} />\n\n'
if panel_line not in text:
    text = replace_once(
        text,
        '          <WallPanelExposureReadinessPanel snapshot={phase4Snapshot} />\n\n',
        '          <WallPanelExposureReadinessPanel snapshot={phase4Snapshot} />\n\n' + panel_line,
        "wall readiness panel",
    )

path.write_text(text)
