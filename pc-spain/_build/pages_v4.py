# Page templates (v4) – imported by build.py after its helpers are defined.
# Every visible sentence is copy from pc-spain.com; only layout, media and labels are new.

PANEL_VIDEOS = ['lawyer-contract', 'valencia-oldtown', 'valencia-street']


def panels_html(label, heading, items):
    cards = ''
    for i, (t, p) in enumerate(items):
        v = PANEL_VIDEOS[i % len(PANEL_VIDEOS)]
        cards += f'''<article class="panel{' is-open' if i == 0 else ''}" tabindex="0" aria-label="{t}">
      <video muted loop playsinline preload="none" poster="assets/video/{v}.jpg" data-panel-src="assets/video/{v}.mp4"></video>
      <div class="panel__in">
        <span class="panel__num">{i + 1:02d}</span>
        <h3 class="panel__title">{t}</h3>
        <p class="panel__text">{p}</p>
      </div>
      <span class="panel__plus" aria-hidden="true"></span>
    </article>'''
    head_ = f'<h2 class="h2" data-split>{heading}</h2>' if heading else ''
    return f'''<section class="sec panels-sec">
  <div class="wrap">
    <div class="panels__head"><span class="label label--brass">{label}</span>{head_}</div>
    <div class="panels" data-panels>{cards}</div>
  </div>
</section>'''


def reviews_show(label, btn_label, all_href, sub, all_label):
    picks = [QUOTES[3], QUOTES[0]]
    items = ''
    for i, (n, im, q) in enumerate(picks):
        if im:
            portrait = f'<img src="{sm(im)}" alt="{n}" loading="lazy">'
        else:
            portrait = f'<span class="rshow__mono">{REVIEW_AVATARS.get(n, n[:2])}</span>'
        items += f'''<figure class="rshow__item{' on' if i == 0 else ''}">
        <div class="rshow__portrait">{portrait}</div>
        <div class="rshow__body">
          <blockquote class="rshow__quote">{q}</blockquote>
          <figcaption><b>{n}</b><span class="label">{sub}</span></figcaption>
        </div>
      </figure>'''
    return f'''<section class="rshow on-dark">
  <div class="rshow__bg" aria-hidden="true">“</div>
  <div class="wrap rshow__grid">
    <div class="rshow__side">
      <span class="label" style="color:#C9B288">{btn_label}</span>
      <h2 class="h2" data-split>{label}</h2>
      <div class="rshow__count"><b>{len(QUOTES):02d}</b><span class="label">{btn_label}</span></div>
      <div data-reveal>{btn(all_label, all_href, 'btn--light')}</div>
    </div>
    <div class="rshow__stage" data-rshow>
      <div class="rshow__items">{items}</div>
      <div class="rshow__nav">
        <span class="rshow__idx label"><b>01</b> / 02</span>
        <span class="rshow__bar"><i></i></span>
        <button data-rs-prev aria-label="Vorige">{ARROW_L}</button>
        <button data-rs-next aria-label="Volgende">{ARROW}</button>
      </div>
    </div>
  </div>
</section>'''


# ----------------------------------------------------------------- OVER PC-SPAIN
OFFICES_GLOBE = [
    ('Valencia', 39.47, -0.38), ('Dénia', 38.84, 0.11), ('Barcelona', 41.39, 2.17),
    ('Amsterdam', 52.37, 4.90), ('Zuid-Florida', 26.12, -80.14),
]


