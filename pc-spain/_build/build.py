#!/usr/bin/env python3
"""Generates the static PC-Spain site into ../ (one HTML file per page).

All copy is taken verbatim from the live pc-spain.com pages. Run:
    python3 pc-spain/_build/build.py
"""
import json, re, html
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE.parent

# ---------------------------------------------------------------- links
LINKS = {
    'https://pc-spain.com/': 'index.html',
    'https://pc-spain.com': 'index.html',
    'https://pc-spain.com/over-pc-spain/': 'over-pc-spain.html',
    'https://pc-spain.com/expertises-in-spanje/': 'expertises.html',
    'https://pc-spain.com/over-ons/': 'werkwijze.html',
    'https://pc-spain.com/werkwijze/': 'werkwijze.html',
    'https://pc-spain.com/portfolio/': 'portfolio.html',
    'https://pc-spain.com/succesverhalen/': 'portfolio.html',
    'https://pc-spain.com/partners/': 'partners.html',
    'https://pc-spain.com/onze-tarieven/': 'tarieven.html',
    'https://pc-spain.com/tarieven/': 'tarieven.html',
    'https://pc-spain.com/woning-kopen-spanje/': 'woning-kopen.html',
    'https://pc-spain.com/woning-kopen-in-spanje-tips/': 'informatie-tips.html',
    'https://pc-spain.com/intake/': 'intake.html',
    '/intake': 'intake.html',
    '/contact/': '#contact',
}

def localize(s):
    def rep(m):
        url = m.group(1)
        if url in LINKS:
            return f'href="{LINKS[url]}"'
        return m.group(0)
    return re.sub(r'href="([^"]+)"', rep, s)

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M9 7h8v8"/></svg>'
MARK = '<svg viewBox="0 0 64 64" fill="none"><path d="M32 4a28 28 0 1 0 12.6 53l9.4 5-3.2-11A28 28 0 0 0 32 4Z" fill="#c29a4f"/><path d="M20 46V29l12-10 12 10v17H20Z" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>'
CHEV = '<svg class="chev" viewBox="0 0 10 10"><path d="M1 3l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>'

def btn(label, href, cls='', ext=False):
    tgt = ' target="_blank" rel="noopener"' if ext else ''
    return f'<a href="{href}" class="btn {cls}"{tgt} data-magnetic>{label} {EXT if ext else ARROW}</a>'

# ---------------------------------------------------------------- shell
def head(title, desc):
    return f'''<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/png" href="assets/property-consultancy-spain-favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
'''

def header(active):
    def cls(key):
        return ' class="active"' if key == active else ''
    return f'''<div class="progress" id="progress"></div>
<div class="cursor" id="cursor"></div>

<header class="topbar" id="topbar">
  <div class="container nav">
    <a href="index.html" class="brand" aria-label="Property Consultancy Spain – Home">
      {MARK}
      <span class="brand__txt"><b>PROPERTY CONSULTANCY</b><small>SPAIN</small><span class="brand__tag">Woning kopen of huren in Spanje</span></span>
    </a>
    <nav aria-label="Hoofdmenu">
      <ul class="menu">
        <li><a href="index.html"{cls('home')}>Home</a></li>
        <li><a href="werkwijze.html"{cls('over')}>Over ons {CHEV}</a>
          <ul class="sub">
            <li><a href="over-pc-spain.html">Over PC-Spain</a></li>
            <li><a href="expertises.html">Expertises</a></li>
            <li><a href="werkwijze.html">Werkwijze</a></li>
            <li><a href="portfolio.html">Portfolio</a></li>
            <li><a href="partners.html">Partners</a></li>
          </ul>
        </li>
        <li><a href="tarieven.html"{cls('tarieven')}>Tarieven</a></li>
        <li><a href="woning-kopen.html"{cls('woning')}>Woning kopen {CHEV}</a>
          <ul class="sub">
            <li><a href="informatie-tips.html">Informatie &amp; Tips</a></li>
          </ul>
        </li>
        <li><a href="intake.html"{cls('intake')}>Intake</a></li>
      </ul>
    </nav>
    <div class="nav__right">
      <div class="lang">
        <a href="index.html" class="on"><img src="assets/nl.png" alt="">NL</a>
        <a href="https://pc-spain.com/en/" target="_blank" rel="noopener"><img src="assets/en.png" alt="">EN</a>
      </div>
      <a href="intake.html" class="btn" data-magnetic>Doe de intake</a>
      <button class="burger" id="burger" aria-label="Menu openen" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

<div class="drawer" id="drawer">
  <ul>
    <li><a href="index.html">Home</a></li>
    <li><a href="werkwijze.html">Over ons</a>
      <ul class="dsub">
        <li><a href="over-pc-spain.html">Over PC-Spain</a></li>
        <li><a href="expertises.html">Expertises</a></li>
        <li><a href="werkwijze.html">Werkwijze</a></li>
        <li><a href="portfolio.html">Portfolio</a></li>
        <li><a href="partners.html">Partners</a></li>
      </ul>
    </li>
    <li><a href="tarieven.html">Tarieven</a></li>
    <li><a href="woning-kopen.html">Woning kopen</a>
      <ul class="dsub"><li><a href="informatie-tips.html">Informatie &amp; Tips</a></li></ul>
    </li>
    <li><a href="intake.html">Intake</a></li>
  </ul>
  <div class="lang" style="margin-top:28px;display:inline-flex">
    <a href="index.html" class="on">NL</a><a href="https://pc-spain.com/en/" target="_blank" rel="noopener">EN</a>
  </div><br>
  <a href="intake.html" class="btn">Doe de intake</a>
</div>
'''

FOOTER = f'''
<footer id="contact">
  <div class="f-big" aria-hidden="true">PC · Spain</div>
  <div class="container">
    <div class="f-grid">
      <div class="f-brand">
        <a href="index.html" class="brand">
          {MARK}
          <span class="brand__txt"><b>PROPERTY CONSULTANCY</b><small>SPAIN</small></span>
        </a>
        <p>Woning kopen of huren in Spanje</p>
        <a href="https://orange-estates.com" class="partner" target="_blank" rel="noopener" aria-label="Orange Estates"><img src="assets/Orange-Logo-small.png" alt="Orange Estates"></a>
      </div>
      <div>
        <h4>Contact informatie</h4>
        <p style="color:#fff;font-weight:600;margin-bottom:8px">Kantoren:</p>
        <ul class="offices"><li>Valencia</li><li>Dénia</li><li>Amsterdam</li><li>Barcelona</li></ul>
      </div>
      <div>
        <h4>Openingstijden:</h4>
        <p>Maandag- Zaterdag:<br><span style="color:#fff;font-weight:600">10:00 - 18:00</span></p>
        <h4 style="margin-top:34px">Vind ons op:</h4>
        <a href="https://instagram.com/pc_spain" target="_blank" rel="noopener" class="social" aria-label="Instagram page opens in new window"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg></i>@pc_spain</a>
      </div>
      <div>
        <h4>Property Consultancy Spain</h4>
        <ul>
          <li><a href="expertises.html">Expertises in Spanje</a></li>
          <li><a href="tarieven.html">Tarieven</a></li>
          <li><a href="woning-kopen.html">Woning kopen Spanje</a></li>
          <li><a href="tarieven.html">Tarieven</a></li>
          <li><a href="intake.html">Intake</a></li>
        </ul>
      </div>
    </div>
    <div class="f-bottom">
      <span>© Property Consultant Spain - All rights reserved.</span>
      <button class="to-top" id="toTop">Go to Top <i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M6 11l6-6 6 6"/></svg></i></button>
    </div>
  </div>
</footer>
<script src="assets/site.js"></script>
'''

