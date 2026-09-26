# v8 — navigation: the main pages sit in the header around the centred logo (desktop),
# the overlay menu becomes a short list with one fold-out ("Over ons") for phones and small laptops.
# Exec'd after pages_v7.py; overrides header().

NAV2 = {
    'nl': {
        'left': [('Woning kopen', 'woning-kopen.html'), ('Expertises', 'expertises.html'), ('Werkwijze', 'werkwijze.html'), ('Tarieven', 'tarieven.html')],
        'right': [],
        'about': ('Over ons', [('Over PC-Spain', 'over-pc-spain.html'), ('Portfolio', 'portfolio.html'),
                               ('Partners', 'partners.html'), ('Informatie &amp; Tips', 'informatie-tips.html')]),
        'main': 'Hoofdmenu',
    },
    'en': {
        'left': [('Buying property', 'en-buying-property.html'), ('Expertises', 'en-expertises.html'), ('Working method', 'en-working-method.html'), ('Prices', 'en-prices.html')],
        'right': [],
        'about': ('About us', [('About PC-Spain', 'en-about.html'), ('Portfolio', 'en-success-stories.html'),
                               ('Partners', 'en-partners.html'), ('Information &amp; Tips', 'en-information-tips.html')]),
        'main': 'Main menu',
    },
}

_CHEV = '<svg class="chev" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>'


def header(lang, active, alt):
    t = T[lang]
    n = NAV2[lang]
    home = 'index.html' if lang == 'nl' else 'en.html'
    nl_href, en_href = (active_file(alt, 'nl'), active_file(alt, 'en'))
    cur = {active, alt}
    on = lambda h: ' class="on" aria-current="page"' if h in cur else ''
    links = lambda items: ''.join(f'<a href="{h}"{on(h)}>{l}</a>' for l, h in items)
    about_label, about_items = n['about']
    about_on = any(h in cur for _, h in about_items)
    exact = lambda h: ' class="on" aria-current="page"' if h == alt else ''
    dd = ''.join(f'<a href="{h}"{exact(h)}>{l}</a>' for l, h in about_items)
    lang_nl = ' class="on"' if lang == 'nl' else ''
    lang_en = ' class="on"' if lang == 'en' else ''
    lang_nav = f'<nav class="hd__lang label" aria-label="Language"><a href="{nl_href}"{lang_nl}>NL</a><a href="{en_href}"{lang_en}>EN</a></nav>'
    # overlay menu: flat list + one fold-out
    rows = ''.join(f'<li><a href="{h}"{on(h)}>{l}</a></li>' for l, h in n['left'] + n['right'])
    sub = ''.join(f'<li><a href="{h}"{exact(h)}>{l}</a></li>' for l, h in about_items)
    open_attr = 'true' if about_on else 'false'
    rows += (f'<li class="menu__has{" is-open" if about_on else ""}"><button class="menu__acc" type="button" aria-expanded="{open_attr}" aria-controls="menu-about">'
             f'{about_label}<i aria-hidden="true"></i></button><ul class="menu__sub" id="menu-about">{sub}</ul></li>')
    return f'''
<header class="hd hd--nav" id="top">
  <div class="hd__left">
    <button class="hd__menu label" data-menu-open aria-label="{t['menu']}"><i></i><span>{t['menu']}</span></button>
    <nav class="hd__nav" aria-label="{n['main']}">{links(n['left'])}</nav>
  </div>
  <a class="hd__logo" href="{home}" aria-label="Property Consultancy Spain"><img src="assets/logo/pc-spain.png" alt="Property Consultancy Spain" width="800" height="258"></a>
  <div class="hd__right">
    <nav class="hd__nav" aria-label="{n['main']} 2">{links(n['right'])}<div class="hd__dd" data-dd><button class="hd__ddbtn{' on' if about_on else ''}" type="button" aria-expanded="false" aria-controls="dd-about">{about_label}{_CHEV}</button><div class="hd__ddp" id="dd-about">{dd}</div></div></nav>
    {lang_nav}
    <a class="hd__cta hd__cta--solid label" href="{t['cta'][1]}">{t['cta'][0]} {ARROW}</a>
  </div>
</header>

<div class="menu" aria-hidden="false">
  <button class="menu__close label" data-menu-close><i></i>{t['close']}</button>
  <a class="menu__logo" href="{home}" aria-label="Property Consultancy Spain"><img src="assets/logo/pc-spain.png" alt="Property Consultancy Spain" width="800" height="258"></a>
  <div class="menu__main">
    <nav aria-label="Menu"><ul class="menu__list menu__list--v8">{rows}</ul></nav>
  </div>
  <aside class="menu__side">
    <a class="btn btn--solid menu__cta" href="{t['cta'][1]}">{t['cta'][0]} {ARROW}</a>
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
      <div class="menu__lang" aria-label="Language"><a href="{nl_href}"{lang_nl} lang="nl">NL</a><a href="{en_href}"{lang_en} lang="en">EN</a></div>
      {IG}
    </div>
  </aside>
</div>
'''


