#!/usr/bin/env python3
"""Builds the complete Property Consultancy Spain website into pc-spain/.

Content is taken verbatim from pc-spain.com (see scrape.py -> content.json,
listings.json and the page copy below). Run:  python3 pc-spain/_build/build.py
"""
import html as H
import json
import os
import re
from pathlib import Path

HERE = Path(__file__).parent
OUT = Path(os.environ.get('OUT', HERE.parent))
OUT_ASSETS = HERE.parent / 'assets'
GALLERY_CAP = int(os.environ.get('GALLERY_CAP', '0'))  # preview builds only
PREVIEW_SM = os.environ.get('PREVIEW_SM') == '1'      # preview builds only: lightbox uses card-size images
MEDIA = json.loads((HERE / 'media.json').read_text())
C = json.loads((HERE / 'content.json').read_text())
CARDS = json.loads((HERE / 'listings.json').read_text())
MISSING = set()

# =====================================================================  helpers
def media(url):
    if not url:
        return ''
    if url.startswith('assets/'):
        return url
    u = re.sub(r'-\d+x\d+(?=\.\w+$)', '', url.split('?')[0])
    if u.startswith('//'):
        u = 'https:' + u
    if u in MEDIA:
        return 'assets/media/' + MEDIA[u]
    MISSING.add(url)
    return url

def slug_city(c):
    return re.sub(r'[^a-z]+', '-', c.lower().replace('á', 'a').replace('à', 'a')).strip('-')

ARROW = '<svg viewBox="0 0 26 10" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 5h25M21 1l4 4-4 4"/></svg>'
ARROW_L = '<svg viewBox="0 0 26 10" fill="none" stroke="currentColor" aria-hidden="true"><path d="M26 5H1M5 1L1 5l4 4"/></svg>'

IG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>'
IG = f'<a class="ig" href="https://instagram.com/pc_spain" target="_blank" rel="noopener" aria-label="Instagram @pc_spain (opens in new window)">{IG_SVG}</a>'

def lk(label, href, ext=False, cls='lk'):
    t = ' target="_blank" rel="noopener"' if ext else ''
    return f'<a class="{cls}" href="{href}"{t}>{label} {ARROW}</a>'

def btn(label, href, cls='', ext=False):
    t = ' target="_blank" rel="noopener"' if ext else ''
    return f'<a class="btn {cls}" href="{href}"{t}>{label} {ARROW}</a>'

def esc(s):
    return H.escape(s, quote=True)

# listing + article slug maps (live URL slug -> local file)
LISTING_FILES = {s: f'woning-{s}.html' for s in C['listings']}
ART_ALIASES = {
    'woning-kopen-in-spanje': 'huis-kopen-in-spanje',
    'vastgoed-spanje-bijkomende-kosten': 'huis-kopen-in-spanje-bijkomende-kosten',
    'woning-kopen-in-spanje-bijkomende-kosten': 'huis-kopen-in-spanje-bijkomende-kosten',
}
ART_FILES = {s: f'artikel-{s}.html' for s in C['articles']}
for a, b in ART_ALIASES.items():
    ART_FILES[a] = ART_FILES[b]

PAGES = {
    '': 'index.html', 'over-pc-spain': 'over-pc-spain.html', 'expertises-in-spanje': 'expertises.html',
    'over-ons': 'werkwijze.html', 'werkwijze': 'werkwijze.html', 'portfolio': 'portfolio.html',
    'succesverhalen': 'portfolio.html', 'partners': 'partners.html', 'onze-tarieven': 'tarieven.html',
    'tarieven': 'tarieven.html', 'woning-kopen-spanje': 'woning-kopen.html',
    'woning-kopen-in-spanje-tips': 'informatie-tips.html', 'intake': 'intake.html', 'contact': 'intake.html',
    'woning-verhuren': 'intake.html', 'eigenaren': 'intake.html', 'corporate/contact': '#contact',
    'en': 'en.html', 'en/working-method': 'en-working-method.html', 'en/expertises-in-spain': 'en-expertises.html',
    'en/prices': 'en-prices.html', 'en/success-stories': 'en-success-stories.html',
    'en/buying-property-spain': 'en-buying-property.html', 'en/contact': '#contact',
}

def local_href(href):
    h = H.unescape(href).strip()
    if 'wp-content/uploads' in h:
        return media(h)
    m = re.match(r'^(?:https?:)?(?://(?:www\.)?pc-spain\.com)?/?(.*)$', h) if ('pc-spain.com' in h or h.startswith('/')) else None
    if not m:
        return href
    path = m.group(1).split('#')[0].split('?')[0].strip('/').lower()
    if path in PAGES:
        return PAGES[path]
    if path.startswith('category/'):
        return 'woning-kopen.html#' + slug_city(path.split('/')[1])
    if path in LISTING_FILES:
        return LISTING_FILES[path]
    if path in ART_FILES:
        return ART_FILES[path]
    if path.startswith('en/'):
        return 'en.html'
    print('  ! unmapped link', href)
    return 'index.html'

def localize_html(s):
    s = re.sub(r'href="([^"]*)"', lambda m: f'href="{local_href(m.group(1))}"', s)
    s = re.sub(r'<img src="([^"]+)"', lambda m: f'<img loading="lazy" src="{media(m.group(1))}"', s)
    return s

# =====================================================================  shell
FONTS = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Jost:wght@300;400;500;600&family=Pinyon+Script&display=swap'
LIBS = '''<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>'''

NAV = {
    'nl': [
        ('Home', 'index.html', 'assets/video/valencia-ciencias.jpg', []),
        ('Over ons', 'over-pc-spain.html', media('https://pc-spain.com/wp-content/uploads/2024/10/travelling_a_team_of_real_estates_professionals_in_spanish_ci_18f2c688-8a7c-42df-a2f7-da7706d1ec0f_0.png'),
         [('Over PC-Spain', 'over-pc-spain.html'), ('Expertises', 'expertises.html'), ('Werkwijze', 'werkwijze.html'), ('Portfolio', 'portfolio.html'), ('Partners', 'partners.html')]),
        ('Tarieven', 'tarieven.html', media('https://pc-spain.com/wp-content/uploads/2017/03/s025.jpg'), []),
        ('Woning kopen', 'woning-kopen.html', media('https://pc-spain.com/wp-content/uploads/2024/10/Nieuwbouw-PC-Spain.jpg'), [('Informatie &amp; Tips', 'informatie-tips.html')]),
        ('Intake', 'intake.html', media('https://pc-spain.com/wp-content/uploads/2020/04/slider-property-consultancy-spain.jpg'), []),
    ],
    'en': [
        ('Property Consultancy Spain', 'en.html', 'assets/video/valencia-ciencias.jpg', []),
        ('Working method', 'en-working-method.html', 'assets/video/valencia-city.jpg', []),
        ('Expertises in Spain', 'en-expertises.html', media('https://pc-spain.com/wp-content/uploads/revslider/the7-corporate-slider/s0061.jpg'), []),
        ('Success stories', 'en-success-stories.html', media('https://pc-spain.com/wp-content/uploads/2024/10/Mislata-after.png'), []),
        ('Prices', 'en-prices.html', media('https://pc-spain.com/wp-content/uploads/2017/03/s025.jpg'), []),
        ('Buying property Spain', 'en-buying-property.html', media('https://pc-spain.com/wp-content/uploads/2024/10/Nieuwbouw-PC-Spain.jpg'), []),
    ],
}
T = {  # interface strings per language (labels for existing content)
    'nl': dict(menu='Menu', close='Sluiten', quick=('Woning kopen', 'woning-kopen.html'), cta=('Doe de intake', 'intake.html'),
               offices='Kantoren:', hours='Openingstijden:', hours_v='Maandag- Zaterdag: 10:00 - 18:00', find='Vind ons op:',
               contact='Contact informatie', top='Go to Top', partner='Partner', home='Home',
               foot_links=[('Expertises in Spanje', 'expertises.html'), ('Tarieven', 'tarieven.html'), ('Woning kopen Spanje', 'woning-kopen.html'), ('Tarieven', 'tarieven.html'), ('Intake', 'intake.html')],
               tagline='Woning kopen of huren in Spanje'),
    'en': dict(menu='Menu', close='Close', quick=('Buying property Spain', 'en-buying-property.html'), cta=('Contact', '#contact'),
               offices='Offices:', hours='Office times', hours_v='Monday - Friday 10:00 - 18:00', find='Find us on:',
               contact='Contact information', top='Go to Top', partner='Partner', home='Home',
               foot_links=[('Property Consultancy Spain', 'en.html'), ('Expertises in Spain', 'en-expertises.html'), ('Prices', 'en-prices.html'), ('Buying property Spain', 'en-buying-property.html'), ('Prices', 'en-prices.html')],
               tagline='Woning kopen of huren in Spanje'),
}

def head(title, desc, lang):
    return f'''<!DOCTYPE html>
<html lang="{lang}" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#233759">
<link rel="icon" type="image/png" href="assets/logo/favicon.png">
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
<link rel="preload" href="assets/fonts/jost-5054f2c4.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="curtain" aria-hidden="true"><div class="curtain__word"><span class="curtain__logo"><img src="assets/logo/pc-spain.png" alt="" width="800" height="258"></span><svg class="curtain__build" viewBox="0 0 160 96" aria-hidden="true">
  <line class="g" x1="4" y1="90" x2="156" y2="90"/>
  <g class="crane"><line x1="118" y1="90" x2="118" y2="10"/><line x1="70" y1="12" x2="150" y2="12"/><line x1="118" y1="10" x2="150" y2="12"/><line x1="118" y1="10" x2="72" y2="12"/>
    <g class="hook"><line x1="84" y1="12" x2="84" y2="30"/><rect x="78" y="30" width="12" height="6"/></g></g>
  <g class="fl">
    <g class="f f1"><rect x="30" y="74" width="48" height="16"/><rect class="w" x="37" y="79" width="7" height="6"/><rect class="w" x="51" y="79" width="7" height="6"/><rect class="w" x="65" y="79" width="7" height="6"/></g>
    <g class="f f2"><rect x="30" y="58" width="48" height="16"/><rect class="w" x="37" y="63" width="7" height="6"/><rect class="w" x="51" y="63" width="7" height="6"/><rect class="w" x="65" y="63" width="7" height="6"/></g>
    <g class="f f3"><rect x="30" y="42" width="48" height="16"/><rect class="w" x="37" y="47" width="7" height="6"/><rect class="w" x="51" y="47" width="7" height="6"/><rect class="w" x="65" y="47" width="7" height="6"/></g>
    <path class="f f4 roof" d="M26 42 L54 24 L82 42 Z"/>
  </g>
</svg></div></div>
'''

def header(lang, active, alt):
    t = T[lang]
    home = 'index.html' if lang == 'nl' else 'en.html'
    nl_href, en_href = (active_file(alt, 'nl'), active_file(alt, 'en'))
    items, imgs = [], []
    for i, (label, href, img, sub) in enumerate(NAV[lang]):
        on = ' class="on"' if href == active else ''
        s = ''
        if sub:
            s = '<ul class="menu__sub">' + ''.join(f'<li><a href="{h}">{l}</a></li>' for l, h in sub) + '</ul>'
        items.append(f'<li><span class="menu__n">{i + 1:02d}</span><a href="{href}"{on}>{label}</a>{s}</li>')
        on_img = ' class="on"' if i == 0 else ''
        imgs.append(f'<img src="{sm(img)}" alt="" loading="lazy"{on_img}>')
    return f'''
<header class="hd" id="top">
  <div class="hd__left">
    <button class="hd__menu label" data-menu-open aria-label="{t['menu']}"><i></i><span>{t['menu']}</span></button>
    <a class="hd__quick label" href="{t['quick'][1]}">{t['quick'][0]}</a>
  </div>
  <a class="hd__logo" href="{home}" aria-label="Property Consultancy Spain"><img src="assets/logo/pc-spain.png" alt="Property Consultancy Spain" width="800" height="258"></a>
  <div class="hd__right">
    <nav class="hd__lang label" aria-label="Language"><a href="{nl_href}"{' class="on"' if lang == 'nl' else ''}>NL</a><a href="{en_href}"{' class="on"' if lang == 'en' else ''}>EN</a></nav>
    <a class="hd__cta label" href="{t['cta'][1]}">{t['cta'][0]}</a>
  </div>
</header>

<div class="menu" aria-hidden="false">
  <button class="menu__close label" data-menu-close><i></i>{t['close']}</button>
  <div class="menu__main">
    <nav aria-label="Menu"><ul class="menu__list">{''.join(items)}</ul></nav>
  </div>
  <aside class="menu__side">
    <div class="menu__block">
      <span class="label">{'Direct contact' if lang == 'nl' else 'Talk to us'}</span>
      <a class="menu__phone" href="tel:{PHONE_TEL}">{PHONE}</a>
      <a class="menu__mail" href="mailto:{EMAIL}">{EMAIL}</a>
      <a class="menu__wa" href="https://wa.me/{PHONE_TEL.lstrip('+')}" target="_blank" rel="noopener">WhatsApp {ARROW}</a>
    </div>
    <div class="menu__block menu__block--2">
      <div><span class="label">{t['offices']}</span><p>Valencia · Dénia · Amsterdam · Barcelona</p></div>
      <div><span class="label">{t['hours']}</span><p>{t['hours_v']}</p></div>
    </div>
    <div class="menu__block menu__block--3">
      <div class="menu__lang" aria-label="Language"><a href="{nl_href}"{' class="on"' if lang == 'nl' else ''} lang="nl">NL</a><a href="{en_href}"{' class="on"' if lang == 'en' else ''} lang="en">EN</a></div>
      {IG}
    </div>
    <a class="btn btn--light menu__cta" href="{t['cta'][1]}">{t['cta'][0]} {ARROW}</a>
  </aside>
</div>
'''