def over_pc_spain():
    import json as _j
    minis = ['39-appartementen-denia', 'chalet-pedreguer', 'villa-in-beniarbeig', 'drie-slaapkamer-villa-javea',
             'finca-gata-de-gorgos', 'la-llosa-de-ranes-xativa', 'chalet-gandia', 'bodega-xativa']
    cards = ''.join(listing_card(next(c for c in CARDS if c['url'].rstrip('/').endswith(s)), i) for i, s in enumerate(minis))
    network = ['Makelaars', 'Projectontwikkelaars', 'Notarissen', 'Financiële adviseurs', 'Veilingen', 'Advocaten']
    net_html = ''.join(f'<li data-reveal="{i * .06:.2f}"><span class="label">{i + 1:02d}</span><b>{n}</b></li>' for i, n in enumerate(network))
    langs = [('EN', 'Engels'), ('NL', 'Nederlands'), ('ES', 'Spaans'), ('DE', 'Duits')]
    lang_html = ''.join(f'<li><b>{c}</b><span class="label">{n}</span></li>' for c, n in langs)
    legend = ''.join(f'<li><i></i>{n}</li>' for n, *_ in OFFICES_GLOBE)
    return f'''
<section class="gl-hero">
  <div class="wrap gl-hero__grid">
    <div class="gl-hero__text">
      <nav class="ph__crumbs" aria-label="Breadcrumb"><a class="label" href="index.html">Home</a><span class="label" aria-hidden="true">/</span><span class="label">Over ons</span></nav>
      <h1 class="h1" data-split>Over <span class="script">PC-Spain</span></h1>
      <p class="gl-hero__lead" data-reveal=".3">Woning kopen of huren in Spanje</p>
      <ul class="gl-legend" data-reveal=".45">{legend}</ul>
    </div>
    <div class="gl-hero__globe"><canvas class="globe" data-globe='{_j.dumps(OFFICES_GLOBE, ensure_ascii=False)}' aria-label="Kantoren in Spanje, Nederland en de Verenigde Staten (Zuid-Florida)" role="img"></canvas></div>
  </div>
</section>

<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Wie of wat?</span></div>
    <div class="split__main"><p class="lead lead--xl" data-words>Property Consultancy Spain is een bedrijf van vastgoedexperts die zich richten op klanten die niet per se een makelaar zoeken, maar wel een consultant die hen kan bijstaan in de zoektocht naar een woning en/of belegging in Spanje. Als jij op zoek bent naar een ervaren partij in Spanje die jou kan bijstaan tijdens het gehele (ver)koopproces van vastgoed, zijn wij een goede match!</p></div>
  </div>
</section>

<section class="sec">
  <div class="wrap why">
    <div class="why__text">
      <span class="label label--brass">Waarom PC-Spain?</span>
      <h2 class="h2" data-split>Waarom PC-Spain?</h2>
      <div class="body" data-reveal>
        <p>Met kantoren in diverse plaatsen in Spanje en ook op verschillende locaties in Nederland en de Verenigde Staten (Zuid-Florida), kunnen wij klanten in Nederland en een deel van België en Duitsland goed bedienen en ondersteunen bij de aankoop van hun (tweede) woning of belegging. Dankzij onze ruime ervaring in vastgoed in Nederland en Spanje heeft ons team alle kennis in huis om jou bij te staan bij het aankopen van vastgoed in Spanje.</p>
        <p>Mede door ons ruime en goed geselecteerde netwerk van makelaars, projectontwikkelaars, notarissen, financiële adviseurs, veilingen en advocaten kunnen wij jou volledig ondersteunen gedurende het gehele aankoopproces.</p>
      </div>
    </div>
    <div class="why__net">
      <ol class="net">{net_html}</ol>
    </div>
  </div>
  <div class="wrap langs-wrap">
    <p class="label muted langs__cap">Tot ons netwerk behoren Engels, Nederlands, Spaans en Duits sprekende partners.</p>
    <ul class="langs" data-reveal>{lang_html}</ul>
  </div>
</section>

<section class="band band--expand">
  <div class="band__media"><video muted loop playsinline preload="none" poster="assets/video/valencia-oldtown.jpg" data-src="assets/video/valencia-oldtown.mp4"></video></div>
  <div class="band__inner wrap"><div class="grid-12">
    <div class="band__title"><span class="label" data-reveal>Over PC-Spain</span><h2 class="h1" data-split style="margin-top:22px;font-size:clamp(2.4rem,5.6vw,5.8rem)">Wat kan PC-Spain voor jou doen?</h2></div>
    <div class="band__text" data-reveal=".2"><p>Of je nu een appartement of (tweede) woning zoekt of een belegging wilt doen in Spanje, wij kunnen je ondersteunen met ons team van consultants en ons uitgebreide netwerk. Het kopen van vastgoed in Spanje gaat alles behalve hetzelfde als in Nederland. Buiten de taal zijn de wetten, regels en de cultuur anders.</p></div>
  </div></div>
</section>

<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">PC-Spain</span></div>
    <div class="split__main">
      <div class="body" data-reveal><p>Ons team kan jou ondersteunen, zowel voordat je afreist naar Spanje, als direct op een van onze kantoren aldaar. Gedurende het proces staan wij je bij. De consultants van PC-Spain zijn geen traditionele makelaars die voor de verkoop gaan, maar vastgoedspecialisten die je begeleiden bij de aankoop van vastgoed. Tevens kunnen wij adviseren bij de verkoop van jouw woning, zowel in Nederland als in Spanje.</p></div>
      <p class="statement" data-split>Investeren in jouw Spaanse toekomst doe je met de hulp van <em>Property Consultancy Spain!</em></p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><span class="label">Woningaanbod</span><h2 class="h2" data-split>Woningaanbod</h2></div>
  </div>
  <div class="drag" data-drag><div class="drag__track">{cards}</div></div>
  <div class="wrap drag__foot"><span class="label muted">← Sleep →</span>{lk('Woning kopen', 'woning-kopen.html')}</div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')


# ----------------------------------------------------------------- WERKWIJZE
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
    collage = [LPH('luxe-design-villa-in-benissa'), LPH('luxe-penthouse-valencia'), LPH('luxe-villa-moraira')]
    rail = ''.join(f'''<article class="rail__card">
        <span class="rail__n">{i:02d}</span>
        <h3 class="h3">{h}</h3><p>{p}</p>
      </article>''' for i, (h, p) in enumerate(buy, 1))
    inv_html = ''.join(f'''<article class="icard" data-reveal="{(i - 1) * .12:.2f}">
        <span class="icard__n">{i:02d}</span><h3 class="h3">{h}</h3>{''.join(f'<p>{x}</p>' for x in ps)}
      </article>''' for i, (h, ps) in enumerate(inv, 1))
    chips = ['Bankbeslagen', 'Vastgoedveilingen', 'Transformatieobjecten', 'Splitsen van woningen', 'Studentenwoningen', 'Co-living projecten', 'Historische panden']
    chip_html = ''.join(f'<span>{c}</span>' for c in chips) * 2
    return f'''