def page(fname, title, desc, active, body, extra_end=''):
    doc = head(title, desc) + header(active) + '\n<main id="content">\n' + body + '\n</main>\n' + FOOTER + extra_end + '</body>\n</html>\n'
    doc = localize(doc)
    # any remaining deep link to the live site (listing / article pages) opens in a new tab
    doc = re.sub(r'<a href="(https://pc-spain\.com/[^"]+)"(?![^>]*target=)', r'<a href="\1" target="_blank" rel="noopener"', doc)
    (OUT / fname).write_text(doc)
    print('wrote', fname)

def phero(crumb, lines, lead='', media=None, video=None, poster=None):
    if video:
        m = f'<video autoplay muted loop playsinline preload="auto" poster="{poster}"><source src="{video}" type="video/mp4"></video>'
    else:
        m = f'<img src="{media}" alt="">'
    h1 = ''.join(f'<span class="line"><span>{l}</span></span>' for l in lines)
    lead_html = f'<p class="phero__lead">{lead}</p>' if lead else ''
    return f'''<section class="phero">
  <div class="phero__media" data-parallax="0.12">{m}</div>
  <div class="container phero__content">
    <div class="crumbs"><a href="index.html">Home</a><span>/</span>{crumb}</div>
    <h1>{h1}</h1>
    {lead_html}
  </div>
</section>
'''

CTA = f'''<section class="cta">
  <div class="container">
    <div class="cta__box rv">
      <h2>Benieuwd naar de mogelijkheden?</h2>
      <p>Doe de intake en start direct met uw belegging in Spanje.</p>
      {btn('Start intake', 'intake.html')}
    </div>
  </div>
</section>'''

# ================================================================ HOME
home = (HERE / 'home.html').read_text()
loader, rest = home.split('@@MAIN@@\n')
main, modal = rest.split('@@END@@\n')
doc = head('Nederlandse Makelaar in Spanje - Property Consultancy Spain',
           'Property Consultancy Spain – Woning kopen of huren in Spanje. Ontmoet ons team van experts die u verbinden met topadvocaten, architecten en makelaars.')
doc += loader + header('home') + '\n<main id="content">\n' + main + '</main>\n' + FOOTER + modal + '</body>\n</html>\n'
doc = localize(doc)
(OUT / 'index.html').write_text(doc)
print('wrote index.html')

# ================================================================ OVER PC-SPAIN
minis = [
    ('https://pc-spain.com/39-appartementen-denia/', '39 appartementen Denia', 'foto-2_800x302-402x302.jpg'),
    ('https://pc-spain.com/chalet-pedreguer/', 'Chalet Pedreguer', 'IMG_20200914_121321_800x600-768x576.jpg'),
    ('https://pc-spain.com/villa-in-beniarbeig/', 'Villa in Beniarbeig', 'foto-1_799x600-768x576.jpg'),
    ('https://pc-spain.com/drie-slaapkamer-villa-javea/', 'Drie slaapkamer villa Javea', 'foto-12_799x600-768x576.jpg'),
    ('https://pc-spain.com/finca-gata-de-gorgos/', 'Finca Gata de Gorgos', 'foto-9_799x600-768x576.jpg'),
    ('https://pc-spain.com/la-llosa-de-ranes-xativa/', 'La Llosa de Ranes Xàtiva', 'foto-7_800x449-598x448.jpg'),
    ('https://pc-spain.com/chalet-gandia/', 'Chalet Gandia', 'foto-2_800x450-600x450.jpg'),
    ('https://pc-spain.com/bodega-xativa/', 'Bodega Xàtiva', 'foto-5_800x449-598x448.jpg'),
]
mini_html = '\n'.join(f'<a class="mini rv" data-d="{i%4}" href="{u}"><img src="assets/img/{im}" alt="{t}" loading="lazy"><b>{t}</b></a>' for i, (u, t, im) in enumerate(minis))
page('over-pc-spain.html', 'Over PC-Spain - Property Consultancy Spain', 'Property Consultancy Spain is een bedrijf van vastgoedexperts.', 'over', phero('Over ons', ['Over', '<em>PC-Spain</em>'], media='assets/img/team-travel.png') + f'''
<section class="sec">
  <div class="container split">
    <div>
      <span class="eyebrow rv">Over ons</span>
      <h2 class="rv" data-d="1">Wie of <em>wat?</em></h2>
      <div class="prose rv" data-d="2"><p>Property Consultancy Spain is een bedrijf van vastgoedexperts die zich richten op klanten die niet per se een makelaar zoeken, maar wel een consultant die hen kan bijstaan in de zoektocht naar een woning en/of belegging in Spanje. Als jij op zoek bent naar een ervaren partij in Spanje die jou kan bijstaan tijdens het gehele (ver)koopproces van vastgoed, zijn wij een goede match!</p></div>
    </div>
    <div class="media-frame rv" data-d="1"><img src="assets/PC-Spain-team.png" alt="Het team van PC-Spain" data-parallax-img="0.08" loading="lazy"></div>
  </div>
</section>

<section class="sec dark">
  <div class="container split split--rev">
    <div>
      <span class="eyebrow rv">Waarom wij</span>
      <h2 class="rv" data-d="1">Waarom <em>PC-Spain?</em></h2>
      <div class="prose rv" data-d="2">
        <p>Met kantoren in diverse plaatsen in Spanje en ook op verschillende locaties in Nederland en de Verenigde Staten (Zuid-Florida), kunnen wij klanten in Nederland en een deel van België en Duitsland goed bedienen en ondersteunen bij de aankoop van hun (tweede) woning of belegging. Dankzij onze ruime ervaring in vastgoed in Nederland en Spanje heeft ons team alle kennis in huis om jou bij te staan bij het aankopen van vastgoed in Spanje.</p>
        <p>Mede door ons ruime en goed geselecteerde netwerk van makelaars, projectontwikkelaars, notarissen, financiële adviseurs, veilingen en advocaten kunnen wij jou volledig ondersteunen gedurende het gehele aankoopproces.</p>
        <p>Tot ons netwerk behoren <strong>Engels, Nederlands, Spaans en Duits sprekende partners</strong>.</p>
      </div>
      <div class="chipcloud rv" data-d="3"><span>Makelaars</span><span>Projectontwikkelaars</span><span>Notarissen</span><span>Financiële adviseurs</span><span>Veilingen</span><span>Advocaten</span></div>
    </div>
    <div class="media-frame rv"><img src="assets/img/s0061-800x800.jpg" alt="" data-parallax-img="0.08" loading="lazy"></div>
  </div>
</section>

<section class="sec">
  <div class="container">
    <div class="sec-head">
      <div>
        <span class="eyebrow rv">Onze dienstverlening</span>
        <h2 class="rv" data-d="1">Wat kan PC-Spain <em>voor jou doen?</em></h2>
      </div>
      <div class="prose rv" data-d="2" style="max-width:640px">
        <p>Of je nu een appartement of (tweede) woning zoekt of een belegging wilt doen in Spanje, wij kunnen je ondersteunen met ons team van consultants en ons uitgebreide netwerk. Het kopen van vastgoed in Spanje gaat alles behalve hetzelfde als in Nederland. Buiten de taal zijn de wetten, regels en de cultuur anders. Ons team kan jou ondersteunen, zowel voordat je afreist naar Spanje, als direct op een van onze kantoren aldaar. Gedurende het proces staan wij je bij. De consultants van PC-Spain zijn geen traditionele makelaars die voor de verkoop gaan, maar vastgoedspecialisten die je begeleiden bij de aankoop van vastgoed. Tevens kunnen wij adviseren bij de verkoop van jouw woning, zowel in Nederland als in Spanje. <strong>Investeren in jouw Spaanse toekomst doe je met de hulp van Property Consultancy Spain!</strong></p>
      </div>
    </div>
    <span class="eyebrow rv" style="margin-bottom:26px">Woningaanbod</span>
    <div class="mini-grid">
{mini_html}
    </div>
    <div class="center mt rv">{btn('Woning kopen', 'woning-kopen.html', 'btn--navy')}</div>
  </div>
</section>
''' + CTA)

