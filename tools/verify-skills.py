#!/usr/bin/env python3
"""Check real installed resources without modifying global AI configuration."""
import hashlib
import json
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
lock = json.loads((root / 'tools/skills-lock.json').read_text())
for name, metadata in lock.items():
    skill = root / metadata['path'] / 'SKILL.md'
    assert skill.is_file(), f'{name}: missing SKILL.md'
    assert hashlib.sha256(skill.read_bytes()).hexdigest() == metadata['skillSha256'], f'{name}: unexpected upstream drift'
    print(f'{name}: pinned skill verified')
assert 'full' in (root / '.agents/skills/ponytail/SKILL.md').read_text()
assert 'ultra' in (root / '.agents/skills/ponytail/SKILL.md').read_text()
r = subprocess.run(['python3', str(root / '.agents/skills/ui-ux-pro-max/scripts/search.py'), 'state accessibility', '--stack', 'jetpack-compose'], capture_output=True, text=True, check=True)
assert 'Content description' in r.stdout and 'rememberSaveable' in r.stdout
print('UI/UX Pro Max: Compose database search executed')
r = subprocess.run([str(root / '.agents/skills/impeccable/scripts/impeccable'), '--version'], capture_output=True, text=True, check=True)
print('Impeccable:', r.stdout.strip())
r = subprocess.run(['graphify', '--version'], capture_output=True, text=True, check=True)
assert '0.9.111' in r.stdout
print(r.stdout.strip())
assert (root / '.codex/hooks.json').is_file()
print('Skill smoke checks passed; visual review remains an Android device task.')