def footer(lang):
    t = T[lang]
    home = 'index.html' if lang == 'nl' else 'en.html'
    links = ''.join(f'<li><a href="{h}">{l}</a></li>' for l, h in t['foot_links'])
    return f'''
<footer class="ft" id="contact">
  <div class="wrap ft__top">
    <div class="ft__brand">
      <a href="{home}"><img src="assets/logo/pc-spain.png" alt="Property Consultancy Spain" width="800" height="258" loading="lazy"></a>
      <p>{t['tagline']}</p>
    </div>
    <div class="ft__col">
      <h4>{t['contact']}</h4>
      <p class="label muted" style="margin-bottom:10px">{t['offices']}</p>
      <ul><li>Valencia</li><li>Dénia</li><li>Amsterdam</li><li>Barcelona</li></ul>
    </div>
    <div class="ft__col">
      <h4>{t['hours']}</h4>
      <p>{t['hours_v']}</p>
      <h4 style="margin-top:34px">{t['find']}</h4>
      {IG}
    </div>
    <div class="ft__col" style="grid-column:span 3">
      <h4>Property Consultancy Spain</h4>
      <ul>{links}</ul>
    </div>
  </div>
  <div class="ft__partner">
    <span class="label">{t['partner']}</span>
    <img src="assets/logo/orange-estates.png" alt="Orange Estates" width="788" height="212" loading="lazy">
  </div>
  <div class="ft__bottom">
    <span>© Property Consultant Spain - All rights reserved.</span>
    <button class="label" data-top>{t['top']} ↑</button>
  </div>
</footer>

<div class="lb" role="dialog" aria-modal="true" aria-label="Media">
  <div class="lb__top"><span class="lb__count label"></span><button class="label" data-lb-close aria-label="{'Sluiten' if lang == 'nl' else 'Close'}">✕</button></div>
  <div class="lb__stage"></div>
  <div class="lb__bot"><button class="label" data-lb-prev aria-label="{'Vorige' if lang == 'nl' else 'Previous'}">{ARROW_L}</button><button class="label" data-lb-next aria-label="{'Volgende' if lang == 'nl' else 'Next'}">{ARROW}</button></div>
</div>
{LIBS}
<script defer src="assets/js/main.js"></script>
'''

ALT = {  # NL <-> EN equivalents for the language switch
    'index.html': 'en.html', 'werkwijze.html': 'en-working-method.html', 'expertises.html': 'en-expertises.html',
    'tarieven.html': 'en-prices.html', 'portfolio.html': 'en-success-stories.html', 'woning-kopen.html': 'en-buying-property.html',
}
ALT_REV = {v: k for k, v in ALT.items()}

def active_file(fname, lang):
    if lang == 'nl':
        return ALT_REV.get(fname, fname if not fname.startswith('en') else 'index.html')
    return ALT.get(fname, fname if fname.startswith('en') else 'en.html')

def sm(path):
    return path + '#sm'

WEBP_RE = re.compile(r'assets/(?:media|video)/([^"#)\s]+?)\.(?:jpe?g|png)(#sm)?(?=["#)\s])')

def webp(doc):
    def rep(m):
        stem, small = m.group(1), m.group(2)
        cand = OUT_ASSETS / 'img' / f'{stem}{"-sm" if small else ""}.webp'
        if cand.exists():
            return f'assets/img/{cand.name}'
        return m.group(0).replace('#sm', '')
    return WEBP_RE.sub(rep, doc)

def write(fname, title, desc, body, lang='nl', active=None, extra=''):
    doc = head(title, desc, lang) + header(lang, active or fname, fname) + f'<main id="main">\n{body}\n</main>\n' + footer(lang) + extra + '</body>\n</html>\n'
    doc = webp(doc)
    (OUT / fname).write_text(doc)

def page_hero(crumbs, h1, aside='', img=None, video=None, poster=None, short=False, script=None):
    cr = ''.join(f'<a class="label" href="{h}">{l}</a><span class="label" aria-hidden="true">/</span>' for l, h in crumbs[:-1]) + f'<span class="label">{crumbs[-1][0]}</span>'
    if video:
        m = f'<video autoplay muted loop playsinline preload="none" poster="{poster}" data-parallax="14" data-src="{video}"></video>'
    else:
        m = f'<img src="{img}" alt="" data-parallax="14">'
    sc = f'<span class="script">{script}</span>' if script else ''
    return f'''<section class="ph{' ph--short' if short else ''}">
  <div class="wrap ph__top">
    <nav class="ph__crumbs" aria-label="Breadcrumb">{cr}</nav>
    <h1 class="h1" data-split>{h1}{sc}</h1>
    {f'<div class="ph__aside" data-reveal=".3">{aside}</div>' if aside else ''}
  </div>
  <div class="ph__media">{m}</div>
</section>'''

def cta(title, text, label, href, video='assets/video/valencia-waves', lang='nl'):
    p = f'<p data-reveal=".2">{text}</p>' if text else ''
    return f'''<section class="cta">
  <div class="cta__media"><video muted loop playsinline preload="none" poster="{video}.jpg" data-src="{video}.mp4"></video></div>
  <div class="cta__inner">
    <h2 class="h1" data-split>{title}</h2>
    {p}
    <div data-reveal=".3">{btn(label, href, 'btn--light')}</div>
  </div>
</section>'''

def listing_card(l, i, lang='nl'):
    slug = l['url'].rstrip('/').split('/')[-1]
    price = next((s for s in l['specs'] if '€' in s), '')
    rest = [s for s in l['specs'] if s != price]
    img = media(C['listings'][slug]['gallery'][0]) if C['listings'][slug]['gallery'] else media(C['listings'][slug]['hero'] or l['img'])
    if l['img']:
        # prefer the card crop used on the live overview if it exists locally
        pass
    return f'''<a class="lcard" data-city="{slug_city(l['city'])}" href="{LISTING_FILES[slug]}">
  <div class="frame"><img src="{sm(img)}" alt="{esc(l['title'])}" loading="lazy" decoding="async"></div>
  <div class="lcard__meta label"><span>{esc(l['city'])}</span><span>{esc(rest[0]) if rest else ''}</span></div>
  <h3>{esc(l['title'])}</h3>
  {f'<div class="lcard__price">{esc(price)}</div>' if price else ''}
  <div class="lcard__specs">{' · '.join(esc(s) for s in rest[1:])}</div>
</a>'''

QUOTES = [
    ('Arnout Bakker', None, 'PC Spain heeft me geholpen om mijn investering in Spaans vastgoed te optimaliseren. Met hun begeleiding en netwerk kon ik het verhuurproces professioneel opzetten, en nu loopt alles vrijwel automatisch. Het resultaat? Een zorgeloos, passief inkomen dat elke maand binnenkomt. Dankzij hun advies en connecties heb ik echt het maximale uit mijn investering gehaald. Ik…'),
    ('Marloes &amp; Peter van den Akker', None, 'Als investeerder was ik op zoek naar een betrouwbaar team dat me kon helpen bij het opzetten van het verhuurproces. Dankzij PC Spain loopt alles nu vrijwel automatisch, en kan ik passief genieten van een stabiel extra inkomen. Ze hebben me verbonden met de juiste partners en begeleid bij elke stap. Het systeem dat ze…'),
    ('Wim van Brakel', None, 'Als investeerder wilde ik niet alleen goed advies, maar ook toegang tot een sterk netwerk. Dankzij PC Spain kon ik gebruikmaken van hun connecties met topadvocaten, architecten en lokale makelaars. Hun partners hebben me geholpen bij de aankoop en renovatie van een pand, waardoor ik het met een mooie winst heb kunnen flippen. Het team…'),
    ('Johan Hoven', media('https://pc-spain.com/wp-content/uploads/2024/10/Johan-Hove.png'), 'Ik heb via Property Consultancy Group geïnvesteerd in een vakantieappartement in Spanje. Het proces verliep soepel en het team gaf uitstekende begeleiding bij zowel de juridische als fiscale aspecten. Ze denken echt met je mee!'),
]

def quotes_block(label, btn_label, btn_href):
    qs = ''.join(f'''<figure class="quote{' on' if i == 0 else ''}">
      <blockquote>{q}</blockquote>
      <figcaption>{f'<img src="{img}" alt="" loading="lazy">' if img else ''}<span class="label">{n}</span></figcaption>
    </figure>''' for i, (n, img, q) in enumerate(QUOTES))
    return f'''<section class="sec bg-navy on-dark">
  <div class="wrap quotes">
    <div class="quotes__side">
      <div><span class="label muted">{label}</span></div>
      <div>
        <div class="quotes__nav"><button data-q-prev aria-label="Vorige">{ARROW_L}</button><button data-q-next aria-label="Volgende">{ARROW}</button><span class="quotes__count"><b>01</b> / 0{len(QUOTES)}</span></div>
        <div class="quotes__bar"><i></i></div>
        <div style="margin-top:40px">{lk(btn_label, btn_href)}</div>
      </div>
    </div>
    <div class="quotes__stage">{qs}</div>
  </div>
</section>'''

def LPH(slug, n=0):
    return media(C['listings'][slug]['gallery'][n])

IMG = {k: media(v) for k, v in {
    'team_travel': 'https://pc-spain.com/wp-content/uploads/2024/10/travelling_a_team_of_real_estates_professionals_in_spanish_ci_18f2c688-8a7c-42df-a2f7-da7706d1ec0f_0.png',
    'team': 'https://pc-spain.com/wp-content/uploads/2024/10/PC-Spain-team.png',
    'contract': 'https://pc-spain.com/wp-content/uploads/2017/03/s025.jpg',
    'mijas': 'https://pc-spain.com/wp-content/uploads/2020/04/slider-property-consultancy-spain.jpg',
    'nieuwbouw': 'https://pc-spain.com/wp-content/uploads/2024/10/Nieuwbouw-PC-Spain.jpg',
    'after': 'https://pc-spain.com/wp-content/uploads/2024/10/Mislata-after.png',
    'before': 'https://pc-spain.com/wp-content/uploads/2024/10/Mislata-before-cropped.png',
    's000': 'https://pc-spain.com/wp-content/uploads/2018/07/s000.jpg',
    's0051': 'https://pc-spain.com/wp-content/uploads/revslider/the7-corporate-slider/s0051.jpg',
    's0061': 'https://pc-spain.com/wp-content/uploads/revslider/the7-corporate-slider/s0061.jpg',
    'pc4': 'https://pc-spain.com/wp-content/uploads/2020/11/PC4.jpg',
    'pc1': 'https://pc-spain.com/wp-content/uploads/2020/11/PC1.jpg',
}.items()}


def orbit_html(items):
    n = len(items)
    nodes = ''.join(f'<button class="orbit__node{" on" if i == 0 else ""}" style="--a:{i * 360 / n}deg" data-orbit-go="{i}" aria-label="{t}"><i></i><span>{t}</span></button>' for i, (t, _) in enumerate(items))
    texts = ''.join(f'<div class="orbit__item{" on" if i == 0 else ""}"><span class="label">{i+1:02d} / {n:02d}</span><h3 class="h3">{t}</h3><p>{p}</p></div>' for i, (t, p) in enumerate(items))
    return f'''<div class="orbit" data-orbit style="--n:{n}">
      <svg class="orbit__ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49.6"/><circle class="orbit__dash" cx="50" cy="50" r="46"/><circle class="orbit__prog" cx="50" cy="50" r="49.6" pathLength="100"/></svg>
      <div class="orbit__core"><video muted loop playsinline preload="none" poster="assets/video/contract-keys.jpg" data-src="assets/video/contract-keys.mp4"></video></div>
      <div class="orbit__text" aria-live="polite">{texts}</div>
      <div class="orbit__nodes">{nodes}</div>
    </div>'''

REVIEW_AVATARS = {
    'Arnout Bakker': 'AB', 'Marloes &amp; Peter van den Akker': 'M&amp;P', 'Wim van Brakel': 'WB', 'Johan Hoven': 'JH',
}