# ================================================================ WERKWIJZE
steps_buy = [
    ('Kennismaken', 'We luisteren naar de wensen en behoeften van de klant. Wat zijn de voorkeuren? Een villa in Moraira of een appartement in een stad als Valencia? Elke type woning heeft zijn eigen kenmerken, de klant wordt hier daarom al voorzien van <strong>advies op maat</strong>. Tevens worden in deze fase de financiële mogelijkheden van de klant bekeken.'),
    ('Huizenjacht', 'Samen gaan we op zoek naar jouw Spaanse woning of belegging! Je mag hierbij een <strong>actieve houding</strong> verwachten vanuit onze adviseurs. Zit jouw woning naar wens niet tussen ons aanbod? Geen probleem, dan kijken we verder bij makelaar collega’s. Alles om een woning te vinden die aansluit op jouw wensen!'),
    ('Bezichtiging inplannen', 'Een woning naar wens is gevonden! Wij hechten in het proces veel waarde aan persoonlijke aandacht. Daarom ontvang je ook bij het boeken van een bezichtigingsreis hulp en advies.'),
    ('Ideale woning of belegging gevonden', 'In Spanje is het van groot belang om een <strong>woning zonder gebreken</strong> aan te kopen. Daarom wordt in deze fase de woning al gecontroleerd door onze juridische afdeling. Kloppen de registraties en (woon)vergunningen? Is de achtergrond van de verhuurder/verkoper correct?'),
    ('Prijsovereenstemming', 'Een woning zonder zorgen start bij het maken van goede afspraken. Onderhandelingen voor de aankoopprijs of het maandelijkse huurbedrag nemen wij voor onze rekening. Hierbij staan we <strong>aan de kant van de klant</strong>, onze commissie is immers al <a href="tarieven.html">bij aanvang gecommuniceerd</a>. Geen verborgen afspraken, maar transparante overeenkomsten!'),
    ('Deal!', 'Na een prijsovereenstemming worden bepaalde zaken afgerond. Denk bij een aankoop aan de financiering bij de Spaanse bank. Hierna kunnen we samen <strong>proosten</strong>!'),
]
steps_inv = [
    ('Vrijblijvend gesprek', ['Wij bieden een vrijblijvend gesprek aan, dat zowel via videocall als op locatie in Spanje kan plaatsvinden. Tijdens dit gesprek krijgt u de kans om uw wensen en doelen te bespreken met een van onze ervaren consultants.']),
    ('Bespreken van investeringsopties', ['In dit gesprek nemen we het volledige proces met u door en bespreken we diverse investeringsopties, zoals bankbeslagen, vastgoedveilingen of transformatieprojecten. We helpen u om de beste keuze te maken die aansluit bij uw investeringsstrategie.']),
    ('Bezoek aan investeringsobjecten', ['Wanneer u besluit om met ons samen te werken, plannen we een bezoek in naar Valencia of een andere door ons geselecteerde regio. Gedurende twee dagen begeleiden we u langs verschillende investeringsobjecten en bouwprojecten.', 'Tijdens deze dagen vinden er ook informatieve gesprekken plaats met internationale belastingadviseurs, bouwers en juristen.', 'Op deze manier bent u goed geïnformeerd en kunnen onze consultants al uw vragen beantwoorden.']),
]
def timeline(steps):
    out = ['<div class="timeline"><span class="timeline__fill"></span>']
    for i, (h, p) in enumerate(steps, 1):
        ps = p if isinstance(p, list) else [p]
        body = ''.join(f'<p>{x}</p>' for x in ps)
        out.append(f'<div class="step"><span class="step__n">{i}</span><div class="step__body rv"><h3>{i}. {h}</h3>{body}</div></div>')
    out.append('</div>')
    return '\n'.join(out)

