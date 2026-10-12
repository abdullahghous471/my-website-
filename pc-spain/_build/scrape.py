#!/usr/bin/env python3
"""One-off scraper: turns saved pc-spain.com HTML into clean content.json.

Usage: python3 scrape.py <dir-with-saved-html>
Expects sub-folders det/ (property posts), art/ (articles), en/ (English pages).
Writes content.json next to this script and prints every image URL it needs.
"""
import json, re, sys, html
from html.parser import HTMLParser
from pathlib import Path

SRC = Path(sys.argv[1])
ALLOWED = {'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'b', 'em', 'i', 'br', 'img', 'blockquote'}
SKIP = {'script', 'style', 'svg', 'noscript', 'form', 'button', 'select', 'textarea'}
IMAGES = set()


def img_url(attrs):
    a = dict(attrs)
    for k in ('data-src', 'data-lazy-src', 'src'):
        v = a.get(k, '')
        if 'wp-content/uploads' in v:
            return v
    return None


class Clean(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], 0

    def handle_starttag(self, t, attrs):
        if t in SKIP:
            self.skip += 1
            return
        if self.skip or t not in ALLOWED:
            return
        a = dict(attrs)
        if t == 'img':
            u = img_url(attrs)
            if u:
                u = re.sub(r'-\d+x\d+(?=\.\w+$)', '', u)  # full-size original
                IMAGES.add(u)
                self.out.append(f'<img src="{u}" alt="{html.escape(a.get("alt", ""))}">')
            return
        if t == 'a':
            self.out.append(f'<a href="{html.escape(a.get("href", "#"))}">')
            return
        t = {'b': 'strong', 'i': 'em', 'h1': 'h2', 'h5': 'h3'}.get(t, t)
        self.out.append(f'<{t}>')

    def handle_endtag(self, t):
        if t in SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or t not in ALLOWED or t in ('img', 'br'):
            return
        t = {'b': 'strong', 'i': 'em', 'h1': 'h2', 'h5': 'h3'}.get(t, t)
        self.out.append(f'</{t}>')

    def handle_data(self, d):
        if not self.skip:
            self.out.append(html.escape(d))


def clean(fragment):
    fragment = re.sub(r'(?s)<br\s*/?>\s*<b>Warning</b>.*?line <b>\d+</b><br\s*/?>', '', fragment)
    fragment = re.sub(r'(?s)<div[^>]*>\s*<b>Warning</b>.*?</div>', '', fragment)
    c = Clean()
    c.feed(fragment)
    s = ''.join(c.out)
    s = re.sub(r'\s+', ' ', s)
    s = s.replace('Warning : Undefined variable $bname in /data/sites/web/pc-spaincom/www/wp-content/plugins/Ultimate_VC_Addons/modules/ultimate_functions.php on line 266', '')
    for _ in range(3):
        s = re.sub(r'<(p|h2|h3|h4|li|strong|em|a[^>]*)>\s*</(p|h2|h3|h4|li|strong|em|a)>', '', s)
        s = re.sub(r'<(ul|ol)>\s*</\1>', '', s)
    s = re.sub(r'\s+(</(?:strong|em|a)>)', r'\1 ', s)
    # wrap loose inline text (page builders often drop <p>) into paragraphs
    parts = re.split(r'(<(?:h2|h3|h4|p|ul|ol|blockquote)>.*?</(?:h2|h3|h4|p|ul|ol|blockquote)>|<img[^>]*>)', s)
    out = []
    for part in parts:
        if part.startswith('<') and re.match(r'<(h2|h3|h4|p|ul|ol|blockquote|img)', part):
            out.append(part)
        elif re.sub(r'<[^>]+>', '', part).strip():
            out.append(f'<p>{part.strip()}</p>')
    return ''.join(out)


def meta(s, prop):
    m = re.search(rf'<meta property="og:{prop}" content="([^"]+)"', s)
    return html.unescape(m.group(1)) if m else ''


def between(s, start, ends):
    i = s.find(start)
    if i < 0:
        return ''
    j = min([k for k in (s.find(e, i) for e in ends) if k > 0] or [len(s)])
    return s[i:j]


content = {'listings': {}, 'articles': {}, 'en': {}}

# ---------------- property posts
for f in sorted((SRC / 'det').glob('*.html')):
    s = f.read_text(errors='ignore')
    slug = f.stem
    body = between(s, '<div class="entry-content">', ['<div class="single-share-box">', '<aside', '<footer'])
    gallery = [re.sub(r'-\d+x\d+(?=\.\w+$)', '', u) for u in re.findall(r'<a href="(https://pc-spain\.com/wp-content/uploads/[^"]+\.(?:jpe?g|png|webp))" class="rollover dt-pswp-item', body)]
    gallery = list(dict.fromkeys(gallery))
    IMAGES.update(gallery)
    text = re.sub(r'(?s)<div class="owl-carousel.*?</figure></div></div>', '', body)
    text = clean(text)
    text = re.sub(r'<img[^>]*>', '', text)
    city = re.search(r'rel="category tag">([^<]+)<', s)
    title = meta(s, 'title').replace(' - Property Consultancy Spain', '')
    hero = meta(s, 'image')
    if hero:
        IMAGES.add(hero)
    content['listings'][slug] = dict(title=html.unescape(title), city=city.group(1) if city else '', hero=hero, gallery=gallery, html=text)

# ---------------- articles
for f in sorted((SRC / 'art').glob('*.html')):
    s = f.read_text(errors='ignore')
    body = between(s, '<div id="content"', ['<aside', 'id="sidebar"', '<footer'])
    title = meta(s, 'title').replace(' - Property Consultancy Spain', '')
    hero = meta(s, 'image')
    if hero:
        IMAGES.add(hero)
    content['articles'][f.stem] = dict(title=html.unescape(title), hero=hero, html=clean(body))

# ---------------- english pages
for f in sorted((SRC / 'en').glob('*.html')):
    s = f.read_text(errors='ignore')
    if 'Page not found' in s[:5000]:
        continue
    body = between(s, '<div id="content"', ['<aside', '<footer'])
    title = meta(s, 'title').replace(' - Property Consultancy Spain', '')
    content['en'][f.stem] = dict(title=html.unescape(title), html=clean(body))

(Path(__file__).parent / 'content.json').write_text(json.dumps(content, ensure_ascii=False, indent=1))
print('\n'.join(sorted(IMAGES)))