def review_card(i, name, img, text, sub):
    tone = ['rcard--paper', 'rcard--navy', 'rcard--white', 'rcard--brass'][i % 4]
    av = f'<img src="{img}" alt="{name}" loading="lazy">' if img else f'<span>{REVIEW_AVATARS.get(name, name[:2])}</span>'
    return f'''<figure class="rcard {tone}">
      <span class="rcard__mark" aria-hidden="true">“</span>
      <blockquote>{text}</blockquote>
      <figcaption><span class="rcard__av">{av}</span><span><b>{name}</b><small class="label">{sub}</small></span></figcaption>
    </figure>'''

def reviews_wall(label, btn_label, btn_href, sub='Klant van PC-Spain'):
    row1 = ''.join(review_card(i, n, im, q, sub) for i, (n, im, q) in enumerate(QUOTES))
    order = [3, 2, 0, 1]
    row2 = ''.join(review_card(i + 1, *QUOTES[j], sub) for i, j in enumerate(order))
    return f'''<section class="sec reviews">
  <div class="wrap reviews__head">
    <span class="label label--brass">{btn_label}</span>
    <h2 class="h2" data-split>{label}</h2>
    <div data-reveal>{lk(btn_label, btn_href)}</div>
  </div>
  <div class="reviews__rows">
    <div class="reviews__row"><div class="reviews__track">{row1}{row1.replace('<figure class="rcard', '<figure aria-hidden="true" class="rcard')}</div></div>
    <div class="reviews__row reviews__row--rev"><div class="reviews__track">{row2}{row2.replace('<figure class="rcard', '<figure aria-hidden="true" class="rcard')}</div></div>
  </div>
</section>'''


def reviews_home(label, btn_label, btn_href, sub='Klant van PC-Spain', all_label=None):
    all_label = all_label or ('Alle reviews' if sub.startswith('Klant') else 'All reviews')
    picks = [QUOTES[3], QUOTES[0]]
    cards = ''.join(f'''<figure class="rfeat rfeat--{i}" data-reveal="{i * .15}">
      <span class="rfeat__mark" aria-hidden="true">“</span>
      <blockquote>{q}</blockquote>
      <figcaption><span class="rcard__av">{f'<img src="{im}" alt="{n}" loading="lazy">' if im else REVIEW_AVATARS.get(n, n[:2])}</span><span><b>{n}</b><small class="label">{sub}</small></span></figcaption>
    </figure>''' for i, (n, im, q) in enumerate(picks))
    return f'''<section class="sec reviews-home">
  <div class="wrap reviews-home__grid">
    <div class="reviews-home__side">
      <span class="label label--brass">{btn_label}</span>
      <h2 class="h2" data-split>{label}</h2>
      <p class="reviews-home__count"><b>{len(QUOTES):02d}</b><span class="label muted">{btn_label}</span></p>
      <div data-reveal>{btn(all_label, btn_href)}</div>
    </div>
    <div class="reviews-home__cards">{cards}</div>
  </div>
</section>'''
# =====================================================================  HOME (NL)
def home_nl():
    pillars = [
        ('Meerdere expertises', 'Van aankoopbegeleiding en raad over je vastgoedportefeuille tot juridisch advies: wij verzorgen het allemaal.'),
        ('Volledige ontzorging', 'Wij begeleiden jou van de huizenjacht tot het tekenen van het koopcontract, en verder.'),
        ('Advies in jouw eigen taal', 'De kwaliteit, kennis en kracht van deskundigen uit beide landen gebundeld in één team.'),
    ]
    advies = [
        ('Volledige ontzorging', 'Meerdere experts slaan de handen in elkaar om jou zo goed en volledig mogelijk te begeleiden bij de koop van vastgoed in Spanje. Hierbij heeft de klant één aanspreekpunt.'),
        ('Professionele ondersteuning', 'Ons team beschikt over uitgebreide kennis van Spaans vastgoed. Bij de aankoop van een woning ontvang je altijd begeleiding mét juridisch advies. PC-Spain staat als één partij aan de kant van de klant.'),
        ('Een woning zonder gebreken', 'Ons huizenaanbod is zorgvuldig geselecteerd en gecontroleerd door onze juridische afdeling. Zo heb jij geen zorgen over (onzichtbare) gebreken van een woning.'),
        ('Transparante tarieven', 'Geen onduidelijke commissies, maar transparante gesprekken over tarieven.'),
        ('Kwaliteit en ervaring', 'Alle betrokken partijen hebben ruime ervaring in de aankoop van woningen in Spanje.'),
    ]
    voordelen = [
        ('Volledige ontzorging', 'Meerdere experts slaan de handen in elkaar om jou zo goed en volledig mogelijk te begeleiden bij de koop van vastgoed in Spanje. Hierbij heeft de klant één aanspreekpunt.', LPH('luxe-villa-moraira')),
        ('Professionele ondersteuning', 'Ons team beschikt over uitgebreide kennis van Spaans vastgoed. Bij de aankoop van een woning ontvang je altijd begeleiding mét juridisch advies. PC-Spain staat als één partij aan de kant van de klant.', LPH('luxe-penthouse-valencia')),
        ('Een woning zonder gebreken', 'Ons huizenaanbod is zorgvuldig geselecteerd en gecontroleerd door onze juridische afdeling. Zo heb jij geen zorgen over (onzichtbare) gebreken van een woning.', IMG['after']),
        ('Maatwerk op het gebied van beleggen in Spanje', 'Gespecialiseerd in op maat gemaakte plannen om uw ideale vastgoedbelegging in Spanje te vinden en optimaal te laten renderen.', LPH('luxe-design-villa-in-benissa')),
        ('Transparante tarieven', 'Geen onduidelijke commissies, maar transparante gesprekken over tarieven. Wanneer je met ons in zee gaat, kom je niet voor ongewenste verrassingen te staan.', LPH('villa-6-slaapkamers-javea')),
        ('Kwaliteit en ervaring', 'Alle bij PC-Spain betrokken partijen hebben bewezen en ruime ervaring in de aankoop van woningen in Spanje.', IMG['mijas']),
    ]
    return home_body(
        lang='nl',
        title_rows=['Investeren in', 'vastgoed in'], script='Spanje?',
        sides=('Valencia', 'Dénia'),
        over_title='Investeren in vastgoed in <span class="script">Spanje?</span>',
        over_text='Ontmoet ons team van experts die u verbinden met topadvocaten, architecten en makelaars.',
        over_cta=('Doe de intake', 'intake.html'), video_label='Bekijk video',
        pillars_label='Property Consultancy Spain', pillars_heading='Woning kopen of huren in Spanje', pillars=pillars,
        advies_label='Waarom PC-Spain', advies_title='Investeren in Spanje? Laat je adviseren', advies=advies,
        advies_cta=('Doe de intake', 'intake.html'),
        hs_label='Voordelen', hs_title='Voordelen van Property Consultancy Spain', hs=voordelen,
        band_label='Werkwijze', band_title='Volledige ontzorging in Spanje',
        band_text='<p>Om de kwaliteit van onze dienstverlening te garanderen, werken wij uitsluitend met onze partners samen. Dit betreft in ons standaard pakket een makelaar én advocaat. Je kan optioneel aanvullende experts toevoegen in het team, zoals een hypotheekadviseur bij een Spaanse bank. Het zijn partijen die <strong>jarenlange ervaring</strong> hebben in hun vak, in Nederlands en Spaans werkgebied. Als je Property Consultancy Spain inschakelt ontvang je de volledige service van alle deskundige, op één plek. Handig toch?</p>',
        band_cta=('Werkwijze', 'werkwijze.html'),
        exp_label='Expertises', exp_title='Ben jij investeerder in Spaans vastgoed?',
        exp_text='<p>Laat ons je ondersteunen bij het optimaliseren van je investeringen met professioneel advies en begeleiding. Property Consultancy Group helpt je graag verder met expertise op het gebied van investeringen, juridische ondersteuning en hypotheekadvies.</p>',
        exp_cta=('Meer informatie!', 'expertises.html'),
        quotes=('Wat klanten over ons zeggen', 'Succesverhalen', 'portfolio.html#reviews', 'Klant van PC-Spain', 'Alle reviews'),
        nb_label='Nieuwbouw', nb_title='Op zoek naar een nieuwbouw woning in Spanje?',
        nb_text='<p>Wij helpen u graag bij het vinden van nieuwbouwprojecten voor eigen gebruik of als investering met uitstekend verhuurrendement. Dankzij onze connecties met de grootste projectontwikkelaars in Spanje hebben we toegang tot exclusieve nieuwbouwmogelijkheden.</p><p><strong>Laat ons u begeleiden in het vinden van de perfecte woning of investering!</strong></p>',
        nb_cta=('Meer informatie!', 'woning-kopen.html'),
        cta_block=('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html'),
    )

def home_body(**k):
    rows = ''.join(f'<span class="row"><span>{r}</span></span>' for r in k['title_rows'])
    pillars = ''.join(f'<article class="pillar"><span class="label label--brass">0{i+1}</span><h3 class="h3" data-split>{t}</h3><p data-reveal=".2">{p}</p></article>' for i, (t, p) in enumerate(k['pillars']))
    orbit = orbit_html(k['advies'])
    n = len(k['hs'])
    hs = ''.join(f'''<article class="hs__card">
        <span class="label">{str(i+1).zfill(2)} / {str(n).zfill(2)}</span>
        <div class="frame"><img src="{sm(img)}" alt="" loading="lazy" decoding="async"></div>
        <h3 class="h3">{t}</h3><p>{p}</p></article>''' for i, (t, p, img) in enumerate(k['hs']))
    quotes = reviews_show(*k['quotes']) + k.get('quotes_alt', '')
    nb = ''
    if k.get('nb_title'):
        nb = f'''<section class="band band--expand">
  <div class="band__media"><video muted loop playsinline preload="none" poster="assets/video/villa.jpg" data-src="assets/video/villa.mp4"></video></div>
  <div class="band__inner wrap"><div class="grid-12">
    <div class="band__title"><span class="label" data-reveal>{k['nb_label']}</span><h2 class="h2" data-split style="margin-top:22px">{k['nb_title']}</h2></div>
    <div class="band__text" data-reveal=".2">{k['nb_text']}{lk(*k['nb_cta'])}</div>
  </div></div>
</section>'''
    return f'''
<section class="intro" id="intro">
  <div class="intro__window"><video autoplay muted loop playsinline preload="none" poster="assets/video/intro-montage.jpg" data-src="assets/video/intro-montage.mp4"></video></div>
  <h1 class="intro__title" aria-label="{re.sub('<[^>]+>', '', ' '.join(k['title_rows']) + ' ' + k['script'])}">{rows}<span class="script">{k['script']}</span></h1>
  <span class="intro__side intro__side--l label">{k['sides'][0]}</span>
  <span class="intro__side intro__side--r label">{k['sides'][1]}</span>
  <div class="intro__over">
    <h2>{k['over_title']}</h2>
    <div class="intro__over-side">
      <p>{k['over_text']}</p>
      <div style="display:flex;gap:28px;flex-wrap:wrap;align-items:center">{btn(k['over_cta'][0], k['over_cta'][1], 'btn--light')}<button class="lk" data-video="assets/video/valencia-city.mp4">{k['video_label']} {ARROW}</button></div>
    </div>
  </div>
  <div class="intro__scroll label"><span>Scroll</span><i></i></div>
</section>

{panels_html(k['pillars_label'], k.get('pillars_heading', ''), k['pillars'])}

<section class="sec bg-white orbit-sec">
  <div class="wrap orbit-grid">
    <div class="orbit-intro">
      <span class="label label--brass" data-reveal>{k['advies_label']}</span>
      <h2 class="h2" data-split>{k['advies_title']}</h2>
      <div class="orbit-count" aria-hidden="true">
        <span class="orbit-count__num" data-orbit-num>01</span>
        <span class="orbit-count__of label">/ {len(k['advies']):02d}</span>
      </div>
      <div class="orbit-ctrl">
        <button data-orbit-prev aria-label="Vorige">{ARROW_L}</button>
        <button data-orbit-next aria-label="Volgende">{ARROW}</button>
        <span class="orbit-ctrl__bar"><i data-orbit-bar></i></span>
      </div>
      <div data-reveal>{btn(*k['advies_cta'])}</div>
    </div>
    {orbit}
  </div>
</section>

<section class="hs">
  <div class="hs__pin">
    <div class="hs__head"><div><span class="label label--brass">{k['hs_label']}</span><h2 class="h2" data-split style="margin-top:18px">{k['hs_title']}</h2></div><span class="hs__count label"><b>01</b> / {str(n).zfill(2)}</span></div>
    <div class="hs__track">{hs}</div>
    <div class="hs__bar"><i></i></div>
  </div>
</section>

<section class="band">
  <div class="band__media"><video muted loop playsinline preload="none" poster="assets/video/valencia-city.jpg" data-src="assets/video/valencia-city.mp4" data-parallax="10"></video></div>
  <div class="band__inner wrap"><div class="grid-12">
    <div class="band__title"><span class="label" data-reveal>{k['band_label']}</span><h2 class="h1" data-split style="margin-top:22px;font-size:clamp(2.6rem,6.4vw,6.8rem)">{k['band_title']}</h2></div>
    <div class="band__text" data-reveal=".2">{k['band_text']}{lk(*k['band_cta'])}</div>
  </div></div>
</section>

<section class="sec">
  <div class="wrap split split--rev split--wide">
    <div class="split__media"><figure class="frame frame--land" data-img><video muted loop playsinline preload="none" poster="assets/video/pool-house.jpg" data-src="assets/video/pool-house.mp4"></video></figure></div>
    <div class="split__text">
      <span class="label label--brass" data-reveal>{k['exp_label']}</span>
      <h2 class="h2" data-split>{k['exp_title']}</h2>
      <div class="body" data-reveal=".2">{k['exp_text']}</div>
      <div data-reveal=".3">{btn(*k['exp_cta'])}</div>
    </div>
  </div>
</section>

{nb}
{quotes}
{cta(*k['cta_block'])}
'''

