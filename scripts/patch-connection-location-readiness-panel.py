from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


path = Path("src/components/Viewport3D.tsx")
text = path.read_text()

import_line = 'import ConnectionJointLocationReadinessPanel from "@/components/ConnectionJointLocationReadinessPanel";\n'
if import_line not in text:
    text = replace_once(
        text,
        'import RoofPanelExposureReadinessPanel from "@/components/RoofPanelExposureReadinessPanel";\n',
        'import RoofPanelExposureReadinessPanel from "@/components/RoofPanelExposureReadinessPanel";\n' + import_line,
        "roof readiness import",
    )

panel_line = '          <ConnectionJointLocationReadinessPanel snapshot={phase4Snapshot} />\n\n'
if panel_line not in text:
    text = replace_once(
        text,
        '          <RoofPanelExposureReadinessPanel snapshot={phase4Snapshot} />\n\n',
        '          <RoofPanelExposureReadinessPanel snapshot={phase4Snapshot} />\n\n' + panel_line,
        "roof readiness panel",
    )

path.write_text(text)