# v8 — "Woning kopen" photo strip: a real carousel you control (arrows, drag, swipe), no endless auto-scroll
def reel_html():
    picks = [c for c in CARDS if C['listings'][c['url'].rstrip('/').split('/')[-1]]['gallery']][:14]
    items = ''
    for c in picks:
        s = c['url'].rstrip('/').split('/')[-1]
        items += (f'<a href="{LISTING_FILES[s]}"><img src="{sm(LPH(s))}" alt="{esc(c.get("title", c["city"]))}" loading="lazy" decoding="async">'
                  f'<span class="label">{esc(c["city"])}</span></a>')
    return f'<div class="reel reel--car"><div class="reel__track" data-carousel>{items}</div></div>'


# ---------------------------------------------------------------- v8 — Tarieven, redesigned: light, editorial, no dark cards
_CHECK = '<svg class="tt-check" viewBox="0 0 20 20" aria-hidden="true"><path pathLength="1" d="M4 10.5l4 4 8-9"/></svg>'


def tarieven():
    tiers = ''.join(f'<li data-max="{m or 0}"><span>{t}</span><b>{f}</b></li>' for m, f, t in TIERS)
    incl = ['Consult met een internationale belastingadviseur.', 'Juridisch advies door een vastgoedadvocaat.',
            'Twee dagen rondleiding door Valencia en omgeving.', 'Bezichtigen van lopende projecten en potentiële investeringen.',
            'Twee dagen begeleiding door een consultant met kennis van Spaanse investeringsmogelijkheden.']
    incl_html = ''.join(f'<li>{_CHECK}<span>{x}</span></li>' for x in incl)
    return f'''
<section class="tt-hero">
  <div class="wrap tt-hero__grid">
    <div class="tt-hero__text">
      {crumbs([('Home', 'index.html'), ('Tarieven', '')])}
      <h1 class="h1" data-split>Transparante <span class="script">tarieven</span></h1>
      <p class="tt-hero__lead" data-reveal=".3">Bij Property Consultancy Spain hanteren we transparante tarieven, afgestemd op uw specifieke situatie. Onze kosten variëren afhankelijk van het type aankoop: of u nu begeleiding zoekt bij de aankoop van een tweede woning voor eigen gebruik, of investeert in vastgoed voor verhuur en rendement.</p>
    </div>
    <div class="tt-price" data-reveal=".2">
      <span class="tt-price__seal" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="tt-seal" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text><textPath href="#tt-seal">TRANSPARANTE TARIEVEN · PC-SPAIN · </textPath></text></svg></span>
      <a class="tt-price__item" href="#tt-plan-1"><span class="label">01 · Aanschaf tweede woning</span><b><span data-count="3">3</span><i>%</i></b><small class="label">Minimum €5.750 exclusief btw</small></a>
      <a class="tt-price__item" href="#tt-plan-2"><span class="label">02 · Vastgoedbelegging</span><b><i>€</i>1.750</b><small class="label">Opstartnota, exclusief btw</small></a>
    </div>
  </div>
</section>

<section class="sec tt-how bg-white">
  <div class="wrap">
    <div class="tt-how__head">
      <span class="label label--brass">Zo werkt commissie in Spanje</span>
      <p class="lead lead--xl" data-words>Wij zorgen ervoor dat u precies weet waar u aan toe bent, zodat u met vertrouwen kunt investeren in de Spaanse vastgoedmarkt. Neem contact met ons op voor meer informatie over onze op maat gemaakte tarieven!</p>
    </div>
    <div class="tt-split" data-tt-split>
      <div class="tt-split__cap"><span class="label">Regio Valencia</span><span class="label muted">Commissie over de aankoopprijs</span></div>
      <div class="tt-split__bar">
        <div class="tt-split__seg tt-split__seg--a"><b>3%</b><span>Verkoper</span><small>Betaalt zijn eigen makelaar</small></div>
        <div class="tt-split__seg tt-split__seg--b"><b>3%</b><span>Koper</span><small>Betaalt uw eigen makelaar: PC-Spain</small></div>
      </div>
    </div>
  </div>
</section>

<section class="sec tt-plans">
  <div class="wrap">
    <div class="tt-plans__head"><span class="label label--brass">Tarieven</span><h2 class="h2" data-split>Twee trajecten, één heldere prijs</h2></div>
    <div class="tt-plans__grid">
      <article class="tt-plan" id="tt-plan-1" data-reveal>
        <span class="tt-plan__n" aria-hidden="true">01</span>
        <h3 class="h3">Tarieven - Aanschaf tweede woning in Spanje</h3>
        <div class="tt-plan__fig">3%<small class="label">Minimum €5.750 exclusief btw</small></div>
        <p>In Spanje werken commissies anders dan in Nederland. Bijna 90% van de verkopen bevat een commissie van 5% in de verkoopprijs. In de regio Valencia betaalt de verkoper 3% aan de makelaar en de koper 3% aan zijn eigen makelaar. Bij PC-Spain hanteren wij dezelfde werkwijze, met een minimum van €5.750 exclusief btw. Voor aankopen buiten Valencia worden wij betaald door de verkopende makelaar. Eventuele afwijkingen communiceren wij altijd transparant vooraf.</p>
        <a class="lk" href="#tt-calc">Bereken uw commissie {ARROW}</a>
      </article>
      <article class="tt-plan" id="tt-plan-2" data-reveal=".15">
        <span class="tt-plan__n" aria-hidden="true">02</span>
        <h3 class="h3">Tarieven - Begeleiding bij aankoop vastgoedbelegging</h3>
        <div class="tt-plan__fig">€ 1.750,-<small class="label">Opstartnota, exclusief btw</small></div>
        <p>Bij de aankoop van een vastgoedbelegging bieden wij uitgebreide begeleiding om ervoor te zorgen dat u het maximale uit uw investering haalt. Onze opstartkosten omvatten essentiële consulten, rondleidingen en projectbezoeken die u volledig inzicht geven in de markt en potentiële kansen. Wij hanteren transparante tarieven zodat u precies weet waar u aan toe bent gedurende het gehele proces.</p>
        <p class="tt-plan__incl-t label">De opstartnota bevat:</p>
        <ul class="tt-incl">{incl_html}</ul>
      </article>
    </div>
    <ul class="tt-promise" data-reveal>
      <li><b>01</b><span>Altijd exclusief btw</span></li>
      <li><b>02</b><span>Buiten Valencia betaalt de verkopende makelaar ons</span></li>
      <li><b>03</b><span>Afwijkingen altijd vooraf gecommuniceerd</span></li>
    </ul>
  </div>
</section>

<section class="sec bg-white" id="tt-calc">
  <div class="wrap tt-calc calc" data-calc>
    <div class="tt-calc__head calc__head">
      <span class="label label--brass">Tarieven bij aankoop:</span>
      <h2 class="h2" data-split>Tarieven bij aankoop</h2>
      <p class="muted">Alle commissies zijn exclusief btw (VAT).</p>
    </div>
    <div class="tt-calc__box">
      <div class="tt-calc__io">
        <div><label class="label" for="calc-range">Aankoopsom</label><output class="calc__amount" for="calc-range">€ 150.000</output></div>
        <div class="tt-calc__res"><span class="label">Commissie</span><b class="calc__fee">€ 6.750,-</b></div>
      </div>
      <input type="range" id="calc-range" min="50000" max="1000000" step="5000" value="150000">
      <div class="calc__scale label muted"><span>€ 50.000</span><span>€ 1.000.000</span></div>
      <ol class="calc__tiers tt-tiers">{tiers}</ol>
    </div>
  </div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')


TF_EN += [
    ('Zo werkt commissie in Spanje', 'How commission works in Spain'), ('>Regio Valencia<', '>Valencia region<'),
    ('Commissie over de aankoopprijs', 'Commission on the purchase price'), ('<span>Verkoper</span>', '<span>Seller</span>'),
    ('<span>Koper</span>', '<span>Buyer</span>'), ('Betaalt zijn eigen makelaar', 'Pays their own agent'),
    ('Betaalt uw eigen makelaar: PC-Spain', 'Pays your own agent: PC-Spain'),
    ('Twee trajecten, één heldere prijs', 'Two paths, one clear price'), ('Bereken uw commissie', 'Calculate your commission'),
    ('>De opstartnota bevat:<', '>The start-up invoice includes:<'),
    ('<span>Consult met een internationale belastingadviseur.</span>', '<span>A consultation with an international tax adviser.</span>'),
    ('<span>Juridisch advies door een vastgoedadvocaat.</span>', '<span>Legal advice from a property lawyer.</span>'),
    ('<span>Twee dagen rondleiding door Valencia en omgeving.</span>', '<span>A two-day tour of Valencia and the surrounding area.</span>'),
    ('<span>Bezichtigen van lopende projecten en potentiële investeringen.</span>', '<span>Viewing ongoing projects and potential investments.</span>'),
    ('<span>Twee dagen begeleiding door een consultant met kennis van Spaanse investeringsmogelijkheden.</span>', '<span>Two days of guidance by a consultant with knowledge of Spanish investment opportunities.</span>'),
    ('Altijd exclusief btw', 'Always excluding VAT'), ('Buiten Valencia betaalt de verkopende makelaar ons', 'Outside Valencia the selling agent pays us'),
    ('Afwijkingen altijd vooraf gecommuniceerd', 'Any deviations communicated in advance'),
]