# =====================================================================  HOME (EN)
def home_en():
    en = [
        ('Multiple expertises', 'From purchasing guidance to legal councelling… All gathered in one place.'),
        ('Completely carefree', 'We support you from the moment you start house hunting untill signing the contract for your purchase or rental property.'),
        ('Quick service', 'We provide a professional and quick service which is unique in Spain.'),
    ]
    advies = [
        ('Completely carefree', 'Mulitple experts join forces to guide you in pruchasing real estate in Spain. While you only have one contact person.'),
        ('Professional support', 'The team has detailed and extensive knowledge. From purchasing guidance to legal councelling to a morgage application with a Spanish bank. One party on the customers side!'),
        ('A property without defects', 'The offer of real estate has been carefully selected and checked by our own legal devision. An unpleasant surprise!'),
        ('Transparent prices', 'No vague commissions, but transparent conversations about prices!'),
        ('Quality and experience', 'All sides involved have extensive and proven experience in Spain.'),
    ]
    adv = [
        ('Completely carefree', 'Multiple experts join forces to guide you in purchasing real estate in Spain. While you only have one contact person.', LPH('luxe-villa-moraira')),
        ('Professional support', 'The team has extensive knowledge. When purchasing or renting property you will always receive support with legal advice. One party on the customers side!', LPH('luxe-penthouse-valencia')),
        ('A property without defects', 'The offer of real estate has been carefully selected and checked by our own legal devision. This way, you won’t have to worry about (hidden) defects in a property!', IMG['after']),
        ('Transparent prices', 'No vague commissions, but transparent conversations about prices! When you choose Property Consultancy Spain, you will not face any unpleasant surprises.', LPH('villa-6-slaapkamers-javea')),
        ('Quality and experience', 'All sides involved have extensive and proven experience in purchasing or renting property in Spain!', IMG['mijas']),
    ]
    owner = f'''<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__media"><figure class="frame frame--arch" data-img><video muted loop playsinline preload="none" poster="assets/video/villa.jpg" data-src="assets/video/villa.mp4"></video></figure></div>
    <div class="split__text">
      <h2 class="h2" data-split>Are you an owner of a Spanish property?</h2>
      <div class="rows">
        <div class="row-item" data-reveal><h3 class="h3">Rent Property</h3><p>Our Team will search for a suitible tenant for your Spanish property. Met juridische ondersteuning worden eerlijke contracten opgesteld, waardoor jij geen zorgen hebt als verhuurde partij. With support from our legal department fair contracts will be drawn. This way you, the renting side, won’t have any worries.</p></div>
        <div class="row-item" data-reveal><h3 class="h3">Selling property</h3><p>Use our network to sell your Spanish property. A team combined from a real estate agent and a lawyer will provide you the perfect starting position. Strong negotiations and extensive legal checks.</p></div>
      </div>
      <div data-reveal>{btn('Meer informatie!', '#contact')}</div>
    </div>
  </div>
</section>'''
    return home_body(
        lang='en', title_rows=['Want to buy', 'or rent a property'], script='in Spain?', sides=('Valencia', 'Dénia'),
        over_title='Want to buy or rent a property <span class="script">in Spain?</span>', over_text='Let us advice you',
        over_cta=('Contact', '#contact'), video_label='Video',
        pillars_label='Property Consultancy Spain', pillars=en,
        advies_label='Property Consultancy Spain', advies_title='Want to buy or rent a property in Spain? Let us advice you', advies=advies,
        advies_cta=('Contact', '#contact'),
        hs_label='Property Consultancy Spain', hs_title='Advantages of Property Consultancy Spain', hs=adv,
        band_label='Working method', band_title='Completely carefree in Spain',
        band_text='<p>To guarantee the quality of our service, we choose to work only with our partners. In our standard package, this means a real estate agent ánd a lawyer. You can choose additional experts to the team such as a mortgage broker at a Spanish bank. These are people with <strong>long time experience</strong> in their profession in the Dutch and Spanish working field. When you contract Property Consultancy Spain you will receive full service from all experts in one place. Easy right?</p>',
        band_cta=('Werkwijze', 'en-working-method.html'),
        exp_label='Expertises', exp_title='Expertises in Spain',
        exp_text='<p>From purchasing guidance to legal councelling… All gathered in one place.</p>',
        exp_cta=('Expertises', 'en-expertises.html'),
        quotes=('What customers say about us', 'Success stories', 'en-success-stories.html', 'Customer of PC-Spain', 'All reviews'), quotes_alt=owner,
        cta_block=('Curious to find out about the possibilities?', 'Feel free to contact us!', 'Contact', '#contact'),
    )

# =====================================================================  NL inner pages
def over_pc_spain():
    minis = ['39-appartementen-denia', 'chalet-pedreguer', 'villa-in-beniarbeig', 'drie-slaapkamer-villa-javea', 'finca-gata-de-gorgos', 'la-llosa-de-ranes-xativa', 'chalet-gandia', 'bodega-xativa']
    cards = ''.join(listing_card(next(c for c in CARDS if c['url'].rstrip('/').endswith(s)), i) for i, s in enumerate(minis))
    return page_hero([('Home', 'index.html'), ('Over ons', 'over-pc-spain.html'), ('Over PC-Spain', '')], 'Over PC-Spain', aside='Woning kopen of huren in Spanje', img=IMG['team_travel']) + f'''
<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Wie of wat?</span></div>
    <div class="split__main"><p class="lead" data-split>Property Consultancy Spain is een bedrijf van vastgoedexperts die zich richten op klanten die niet per se een makelaar zoeken, maar wel een consultant die hen kan bijstaan in de zoektocht naar een woning en/of belegging in Spanje. Als jij op zoek bent naar een ervaren partij in Spanje die jou kan bijstaan tijdens het gehele (ver)koopproces van vastgoed, zijn wij een goede match!</p></div>
  </div>
</section>
<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__media"><figure class="frame frame--arch" data-img><img src="{IMG['team']}" alt="Het team van PC-Spain" loading="lazy"></figure></div>
    <div class="split__text">
      <h2 class="h2" data-split>Waarom PC-Spain?</h2>
      <div class="body" data-reveal>
        <p>Met kantoren in diverse plaatsen in Spanje en ook op verschillende locaties in Nederland en de Verenigde Staten (Zuid-Florida), kunnen wij klanten in Nederland en een deel van België en Duitsland goed bedienen en ondersteunen bij de aankoop van hun (tweede) woning of belegging. Dankzij onze ruime ervaring in vastgoed in Nederland en Spanje heeft ons team alle kennis in huis om jou bij te staan bij het aankopen van vastgoed in Spanje.</p>
        <p>Mede door ons ruime en goed geselecteerde netwerk van makelaars, projectontwikkelaars, notarissen, financiële adviseurs, veilingen en advocaten kunnen wij jou volledig ondersteunen gedurende het gehele aankoopproces.</p>
        <p>Tot ons netwerk behoren <strong>Engels, Nederlands, Spaans en Duits sprekende partners</strong>.</p>
      </div>
      <ul class="inline-list" data-reveal><li>Makelaars</li><li>Projectontwikkelaars</li><li>Notarissen</li><li>Financiële adviseurs</li><li>Veilingen</li><li>Advocaten</li></ul>
    </div>
  </div>
</section>
<section class="band band--expand">
  <div class="band__media"><video muted loop playsinline preload="none" poster="assets/video/valencia-city.jpg" data-src="assets/video/valencia-city.mp4"></video></div>
  <div class="band__inner wrap"><div class="grid-12">
    <div class="band__title"><h2 class="h2" data-split>Wat kan PC-Spain voor jou doen?</h2></div>
    <div class="band__text" data-reveal=".2"><p>Of je nu een appartement of (tweede) woning zoekt of een belegging wilt doen in Spanje, wij kunnen je ondersteunen met ons team van consultants en ons uitgebreide netwerk. Het kopen van vastgoed in Spanje gaat alles behalve hetzelfde als in Nederland. Buiten de taal zijn de wetten, regels en de cultuur anders.</p></div>
  </div></div>
</section>
<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">PC-Spain</span></div>
    <div class="split__main body" data-reveal><p>Ons team kan jou ondersteunen, zowel voordat je afreist naar Spanje, als direct op een van onze kantoren aldaar. Gedurende het proces staan wij je bij. De consultants van PC-Spain zijn geen traditionele makelaars die voor de verkoop gaan, maar vastgoedspecialisten die je begeleiden bij de aankoop van vastgoed. Tevens kunnen wij adviseren bij de verkoop van jouw woning, zowel in Nederland als in Spanje.</p><p class="lead" style="margin-top:36px">Investeren in jouw Spaanse toekomst doe je met de hulp van Property Consultancy Spain!</p></div>
  </div>
</section>
<section class="sec bg-white">
  <div class="wrap">
    <div class="sec-head"><span class="label">Woningaanbod</span><h2 class="h2" data-split>Woningaanbod</h2></div>
    <div class="lgrid lgrid--3">{cards}</div>
    <div class="more">{btn('Woning kopen', 'woning-kopen.html')}</div>
  </div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')

def steps_html(steps):
    out = []
    for i, (h, ps) in enumerate(steps, 1):
        ps = ps if isinstance(ps, list) else [ps]
        out.append(f'<li class="step" data-reveal><span class="step__n">{i:02d}</span><div><h3 class="h3">{i}. {h}</h3>{"".join(f"<p>{p}</p>" for p in ps)}</div></li>')
    return '<ol class="steps__list">' + ''.join(out) + '</ol>'

def werkwijze():
    buy = [
        ('Kennismaken', 'We luisteren naar de wensen en behoeften van de klant. Wat zijn de voorkeuren? Een villa in Moraira of een appartement in een stad als Valencia? Elke type woning heeft zijn eigen kenmerken, de klant wordt hier daarom al voorzien van <strong>advies op maat</strong>. Tevens worden in deze fase de financiële mogelijkheden van de klant bekeken.'),
        ('Huizenjacht', 'Samen gaan we op zoek naar jouw Spaanse woning of belegging! Je mag hierbij een <strong>actieve houding</strong> verwachten vanuit onze adviseurs. Zit jouw woning naar wens niet tussen ons aanbod? Geen probleem, dan kijken we verder bij makelaar collega’s. Alles om een woning te vinden die aansluit op jouw wensen!'),
        ('Bezichtiging inplannen', 'Een woning naar wens is gevonden! Wij hechten in het proces veel waarde aan persoonlijke aandacht. Daarom ontvang je ook bij het boeken van een bezichtigingsreis hulp en advies.'),
        ('Ideale woning of belegging gevonden', 'In Spanje is het van groot belang om een <strong>woning zonder gebreken</strong> aan te kopen. Daarom wordt in deze fase de woning al gecontroleerd door onze juridische afdeling. Kloppen de registraties en (woon)vergunningen? Is de achtergrond van de verhuurder/verkoper correct?'),
        ('Prijsovereenstemming', 'Een woning zonder zorgen start bij het maken van goede afspraken. Onderhandelingen voor de aankoopprijs of het maandelijkse huurbedrag nemen wij voor onze rekening. Hierbij staan we <strong>aan de kant van de klant</strong>, onze commissie is immers al <a href="tarieven.html">bij aanvang gecommuniceerd</a>. Geen verborgen afspraken, maar transparante overeenkomsten!'),
        ('Deal!', 'Na een prijsovereenstemming worden bepaalde zaken afgerond. Denk bij een aankoop aan de financiering bij de Spaanse bank. Hierna kunnen we samen <strong>proosten</strong>!'),
    ]
    inv = [
        ('Vrijblijvend gesprek', ['Wij bieden een vrijblijvend gesprek aan, dat zowel via videocall als op locatie in Spanje kan plaatsvinden. Tijdens dit gesprek krijgt u de kans om uw wensen en doelen te bespreken met een van onze ervaren consultants.']),
        ('Bespreken van investeringsopties', ['In dit gesprek nemen we het volledige proces met u door en bespreken we diverse investeringsopties, zoals bankbeslagen, vastgoedveilingen of transformatieprojecten. We helpen u om de beste keuze te maken die aansluit bij uw investeringsstrategie.']),
        ('Bezoek aan investeringsobjecten', ['Wanneer u besluit om met ons samen te werken, plannen we een bezoek in naar Valencia of een andere door ons geselecteerde regio. Gedurende twee dagen begeleiden we u langs verschillende investeringsobjecten en bouwprojecten.', 'Tijdens deze dagen vinden er ook informatieve gesprekken plaats met internationale belastingadviseurs, bouwers en juristen.', 'Op deze manier bent u goed geïnformeerd en kunnen onze consultants al uw vragen beantwoorden.']),
    ]
    return page_hero([('Home', 'index.html'), ('Over ons', 'over-pc-spain.html'), ('Werkwijze', '')], 'Makelaardij in', script='Spanje', aside='Werkwijze - Woning kopen in Spanje', video='assets/video/valencia-city.mp4', poster='assets/video/valencia-city.jpg') + f'''