page('werkwijze.html', 'Werkwijze - Property Consultancy Spain', 'Makelaardij in Spanje: onze werkwijze bij het kopen van een woning of belegging in Spanje.', 'over',
     phero('Over ons / Werkwijze', ['Makelaardij', 'in <em>Spanje</em>'], video='assets/hero-valencia.mp4', poster='assets/hero-poster.jpg') + f'''
<section class="sec">
  <div class="container split">
    <div>
      <span class="eyebrow rv">Over ons</span>
      <h2 class="rv" data-d="1">Makelaardij in <em>Spanje</em></h2>
      <div class="prose rv" data-d="2">
        <p>Het relaxte leven en de dagelijkse zonnestralen maken jou een <strong>liefhebber van Spanje</strong>. Echter is dit zakelijk gezien even schakelen! Er komt namelijk veel kijken bij de koop van een Spaanse woning. De <strong>mañana mañana</strong> cultuur en de taalbarrière kunnen dan een struikelblok vormen.</p>
        <p>Property Consultancy Spain is er om jouw zorgen uit handen te nemen! Onze volledige expertise op verschillende vakgebieden is wat ons <strong>uniek maakt in de makelaardij</strong> in Spanje. Er zijn geen onduidelijke afspraken tussen meerdere externe partijen, omdat wij alle expertise onder één dak hebben die nodig is bij de begeleiding in de koop van een woning in Spanje. Hierdoor is het gehele proces vanaf het begin af aan transparant en zijn er geen onaangename verrassingen. Wij zijn één team met alle expertise!</p>
      </div>
    </div>
    <div class="media-frame media-frame--sq rv" data-d="1"><img src="assets/img/team-travel.png" alt="" data-parallax-img="0.08" loading="lazy"></div>
  </div>
</section>

<section class="dark">
  <div class="container">
    <div class="counters">
      <div class="counter"><b data-count="16">16</b><span>Experts</span></div>
      <div class="counter"><b data-count="120">120</b><span>Tevreden klanten</span></div>
      <div class="counter"><b data-count="23">23</b><span>Jaar ervaring in Spanje</span></div>
    </div>
  </div>
</section>

<section class="sec sand">
  <div class="container">
    <span class="eyebrow rv">Werkwijze</span>
    <h2 class="rv" data-d="1" style="color:var(--navy);margin-top:18px;max-width:18ch">Werkwijze - Woning kopen in <em>Spanje</em></h2>
    <div class="prose rv" data-d="2" style="margin-top:24px"><p>Je kan ons inschakelen voor het kopen van een woning in Spanje. Je schakelt een team in met persoonlijke adviseurs. Standaard ontvang jij <strong>aankoopbegeleiding en juridische begeleiding</strong>. Is aanvullend advies nodig? Dan kan je het team uitbreiden. Hieronder krijg je inzicht hoe de koop van een woning werkt.</p></div>
    {timeline(steps_buy)}
  </div>
</section>

<section class="nieuw" style="min-height:70vh">
  <div class="nieuw__media" data-parallax="0.1">
    <video muted loop playsinline preload="none" poster="assets/villa-poster.jpg" data-src="assets/villa-marbella.mp4"></video>
  </div>
  <div class="container nieuw__content" style="grid-template-columns:1fr">
    <div>
      <span class="eyebrow rv">Beleggen</span>
      <h2 class="rv" data-d="1" style="font-size:clamp(2.6rem,6vw,5rem);max-width:16ch">Wilt u een belegging aankopen in <em>Spanje?</em></h2>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container">
    <span class="eyebrow rv">Werkwijze</span>
    <h2 class="rv" data-d="1" style="color:var(--navy);margin-top:18px;max-width:20ch">Werkwijze - Belegging aankopen in <em>Spanje</em></h2>
    <div class="prose rv" data-d="2" style="margin-top:24px">
      <p>Je kunt ons inschakelen voor het aankopen van een vastgoedbelegging in Spanje. Met jarenlange ervaring in het begeleiden van investeerders, biedt PC-Spain een volledig team van persoonlijke adviseurs. Standaard bieden we aankoop- en juridische begeleiding, en indien nodig kan het team worden uitgebreid met fiscale experts en ontwikkelaars.</p>
      <p>Wij helpen u bij het benutten van investeringskansen, zoals bankbeslagen, vastgoedveilingen, transformatieobjecten, het splitsen van woningen, het creëren van studentenwoningen, co-living projecten, en het renoveren van historische panden. Hieronder leest u hoe het proces van een vastgoedbelegging verloopt.</p>
    </div>
    <div class="chipcloud rv" data-d="3"><span>Bankbeslagen</span><span>Vastgoedveilingen</span><span>Transformatieobjecten</span><span>Splitsen van woningen</span><span>Studentenwoningen</span><span>Co-living projecten</span><span>Historische panden</span></div>
    {timeline(steps_inv)}
  </div>
</section>

<section class="cta">
  <div class="container">
    <div class="cta__box rv">
      <h2>Bent u klaar voor uw tweede woning of belegging in Spanje?</h2>
      <p></p>
      {btn('Ga van start!', 'intake.html')}
    </div>
  </div>
</section>''')

# ================================================================ EXPERTISES
xps = [
    ('aankoop', 'Aankoopbegeleiding', 'assets/img/s000-800x800.jpg',
     'Ons team helpt jou met het zoeken van een droomhuis in Spanje. Door jarenlang zaken te doen in Spanje weten ze de beste match te maken. Een nieuwbouwwoning dicht aan het Spaanse strand? Of juist een knus appartement in een stad? Ze gaan graag met jouw wensen aan de slag! Er is een eigen aanbod van woningen beschikbaar, waar een match wordt gezocht. Zit jouw woning hier niet tussen? Geen probleem, dan kijken ze verder bij collega makelaars. De commissie voor de dienstverlening ons team wordt transparant besproken. Je hoeft je dus geen zorgen te maken dat je onbewust hoge commissies moet betalen.',
     ['Betrouwbare partner', 'Transparante tarieven', '100% persoonlijke aandacht'], 'intake.html', False, 'standaard'),
    ('juridisch', 'Juridisch advies', 'assets/img/s0061-800x800.jpg',
     'Voor juridisch advies nemen we onze betrouwbaar advocatenkantoor in de arm! Een partij die zijn weg kent in de <strong>Spaanse wet- en regelgeving</strong>. De diensten van hen wordt niet enkel beperkt tot begeleiding bij de aankoop van een woning. Er zijn veel meer mogelijkheden! Wens jij bijvoorbeeld een bedrijf op te starten of dien je aangifte te doen in Spanje? Wij helpen jou graag verder.',
     ['Advies op meerdere rechtsgebieden', 'Professionele dienstverlening', 'Ervaring in de Spaanse wet- en regelgeving'], 'https://gimbrerelegal.com/', True, 'standaard'),
    ('hypotheek', 'Hypotheekadvies', 'assets/img/PC4-675x675.jpg',
     'Is een hypotheek noodzakelijk of gewenst in jouw dossier? Ook op dit gebied is er expertise in ons team. We schakelen hiervoor Spaanse Hypotheek en haar team in. Een Nederlandstalige partner welke advies kan uitbrengen over een financiering bij een Spaanse bank. Met meerdere banken in hun netwerk, kunnen ze <strong>onafhankelijk hypotheekadvies</strong> uitbrengen. Gebaseerd op het klantprofiel. Iets wat hen uniek maakt!',
     ['Onafhankelijke hypotheekadvies', 'Schakel tussen klant en Spaanse bank', 'Specialisatie: ondernemerdossiers'], 'http://www.spaansehypotheek.nl', True, 'optioneel'),
    ('renovatie', 'Renovatie/Verbouwing', 'assets/img/Mislata-before-cropped.png',
     'Wil je een Spaanse woning laten verbouwen? Property Consultancy Spain helpt jou met een <strong>verbouwing scan</strong>! Met onze experts maken we het voor de klant inzichtelijk wat de kosten en het tijdsbestek zal zijn voor de geplande renovatie. Maar ook of het plan juridisch gezien haalbaar is. Ondersteuning in de voorbereiding en/of begeleiding in het proces!',
     ['Realistische tijdsplanning en kostenbegroting', 'Juridische check', 'Advies voor- en tijdens de renovatie'], 'intake.html', False, 'optioneel'),
]
xblocks = []
for i, (key, name, img, text, ticks, href, ext, pkg) in enumerate(xps):
    rev = ' split--rev' if i % 2 else ''
    tk = ''.join(f'<li>{t}</li>' for t in ticks)
    opt = ' tag--opt' if pkg == 'optioneel' else ''
    xblocks.append(f'''<section class="xblock" id="{key}">
  <div class="container split{rev}">
    <div>
      <h2 class="rv"><small>Expertises in Spanje</small>{name}</h2>
      <div class="prose rv" data-d="1"><p>{text}</p></div>
      <ul class="ticks rv" data-d="2">{tk}</ul>
      <div class="xblock__foot rv" data-d="3">{btn('Meer weten', href, 'btn--navy', ext)}<span class="tag{opt}"><b>*</b> Expertise: <b>{pkg}</b> in jouw pakket.</span></div>
    </div>
    <div class="media-frame media-frame--sq rv" data-d="1"><img src="{img}" alt="{name}" data-parallax-img="0.08" loading="lazy"></div>
  </div>
</section>''')
xnav = ''.join(f'<a href="#{k}" class="rv" data-d="{i}"><i>0{i+1}</i>{n}</a>' for i, (k, n) in enumerate([('aankoop', 'Aankoopbegeleiding'), ('juridisch', 'Juridisch advies'), ('hypotheek', 'Hypotheekadvies'), ('renovatie', 'Verbouwingscan'), ('contact', 'Woningbeheer')]))
page('expertises.html', 'Expertises in Spanje - Property Consultancy Spain', 'Aankoopbegeleiding, juridisch advies, hypotheekadvies, verbouwingscan en woningbeheer in Spanje.', 'over',
     phero('Over ons / Expertises', ['Expertises', 'in <em>Spanje</em>'], lead='Hoe gaan wij te werk?', media='assets/img/s0051-800x800.jpg') + f'''
<section class="sec sand">
  <div class="container">
    <span class="eyebrow rv">Hoe gaan wij te werk?</span>
    <div class="prose rv" data-d="1" style="margin-top:24px;max-width:78ch">
      <p>Om de kwaliteit van onze dienstverlening te garanderen, werken wij uitsluitend met onze partners samen. Onze partners hebben ervaring in het Spaanse werkgebied. Het zijn partijen waar wij, maar ook de klant, <strong>op kan bouwen</strong>. Je schakelt Property Consultancy Spain in en ontvangt altijd begeleiding + juridisch advies. Optioneel voeg jij deskundige waar jij behoefte aan hebt toe! Hierbij is het niet mogelijk om zelf partijen in te schakelen, waarvan wij de kwaliteit niet kunnen garanderen. Dit brengt onduidelijkheid met zich mee door communiceren over meerdere kanalen. Om een <strong>exclusieve service</strong> te kunnen bieden ontvang je bij Property Consultancy Spain daarom het volledige pakket. Lees hieronder de verschillende expertises waar jij gebruik van kan maken.</p>
    </div>
    <nav class="xnav" aria-label="Expertises">{xnav}</nav>
  </div>
</section>
{''.join(xblocks)}
<section class="cta">
  <div class="container">
    <div class="cta__box rv">
      <h2>Aan de slag in Spanje!</h2>
      <p>Alles wat met de koop of huur van de woning te maken heeft is bij Property Consultancy Spain te vinden. Er is geen ruis in de communicatie, aangezien alle partijen in één team samenwerken. Je hebt dus één aanspreekpunt, wat door onze klanten als zeer prettig wordt ervaren. Benieuwd hoe onze commissie is opgebouwd?</p>
      {btn('Naar tarieven!', 'tarieven.html')}
    </div>
  </div>
</section>''')