<section class="wk-hero">
  <div class="wrap wk-hero__grid">
    <div class="wk-hero__text">
      <nav class="ph__crumbs" aria-label="Breadcrumb"><a class="label" href="index.html">Home</a><span class="label" aria-hidden="true">/</span><a class="label" href="over-pc-spain.html">Over ons</a><span class="label" aria-hidden="true">/</span><span class="label">Werkwijze</span></nav>
      <h1 class="h1" data-split>Makelaardij in <span class="script">Spanje</span></h1>
      <p class="lead" data-reveal=".3">Het relaxte leven en de dagelijkse zonnestralen maken jou een <em>liefhebber van Spanje</em>. Echter is dit zakelijk gezien even schakelen! Er komt namelijk veel kijken bij de koop van een Spaanse woning. De <em>mañana mañana</em> cultuur en de taalbarrière kunnen dan een struikelblok vormen.</p>
    </div>
    <div class="collage" aria-hidden="true">
      <figure class="collage__a" data-img><img src="{collage[0]}" alt=""></figure>
      <figure class="collage__b" data-img><img src="{sm(collage[1])}" alt=""></figure>
      <figure class="collage__c" data-img><img src="{sm(collage[2])}" alt=""></figure>
      <svg class="collage__route" viewBox="0 0 400 400" fill="none"><path d="M20 360 C 120 300, 80 180, 200 170 S 330 60, 380 30" pathLength="1"/></svg>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Makelaardij in Spanje</span></div>
    <div class="split__main"><div class="body" data-reveal><p>Property Consultancy Spain is er om jouw zorgen uit handen te nemen! Onze volledige expertise op verschillende vakgebieden is wat ons <strong>uniek maakt in de makelaardij</strong> in Spanje. Er zijn geen onduidelijke afspraken tussen meerdere externe partijen, omdat wij alle expertise onder één dak hebben die nodig is bij de begeleiding in de koop van een woning in Spanje. Hierdoor is het gehele proces vanaf het begin af aan transparant en zijn er geen onaangename verrassingen. Wij zijn één team met alle expertise!</p></div></div>
  </div>
  <div class="wrap bento">
    <article class="bento__tile bento__tile--video">
      <video muted loop playsinline preload="none" poster="assets/video/valencia-city.jpg" data-src="assets/video/valencia-city.mp4"></video>
      <div class="bento__in"><b data-count="23">23</b><span class="label">Jaar ervaring in Spanje</span></div>
    </article>
    <article class="bento__tile bento__tile--navy">
      <div class="dots" aria-hidden="true">{'<i></i>' * 16}</div>
      <div class="bento__in"><b data-count="16">16</b><span class="label">Experts</span></div>
    </article>
    <article class="bento__tile bento__tile--sand">
      <svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54"/><circle class="ring__p" cx="60" cy="60" r="54" pathLength="100"/></svg>
      <div class="bento__in"><b data-count="120">120</b><span class="label">Tevreden klanten</span></div>
    </article>
  </div>