<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Makelaardij in Spanje</span></div>
    <div class="split__main">
      <p class="lead" data-split>Het relaxte leven en de dagelijkse zonnestralen maken jou een <em>liefhebber van Spanje</em>. Echter is dit zakelijk gezien even schakelen! Er komt namelijk veel kijken bij de koop van een Spaanse woning. De <em>mañana mañana</em> cultuur en de taalbarrière kunnen dan een struikelblok vormen.</p>
      <div class="body" data-reveal><p>Property Consultancy Spain is er om jouw zorgen uit handen te nemen! Onze volledige expertise op verschillende vakgebieden is wat ons <strong>uniek maakt in de makelaardij</strong> in Spanje. Er zijn geen onduidelijke afspraken tussen meerdere externe partijen, omdat wij alle expertise onder één dak hebben die nodig is bij de begeleiding in de koop van een woning in Spanje. Hierdoor is het gehele proces vanaf het begin af aan transparant en zijn er geen onaangename verrassingen. Wij zijn één team met alle expertise!</p></div>
    </div>
  </div>
</section>
<section class="sec--tight bg-navy on-dark" style="padding-block:clamp(72px,8vw,128px)">
  <div class="wrap counters">
    <div class="counter"><b data-count="16">16</b><span class="label muted">Experts</span></div>
    <div class="counter"><b data-count="120">120</b><span class="label muted">Tevreden klanten</span></div>
    <div class="counter"><b data-count="23">23</b><span class="label muted">Jaar ervaring in Spanje</span></div>
  </div>
</section>
<section class="sec">
  <div class="wrap steps">
    <div class="steps__side"><div class="steps__sticky">
      <span class="label label--brass">Werkwijze</span>
      <h2 class="h2" data-split>Werkwijze - Woning kopen in Spanje</h2>
      <div class="body" data-reveal><p>Je kan ons inschakelen voor het kopen van een woning in Spanje. Je schakelt een team in met persoonlijke adviseurs. Standaard ontvang jij <strong>aankoopbegeleiding en juridische begeleiding</strong>. Is aanvullend advies nodig? Dan kan je het team uitbreiden. Hieronder krijg je inzicht hoe de koop van een woning werkt.</p></div>
    </div></div>
    {steps_html(buy)}
  </div>
</section>
<section class="band band--expand">
  <div class="band__media"><video muted loop playsinline preload="none" poster="assets/video/villa.jpg" data-src="assets/video/villa.mp4"></video></div>
  <div class="band__inner wrap"><div class="grid-12">
    <div class="band__title" style="grid-column:1 / -1"><h2 class="h1" data-split style="font-size:clamp(2.6rem,6.6vw,7rem);max-width:14ch">Wilt u een belegging aankopen in Spanje?</h2></div>
  </div></div>
</section>
<section class="sec bg-white">
  <div class="wrap steps">
    <div class="steps__side"><div class="steps__sticky">
      <span class="label label--brass">Werkwijze</span>
      <h2 class="h2" data-split>Werkwijze - Belegging aankopen in Spanje</h2>
      <div class="body" data-reveal><p>Je kunt ons inschakelen voor het aankopen van een vastgoedbelegging in Spanje. Met jarenlange ervaring in het begeleiden van investeerders, biedt PC-Spain een volledig team van persoonlijke adviseurs. Standaard bieden we aankoop- en juridische begeleiding, en indien nodig kan het team worden uitgebreid met fiscale experts en ontwikkelaars.</p><p>Wij helpen u bij het benutten van investeringskansen, zoals bankbeslagen, vastgoedveilingen, transformatieobjecten, het splitsen van woningen, het creëren van studentenwoningen, co-living projecten, en het renoveren van historische panden. Hieronder leest u hoe het proces van een vastgoedbelegging verloopt.</p></div>
    </div></div>
    {steps_html(inv)}
  </div>
</section>
''' + cta('Bent u klaar voor uw tweede woning of belegging in Spanje?', '', 'Ga van start!', 'intake.html')

def expertises():
    xs = [
        ('aankoop', 'Aankoopbegeleiding', IMG['s000'], 'Ons team helpt jou met het zoeken van een droomhuis in Spanje. Door jarenlang zaken te doen in Spanje weten ze de beste match te maken. Een nieuwbouwwoning dicht aan het Spaanse strand? Of juist een knus appartement in een stad? Ze gaan graag met jouw wensen aan de slag! Er is een eigen aanbod van woningen beschikbaar, waar een match wordt gezocht. Zit jouw woning hier niet tussen? Geen probleem, dan kijken ze verder bij collega makelaars. De commissie voor de dienstverlening ons team wordt transparant besproken. Je hoeft je dus geen zorgen te maken dat je onbewust hoge commissies moet betalen.', ['Betrouwbare partner', 'Transparante tarieven', '100% persoonlijke aandacht'], 'intake.html', False, 'standaard'),
        ('juridisch', 'Juridisch advies', IMG['s0061'], 'Voor juridisch advies nemen we onze betrouwbaar advocatenkantoor in de arm! Een partij die zijn weg kent in de <strong>Spaanse wet- en regelgeving</strong>. De diensten van hen wordt niet enkel beperkt tot begeleiding bij de aankoop van een woning. Er zijn veel meer mogelijkheden! Wens jij bijvoorbeeld een bedrijf op te starten of dien je aangifte te doen in Spanje? Wij helpen jou graag verder.', ['Advies op meerdere rechtsgebieden', 'Professionele dienstverlening', 'Ervaring in de Spaanse wet- en regelgeving'], 'https://gimbrerelegal.com/', True, 'standaard'),
        ('hypotheek', 'Hypotheekadvies', IMG['pc4'], 'Is een hypotheek noodzakelijk of gewenst in jouw dossier? Ook op dit gebied is er expertise in ons team. We schakelen hiervoor Spaanse Hypotheek en haar team in. Een Nederlandstalige partner welke advies kan uitbrengen over een financiering bij een Spaanse bank. Met meerdere banken in hun netwerk, kunnen ze <strong>onafhankelijk hypotheekadvies</strong> uitbrengen. Gebaseerd op het klantprofiel. Iets wat hen uniek maakt!', ['Onafhankelijke hypotheekadvies', 'Schakel tussen klant en Spaanse bank', 'Specialisatie: ondernemerdossiers'], 'http://www.spaansehypotheek.nl', True, 'optioneel'),
        ('renovatie', 'Renovatie/Verbouwing', IMG['before'], 'Wil je een Spaanse woning laten verbouwen? Property Consultancy Spain helpt jou met een <strong>verbouwing scan</strong>! Met onze experts maken we het voor de klant inzichtelijk wat de kosten en het tijdsbestek zal zijn voor de geplande renovatie. Maar ook of het plan juridisch gezien haalbaar is. Ondersteuning in de voorbereiding en/of begeleiding in het proces!', ['Realistische tijdsplanning en kostenbegroting', 'Juridische check', 'Advies voor- en tijdens de renovatie'], 'intake.html', False, 'optioneel'),
    ]
    blocks = ''
    for i, (key, name, img, text, ticks, href, ext, pkg) in enumerate(xs):
        rev = ' split--rev' if i % 2 else ''
        blocks += f'''<section class="xblock{' bg-white' if i % 2 else ''}" id="{key}">
  <div class="wrap split{rev}">
    <div class="split__media"><figure class="frame {'frame--arch' if i % 2 == 0 else 'frame--tall'}" data-img><img src="{img}" alt="{name}" loading="lazy"></figure></div>
    <div class="split__text">
      <span class="label label--brass" data-reveal>Expertises in Spanje</span>
      <h2 class="h2" data-split>{name}</h2>
      <div class="body" data-reveal><p>{text}</p></div>
      <ul class="ticks" data-reveal>{''.join(f'<li>{t}</li>' for t in ticks)}</ul>
      <p class="pkg" data-reveal>* Expertise: <b>{pkg}</b> in jouw pakket.</p>
      <div data-reveal>{lk('Meer weten', href, ext)}</div>
    </div>
  </div>
</section>'''
    idx = ''.join(f'<li><a href="#{k}"><span>{n}</span><span class="label">{s}</span></a></li>' for k, n, s in [('aankoop', 'Aankoopbegeleiding', '01'), ('juridisch', 'Juridisch advies', '02'), ('hypotheek', 'Hypotheekadvies', '03'), ('renovatie', 'Verbouwingscan', '04'), ('contact', 'Woningbeheer', '05')])
    return page_hero([('Home', 'index.html'), ('Over ons', 'over-pc-spain.html'), ('Expertises', '')], 'Expertises in', script='Spanje', aside='Hoe gaan wij te werk?', img=IMG['s0051']) + f'''
<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Hoe gaan wij te werk?</span></div>
    <div class="split__main">
      <div class="body" data-reveal style="max-width:70ch"><p>Om de kwaliteit van onze dienstverlening te garanderen, werken wij uitsluitend met onze partners samen. Onze partners hebben ervaring in het Spaanse werkgebied. Het zijn partijen waar wij, maar ook de klant, <strong>op kan bouwen</strong>. Je schakelt Property Consultancy Spain in en ontvangt altijd begeleiding + juridisch advies. Optioneel voeg jij deskundige waar jij behoefte aan hebt toe! Hierbij is het niet mogelijk om zelf partijen in te schakelen, waarvan wij de kwaliteit niet kunnen garanderen. Dit brengt onduidelijkheid met zich mee door communiceren over meerdere kanalen. Om een <strong>exclusieve service</strong> te kunnen bieden ontvang je bij Property Consultancy Spain daarom het volledige pakket. Lees hieronder de verschillende expertises waar jij gebruik van kan maken.</p></div>
      <ul class="xindex" style="margin-top:56px" data-reveal>{idx}</ul>
    </div>
  </div>
</section>
{blocks}
''' + cta('Aan de slag in Spanje!', 'Alles wat met de koop of huur van de woning te maken heeft is bij Property Consultancy Spain te vinden. Er is geen ruis in de communicatie, aangezien alle partijen in één team samenwerken. Je hebt dus één aanspreekpunt, wat door onze klanten als zeer prettig wordt ervaren. Benieuwd hoe onze commissie is opgebouwd?', 'Naar tarieven!', 'tarieven.html')

def portfolio():
    return page_hero([('Home', 'index.html'), ('Over ons', 'over-pc-spain.html'), ('Portfolio', '')], 'Portfolio', aside='Succesverhalen', img=IMG['after']) + f'''
<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Portfolio</span></div>
    <div class="split__main"><p class="lead" data-split>Bij Property Consultancy Spain begeleiden we klanten in het transformeren van oude panden, zoals kantoren en loodsen, naar moderne woon- of werkruimtes. Of het nu gaat om co-living projecten of kantoorruimtes, wij zorgen ervoor dat elk gebouw wordt omgevormd tot een innovatieve en functionele ruimte.</p>
    <div class="body" data-reveal><p>Hier onder vind je een selectie van ons portfolio, waarin we enkele van onze meest succesvolle transformatieprojecten laten zien. Deze voorbeelden geven een goed beeld van ons vakmanschap en toewijding aan kwaliteit en design.</p></div></div>
  </div>
