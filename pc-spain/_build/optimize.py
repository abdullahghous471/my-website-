#!/usr/bin/env python3
"""Creates web-optimised WebP images for the site.

For every photo in assets/media and every video poster in assets/video it writes
  assets/img/<name>.webp      (max 1600 px wide)  – heroes, galleries, lightbox
  assets/img/<name>-sm.webp   (max 720 px wide)   – cards, grids, thumbnails
Run once after adding media:  python3 pc-spain/_build/optimize.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
OUT = ROOT / 'assets' / 'img'
OUT.mkdir(exist_ok=True)

sources = [p for p in (ROOT / 'assets' / 'media').iterdir() if p.suffix.lower() in ('.jpg', '.jpeg', '.png')]
sources += [p for p in (ROOT / 'assets' / 'video').iterdir() if p.suffix.lower() == '.jpg']

for p in sorted(sources):
    im = Image.open(p)
    if im.mode in ('P', 'LA'):
        im = im.convert('RGBA')
    if im.mode == 'RGBA' and p.parent.name == 'media' and im.getchannel('A').getextrema()[0] == 255:
        im = im.convert('RGB')
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGB')
    for suffix, width, q in (('', 1600, 78), ('-sm', 720, 74)):
        dst = OUT / f'{p.stem}{suffix}.webp'
        if dst.exists() and dst.stat().st_mtime > p.stat().st_mtime:
            continue
        copy = im.copy()
        copy.thumbnail((width, width * 3), Image.LANCZOS)
        copy.save(dst, 'WEBP', quality=q, method=6)
print('webp files:', len(list(OUT.glob('*.webp'))))