</section>

<section class="rail-sec bg-white" data-rail>
  <div class="rail__pin">
    <div class="wrap rail__head">
      <div><span class="label label--brass">Werkwijze</span><h2 class="h2" data-split>Werkwijze - Woning kopen in Spanje</h2></div>
      <div class="body rail__intro"><p>Je kan ons inschakelen voor het kopen van een woning in Spanje. Je schakelt een team in met persoonlijke adviseurs. Standaard ontvang jij <strong>aankoopbegeleiding en juridische begeleiding</strong>. Is aanvullend advies nodig? Dan kan je het team uitbreiden. Hieronder krijg je inzicht hoe de koop van een woning werkt.</p></div>
    </div>
    <div class="rail">
      <svg class="rail__line" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden="true"><line x1="0" y1="1" x2="100" y2="1"/><line class="rail__prog" x1="0" y1="1" x2="100" y2="1"/></svg>
      <div class="rail__track">{rail}</div>
    </div>
  </div>
</section>

<section class="band band--expand">
  <div class="band__media"><video muted loop playsinline preload="none" poster="assets/video/villa.jpg" data-src="assets/video/villa.mp4"></video></div>
  <div class="band__inner wrap"><div class="grid-12">
    <div class="band__title" style="grid-column:1 / -1"><h2 class="h1" data-split style="font-size:clamp(2.6rem,6.6vw,7rem);max-width:14ch">Wilt u een belegging aankopen in Spanje?</h2></div>
  </div></div>
</section>

<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Werkwijze</span></div>
    <div class="split__main">
      <h2 class="h2" data-split>Werkwijze - Belegging aankopen in Spanje</h2>
      <div class="body" data-reveal><p>Je kunt ons inschakelen voor het aankopen van een vastgoedbelegging in Spanje. Met jarenlange ervaring in het begeleiden van investeerders, biedt PC-Spain een volledig team van persoonlijke adviseurs. Standaard bieden we aankoop- en juridische begeleiding, en indien nodig kan het team worden uitgebreid met fiscale experts en ontwikkelaars.</p><p>Wij helpen u bij het benutten van investeringskansen, zoals bankbeslagen, vastgoedveilingen, transformatieobjecten, het splitsen van woningen, het creëren van studentenwoningen, co-living projecten, en het renoveren van historische panden. Hieronder leest u hoe het proces van een vastgoedbelegging verloopt.</p></div>
    </div>
  </div>
  <div class="ticker" aria-hidden="true"><div class="ticker__track">{chip_html}</div></div>
  <div class="wrap icards">{inv_html}</div>