</section>
<section class="sec bg-white" style="padding-top:0;background:linear-gradient(var(--paper) 30%, var(--white) 30%)">
  <div class="wrap">
    <div class="ba" data-reveal>
      <img src="{IMG['after']}" alt="Transitie Valencia – na">
      <img class="ba__before" src="{IMG['before']}" alt="Transitie Valencia – voor">
      <div class="ba__line"><span class="ba__knob"><span>⟷</span></span></div>
      <span class="ba__tag ba__tag--b label">Voor</span><span class="ba__tag ba__tag--a label">Na</span>
      <input type="range" id="ba-range" min="0" max="100" value="50" aria-label="Voor en na vergelijken">
    </div>
    <div class="split" style="margin-top:clamp(56px,6vw,96px)">
      <div class="split__label"><span class="label label--brass">Transformatie</span></div>
      <div class="split__main"><h2 class="h2" data-split>Transitie Valencia</h2><div class="body" data-reveal><p>Dit prachtige appartement in Valencia is ontstaan uit de transformatie van een oud kantoorpand naar een moderne woonruimte. Met aandacht voor detail en hoogwaardige afwerking is het kantoor volledig omgebouwd tot een stijlvol appartement. De ligging in het hart van Valencia, gecombineerd met de vernieuwde en comfortabele inrichting, maakt dit de perfecte plek om te wonen of te investeren. Het appartement biedt een unieke mix van geschiedenis en moderne voorzieningen, waardoor het een bijzondere en aantrekkelijke optie is voor de liefhebber van eigentijds wonen.</p></div></div>
    </div>
  </div>
</section>
{quotes_block('Wat klanten over ons zeggen', 'Doe de intake', 'intake.html')}
<section class="sec">
  <div class="wrap split">
    <div class="split__media"><figure class="frame frame--arch" data-img><img src="{IMG['nieuwbouw']}" alt="" loading="lazy"></figure></div>
    <div class="split__text">
      <h2 class="h2" data-split>Start jouw vastgoedtransformatie!</h2>
      <div class="body" data-reveal><p>Ben je klaar om een oude ruimte om te toveren tot een moderne woon- of werkplek? Wij begeleiden je van begin tot eind, met innovatieve oplossingen en een team van experts. Neem vandaag nog de eerste stap naar jouw succesvolle transformatie!</p><p>Laat ons je ondersteunen bij het optimaliseren van je investeringen met professioneel advies en begeleiding. Property Consultancy Group helpt je graag verder met expertise op het gebied van investeringen, juridische ondersteuning en hypotheekadvies.</p></div>
      <div data-reveal>{btn('Meer informatie!', 'intake.html')}</div>
    </div>
  </div>
</section>'''

PARTNERS = [
    ('BeleggenInValencia.nl', 'https://pc-spain.com/wp-content/uploads/2024/11/Beleggen-In-Valencia.png', 'https://beleggeninvalencia.nl', ['Beleggeninvalencia.nl is gespecialiseerd in het begeleiden van internationale investeerders bij de aankoop en ontwikkeling van vastgoed in Valencia. Met een diepgaande kennis van de lokale markt en een sterk netwerk van juridische, fiscale en bouwexperts biedt Beleggeninvalencia.nl een complete dienstverlening.', 'Van het vinden van de juiste panden tot projectmanagement en het optimaliseren van het investeringsrendement: zij zorgen ervoor dat elke stap professioneel en efficiënt verloopt. Beleggeninvalencia.nl maakt investeren in Valencia toegankelijk en succesvol voor zowel particuliere als zakelijke beleggers.']),
    ('Ambau', 'https://pc-spain.com/wp-content/uploads/2024/10/Ambau-1.png', None, ['Ambau is een jong en dynamisch architectenbureau uit Valencia, gespecialiseerd in het bedenken van moderne en efficiënte oplossingen voor elk project. Dankzij hun innovatieve aanpak en snelle werkwijze kunnen zij maatwerk leveren dat perfect aansluit bij de wensen van hun klanten.', 'Of het nu gaat om een nieuwbouwproject of een renovatie, Ambau combineert creativiteit met functionaliteit om hoogwaardige en unieke ontwerpen te realiseren. Samen met PC Spain zorgen ze voor naadloze architectonische oplossingen binnen elk investeringsproject.']),
    ('Santander', 'https://pc-spain.com/wp-content/uploads/2024/10/Santander.png', None, ['Santander is een toonaangevende bank in Spanje, met een sterke focus op zowel nationale als internationale markten. Het biedt een breed scala aan financiële diensten, variërend van persoonlijke bankdiensten tot bedrijfsoplossingen, en staat bekend om zijn innovatieve digitale oplossingen.', 'Santander speelt een belangrijke rol in de financiering van vastgoed- en investeringsprojecten, wat het een betrouwbare partner maakt voor iedereen die actief is in de vastgoedmarkt in Spanje. Dankzij hun jarenlange ervaring kunnen ze investeerders op maat gemaakte financiële oplossingen bieden.']),
    ('Cajamar', 'https://pc-spain.com/wp-content/uploads/2024/10/Cajamar.png', None, ['Cajamar is een toonaangevende coöperatieve bank in Spanje met een sterke focus op de landbouwsector en duurzame projecten. Met een uitgebreid netwerk van filialen en een klantgerichte benadering, biedt Cajamar financiële oplossingen voor zowel particulieren als bedrijven.', 'Hun expertise in vastgoedfinanciering maakt hen een ideale partner voor investeerders die op zoek zijn naar betrouwbare hypotheek- en investeringsopties in Spanje. Cajamar staat bekend om hun innovatie in de banksector en hun betrokkenheid bij regionale economische ontwikkeling.']),
    ('Fides – ETL Global', 'https://pc-spain.com/wp-content/uploads/2024/10/Fides.png', None, ['Fides Auditores is een gerenommeerd accountantskantoor dat gespecialiseerd is in fiscale, boekhoudkundige en auditdiensten. Met een ervaren team van professionals biedt Fides Auditores op maat gemaakte oplossingen voor bedrijven en particulieren die hun financiële zaken in Spanje willen optimaliseren. Hun expertise en grondige kennis van de lokale wetgeving maken hen een betrouwbare partner voor zowel investeerders als ondernemers. Door nauw samen te werken met klanten, waarborgen ze transparantie en naleving van fiscale verplichtingen, waardoor financiële processen efficiënt worden beheerd.']),
    ('Gimbrere Legal', 'https://pc-spain.com/wp-content/uploads/2024/10/Gimbrere-Legal.png', None, ['Gimbrere Legal is een internationaal advocatenkantoor dat gespecialiseerd is in juridische diensten op het gebied van onder andere vastgoed, ondernemingsrecht, en immigratierecht. Met kantoren in zowel Spanje als Nederland biedt Gimbrere Legal grensoverschrijdende juridische ondersteuning voor particulieren en bedrijven die zaken doen in Spanje.', 'Hun team van ervaren advocaten staat bekend om hun betrokkenheid, expertise en persoonlijke aanpak, waarbij zij cliënten door complexe juridische vraagstukken begeleiden. Samen met PC Spain zorgen zij voor naadloze juridische ondersteuning bij investeringsprojecten.']),
    ('To Do', 'https://pc-spain.com/wp-content/uploads/2024/10/To-Do.png', None, ['To Do is een hoogwaardig architectenbureau dat gespecialiseerd is in luxueuze en moderne projecten. Met een verfijnde en innovatieve aanpak realiseren ze unieke ontwerpen die esthetiek en functionaliteit combineren. To Do creëert exclusieve woon- en werkruimtes die aan de hoogste standaarden voldoen. Dankzij hun oog voor detail en gebruik van hoogwaardige materialen, weten ze telkens weer indrukwekkende architecturale meesterwerken te leveren.', 'Samen met PC Spain zorgen ze voor luxueuze vastgoedoplossingen die perfect passen bij de wensen van de meest veeleisende investeerders.']),
    ('Handy Valencia', 'https://pc-spain.com/wp-content/uploads/2024/10/Handy-Valencia.png', None, ['Handy Valencia is een aannemer die bekend staat om zijn uitstekende communicatie en snelle aanpak. Met continue updates over de voortgang houden ze klanten nauw betrokken bij het project. Handy Valencia levert verbouwingen en renovaties van topkwaliteit, waarbij geen detail over het hoofd wordt gezien.', 'Hun persoonlijke benadering en focus op klanttevredenheid zorgen ervoor dat elk project niet alleen volgens planning, maar ook met de hoogste kwaliteitsstandaarden wordt afgerond.']),
    ('Orange Estates', 'assets/logo/orange-estates.png', None, ['Orange Estates is een wereldwijd netwerk van ervaren vastgoedprofessionals, waaronder makelaars, notarissen, juridische experts, architecten en aannemers. Ze zijn toegewijd aan het realiseren van de vastgoeddoelen van hun klanten door middel van een naadloze en samenwerkingsgerichte aanpak. Of het nu gaat om aan- of verkoop, ontwikkeling of advies,', 'Orange Estates biedt de expertise en begeleiding die nodig is om vastgoedprojecten tot een succes te maken. Hun netwerk staat garant voor betrouwbare en efficiënte transacties en ontwikkelingen.']),
    ('Ennumera Consultores', 'https://pc-spain.com/wp-content/uploads/2024/10/Ennumera.png', None, ['Ennumera Consultores is een gerenommeerde gestor in Denia die particulieren en bedrijven ondersteunt met administratieve, fiscale en juridische zaken. Ze bieden op maat gemaakte oplossingen voor hun klanten, van belastingadvies en bedrijfsadministratie tot immigratieprocedures en vastgoedtransacties.', 'Met hun diepgaande kennis van de Spaanse regelgeving en hun klantgerichte benadering, zorgen ze ervoor dat elke procedure soepel verloopt. Of het nu gaat om residentieaanvragen of zakelijke verplichtingen, Ennumera Consultores is een betrouwbare partner voor iedereen die zorgeloos zaken wil doen in Spanje.']),
    ('Orange Brokers', 'https://pc-spain.com/wp-content/uploads/2024/10/Orange-Brokers.png', 'https://orange-brokers.nl', ['Orange Brokers is een ervaren makelaar gespecialiseerd in vastgoed aan de Spaanse Costa’s. Ze bieden uitgebreide diensten voor zowel de aankoop als de verkoop van woningen, met een sterke focus op persoonlijke begeleiding en maatwerk.', 'Orange Brokers onderscheidt zich door diepgaande kennis van de lokale markt en een breed netwerk van partners, waardoor ze hun klanten kunnen voorzien van gedetailleerd advies en ondersteuning tijdens elke stap van het proces. Samen met PC Spain zorgen ze voor een soepele en succesvolle vastgoedtransactie in Spanje.']),
]

def partners():
    rows = ''
    for n, logo, url, ps in PARTNERS:
        is_oe = logo.startswith('assets/')
        style = ' style="background:#233759;padding:8%"' if is_oe else ''
        link = lk(url.split('//')[1], url, True) if url else ''
        rows += f'''<article class="partner" data-reveal>
  <div class="partner__logo"{style}><img src="{media(logo)}" alt="{n}" loading="lazy"{' style="filter:none;opacity:1"' if is_oe else ''}></div>
  <div class="partner__name"><h2 class="h3">{n}</h2></div>
  <div class="partner__text">{''.join(f'<p>{p}</p>' for p in ps)}{link}</div>
</article>'''
    return page_hero([('Home', 'index.html'), ('Over ons', 'over-pc-spain.html'), ('Partners', '')], 'Partners', aside='BeleggenInValencia.nl · Ambau · Santander · Cajamar · Fides – ETL Global · Gimbrere Legal · To Do · Handy Valencia · Orange Estates · Ennumera Consultores · Orange Brokers', img=IMG['s0061'], short=True) + f'''
<section class="sec">
  <div class="wrap partners">{rows}</div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')

