from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


path = Path("src/components/Viewport3D.tsx")
text = path.read_text()

import_line = 'import FloorRingFrameReadinessPanel from "@/components/FloorRingFrameReadinessPanel";\n'
if import_line not in text:
    text = replace_once(
        text,
        'import PrimarySupportReadinessPanel from "@/components/PrimarySupportReadinessPanel";\n',
        'import PrimarySupportReadinessPanel from "@/components/PrimarySupportReadinessPanel";\n' + import_line,
        "primary-support readiness import",
    )

panel_line = '          <FloorRingFrameReadinessPanel snapshot={phase4Snapshot} />\n\n'
if panel_line not in text:
    text = replace_once(
        text,
        '          <PrimarySupportReadinessPanel snapshot={phase4Snapshot} />\n\n',
        '          <PrimarySupportReadinessPanel snapshot={phase4Snapshot} />\n\n' + panel_line,
        "primary-support readiness panel",
    )

path.write_text(text)