# ================================================================ PORTFOLIO
page('portfolio.html', 'Portfolio - Property Consultancy Spain', 'Transformatie van oude panden naar moderne woon- of werkruimtes in Spanje.', 'over',
     phero('Over ons / Portfolio', ['Portfolio &amp;', '<em>succesverhalen</em>'], media='assets/img/Mislata-after.png') + f'''
<section class="sec">
  <div class="container">
    <div class="prose rv" style="max-width:80ch;font-size:1.1rem">
      <p>Bij Property Consultancy Spain begeleiden we klanten in het transformeren van oude panden, zoals kantoren en loodsen, naar moderne woon- of werkruimtes. Of het nu gaat om co-living projecten of kantoorruimtes, wij zorgen ervoor dat elk gebouw wordt omgevormd tot een innovatieve en functionele ruimte. Hier onder vind je een selectie van ons portfolio, waarin we enkele van onze meest succesvolle transformatieprojecten laten zien. Deze voorbeelden geven een goed beeld van ons vakmanschap en toewijding aan kwaliteit en design.</p>
    </div>
  </div>
</section>
<section class="sec sand">
  <div class="container split">
    <div class="ba rv">
      <img src="assets/img/Mislata-after.png" alt="Transitie Valencia – na">
      <img class="ba__before" src="assets/img/Mislata-before-cropped.png" alt="Transitie Valencia – voor">
      <span class="ba__lbl ba__lbl--b">Voor</span><span class="ba__lbl ba__lbl--a">Na</span>
      <div class="ba__handle"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg></i></div>
      <input type="range" id="baRange" min="0" max="100" value="50" aria-label="Vergelijk voor en na">
    </div>
    <div>
      <span class="eyebrow rv">Transformatie</span>
      <h2 class="rv" data-d="1">Transitie <em>Valencia</em></h2>
      <div class="prose rv" data-d="2"><p>Dit prachtige appartement in Valencia is ontstaan uit de transformatie van een oud kantoorpand naar een moderne woonruimte. Met aandacht voor detail en hoogwaardige afwerking is het kantoor volledig omgebouwd tot een stijlvol appartement. De ligging in het hart van Valencia, gecombineerd met de vernieuwde en comfortabele inrichting, maakt dit de perfecte plek om te wonen of te investeren. Het appartement biedt een unieke mix van geschiedenis en moderne voorzieningen, waardoor het een bijzondere en aantrekkelijke optie is voor de liefhebber van eigentijds wonen.</p></div>
    </div>
  </div>
</section>
<section class="expert">
  <div class="container">
    <div class="expert__card rv">
      <div class="expert__bg" data-parallax="0.08" style="background-image:url(assets/img/Mislata-after.png)"></div>
      <div class="expert__content">
        <span class="eyebrow">Transformatie</span>
        <h2>Start jouw <em>vastgoedtransformatie!</em></h2>
        <p>Ben je klaar om een oude ruimte om te toveren tot een moderne woon- of werkplek? Wij begeleiden je van begin tot eind, met innovatieve oplossingen en een team van experts. Neem vandaag nog de eerste stap naar jouw succesvolle transformatie!</p>
        <p style="margin-top:14px">Laat ons je ondersteunen bij het optimaliseren van je investeringen met professioneel advies en begeleiding. Property Consultancy Group helpt je graag verder met expertise op het gebied van investeringen, juridische ondersteuning en hypotheekadvies.</p>
        {btn('Meer informatie!', 'intake.html')}
      </div>
    </div>
  </div>
</section>''')

