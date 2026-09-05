from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


path = Path("src/components/Viewport3D.tsx")
text = path.read_text()

if 'import PrimarySupportReadinessPanel from "@/components/PrimarySupportReadinessPanel";' not in text:
    text = replace_once(
        text,
        'import SmallHouseWindStageScene from "@/components/SmallHouseWindStageScene";\n',
        'import SmallHouseWindStageScene from "@/components/SmallHouseWindStageScene";\nimport PrimarySupportReadinessPanel from "@/components/PrimarySupportReadinessPanel";\n',
        "Phase 4 scene import",
    )

panel_line = '          <PrimarySupportReadinessPanel snapshot={phase4Snapshot} />\n\n'
if panel_line not in text:
    text = replace_once(
        text,
        '          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">VISIBLE ≠ ADEQUATE. This viewer is topology/geometry QA only. Whole-house wind actions, stiffness, reactions, racking, uplift, sliding, failure, and debris are not claimed by this stage viewer.</p>\n',
        panel_line + '          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">VISIBLE ≠ ADEQUATE. This viewer is topology/geometry QA only. Whole-house wind actions, stiffness, reactions, racking, uplift, sliding, failure, and debris are not claimed by this stage viewer.</p>\n',
        "Phase 4 evidence-boundary paragraph",
    )

path.write_text(text)