</section>
''' + cta('Bent u klaar voor uw tweede woning of belegging in Spanje?', '', 'Ga van start!', 'intake.html')


# ----------------------------------------------------------------- EXPERTISES
def expertises():
    xs = [
        ('aankoop', 'Aankoopbegeleiding', ('video', 'valencia-street'), 'Ons team helpt jou met het zoeken van een droomhuis in Spanje. Door jarenlang zaken te doen in Spanje weten ze de beste match te maken. Een nieuwbouwwoning dicht aan het Spaanse strand? Of juist een knus appartement in een stad? Ze gaan graag met jouw wensen aan de slag! Er is een eigen aanbod van woningen beschikbaar, waar een match wordt gezocht. Zit jouw woning hier niet tussen? Geen probleem, dan kijken ze verder bij collega makelaars. De commissie voor de dienstverlening ons team wordt transparant besproken. Je hoeft je dus geen zorgen te maken dat je onbewust hoge commissies moet betalen.', ['Betrouwbare partner', 'Transparante tarieven', '100% persoonlijke aandacht'], 'intake.html', False, 'standaard'),
        ('juridisch', 'Juridisch advies', ('video', 'lawyer-contract'), 'Voor juridisch advies nemen we onze betrouwbaar advocatenkantoor in de arm! Een partij die zijn weg kent in de <strong>Spaanse wet- en regelgeving</strong>. De diensten van hen wordt niet enkel beperkt tot begeleiding bij de aankoop van een woning. Er zijn veel meer mogelijkheden! Wens jij bijvoorbeeld een bedrijf op te starten of dien je aangifte te doen in Spanje? Wij helpen jou graag verder.', ['Advies op meerdere rechtsgebieden', 'Professionele dienstverlening', 'Ervaring in de Spaanse wet- en regelgeving'], 'https://gimbrerelegal.com/', True, 'standaard'),
        ('hypotheek', 'Hypotheekadvies', ('video', 'contract-keys'), 'Is een hypotheek noodzakelijk of gewenst in jouw dossier? Ook op dit gebied is er expertise in ons team. We schakelen hiervoor Spaanse Hypotheek en haar team in. Een Nederlandstalige partner welke advies kan uitbrengen over een financiering bij een Spaanse bank. Met meerdere banken in hun netwerk, kunnen ze <strong>onafhankelijk hypotheekadvies</strong> uitbrengen. Gebaseerd op het klantprofiel. Iets wat hen uniek maakt!', ['Onafhankelijke hypotheekadvies', 'Schakel tussen klant en Spaanse bank', 'Specialisatie: ondernemerdossiers'], 'http://www.spaansehypotheek.nl', True, 'optioneel'),
        ('renovatie', 'Renovatie/<wbr>Verbouwing', ('ba', None), 'Wil je een Spaanse woning laten verbouwen? Property Consultancy Spain helpt jou met een <strong>verbouwing scan</strong>! Met onze experts maken we het voor de klant inzichtelijk wat de kosten en het tijdsbestek zal zijn voor de geplande renovatie. Maar ook of het plan juridisch gezien haalbaar is. Ondersteuning in de voorbereiding en/of begeleiding in het proces!', ['Realistische tijdsplanning en kostenbegroting', 'Juridische check', 'Advies voor- en tijdens de renovatie'], 'intake.html', False, 'optioneel'),
    ]
    tones = ['stack__card--white', 'stack__card--navy on-dark', 'stack__card--sand', 'stack__card--ink on-dark']
    cards = ''
    for i, (key, name, (kind, src), text, ticks, href, ext, pkg) in enumerate(xs):
        if kind == 'video':
            med = f'<video muted loop playsinline preload="none" poster="assets/video/{src}.jpg" data-src="assets/video/{src}.mp4"></video>'
        else:
            med = f'''<div class="ba ba--fill">
          <img src="{IMG['after']}" alt="Renovatie – na"><img class="ba__before" src="{IMG['before']}" alt="Renovatie – voor">
          <div class="ba__line"><span class="ba__knob"><span>⟷</span></span></div>
          <span class="ba__tag ba__tag--b label">Voor</span><span class="ba__tag ba__tag--a label">Na</span>
          <input type="range" id="ba-x-{key}" min="0" max="100" value="50" aria-label="Voor en na vergelijken">
        </div>'''
        chips = ''.join(f'<li>{t}</li>' for t in ticks)
        cls = 'btn--light' if 'on-dark' in tones[i] else ''
        cards += f'''<article class="stack__card {tones[i]}" id="{key}" style="--i:{i}">
      <div class="stack__media">{med}</div>
      <div class="stack__body">
        <div class="stack__top"><span class="stack__n">{i + 1:02d}</span><span class="stack__pkg label">Expertise: <b>{pkg}</b> in jouw pakket</span></div>
        <span class="label label--brass">Expertises in Spanje</span>
        <h2 class="h2">{name}</h2>
        <p class="stack__text">{text}</p>
        <ul class="stack__chips">{chips}</ul>
        {btn('Meer weten', href, cls, ext)}
      </div>
    </article>'''
    idx = ''.join(f'<li><a href="#{k}"><span class="label">{s}</span><b>{n}</b><span class="idx__go" aria-hidden="true">{ARROW}</span></a></li>' for k, n, s in [
        ('aankoop', 'Aankoopbegeleiding', '01'), ('juridisch', 'Juridisch advies', '02'), ('hypotheek', 'Hypotheekadvies', '03'),
        ('renovatie', 'Verbouwingscan', '04'), ('contact', 'Woningbeheer', '05')])
    return f'''
