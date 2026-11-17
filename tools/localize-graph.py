#!/usr/bin/env python3
"""Make upstream Graphify's visualization usable without a CDN request."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
page = root / 'graphify-out/graph.html'
asset = root / 'graphify-out/assets/vis-network.min.js'
assert asset.is_file() and asset.stat().st_size > 100_000
text = page.read_text()
url = 'https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js'
assert url in text or 'assets/vis-network.min.js' in text, 'Review new Graphify dependency before localizing'
page.write_text(text.replace(url, 'assets/vis-network.min.js'))
print('Graph visualization uses pinned local vis-network 9.1.6')