# ================================================================ PARTNERS
partners = [
    ('BeleggenInValencia.nl', 'Beleggen-In-Valencia.png', 'https://beleggeninvalencia.nl', ['Beleggeninvalencia.nl is gespecialiseerd in het begeleiden van internationale investeerders bij de aankoop en ontwikkeling van vastgoed in Valencia. Met een diepgaande kennis van de lokale markt en een sterk netwerk van juridische, fiscale en bouwexperts biedt Beleggeninvalencia.nl een complete dienstverlening.', 'Van het vinden van de juiste panden tot projectmanagement en het optimaliseren van het investeringsrendement: zij zorgen ervoor dat elke stap professioneel en efficiënt verloopt. Beleggeninvalencia.nl maakt investeren in Valencia toegankelijk en succesvol voor zowel particuliere als zakelijke beleggers.']),
    ('Ambau', 'Ambau-1.png', None, ['Ambau is een jong en dynamisch architectenbureau uit Valencia, gespecialiseerd in het bedenken van moderne en efficiënte oplossingen voor elk project. Dankzij hun innovatieve aanpak en snelle werkwijze kunnen zij maatwerk leveren dat perfect aansluit bij de wensen van hun klanten.', 'Of het nu gaat om een nieuwbouwproject of een renovatie, Ambau combineert creativiteit met functionaliteit om hoogwaardige en unieke ontwerpen te realiseren. Samen met PC Spain zorgen ze voor naadloze architectonische oplossingen binnen elk investeringsproject.']),
    ('Santander', 'Santander.png', None, ['Santander is een toonaangevende bank in Spanje, met een sterke focus op zowel nationale als internationale markten. Het biedt een breed scala aan financiële diensten, variërend van persoonlijke bankdiensten tot bedrijfsoplossingen, en staat bekend om zijn innovatieve digitale oplossingen.', 'Santander speelt een belangrijke rol in de financiering van vastgoed- en investeringsprojecten, wat het een betrouwbare partner maakt voor iedereen die actief is in de vastgoedmarkt in Spanje. Dankzij hun jarenlange ervaring kunnen ze investeerders op maat gemaakte financiële oplossingen bieden.']),
    ('Cajamar', 'Cajamar.png', None, ['Cajamar is een toonaangevende coöperatieve bank in Spanje met een sterke focus op de landbouwsector en duurzame projecten. Met een uitgebreid netwerk van filialen en een klantgerichte benadering, biedt Cajamar financiële oplossingen voor zowel particulieren als bedrijven.', 'Hun expertise in vastgoedfinanciering maakt hen een ideale partner voor investeerders die op zoek zijn naar betrouwbare hypotheek- en investeringsopties in Spanje. Cajamar staat bekend om hun innovatie in de banksector en hun betrokkenheid bij regionale economische ontwikkeling.']),
    ('Fides – ETL Global', 'Fides.png', None, ['Fides Auditores is een gerenommeerd accountantskantoor dat gespecialiseerd is in fiscale, boekhoudkundige en auditdiensten. Met een ervaren team van professionals biedt Fides Auditores op maat gemaakte oplossingen voor bedrijven en particulieren die hun financiële zaken in Spanje willen optimaliseren. Hun expertise en grondige kennis van de lokale wetgeving maken hen een betrouwbare partner voor zowel investeerders als ondernemers. Door nauw samen te werken met klanten, waarborgen ze transparantie en naleving van fiscale verplichtingen, waardoor financiële processen efficiënt worden beheerd.']),
    ('Gimbrere Legal', 'Gimbrere-Legal.png', None, ['Gimbrere Legal is een internationaal advocatenkantoor dat gespecialiseerd is in juridische diensten op het gebied van onder andere vastgoed, ondernemingsrecht, en immigratierecht. Met kantoren in zowel Spanje als Nederland biedt Gimbrere Legal grensoverschrijdende juridische ondersteuning voor particulieren en bedrijven die zaken doen in Spanje.', 'Hun team van ervaren advocaten staat bekend om hun betrokkenheid, expertise en persoonlijke aanpak, waarbij zij cliënten door complexe juridische vraagstukken begeleiden. Samen met PC Spain zorgen zij voor naadloze juridische ondersteuning bij investeringsprojecten.']),
    ('To Do', 'To-Do.png', None, ['To Do is een hoogwaardig architectenbureau dat gespecialiseerd is in luxueuze en moderne projecten. Met een verfijnde en innovatieve aanpak realiseren ze unieke ontwerpen die esthetiek en functionaliteit combineren. To Do creëert exclusieve woon- en werkruimtes die aan de hoogste standaarden voldoen. Dankzij hun oog voor detail en gebruik van hoogwaardige materialen, weten ze telkens weer indrukwekkende architecturale meesterwerken te leveren.', 'Samen met PC Spain zorgen ze voor luxueuze vastgoedoplossingen die perfect passen bij de wensen van de meest veeleisende investeerders.']),
    ('Handy Valencia', 'Handy-Valencia.png', None, ['Handy Valencia is een aannemer die bekend staat om zijn uitstekende communicatie en snelle aanpak. Met continue updates over de voortgang houden ze klanten nauw betrokken bij het project. Handy Valencia levert verbouwingen en renovaties van topkwaliteit, waarbij geen detail over het hoofd wordt gezien.', 'Hun persoonlijke benadering en focus op klanttevredenheid zorgen ervoor dat elk project niet alleen volgens planning, maar ook met de hoogste kwaliteitsstandaarden wordt afgerond.']),
    ('Orange Estates', 'logo-transparent-orange.png', 'https://orange-estates.com', ['Orange Estates is een wereldwijd netwerk van ervaren vastgoedprofessionals, waaronder makelaars, notarissen, juridische experts, architecten en aannemers. Ze zijn toegewijd aan het realiseren van de vastgoeddoelen van hun klanten door middel van een naadloze en samenwerkingsgerichte aanpak. Of het nu gaat om aan- of verkoop, ontwikkeling of advies,', 'Orange Estates biedt de expertise en begeleiding die nodig is om vastgoedprojecten tot een succes te maken. Hun netwerk staat garant voor betrouwbare en efficiënte transacties en ontwikkelingen.']),
    ('Ennumera Consultores', 'Ennumera.png', None, ['Ennumera Consultores is een gerenommeerde gestor in Denia die particulieren en bedrijven ondersteunt met administratieve, fiscale en juridische zaken. Ze bieden op maat gemaakte oplossingen voor hun klanten, van belastingadvies en bedrijfsadministratie tot immigratieprocedures en vastgoedtransacties.', 'Met hun diepgaande kennis van de Spaanse regelgeving en hun klantgerichte benadering, zorgen ze ervoor dat elke procedure soepel verloopt. Of het nu gaat om residentieaanvragen of zakelijke verplichtingen, Ennumera Consultores is een betrouwbare partner voor iedereen die zorgeloos zaken wil doen in Spanje.']),
    ('Orange Brokers', 'Orange-Brokers.png', 'https://orange-brokers.nl', ['Orange Brokers is een ervaren makelaar gespecialiseerd in vastgoed aan de Spaanse Costa’s. Ze bieden uitgebreide diensten voor zowel de aankoop als de verkoop van woningen, met een sterke focus op persoonlijke begeleiding en maatwerk.', 'Orange Brokers onderscheidt zich door diepgaande kennis van de lokale markt en een breed netwerk van partners, waardoor ze hun klanten kunnen voorzien van gedetailleerd advies en ondersteuning tijdens elke stap van het proces. Samen met PC Spain zorgen ze voor een soepele en succesvolle vastgoedtransactie in Spanje.']),
]
pcards = []
for i, (n, logo, url, ps) in enumerate(partners):
    body = ''.join(f'<p>{p}</p>' for p in ps)
    link = f'<a class="ext" href="{url}" target="_blank" rel="noopener">{url.split("//")[1]} {EXT}</a>' if url else ''
    pcards.append(f'<article class="p-card rv" data-d="{i%2}"><div class="p-card__logo"><img src="assets/img/{logo}" alt="{n}" loading="lazy"></div><div><h3>{n}</h3>{body}{link}</div></article>')