<section class="xp-hero">
  <div class="wrap xp-hero__grid">
    <div>
      <nav class="ph__crumbs" aria-label="Breadcrumb"><a class="label" href="index.html">Home</a><span class="label" aria-hidden="true">/</span><a class="label" href="over-pc-spain.html">Over ons</a><span class="label" aria-hidden="true">/</span><span class="label">Expertises</span></nav>
      <h1 class="h1" data-split>Expertises in <span class="script">Spanje</span></h1>
    </div>
    <div class="xp-hero__intro">
      <span class="label label--brass">Hoe gaan wij te werk?</span>
      <div class="body" data-reveal><p>Om de kwaliteit van onze dienstverlening te garanderen, werken wij uitsluitend met onze partners samen. Onze partners hebben ervaring in het Spaanse werkgebied. Het zijn partijen waar wij, maar ook de klant, <strong>op kan bouwen</strong>. Je schakelt Property Consultancy Spain in en ontvangt altijd begeleiding + juridisch advies. Optioneel voeg jij deskundige waar jij behoefte aan hebt toe! Hierbij is het niet mogelijk om zelf partijen in te schakelen, waarvan wij de kwaliteit niet kunnen garanderen. Dit brengt onduidelijkheid met zich mee door communiceren over meerdere kanalen. Om een <strong>exclusieve service</strong> te kunnen bieden ontvang je bij Property Consultancy Spain daarom het volledige pakket. Lees hieronder de verschillende expertises waar jij gebruik van kan maken.</p></div>
    </div>
  </div>
  <div class="wrap"><ul class="idx">{idx}</ul></div>
</section>
<section class="stack wrap">{cards}</section>
''' + cta('Aan de slag in Spanje!', 'Alles wat met de koop of huur van de woning te maken heeft is bij Property Consultancy Spain te vinden. Er is geen ruis in de communicatie, aangezien alle partijen in één team samenwerken. Je hebt dus één aanspreekpunt, wat door onze klanten als zeer prettig wordt ervaren. Benieuwd hoe onze commissie is opgebouwd?', 'Naar tarieven!', 'tarieven.html')


# ----------------------------------------------------------------- PORTFOLIO
def reviews_all(label, sub):
    cards = ''
    for i, (n, im, q) in enumerate(QUOTES):
        av = f'<img src="{sm(im)}" alt="{n}" loading="lazy">' if im else REVIEW_AVATARS.get(n, n[:2])
        cards += f'''<figure class="rall__card rall__card--{i}" data-reveal="{(i % 2) * .12:.2f}">
      <span class="rfeat__mark" aria-hidden="true">“</span>
      <blockquote>{q}</blockquote>
      <figcaption><span class="rcard__av">{av}</span><span><b>{n}</b><small class="label">{sub}</small></span></figcaption>
    </figure>'''
    return f'''<section class="sec rall" id="reviews">
  <div class="wrap">
    <div class="sec-head"><span class="label">Succesverhalen</span><h2 class="h2" data-split>{label}</h2></div>
    <div class="rall__grid">{cards}</div>
  </div>