def tarieven():
    tiers = [('voor aankopen tot € 100.000,-', '€ 5.750,-'), ('voor aankopen tot € 150.000,-', '€ 6.750,-'), ('voor aankopen tot € 200.000,-', '€ 7.750,-'), ('van de aankoopsom voor aankopen boven € 200.000,-', '4%')]
    return page_hero([('Home', 'index.html'), ('Tarieven', '')], 'Transparante tarieven', img=IMG['contract'], short=True) + f'''
<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Transparante tarieven</span></div>
    <div class="split__main">
      <p class="lead" data-split>Bij Property Consultancy Spain hanteren we transparante tarieven, afgestemd op uw specifieke situatie. Onze kosten variëren afhankelijk van het type aankoop: of u nu begeleiding zoekt bij de aankoop van een tweede woning voor eigen gebruik, of investeert in vastgoed voor verhuur en rendement.</p>
      <div class="body" data-reveal><p>Wij zorgen ervoor dat u precies weet waar u aan toe bent, zodat u met vertrouwen kunt investeren in de Spaanse vastgoedmarkt. Neem contact met ons op voor meer informatie over onze op maat gemaakte tarieven!</p></div>
    </div>
  </div>
</section>
<section class="bg-white" style="padding-bottom:clamp(96px,12vw,180px)">
  <div class="wrap">
    <div class="price">
      <div class="price__head"><span class="label label--brass">01</span><h2 class="h3">Tarieven - Aanschaf tweede woning in Spanje</h2><div class="price__fig" data-reveal>3%<small>Minimum €5.750 exclusief btw</small></div></div>
      <div class="price__body body" data-reveal><p>In Spanje werken commissies anders dan in Nederland. Bijna 90% van de verkopen bevat een commissie van 5% in de verkoopprijs. In de regio Valencia betaalt de verkoper 3% aan de makelaar en de koper 3% aan zijn eigen makelaar. Bij PC-Spain hanteren wij dezelfde werkwijze, met een minimum van €5.750 exclusief btw. Voor aankopen buiten Valencia worden wij betaald door de verkopende makelaar. Eventuele afwijkingen communiceren wij altijd transparant vooraf.</p></div>
    </div>
    <div class="price">
      <div class="price__head"><span class="label label--brass">02</span><h2 class="h3">Tarieven - Begeleiding bij aankoop vastgoedbelegging</h2><div class="price__fig" data-reveal>€ 1.750,-<small>Opstartnota, exclusief btw</small></div></div>
      <div class="price__body body" data-reveal><p>Bij de aankoop van een vastgoedbelegging bieden wij uitgebreide begeleiding om ervoor te zorgen dat u het maximale uit uw investering haalt. Onze opstartkosten omvatten essentiële consulten, rondleidingen en projectbezoeken die u volledig inzicht geven in de markt en potentiële kansen. Wij hanteren transparante tarieven zodat u precies weet waar u aan toe bent gedurende het gehele proces.</p>
        <p><strong>Opstartnota: € 1.750,- exclusief btw</strong></p><p>De opstartnota bevat:</p>
        <ul><li>Consult met een internationale belastingadviseur.</li><li>Juridisch advies door een vastgoedadvocaat.</li><li>Twee dagen rondleiding door Valencia en omgeving.</li><li>Bezichtigen van lopende projecten en potentiële investeringen.</li><li>Twee dagen begeleiding door een consultant met kennis van Spaanse investeringsmogelijkheden.</li></ul></div>
    </div>
    <div class="split" style="margin-top:clamp(56px,6vw,96px)">
      <div class="split__label"><span class="label label--brass">Tarieven bij aankoop:</span></div>
      <div class="split__main"><div class="tiers">{''.join(f'<div class="tier" data-reveal><span>{a}</span><b>{b}</b></div>' for a, b in tiers)}</div><p class="muted" style="margin-top:22px">Alle commissies zijn exclusief btw (VAT).</p></div>
    </div>
  </div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')

CITIES = ['Altea', 'Benidorm', 'Benissa', 'Denia', 'Finestrat', 'Gandia', 'Gran Alacant', 'Javeá', 'Moraira', 'Orihuela', 'Santa Pola', 'Tarbena', 'Valencia', 'Xativa']

def listings_section(all_label, more_label):
    counts = {c: sum(1 for l in CARDS if l['city'] == c) for c in CITIES}
    filt = f'<button class="on" data-city="all">{all_label}<sup>{len(CARDS)}</sup></button>' + ''.join(f'<button data-city="{slug_city(c)}">{c}<sup>{counts[c]}</sup></button>' for c in CITIES)
    cards = ''.join(listing_card(l, i) for i, l in enumerate(CARDS))
    return f'''<div class="filters" role="group" aria-label="Filter">{filt}</div>
    <div class="lgrid lgrid--3" id="lgrid">{cards}</div>
    <div class="more"><button class="btn" id="more">{more_label} {ARROW}</button></div>'''

def woning_kopen():
    return page_hero([('Home', 'index.html'), ('Woning kopen', '')], 'Woning kopen', script='Spanje', aside='Allemaal · Altea · Benidorm · Benissa · Denia · Finestrat · Gandia · Gran Alacant · Javeá · Moraira · Orihuela · Santa Pola · Tarbena · Valencia · Xativa', video='assets/video/villa.mp4', poster='assets/video/villa.jpg') + f'''
<section class="sec">
  <div class="wrap">{listings_section('Allemaal', 'Laadt meer')}</div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')

TIPS_ORDER = ['procedure-aankoop-woning-spanje', 'aankoopmakelaar-spanje', 'de-beste-nederlandse-makelaar-in-spanje', 'huis-kopen-in-spanje', 'huis-kopen-in-spanje-bijkomende-kosten', 'huis-kopen-spanje-wat-moet-je-weten', 'hoeveel-eigen-geld-om-een-woning-te-kopen-in-spanje', 'hulp-bij-woning-aankoop-spanje', 'nederlandse-makelaar-in-valencia', 'uitleg-aankoop-commissie-spanje', 'onbezorgd-een-woning-kopen-in-spanje', 'kosten-bij-aankoop-huis-in-spanje']
TIPS_TITLE = {  # titles as shown on the live "Informatie & Tips" page
    'procedure-aankoop-woning-spanje': 'Procedure aankoop woning Spanje', 'aankoopmakelaar-spanje': 'Aankoopmakelaar Spanje',
    'de-beste-nederlandse-makelaar-in-spanje': 'Nederlandse makelaar in Spanje', 'huis-kopen-in-spanje': 'Woning kopen in Spanje',
    'huis-kopen-in-spanje-bijkomende-kosten': 'Vastgoed in Spanje – bijkomende kosten', 'huis-kopen-spanje-wat-moet-je-weten': 'Woning kopen: wat moet je weten?',
    'hoeveel-eigen-geld-om-een-woning-te-kopen-in-spanje': 'Hoeveel eigen geld heb je nodig?', 'hulp-bij-woning-aankoop-spanje': 'Hulp bij woning aankoop Spanje',
    'nederlandse-makelaar-in-valencia': 'Nederlandse makelaar in Valencia',
}

def article_hero(slug):
    a = C['articles'][slug]
    if a['hero']:
        return media(a['hero'])
    m = re.search(r'<img src="([^"]+)"', a['html'])
    return media(m.group(1)) if m else IMG['pc1']

def tips():
    cards = ''
    for s in TIPS_ORDER:
        t = TIPS_TITLE.get(s, C['articles'][s]['title'])
        cards += f'<a class="acard" href="{ART_FILES[s]}" data-reveal><figure class="frame" data-img><img src="{sm(article_hero(s))}" alt="" loading="lazy" decoding="async"></figure><h3 class="h3">{t}</h3><span class="lk">Meer informatie {ARROW}</span></a>'
    return page_hero([('Home', 'index.html'), ('Woning kopen', 'woning-kopen.html'), ('Informatie &amp; Tips', '')], 'Informatie &amp; Tips', img=IMG['pc1'], short=True) + f'''
<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Informatie &amp; Tips</span></div>
    <div class="split__main">
      <h2 class="h2" data-split>Hoe koop je een woning of doe je een investering in Spanje? Wij geven tips!</h2>
      <div class="body" data-reveal><p>Wanneer je de beslissing hebt genomen om een woning in Spanje te kopen, sta je aan het begin van een spannend avontuur. Voor veel Nederlandstalige kopers is het lang niet altijd duidelijk hoe dit proces precies verloopt. Hieronder plaatsen wij regelmatig artikelen om je uitleg te geven over het aanschaffen van een woning in Spanje. Als <a href="index.html" style="border-bottom:1px solid var(--brass)">Nederlandse woningmakelaar in Spanje</a> willen wij jou hierbij graag helpen. Onze groep van consultants en aangesloten partners helpt je met het zoeken van een mooie woning in Spanje. Wijzelf en ons netwerk beschikken over jarenlange ervaring, waardoor we de beste match weten te maken. Een nieuwbouwwoning dicht aan het Spaanse strand? Of juist een knus appartement in een stad? Wij gaan graag met jouw wensen aan de slag!</p></div>
    </div>
  </div>
</section>
<section class="sec bg-white">
  <div class="wrap">
    <div class="sec-head"><span class="label">Artikelen</span><h2 class="h2" data-split>Alle tips om een huis te kopen in Spanje</h2></div>
    <div class="agrid">{cards}</div>
  </div>
</section>
''' + cta('Hulp nodig bij je woning aankoop in Spanje?', '', 'Contact opnemen', 'intake.html')

def intake():
    return page_hero([('Home', 'index.html'), ('Intake', '')], 'Doe de intake', aside='Doe de intake en start direct met uw belegging in Spanje.', video='assets/video/valencia-waves.mp4', poster='assets/video/valencia-waves.jpg', short=True) + f'''
<section class="sec">
  <div class="wrap">
    <div class="split" style="margin-bottom:clamp(56px,6vw,96px)">
      <div class="split__label"><span class="label label--brass">Intake</span></div>
      <div class="split__main"><p class="lead" data-split>Om u zo goed mogelijk van dienst te zijn, vragen wij u vriendelijk om dit korte intakeformulier in te vullen.</p><div class="body" data-reveal><p>Dit helpt ons om een duidelijk beeld te krijgen van uw wensen en behoeften, zodat we u op maat kunnen ondersteunen met uw vastgoedplannen. Zodra we uw informatie hebben ontvangen, nemen we spoedig contact met u op om een vervolgafspraak te maken. Op deze manier kunnen we u de best mogelijke service bieden, afgestemd op uw persoonlijke situatie.</p></div></div>
    </div>
    <div class="intake">
      <div class="intake__form" data-reveal><div data-tf-live="01J8J7W38XSF5PMAV91S5H8HA1"></div></div>
      <aside class="intake__aside" data-reveal=".2">
        <h2 class="h3" style="margin-bottom:26px">Contact informatie</h2>
        <dl><dt class="label">Kantoren:</dt><dd>Valencia · Dénia · Amsterdam · Barcelona</dd>
        <dt class="label">Openingstijden:</dt><dd>Maandag- Zaterdag: 10:00 - 18:00</dd>
        <dt class="label">Vind ons op:</dt><dd>{IG}</dd></dl>
      </aside>
    </div>
  </div>
</section>'''

# =====================================================================  listing detail
def spec_rows(specs):
    rows = []
    for s in specs:
        low = s.lower()
        if '€' in s:
            k = 'Prijs'
        elif 'm2' in low:
            k = 'Oppervlakte'
        elif 'slaapkamer' in low:
            k = 'Slaapkamers'
        elif 'badkamer' in low:
            k = 'Badkamers'
        else:
            k = 'Kenmerk'
        rows.append((k, s))
    return rows

def listing_page(i, card):
    slug = card['url'].rstrip('/').split('/')[-1]
    d = C['listings'][slug]
    gal = [media(u) for u in d['gallery']] or [media(d['hero'] or card['img'])]
    if GALLERY_CAP:
        gal = gal[:GALLERY_CAP]
    hero = sm(gal[0]) if PREVIEW_SM else gal[0]
    price = next((s for s in card['specs'] if '€' in s), '')
    specs = ''.join(f'<div><dt class="label">{k}</dt><dd>{esc(v)}</dd></div>' for k, v in spec_rows(card['specs']))
    gallery = ''.join(f'<button data-full="{sm(g) if PREVIEW_SM else g}" aria-label="Foto {n+1}"><img src="{sm(g)}" decoding="async" alt="{esc(card["title"])} – foto {n+1}" loading="lazy"></button>' for n, g in enumerate(gal))
    prev_c, next_c = CARDS[i - 1], CARDS[(i + 1) % len(CARDS)]
    ps, ns = prev_c['url'].rstrip('/').split('/')[-1], next_c['url'].rstrip('/').split('/')[-1]
    related = [c for c in CARDS if c['city'] == card['city'] and c is not card][:3]
    if len(related) < 3:
        related += [c for c in CARDS if c not in related and c is not card][: 3 - len(related)]
    rel = ''.join(listing_card(c, n) for n, c in enumerate(related))
    body = f'''
<section class="lx-hero">
  <img src="{hero}" alt="{esc(card['title'])}">
  <div class="lx-hero__in">
    <div style="grid-column:1 / span 8"><a class="label" href="woning-kopen.html#{slug_city(card['city'])}" style="opacity:.8">{esc(card['city'])}</a><h1 class="h1" data-split style="margin-top:18px;font-size:clamp(2.6rem,6.6vw,7rem)">{esc(card['title'])}</h1></div>
    <div class="lx-hero__meta">{f'<span class="lx-price">{esc(price)}</span>' if price else ''}<span class="label" style="opacity:.8">{len(gal)} foto’s</span></div>
  </div>
</section>
<section class="bg-white"><div class="wrap"><dl class="specs">{specs}</dl></div></section>
<section class="sec bg-white" style="padding-top:clamp(64px,7vw,110px)">
  <div class="wrap lx-body">
    <div class="rich rich--nodrop" data-reveal>{localize_html(d['html'])}</div>
    <aside class="lx-aside"><div class="lx-aside__box">
      <span class="label" style="opacity:.6">Property Consultancy Spain</span>
      <h2 class="h3">Benieuwd naar de mogelijkheden?</h2>
      <p>Doe de intake en start direct met uw belegging in Spanje.</p>
      {btn('Doe de intake', 'intake.html', 'btn--light')}
      <p style="border-top:1px solid var(--line-d);padding-top:18px">Kantoren: Valencia · Dénia · Amsterdam · Barcelona<br>Maandag- Zaterdag: 10:00 - 18:00</p>
    </div></aside>
  </div>
</section>
<section class="sec" style="padding-top:clamp(64px,7vw,110px)">
  <div class="wrap">
    <div class="sec-head"><span class="label">Foto’s</span><h2 class="h2" data-split>{esc(card['title'])}</h2></div>
    <div class="gallery">{gallery}</div>
  </div>
</section>
<section class="sec bg-white">
  <div class="wrap">
    <div class="sec-head"><span class="label">Woningaanbod</span><h2 class="h2" data-split>Woningaanbod</h2></div>
    <div class="lgrid">{rel}</div>
    <nav class="lx-nav" style="margin-top:clamp(64px,7vw,110px)">
      <a href="{LISTING_FILES[ps]}"><span class="label muted">← Vorige woning</span><span class="h3">{esc(prev_c['title'])}</span></a>
      <a href="{LISTING_FILES[ns]}"><span class="label muted">Volgende woning →</span><span class="h3">{esc(next_c['title'])}</span></a>
    </nav>
  </div>
</section>'''
    write(LISTING_FILES[slug], f'{esc(card["title"])} - Property Consultancy Spain', f'{card["title"]} in {card["city"]} – ' + ', '.join(card['specs']), body, active='woning-kopen.html')