marq = ''.join(f'<span>{p[0]}</span>' for p in partners) * 2
page('partners.html', 'Partners - Property Consultancy Spain', 'Het netwerk van partners van Property Consultancy Spain.', 'over',
     phero('Over ons / Partners', ['Onze', '<em>partners</em>'], media='assets/img/s0061-800x800.jpg') + f'''
<div class="marquee" aria-hidden="true"><div class="marquee__track">{marq}</div></div>
<section class="sec sand">
  <div class="container">
    <div class="p-grid">
{chr(10).join(pcards)}
    </div>
  </div>
</section>
''' + CTA)

# ================================================================ TARIEVEN
tiers = [('voor aankopen tot € 100.000,-', '€ 5.750,-', 25), ('voor aankopen tot € 150.000,-', '€ 6.750,-', 50), ('voor aankopen tot € 200.000,-', '€ 7.750,-', 75), ('van de aankoopsom voor aankopen boven € 200.000,-', '4%', 100)]
tier_html = ''.join(f'<div class="tier"><span>{a}</span><b>{b}</b><div class="tier__bar"><i style="--w:{w}%"></i></div></div>' for a, b, w in tiers)
page('tarieven.html', 'Tarieven - Property Consultancy Spain', 'Transparante tarieven voor de aanschaf van een tweede woning of vastgoedbelegging in Spanje.', 'tarieven',
     phero('Tarieven', ['Transparante', '<em>tarieven</em>'], media='assets/s025.jpg') + f'''
<section class="sec">
  <div class="container split">
    <div>
      <span class="eyebrow rv">Tarieven</span>
      <h2 class="rv" data-d="1">Transparante <em>tarieven</em></h2>
    </div>
    <div class="prose rv" data-d="2">
      <p>Bij Property Consultancy Spain hanteren we transparante tarieven, afgestemd op uw specifieke situatie. Onze kosten variëren afhankelijk van het type aankoop: of u nu begeleiding zoekt bij de aankoop van een tweede woning voor eigen gebruik, of investeert in vastgoed voor verhuur en rendement.</p>
      <p>Wij zorgen ervoor dat u precies weet waar u aan toe bent, zodat u met vertrouwen kunt investeren in de Spaanse vastgoedmarkt. Neem contact met ons op voor meer informatie over onze op maat gemaakte tarieven!</p>
    </div>
  </div>
</section>
<section class="sec sand">
  <div class="container">
    <div class="price-hero">
      <article class="pcard rv">
        <span class="eyebrow">Tweede woning</span>
        <h3 style="margin-top:16px">Tarieven - Aanschaf tweede woning in Spanje</h3>
        <div class="bignum">3% <small>minimum €5.750 excl. btw</small></div>
        <p>In Spanje werken commissies anders dan in Nederland. Bijna 90% van de verkopen bevat een commissie van 5% in de verkoopprijs. In de regio Valencia betaalt de verkoper 3% aan de makelaar en de koper 3% aan zijn eigen makelaar. Bij PC-Spain hanteren wij dezelfde werkwijze, met een minimum van €5.750 exclusief btw. Voor aankopen buiten Valencia worden wij betaald door de verkopende makelaar. Eventuele afwijkingen communiceren wij altijd transparant vooraf.</p>
      </article>
      <article class="pcard pcard--navy rv" data-d="1">
        <span class="eyebrow">Vastgoedbelegging</span>
        <h3 style="margin-top:16px">Tarieven - Begeleiding bij aankoop vastgoedbelegging</h3>
        <p>Bij de aankoop van een vastgoedbelegging bieden wij uitgebreide begeleiding om ervoor te zorgen dat u het maximale uit uw investering haalt. Onze opstartkosten omvatten essentiële consulten, rondleidingen en projectbezoeken die u volledig inzicht geven in de markt en potentiële kansen. Wij hanteren transparante tarieven zodat u precies weet waar u aan toe bent gedurende het gehele proces.</p>
        <div class="bignum">€ 1.750,- <small>Opstartnota, exclusief btw</small></div>
        <p style="color:#fff;font-weight:700">De opstartnota bevat:</p>
        <ul>
          <li>Consult met een internationale belastingadviseur.</li>
          <li>Juridisch advies door een vastgoedadvocaat.</li>
          <li>Twee dagen rondleiding door Valencia en omgeving.</li>
          <li>Bezichtigen van lopende projecten en potentiële investeringen.</li>
          <li>Twee dagen begeleiding door een consultant met kennis van Spaanse investeringsmogelijkheden.</li>
        </ul>
      </article>
    </div>
    <h2 class="rv" style="color:var(--navy);margin-top:100px">Tarieven bij <em>aankoop</em>:</h2>
    <div class="tiers rv">{tier_html}</div>
    <p class="note">Alle commissies zijn exclusief btw (VAT).</p>
  </div>
</section>
''' + CTA)

# ================================================================ WONING KOPEN
listings = json.loads((HERE / 'listings.json').read_text())
cities = ['Altea', 'Benidorm', 'Benissa', 'Denia', 'Finestrat', 'Gandia', 'Gran Alacant', 'Javeá', 'Moraira', 'Orihuela', 'Santa Pola', 'Tarbena', 'Valencia', 'Xativa']
def slug(c): return re.sub(r'[^a-z]+', '-', c.lower().replace('á', 'a'))
counts = {c: sum(1 for l in listings if l['city'] == c) for c in cities}
filt = f'<button class="on" data-city="all">Allemaal<sup>{len(listings)}</sup></button>' + ''.join(f'<button data-city="{slug(c)}">{c}<sup>{counts[c]}</sup></button>' for c in cities)
cards = []
for l in listings:
    price = next((s for s in l['specs'] if '€' in s), '')
    rest = [s for s in l['specs'] if s != price]
    li = ''.join(f'<li>{html.escape(s)}</li>' for s in rest)
    pr = f'<div class="l-card__price">{html.escape(price)}</div>' if price else ''
    cards.append(f'''<a class="l-card" data-city="{slug(l['city'])}" href="{l['url']}">
  <div class="l-card__img"><img src="assets/img/{l['img']}" alt="{html.escape(l['title'])}" loading="lazy"><span class="l-card__city">{l['city']}</span></div>
  <div class="l-card__body"><h3>{html.escape(l['title'])}</h3>{pr}<ul>{li}</ul><span class="more">Bekijk woning {ARROW}</span></div>
</a>''')
page('woning-kopen.html', 'Woning kopen Spanje - Property Consultancy Spain', 'Woningaanbod in Spanje: Altea, Benidorm, Denia, Javeá, Valencia en meer.', 'woning',
     phero('Woning kopen', ['Woning kopen', 'in <em>Spanje</em>'], video='assets/villa-marbella.mp4', poster='assets/villa-poster.jpg') + f'''
<section class="sec">
  <div class="container">
    <div class="filters rv" id="filters" role="group" aria-label="Filter op plaats">{filt}</div>
    <div class="l-grid" id="lGrid">
{chr(10).join(cards)}
    </div>
    <div class="loadmore"><button class="btn btn--navy" id="loadMore">Laadt meer</button></div>
  </div>
</section>
''' + CTA)