</section>'''


def portfolio():
    return f'''
<section class="pf-hero">
  <div class="wrap">
    <nav class="ph__crumbs" aria-label="Breadcrumb"><a class="label" href="index.html">Home</a><span class="label" aria-hidden="true">/</span><a class="label" href="over-pc-spain.html">Over ons</a><span class="label" aria-hidden="true">/</span><span class="label">Portfolio</span></nav>
    <div class="pf-hero__grid">
      <h1 class="h1" data-split>Portfolio</h1>
      <p class="lead" data-reveal=".25">Bij Property Consultancy Spain begeleiden we klanten in het transformeren van oude panden, zoals kantoren en loodsen, naar moderne woon- of werkruimtes. Of het nu gaat om co-living projecten of kantoorruimtes, wij zorgen ervoor dat elk gebouw wordt omgevormd tot een innovatieve en functionele ruimte.</p>
    </div>
    <p class="pf-hero__note body" data-reveal=".35">Hier onder vind je een selectie van ons portfolio, waarin we enkele van onze meest succesvolle transformatieprojecten laten zien. Deze voorbeelden geven een goed beeld van ons vakmanschap en toewijding aan kwaliteit en design.</p>
  </div>
</section>

<section class="case">
  <div class="wrap case__grid">
    <div class="case__media">
      <div class="ba ba--portrait" data-reveal>
        <img src="{IMG['after']}" alt="Transitie Valencia – na">
        <img class="ba__before" src="{IMG['before']}" alt="Transitie Valencia – voor">
        <div class="ba__line"><span class="ba__knob"><span>⟷</span></span></div>
        <span class="ba__tag ba__tag--b label">Voor</span><span class="ba__tag ba__tag--a label">Na</span>
        <input type="range" id="ba-case" min="0" max="100" value="50" aria-label="Voor en na vergelijken">
      </div>
      <p class="label muted case__hint">Sleep om te vergelijken</p>
    </div>
    <div class="case__body">
      <div class="case__no"><span class="label label--brass">Project</span><b>01</b></div>
      <h2 class="h1 case__title" data-split>Transitie <span class="script">Valencia</span></h2>
      <dl class="case__facts" data-reveal>
        <div><dt class="label">Locatie</dt><dd>Valencia</dd></div>
        <div><dt class="label">Voor</dt><dd>Oud kantoorpand</dd></div>
        <div><dt class="label">Na</dt><dd>Moderne woonruimte</dd></div>
      </dl>
      <div class="body" data-reveal><p>Dit prachtige appartement in Valencia is ontstaan uit de transformatie van een oud kantoorpand naar een moderne woonruimte. Met aandacht voor detail en hoogwaardige afwerking is het kantoor volledig omgebouwd tot een stijlvol appartement. De ligging in het hart van Valencia, gecombineerd met de vernieuwde en comfortabele inrichting, maakt dit de perfecte plek om te wonen of te investeren. Het appartement biedt een unieke mix van geschiedenis en moderne voorzieningen, waardoor het een bijzondere en aantrekkelijke optie is voor de liefhebber van eigentijds wonen.</p></div>
    </div>
  </div>
</section>

{reviews_all('Wat klanten over ons zeggen', 'Klant van PC-Spain')}

<section class="band">
  <div class="band__media"><video muted loop playsinline preload="none" poster="assets/video/valencia-oldtown.jpg" data-src="assets/video/valencia-oldtown.mp4" data-parallax="10"></video></div>
  <div class="band__inner wrap"><div class="grid-12">
    <div class="band__title"><span class="label" data-reveal>Transformatie</span><h2 class="h1" data-split style="margin-top:22px;font-size:clamp(2.4rem,5.6vw,5.8rem)">Start jouw vastgoedtransformatie!</h2></div>
    <div class="band__text" data-reveal=".2"><p>Ben je klaar om een oude ruimte om te toveren tot een moderne woon- of werkplek? Wij begeleiden je van begin tot eind, met innovatieve oplossingen en een team van experts. Neem vandaag nog de eerste stap naar jouw succesvolle transformatie!</p><p>Laat ons je ondersteunen bij het optimaliseren van je investeringen met professioneel advies en begeleiding. Property Consultancy Group helpt je graag verder met expertise op het gebied van investeringen, juridische ondersteuning en hypotheekadvies.</p>{btn('Meer informatie!', 'intake.html', 'btn--light')}</div>
  </div></div>