# =====================================================================  article
def article_page(slug):
    a = C['articles'][slug]
    hero = article_hero(slug)
    h = a['html']
    h = re.sub(r'^<img[^>]*>', '', h)  # first image becomes the hero
    h = re.sub(r'<p><a href="[^"]*">Contact opnemen</a></p>$', '', h)
    title = TIPS_TITLE.get(slug, a['title'])
    others = [s for s in TIPS_ORDER if s != slug][:3]
    cards = ''.join(f'<a class="acard" href="{ART_FILES[s]}" data-reveal><figure class="frame" data-img><img src="{sm(article_hero(s))}" alt="" loading="lazy" decoding="async"></figure><h3 class="h3">{TIPS_TITLE.get(s, C["articles"][s]["title"])}</h3><span class="lk">Meer informatie {ARROW}</span></a>' for s in others)
    body = page_hero([('Home', 'index.html'), ('Informatie &amp; Tips', 'informatie-tips.html'), (esc(a['title']), '')], esc(a['title']), img=hero, short=True) + f'''
<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Informatie &amp; Tips</span></div>
    <div class="split__main"><article class="rich" data-reveal>{localize_html(h)}</article>
      <div style="margin-top:56px">{btn('Contact opnemen', 'intake.html')}</div></div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><span class="label">Informatie &amp; Tips</span><h2 class="h2" data-split>Alle tips om een huis te kopen in Spanje</h2></div>
    <div class="agrid">{cards}</div>
  </div>
</section>'''
    write(ART_FILES[slug], f'{esc(a["title"])} - Property Consultancy Spain', a['title'], body, active='informatie-tips.html')

# =====================================================================  EN inner pages (generic editorial renderer)
def sections_from(html_):
    parts = re.split(r'(?=<h2>)', html_)
    return [p for p in parts if re.sub('<[^>]+>', '', p).strip()]

def en_generic(fname, title, crumb, hero_img=None, hero_video=None, poster=None, fixups=None, skip=()):
    h = C['en'][fname_key(fname)]['html']
    for a, b in (fixups or []):
        h = h.replace(a, b)
    secs = sections_from(h)
    out = ''
    n = 0
    for sec in secs:
        m = re.match(r'<h2>(.*?)</h2>(.*)$', sec, re.S)
        head_, rest = (m.group(1), m.group(2)) if m else ('', sec)
        if any(s in head_ for s in skip):
            continue
        bg = ' bg-white' if n % 2 else ''
        n += 1
        head_html = f'<h2 class="h2" data-split>{head_}</h2>' if head_ else ''
        out += f'''<section class="sec{bg}">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">{crumb}</span></div>
    <div class="split__main">{head_html}<div class="rich rich--nodrop" data-reveal>{localize_html(rest)}</div></div>
  </div>
</section>'''
    return page_hero([('Home', 'en.html'), (crumb, '')], title, img=hero_img, video=hero_video, poster=poster, short=True) + out

def fname_key(f):
    return {'en-working-method.html': 'working-method', 'en-expertises.html': 'expertises-in-spain', 'en-prices.html': 'prices',
            'en-success-stories.html': 'success-stories', 'en-buying-property.html': 'buying-property-spain'}[f]

COUNTERS_EN = '''</div></div></div></section><section class="sec--tight bg-navy on-dark" style="padding-block:clamp(72px,8vw,128px)"><div class="wrap counters">
<div class="counter"><b data-count="16">16</b><span class="label muted">Experts</span></div>
<div class="counter"><b data-count="120">120</b><span class="label muted">Satisfied customers</span></div>
<div class="counter"><b data-count="23">23</b><span class="label muted">Years of experience in Spain</span></div>
</div></section><section class="sec"><div class="wrap split"><div class="split__label"></div><div class="split__main"><div class="rich rich--nodrop">'''

def build_en():
    write('en.html', 'Dutch Real Estate Agent in Spain - Property Consultancy Spain', 'Want to buy or rent a property in Spain? Let us advice you.', home_en(), lang='en')
    write('en-working-method.html', 'Working method - Property Consultancy Spain', 'Real Estate Agency in Spain – working method.',
          en_generic('en-working-method.html', 'Working method', 'Working method', hero_video='assets/video/valencia-city.mp4', poster='assets/video/valencia-city.jpg',
                     fixups=[('<p>0Experts 0Satisfied customers 0Years of experience in Spain</p>', COUNTERS_EN), ('0Experts 0Satisfied customers 0Years of experience in Spain', '')]), lang='en')
    write('en-expertises.html', 'Expertises in Spain - Property Consultancy Spain', 'Purchasing support, legal advice, mortgage advice, refurbishment scan and property management.',
          en_generic('en-expertises.html', 'Expertises in Spain', 'Expertises in Spain', hero_img=IMG['s0061'], fixups=[('<h2>Expertises in Spain</h2><p>How do we work?</p>', '<h2>How do we work?</h2>')]), lang='en')
    yt_thumb = 'assets/media/yt-4UjcDfP00PM.jpg'
    yt = f'<div class="yt" data-id="4UjcDfP00PM"><img src="{yt_thumb}" alt="" loading="lazy"><button aria-label="Play video"><span class="label">Play</span></button></div><p><a href="https://www.youtube.com/watch?v=4UjcDfP00PM" target="_blank" rel="noopener">YouTube ↗</a></p>'
    write('en-prices.html', 'Prices - Property Consultancy Spain', 'Transparent prices for buying property in Spain.',
          en_generic('en-prices.html', 'Transparent Prices', 'Prices', hero_img=IMG['contract'],
                     fixups=[('<h2>In this video we explain our working method.</h2>', '<h2>In this video we explain our working method.</h2>' + yt)]), lang='en')
    form = '''<form class="form" data-form data-endpoint="" data-offline="This form is not connected yet. Please contact us via Instagram @pc_spain." data-sending="Sending…" data-ok="Thank you! Your success story has been sent." data-fail="Sending failed. Please try again later." style="margin-top:40px">
  <div class="field"><label for="ss-name">Name *</label><input id="ss-name" name="name" required autocomplete="name"></div>
  <div class="field"><label for="ss-mail">E-mail *</label><input id="ss-mail" name="email" type="email" required autocomplete="email"></div>
  <div class="field field--full"><label for="ss-tel">Telephone</label><input id="ss-tel" name="telephone" type="tel" autocomplete="tel"></div>
  <div class="field field--full"><label for="ss-msg">Message *</label><textarea id="ss-msg" name="message" required></textarea></div>
  <div class="form__foot"><button class="btn btn--solid" type="submit">Send success story ''' + ARROW + '''</button><span class="form__msg" role="status"></span></div>
</form>'''
    body = page_hero([('Home', 'en.html'), ('Success stories', '')], 'Success stories', img=IMG['after'], short=True) + f'''
<section class="sec bg-white" style="padding-top:0;background:linear-gradient(var(--paper) 30%, var(--white) 30%)">
  <div class="wrap">
    <div class="ba" data-reveal>
      <img src="{IMG['after']}" alt=""><img class="ba__before" src="{IMG['before']}" alt="">
      <div class="ba__line"><span class="ba__knob"><span>⟷</span></span></div>
      <input type="range" id="ba-range-en" min="0" max="100" value="50" aria-label="Before and after">
    </div>
  </div>
</section>
{quotes_block('What customers say about us', 'Contact', '#contact')}
<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Success stories</span></div>
    <div class="split__main"><h2 class="h2" data-split>Share your success story</h2><div class="body" data-reveal><p>Have you consulted Property Consultanct Group for you purchase? Then leave your success story here! This helps new customers find their way to us.</p></div>{form}</div>
  </div>
</section>'''
    write('en-success-stories.html', 'Success stories - Property Consultancy Spain', 'Share your success story.', body, lang='en')
    body = page_hero([('Home', 'en.html'), ('Buying property Spain', '')], 'Buying property', script='Spain', video='assets/video/villa.mp4', poster='assets/video/villa.jpg', short=True) + f'''
<section class="sec"><div class="wrap">{listings_section('All', 'Load more')}</div></section>
<section class="sec bg-navy on-dark">
  <div class="wrap split">
    <div class="split__label"><span class="label muted">Prices</span></div>
    <div class="split__main"><h2 class="h2" data-split>Transparent commission</h2><div class="body" data-reveal><p>Are you curious about how our commission is formed? Because of our effort en thorough negotiations we achieve a purchase price reduction. Our commission is based on this reduction. This clarifies expectations from both parties. Want to know more?</p></div>
    <div style="margin-top:40px">{btn('Download!', media('https://pc-spain.com/wp-content/uploads/2020/04/Voordeel-met-Property-Consultancy-Spain.pdf'), 'btn--light', True)}</div></div>
  </div>
</section>'''
    write('en-buying-property.html', 'Buying property Spain - Property Consultancy Spain', 'Property for sale in Spain.', body, lang='en')

exec((HERE / 'pages_v4.py').read_text())
exec((HERE / 'pages_v5.py').read_text())
exec((HERE / 'pages_v6.py').read_text())
exec((HERE / 'pages_v7.py').read_text())

# =====================================================================  run
write('index.html', 'Nederlandse Makelaar in Spanje - Property Consultancy Spain', 'Property Consultancy Spain – Woning kopen of huren in Spanje. Ontmoet ons team van experts die u verbinden met topadvocaten, architecten en makelaars.', home_nl())
write('over-pc-spain.html', 'Over PC-Spain - Property Consultancy Spain', 'Property Consultancy Spain is een bedrijf van vastgoedexperts.', over_pc_spain(), active='over-pc-spain.html')
write('werkwijze.html', 'Werkwijze - Property Consultancy Spain', 'Makelaardij in Spanje: onze werkwijze.', werkwijze(), active='over-pc-spain.html')
write('expertises.html', 'Expertises in Spanje - Property Consultancy Spain', 'Aankoopbegeleiding, juridisch advies, hypotheekadvies, verbouwingscan en woningbeheer.', expertises(), active='over-pc-spain.html')
write('portfolio.html', 'Portfolio - Property Consultancy Spain', 'Transformatie van oude panden naar moderne woon- of werkruimtes.', portfolio(), active='over-pc-spain.html')
write('partners.html', 'Partners - Property Consultancy Spain', 'Het netwerk van partners van Property Consultancy Spain.', partners(), active='over-pc-spain.html')
write('tarieven.html', 'Tarieven - Property Consultancy Spain', 'Transparante tarieven.', tarieven())
write('woning-kopen.html', 'Woning kopen Spanje - Property Consultancy Spain', 'Woningaanbod in Spanje.', woning_kopen())
write('informatie-tips.html', 'Informatie & Tips - Property Consultancy Spain', 'Hoe koop je een woning of doe je een investering in Spanje? Wij geven tips!', tips(), active='woning-kopen.html')
write('intake.html', 'Intake - Property Consultancy Spain', 'Doe de intake en start direct met uw belegging in Spanje.', intake())
for i, card in enumerate(CARDS):
    listing_page(i, card)
for s in C['articles']:
    article_page(s)
build_en()
print('pages:', len(list(OUT.glob('*.html'))))
if MISSING:
    print('missing media:', *sorted(MISSING), sep='\n  ')