# ================================================================ TIPS
tips = [
    ('https://pc-spain.com/procedure-aankoop-woning-spanje/', 'Procedure aankoop woning Spanje', 'PC15.jpg'),
    ('https://pc-spain.com/aankoopmakelaar-spanje/', 'Aankoopmakelaar Spanje', 'PC3.jpg'),
    ('https://pc-spain.com/de-beste-nederlandse-makelaar-in-spanje/', 'Nederlandse makelaar in Spanje', 'PC7.jpg'),
    ('https://pc-spain.com/huis-kopen-in-spanje/', 'Woning kopen in Spanje', 'PC8.jpg'),
    ('https://pc-spain.com/huis-kopen-in-spanje-bijkomende-kosten/', 'Vastgoed in Spanje – bijkomende kosten', 'PC2.jpg'),
    ('https://pc-spain.com/huis-kopen-spanje-wat-moet-je-weten/', 'Woning kopen: wat moet je weten?', 'PC11.jpg'),
    ('https://pc-spain.com/hoeveel-eigen-geld-om-een-woning-te-kopen-in-spanje/', 'Hoeveel eigen geld heb je nodig?', 'PC6.jpg'),
    ('https://pc-spain.com/hulp-bij-woning-aankoop-spanje/', 'Hulp bij woning aankoop Spanje', 'PC1.jpg'),
    ('https://pc-spain.com/nederlandse-makelaar-in-valencia/', 'Nederlandse makelaar in Valencia', 'PC14.jpg'),
]
tip_html = '\n'.join(f'<a class="tip rv" data-d="{i%3}" href="{u}"><img src="assets/img/{im}" alt="" loading="lazy"><div class="tip__body"><h3>{t}</h3><span>Meer informatie {ARROW}</span></div></a>' for i, (u, t, im) in enumerate(tips))
page('informatie-tips.html', 'Informatie & Tips - Property Consultancy Spain', 'Hoe koop je een woning of doe je een investering in Spanje? Wij geven tips!', 'woning',
     phero('Woning kopen / Informatie &amp; Tips', ['Informatie', '&amp; <em>Tips</em>'], media='assets/img/PC1.jpg') + f'''
<section class="sec">
  <div class="container split">
    <div>
      <span class="eyebrow rv">Informatie &amp; Tips</span>
      <h2 class="rv" data-d="1">Hoe koop je een woning of doe je een investering in Spanje? <em>Wij geven tips!</em></h2>
      <div class="prose rv" data-d="2"><p>Wanneer je de beslissing hebt genomen om een woning in Spanje te kopen, sta je aan het begin van een spannend avontuur. Voor veel Nederlandstalige kopers is het lang niet altijd duidelijk hoe dit proces precies verloopt. Hieronder plaatsen wij regelmatig artikelen om je uitleg te geven over het aanschaffen van een woning in Spanje. Als <a href="index.html" style="color:var(--gold);font-weight:700">Nederlandse woningmakelaar in Spanje</a> willen wij jou hierbij graag helpen. Onze groep van consultants en aangesloten partners helpt je met het zoeken van een mooie woning in Spanje. Wijzelf en ons netwerk beschikken over jarenlange ervaring, waardoor we de beste match weten te maken. Een nieuwbouwwoning dicht aan het Spaanse strand? Of juist een knus appartement in een stad? Wij gaan graag met jouw wensen aan de slag!</p></div>
    </div>
    <div class="media-frame media-frame--sq rv" data-d="1"><img src="assets/img/PC1.jpg" alt="" data-parallax-img="0.08" loading="lazy"></div>
  </div>
</section>
<section class="sec sand">
  <div class="container">
    <div class="sec-head"><div><span class="eyebrow rv">Artikelen</span><h2 class="rv" data-d="1">Alle tips om een huis te kopen in <em>Spanje</em></h2></div></div>
    <div class="tip-grid">
{tip_html}
    </div>
  </div>
</section>
<section class="cta">
  <div class="container">
    <div class="cta__box rv">
      <h2>Hulp nodig bij je woning aankoop in Spanje?</h2>
      <p></p>
      {btn('Contact opnemen', '#contact')}
    </div>
  </div>
</section>''')

# ================================================================ INTAKE
page('intake.html', 'Intake - Property Consultancy Spain', 'Vul het korte intakeformulier in en start direct met uw belegging in Spanje.', 'intake',
     phero('Intake', ['Doe de', '<em>intake</em>'], lead='Doe de intake en start direct met uw belegging in Spanje.', media='assets/slider-property-consultancy-spain.jpg') + f'''
<section class="sec sand">
  <div class="container intake-grid">
    <div>
      <div class="prose rv" style="margin-bottom:40px"><p>Om u zo goed mogelijk van dienst te zijn, vragen wij u vriendelijk om dit korte intakeformulier in te vullen. Dit helpt ons om een duidelijk beeld te krijgen van uw wensen en behoeften, zodat we u op maat kunnen ondersteunen met uw vastgoedplannen. Zodra we uw informatie hebben ontvangen, nemen we spoedig contact met u op om een vervolgafspraak te maken. Op deze manier kunnen we u de best mogelijke service bieden, afgestemd op uw persoonlijke situatie.</p></div>
      <div class="tf-wrap rv" data-d="1">
        <div data-tf-live="01J8J7W38XSF5PMAV91S5H8HA1"></div>
        <noscript><div class="tf-fallback">Schakel JavaScript in om het intakeformulier te laden.</div></noscript>
      </div>
    </div>
    <aside class="aside rv" data-d="2">
      <h3>Contact informatie</h3>
      <h4>Kantoren:</h4>
      <ul><li>Valencia</li><li>Dénia</li><li>Amsterdam</li><li>Barcelona</li></ul>
      <h4>Openingstijden:</h4>
      <p>Maandag- Zaterdag: 10:00 - 18:00</p>
      <h4>Vind ons op:</h4>
      <a href="https://instagram.com/pc_spain" target="_blank" rel="noopener" style="color:var(--gold-light);font-weight:700">@pc_spain</a>
    </aside>
  </div>
</section>''', extra_end='<script src="https://embed.typeform.com/next/embed.js"></script>\n')