</section>'''


# ----------------------------------------------------------------- PARTNERS
PARTNER_META = {  # file, category (describes each partner's own description), link
    'BeleggenInValencia.nl': ('beleggen-in-valencia', 'Beleggen', 'https://beleggeninvalencia.nl'),
    'Ambau': ('ambau', 'Architectuur', None),
    'Santander': ('santander', 'Bank', None),
    'Cajamar': ('cajamar', 'Bank', None),
    'Fides – ETL Global': ('fides', 'Fiscaal & audit', None),
    'Gimbrere Legal': ('gimbrere-legal', 'Juridisch', None),
    'To Do': ('to-do', 'Architectuur', None),
    'Handy Valencia': ('handy-valencia', 'Aannemer', None),
    'Orange Estates': ('orange-estates', 'Vastgoednetwerk', None),
    'Ennumera Consultores': ('ennumera', 'Gestor', None),
    'Orange Brokers': ('orange-brokers', 'Makelaar', 'https://orange-brokers.nl'),
}


def partners():
    logos = ''.join(f'<li><img src="assets/partners/{PARTNER_META[n][0]}.png" alt="{n}" loading="lazy"></li>' for n, *_ in PARTNERS)
    cats = []
    for n, *_ in PARTNERS:
        c = PARTNER_META[n][1]
        if c not in cats:
            cats.append(c)
    slug = lambda c: re.sub(r'[^a-z]+', '-', c.lower()).strip('-')
    filt = f'<button class="on" data-cat="all">Alle<sup>{len(PARTNERS)}</sup></button>' + ''.join(
        f'<button data-cat="{slug(c)}">{c}<sup>{sum(1 for n, *_ in PARTNERS if PARTNER_META[n][1] == c)}</sup></button>' for c in cats)
    rows = ''
    for i, (n, _logo, _url, ps) in enumerate(PARTNERS):
        f, cat, url = PARTNER_META[n]
        link = lk(url.split('//')[1], url, True) if url else ''
        first, rest = ps[0], ps[1:]
        more = ''.join(f'<p>{p}</p>' for p in rest)
        rows += f'''<article class="pt" data-cat="{slug(cat)}">
      <button class="pt__head" aria-expanded="false">
        <span class="pt__n label">{i + 1:02d}</span>
        <span class="pt__logo"><img src="assets/partners/{f}.png" alt="{n}" loading="lazy"></span>
        <span class="pt__name">{n}</span>
        <span class="pt__cat label">{cat}</span>
        <span class="pt__plus" aria-hidden="true"></span>
      </button>
      <div class="pt__panel"><div><div class="pt__text"><p>{first}</p>{more}{link}</div></div></div>
    </article>'''
    return f'''
<section class="pn-hero">
  <div class="wrap">
    <nav class="ph__crumbs" aria-label="Breadcrumb"><a class="label" href="index.html">Home</a><span class="label" aria-hidden="true">/</span><a class="label" href="over-pc-spain.html">Over ons</a><span class="label" aria-hidden="true">/</span><span class="label">Partners</span></nav>
    <div class="pn-hero__grid">
      <h1 class="h1" data-split>Partners</h1>
      <p class="pn-hero__count"><b data-count="{len(PARTNERS)}">{len(PARTNERS)}</b><span class="label muted">Partners</span></p>
    </div>
  </div>
  <div class="logowall" aria-label="Partners">
    <ul class="logowall__row">{logos}{logos.replace('<li>', '<li aria-hidden="true">')}</ul>
    <ul class="logowall__row logowall__row--rev">{logos}{logos.replace('<li>', '<li aria-hidden="true">')}</ul>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="filters pt-filters" role="group" aria-label="Filter">{filt}</div>
    <div class="pts" data-pts>{rows}</div>
  </div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')
