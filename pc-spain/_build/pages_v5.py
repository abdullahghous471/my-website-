# Page templates (v5) – the remaining pages in the v4 design language, plus the English set.
# Every visible sentence is copy from pc-spain.com (NL or EN); only layout, media and short UI labels are new.


def crumbs(items):
    out = ''.join(f'<a class="label" href="{h}">{l}</a><span class="label" aria-hidden="true">/</span>' for l, h in items[:-1])
    return f'<nav class="ph__crumbs" aria-label="Breadcrumb">{out}<span class="label">{items[-1][0]}</span></nav>'


def ba_html(key, before='Voor', after='Na', aria='Voor en na vergelijken', cls='ba--fill'):
    return f'''<div class="ba {cls}">
          <img src="{IMG['after']}" alt="{after}"><img class="ba__before" src="{IMG['before']}" alt="{before}">
          <div class="ba__line"><span class="ba__knob"><span>⟷</span></span></div>
          <span class="ba__tag ba__tag--b label">{before}</span><span class="ba__tag ba__tag--a label">{after}</span>
          <input type="range" id="ba-{key}" min="0" max="100" value="50" aria-label="{aria}">
        </div>'''


# ----------------------------------------------------------------- TARIEVEN
TIERS = [(100000, '€ 5.750,-', 'voor aankopen tot € 100.000,-'), (150000, '€ 6.750,-', 'voor aankopen tot € 150.000,-'),
         (200000, '€ 7.750,-', 'voor aankopen tot € 200.000,-'), (None, '4%', 'van de aankoopsom voor aankopen boven € 200.000,-')]


def tarieven():
    tiers = ''.join(f'<li data-max="{m or 0}"><span>{t}</span><b>{f}</b></li>' for m, f, t in TIERS)
    return f'''
<section class="tf-hero">
  <div class="wrap tf-hero__grid">
    <div class="tf-hero__text">
      {crumbs([('Home', 'index.html'), ('Tarieven', '')])}
      <h1 class="h1" data-split>Transparante <span class="script">tarieven</span></h1>
      <p class="tf-hero__lead" data-reveal=".3">Bij Property Consultancy Spain hanteren we transparante tarieven, afgestemd op uw specifieke situatie. Onze kosten variëren afhankelijk van het type aankoop: of u nu begeleiding zoekt bij de aankoop van een tweede woning voor eigen gebruik, of investeert in vastgoed voor verhuur en rendement.</p>
    </div>
    <aside class="ratecard on-dark" data-reveal=".2">
      <div class="ratecard__row"><span class="label">01 · Aanschaf tweede woning</span><b><span data-count="3">3</span>%</b><small class="label">Minimum €5.750 exclusief btw</small></div>
      <div class="ratecard__row"><span class="label">02 · Vastgoedbelegging</span><b>€ 1.750,-</b><small class="label">Opstartnota, exclusief btw</small></div>
      <span class="ratecard__seal" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="seal" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text><textPath href="#seal">TRANSPARANTE TARIEVEN · PC-SPAIN · </textPath></text></svg></span>
    </aside>
  </div>
</section>

<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Transparante tarieven</span></div>
    <div class="split__main"><p class="lead lead--xl" data-words>Wij zorgen ervoor dat u precies weet waar u aan toe bent, zodat u met vertrouwen kunt investeren in de Spaanse vastgoedmarkt. Neem contact met ons op voor meer informatie over onze op maat gemaakte tarieven!</p></div>
  </div>
</section>

<section class="sec plans-sec">
  <div class="wrap plans">
    <article class="plan" data-reveal>
      <div class="plan__top"><span class="plan__n">01</span><span class="label label--brass">Tarieven</span></div>
      <h2 class="h3">Tarieven - Aanschaf tweede woning in Spanje</h2>
      <div class="plan__fig">3%<small class="label">Minimum €5.750 exclusief btw</small></div>
      <div class="plan__body"><p>In Spanje werken commissies anders dan in Nederland. Bijna 90% van de verkopen bevat een commissie van 5% in de verkoopprijs. In de regio Valencia betaalt de verkoper 3% aan de makelaar en de koper 3% aan zijn eigen makelaar. Bij PC-Spain hanteren wij dezelfde werkwijze, met een minimum van €5.750 exclusief btw. Voor aankopen buiten Valencia worden wij betaald door de verkopende makelaar. Eventuele afwijkingen communiceren wij altijd transparant vooraf.</p></div>
    </article>
    <article class="plan plan--navy on-dark" data-reveal=".15">
      <div class="plan__top"><span class="plan__n">02</span><span class="label">Tarieven</span></div>
      <h2 class="h3">Tarieven - Begeleiding bij aankoop vastgoedbelegging</h2>
      <div class="plan__fig">€ 1.750,-<small class="label">Opstartnota, exclusief btw</small></div>
      <div class="plan__body"><p>Bij de aankoop van een vastgoedbelegging bieden wij uitgebreide begeleiding om ervoor te zorgen dat u het maximale uit uw investering haalt. Onze opstartkosten omvatten essentiële consulten, rondleidingen en projectbezoeken die u volledig inzicht geven in de markt en potentiële kansen. Wij hanteren transparante tarieven zodat u precies weet waar u aan toe bent gedurende het gehele proces.</p>
        <p><strong>Opstartnota: € 1.750,- exclusief btw</strong></p><p>De opstartnota bevat:</p>
        <ul><li>Consult met een internationale belastingadviseur.</li><li>Juridisch advies door een vastgoedadvocaat.</li><li>Twee dagen rondleiding door Valencia en omgeving.</li><li>Bezichtigen van lopende projecten en potentiële investeringen.</li><li>Twee dagen begeleiding door een consultant met kennis van Spaanse investeringsmogelijkheden.</li></ul></div>
    </article>
  </div>
</section>

<section class="sec bg-white">
  <div class="wrap calc" data-calc>
    <div class="calc__head">
      <span class="label label--brass">Tarieven bij aankoop:</span>
      <h2 class="h2" data-split>Tarieven bij aankoop</h2>
      <p class="muted">Alle commissies zijn exclusief btw (VAT).</p>
    </div>
    <div class="calc__box">
      <label class="label" for="calc-range">Aankoopsom</label>
      <output class="calc__amount" for="calc-range">€ 150.000</output>
      <input type="range" id="calc-range" min="50000" max="1000000" step="5000" value="150000">
      <div class="calc__scale label muted"><span>€ 50.000</span><span>€ 1.000.000</span></div>
      <div class="calc__out"><span class="label">Commissie</span><b class="calc__fee">€ 6.750,-</b></div>
      <ol class="calc__tiers">{tiers}</ol>
    </div>
  </div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')


# ----------------------------------------------------------------- LISTINGS (NL + EN)
def reel_html():
    picks = [c for c in CARDS if C['listings'][c['url'].rstrip('/').split('/')[-1]]['gallery']][:14]
    items = ''
    for c in picks:
        s = c['url'].rstrip('/').split('/')[-1]
        items += f'<a href="{LISTING_FILES[s]}" tabindex="-1"><img src="{sm(LPH(s))}" alt="" loading="lazy" decoding="async"><span class="label">{esc(c["city"])}</span></a>'
    return f'<div class="reel" aria-hidden="true"><div class="reel__track">{items}{items}</div></div>'


def listings_hero(lang='nl'):
    nl = lang == 'nl'
    cities = ' · '.join(CITIES)
    return f'''
<section class="wl-hero">
  <div class="wrap wl-hero__grid">
    <div>
      {crumbs([('Home', 'index.html' if nl else 'en.html'), ('Woning kopen' if nl else 'Buying property Spain', '')])}
      <h1 class="h1" data-split>{'Woning kopen' if nl else 'Buying property'} <span class="script">{'Spanje' if nl else 'Spain'}</span></h1>
    </div>
    <div class="wl-hero__side" data-reveal=".25">
      <p class="wl-hero__count"><b data-count="{len(CARDS)}">{len(CARDS)}</b><span class="label muted">{'Woningaanbod' if nl else 'Properties'}</span></p>
      <p class="wl-hero__cities">{cities}</p>
    </div>
  </div>
  {reel_html()}
</section>'''


def woning_kopen():
    return listings_hero('nl') + f'''
<section class="sec" id="aanbod">
  <div class="wrap">{listings_section('Allemaal', 'Laadt meer')}</div>
</section>
''' + cta('Benieuwd naar de mogelijkheden?', 'Doe de intake en start direct met uw belegging in Spanje.', 'Start intake', 'intake.html')


# stock photos (laptop, calculator, money bag, office meeting, Basque coast) -> Valencia / process footage stills
_ART_SWAP = {'2020-11-pc15': 'assets/video/lawyer-contract.jpg', '2020-11-pc2': 'assets/video/valencia-oldtown.jpg',
             '2020-11-pc1': 'assets/video/valencia-street.jpg', '2020-11-pc4': 'assets/video/contract-keys.jpg',
             '2020-11-pc5': 'assets/video/villa-garden.jpg'}
_article_hero_orig = article_hero


def article_hero(slug):
    src = _article_hero_orig(slug)
    stem = src.rsplit('/', 1)[-1].rsplit('.', 1)[0]
    return _ART_SWAP.get(stem, src)


# ----------------------------------------------------------------- INFORMATIE & TIPS
def tindex_html(slugs, start=1):
    rows, imgs = '', ''
    for i, s in enumerate(slugs):
        t = TIPS_TITLE.get(s, C['articles'][s]['title'])
        im = sm(article_hero(s))
        rows += f'''<li><a href="{ART_FILES[s]}" data-i="{i}">
          <span class="tindex__n label">{i + start:02d}</span>
          <img class="tindex__thumb" src="{im}" alt="" loading="lazy" decoding="async">
          <span class="tindex__t">{t}</span>
          <span class="tindex__go" aria-hidden="true">{ARROW}</span></a></li>'''
        on = ' class="on"' if i == 0 else ''
        imgs += f'<img src="{im}" alt="" loading="lazy" decoding="async"{on}>'
    return f'''<div class="tindex" data-tindex>
      <div class="tindex__view" aria-hidden="true"><div class="tindex__frame">{imgs}</div></div>
      <ol class="tindex__list">{rows}</ol>
    </div>'''


def tips():
    return f'''
<section class="tp-hero">
  <div class="wrap">
    {crumbs([('Home', 'index.html'), ('Woning kopen', 'woning-kopen.html'), ('Informatie &amp; Tips', '')])}
    <div class="tp-hero__grid">
      <h1 class="h1" data-split>Informatie &amp; <span class="script">Tips</span></h1>
      <p class="tp-hero__q" data-reveal=".25">Hoe koop je een woning of doe je een investering in Spanje? Wij geven tips!</p>
    </div>
  </div>
</section>
<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Informatie &amp; Tips</span></div>
    <div class="split__main"><div class="body" data-reveal><p>Wanneer je de beslissing hebt genomen om een woning in Spanje te kopen, sta je aan het begin van een spannend avontuur. Voor veel Nederlandstalige kopers is het lang niet altijd duidelijk hoe dit proces precies verloopt. Hieronder plaatsen wij regelmatig artikelen om je uitleg te geven over het aanschaffen van een woning in Spanje. Als <a href="index.html" style="border-bottom:1px solid var(--brass)">Nederlandse woningmakelaar in Spanje</a> willen wij jou hierbij graag helpen. Onze groep van consultants en aangesloten partners helpt je met het zoeken van een mooie woning in Spanje. Wijzelf en ons netwerk beschikken over jarenlange ervaring, waardoor we de beste match weten te maken. Een nieuwbouwwoning dicht aan het Spaanse strand? Of juist een knus appartement in een stad? Wij gaan graag met jouw wensen aan de slag!</p></div></div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><span class="label">Artikelen</span><h2 class="h2" data-split>Alle tips om een huis te kopen in Spanje</h2></div>
    {tindex_html(TIPS_ORDER)}
  </div>
</section>
''' + cta('Hulp nodig bij je woning aankoop in Spanje?', '', 'Contact opnemen', 'intake.html')


# ----------------------------------------------------------------- INTAKE
def intake():
    steps = [('Intakeformulier', 'Om u zo goed mogelijk van dienst te zijn, vragen wij u vriendelijk om dit korte intakeformulier in te vullen.'),
             ('Uw wensen', 'Dit helpt ons om een duidelijk beeld te krijgen van uw wensen en behoeften, zodat we u op maat kunnen ondersteunen met uw vastgoedplannen.'),
             ('Vervolgafspraak', 'Zodra we uw informatie hebben ontvangen, nemen we spoedig contact met u op om een vervolgafspraak te maken. Op deze manier kunnen we u de best mogelijke service bieden, afgestemd op uw persoonlijke situatie.')]
    st = ''.join(f'<li data-reveal="{.1 * i:.1f}"><span class="in-steps__n">{i + 1:02d}</span><div><h2 class="h3">{h}</h2><p>{p}</p></div></li>' for i, (h, p) in enumerate(steps))
    return f'''
<section class="in-hero">
  <div class="wrap in-grid">
    <div class="in-side">
      {crumbs([('Home', 'index.html'), ('Intake', '')])}
      <h1 class="h1" data-split>Doe de <span class="script">intake</span></h1>
      <p class="in-lead" data-reveal=".25">Doe de intake en start direct met uw belegging in Spanje.</p>
      <ol class="in-steps">{st}</ol>
      <dl class="in-contact" data-reveal>
        <div><dt class="label">Kantoren:</dt><dd>Valencia · Dénia · Amsterdam · Barcelona</dd></div>
        <div><dt class="label">Openingstijden:</dt><dd>Maandag- Zaterdag: 10:00 - 18:00</dd></div>
        <div><dt class="label">Vind ons op:</dt><dd>{IG}</dd></div>
      </dl>
    </div>
    <div class="in-form" data-reveal=".15">
      <div class="in-form__bar"><span class="label">Intake</span><span class="label muted">Property Consultancy Spain</span></div>
      <div class="in-form__body"><div data-tf-live="01J8J7W38XSF5PMAV91S5H8HA1"></div></div>
    </div>
  </div>
</section>'''


# ----------------------------------------------------------------- ARTICLE
def read_min(html_):
    return max(2, round(len(re.sub('<[^>]+>', ' ', html_).split()) / 220))


def article_page(slug):
    a = C['articles'][slug]
    hero = article_hero(slug)
    h = a['html']
    h = re.sub(r'^<img[^>]*>', '', h)  # first image becomes the lead image
    h = re.sub(r'<p><a href="[^"]*">Contact opnemen</a></p>$', '', h)
    n = TIPS_ORDER.index(slug) if slug in TIPS_ORDER else 0
    others = [TIPS_ORDER[(n + k) % len(TIPS_ORDER)] for k in (1, 2, 3)]
    body = f'''<div class="readbar" aria-hidden="true"><i></i></div>
<section class="ar-hero">
  <div class="wrap">
    {crumbs([('Home', 'index.html'), ('Informatie &amp; Tips', 'informatie-tips.html'), (esc(a['title']), '')])}
    <div class="ar-hero__grid">
      <div class="ar-hero__meta"><span class="label label--brass">Informatie &amp; Tips</span><span class="label muted">{n + 1:02d} / {len(TIPS_ORDER):02d}</span><span class="label muted">{read_min(h)} min leestijd</span></div>
      <h1 class="h1 ar-hero__title" data-split>{esc(a['title'])}</h1>
    </div>
  </div>
  <div class="wrap"><figure class="ar-hero__img" data-img><img src="{hero}" alt="" data-parallax="8"></figure></div>
</section>
<section class="sec bg-white ar-sec">
  <div class="wrap ar-grid">
    <article class="rich ar-body" data-reveal>{localize_html(h)}</article>
    <aside class="ar-aside"><div class="ar-aside__box on-dark">
      <span class="label">Property Consultancy Spain</span>
      <h2 class="h3">Hulp nodig bij je woning aankoop in Spanje?</h2>
      {btn('Contact opnemen', 'intake.html', 'btn--light')}
    </div></aside>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><span class="label">Informatie &amp; Tips</span><h2 class="h2" data-split>Alle tips om een huis te kopen in Spanje</h2></div>
    {tindex_html(others, 1)}
    <div style="margin-top:48px">{lk('Informatie &amp; Tips', 'informatie-tips.html')}</div>
  </div>
</section>'''
    write(ART_FILES[slug], f'{esc(a["title"])} - Property Consultancy Spain', a['title'], body, active='informatie-tips.html')


# ================================================================= ENGLISH
def en_working_method():
    buy = [
        ('First acquaintance', 'We listen to the desires and needs of our customer. What are the preferences? A villa on the island of Ibiza or an appartment in lively Valencia? Every type of property has its own characteristics. The customer will be provided with <strong>tailored advice.</strong> Furthermore, the clients financial possibilities are being reviewed in this fase.'),
        ('House hunting', 'Together we will go house hunting for your Spanish dream house! You can expect an <strong>active attitude</strong> from our advisors. Is your dream house not among our offer? No problem, we will extend our search to fellow brokers. All this so we will find a property to match your desires!'),
        ('Planning a visit', 'A property that fulfils your desires is found! We value personal attention during the proces. That is why you receive support and advice when booking a viewing trip.'),
        ('Dream house found!', 'In Spain, it is of great importance to buy or rent a property <strong>free of defects.</strong> That is why, in this phase, the property is checked by our legal department. Are registrations, living permits and licences correct? Is the seller’s/letter’s background correct?'),
        ('Price agreement', 'A carefree property starts with making clear arrangments. We take care of negotiating for the purchase price or monthly rental amount. In this, we are <strong>on the customers side</strong>. This is because our commission <a href="en-prices.html">has been communicated at the start.</a> No hidden deals, but transparent agreements.'),
        ('Deal!', 'After agreeing on a price, certain matters are wrapped up. In case of buying a property, this could by arranging the financing with a Spanish bank. Or in case of renting a property, drawing up a correct rental contract. After this, we can <strong>celebrate</strong> the end of the process!'),
    ]
    tailored = ['Only <strong>one contact person</strong> for the complete buying or rental process.', 'You make use of our network to find a <strong>suitable</strong> property.',
                'You will receive <strong>legal advice</strong> and contract are drawn up and checked for you.', 'You can <strong>communicate in English</strong> about the Spanish process.',
                'You will see that the team is working fully <strong>on the customers side</strong>.']
    collage = [LPH('luxe-design-villa-in-benissa'), LPH('luxe-penthouse-valencia'), LPH('luxe-villa-moraira')]
    rail = ''.join(f'<article class="rail__card"><span class="rail__n">{i:02d}</span><h3 class="h3">{h}</h3><p>{p}</p></article>' for i, (h, p) in enumerate(buy, 1))
    tl = ''.join(f'<li data-reveal="{i * .08:.2f}"><span class="label">{i + 1:02d}</span><p>{t}</p></li>' for i, t in enumerate(tailored))
    fran = media('https://pc-spain.com/wp-content/uploads/2020/03/francisco.jpg')
    return f'''
<section class="wk-hero">
  <div class="wrap wk-hero__grid">
    <div class="wk-hero__text">
      {crumbs([('Home', 'en.html'), ('Working method', '')])}
      <h1 class="h1" data-split>Real Estate Agency in <span class="script">Spain</span></h1>
      <p class="lead" data-reveal=".3">The relaxed way of life and daily sunshine make you a true <em>lover of Spain.</em> However, this can be quite a switch from a business point of view! There is a lot you have to know when buying or renting a property in Spain. The <em>mañana culture</em> and language barrier could form an obstacle.</p>
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
    <div class="split__label"><span class="label label--brass">Real Estate Agency in Spain</span></div>
    <div class="split__main"><div class="body" data-reveal><p>Property Consultancy Spain is here to take away your worries. Our extensive expertise on different professional areas makes us <strong>unique in Spanish brokerage.</strong> No more vague deals between multiple parties. Because we have all expertise required to guide you in buying or property in Spain! This allows us to be transparent from the start so you won’t be confronted with unpleasant surprises. We are one team with all the know-how!</p></div></div>
  </div>
  <div class="wrap bento">
    <article class="bento__tile bento__tile--video">
      <video muted loop playsinline preload="none" poster="assets/video/villa-garden.jpg" data-src="assets/video/villa-garden.mp4"></video>
      <div class="bento__in"><b data-count="23">23</b><span class="label">Years of experience in Spain</span></div>
    </article>
    <article class="bento__tile bento__tile--navy">
      <div class="dots" aria-hidden="true">{'<i></i>' * 16}</div>
      <div class="bento__in"><b data-count="16">16</b><span class="label">Experts</span></div>
    </article>
    <article class="bento__tile bento__tile--sand">
      <svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54"/><circle class="ring__p" cx="60" cy="60" r="54" pathLength="100"/></svg>
      <div class="bento__in"><b data-count="120">120</b><span class="label">Satisfied customers</span></div>
    </article>
  </div>
</section>

<section class="rail-sec bg-white" data-rail>
  <div class="rail__pin">
    <div class="wrap rail__head">
      <div><span class="label label--brass">Working method</span><h2 class="h2" data-split>Buying or renting a property in Spain</h2></div>
      <div class="body rail__intro"><p>You can consult us for buying or renting a property in Spain. You are consulting a team with personal advisors. You will always receive <strong>purchasing guidance and legal support.</strong> Do you require additional advice? Then you can expand your team. Below we will give you a better insight in how buying or renting a property in Spain works.</p></div>
    </div>
    <div class="rail">
      <svg class="rail__line" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden="true"><line x1="0" y1="1" x2="100" y2="1"/><line class="rail__prog" x1="0" y1="1" x2="100" y2="1"/></svg>
      <div class="rail__track">{rail}</div>
    </div>
  </div>
</section>

<section class="sec bg-navy on-dark">
  <div class="wrap tailor">
    <div class="tailor__head"><span class="label muted">Working method</span><h2 class="h2" data-split>Tailored advice in Spain!</h2><div data-reveal style="margin-top:36px">{btn('Contact!', 'en.html#contact', 'btn--light')}</div></div>
    <ol class="tailor__list">{tl}</ol>
  </div>
</section>

<section class="sec">
  <div class="wrap expert">
    <figure class="expert__img frame frame--arch" data-img><img src="{sm(fran)}" alt="Francsico Estevan" loading="lazy"></figure>
    <div class="expert__body">
      <span class="label label--brass">Expert says...</span>
      <blockquote class="expert__q" data-split>“It is truly great to work in this professional team. We are able to provide clients with tailored advice on multiple areas, such as mortgage adive but also legal support. Because of the confidence that has grown, we can count on each other. This is very pleasant for mutual cooperation, but also for the client!”</blockquote>
      <p class="expert__by" data-reveal>– <strong>Francsico Estevan</strong> EFS Abogados.</p>
      <div data-reveal style="margin-top:30px">{lk('Meet our experts!', 'en-expertises.html')}</div>
    </div>
  </div>
</section>
''' + cta('Are you already an owner of a Spanish property?', '', 'More information!', 'en.html#contact', lang='en')


def en_expertises():
    xs = [
        ('purchasing', 'Purchasing support', ('video', 'valencia-street'), 'Our team helps you look for your Spanish dream house. Because of our years of experience in doing business in Spain, we will make the best match. A newly-built house close to the Spanish beach? Or rather a cozy apartment in a city? They can’t wait to get to work with your needs and wishes! We have our own offer in houses from which we will look for a suitable match. Is your dream house not amongst it? No problem, we will look further at fellow brokers. The commission of our service will be discussed in transparent way. So you don’t have to worry about hidden fees or commissions.', ['Reliable partner', 'Transparent prices', '100% personal attention'], 'en.html#contact', False, 'standard'),
        ('legal', 'Legal advice', ('video', 'lawyer-contract'), 'For legal advice, our partner is EFS Abogados! A party who know everything about <strong>Spanish laws and regulations.</strong> Their service is not limited to guidance when pruchasing a property. There are many more possibilities! For example, do you wish to start up a business or do you need to file a declaration? EFS Abogados love to help you!', ['Advice in multiple legal areas', 'Professional service', 'Experience in Spanish laws and regulations'], 'https://www.efsadvocaten.nl/', True, 'standard'),
        ('mortgage', 'Mortgage advice', ('video', 'contract-keys'), 'Is a mortgage necessary or desired in your file? We can help you with that as well. We consult Mortgage in Spain SL and its team. A Dutch partner who can advice you about arranging financing at a Spanish bank. They have multiple Spanish banks in their network and can provide you with <strong>independent mortgage advice</strong>. Based on the customer profile. Something that makes them unique!', ['Independent mortgage advice.', 'Bridge between client and Spanish bank', 'Specialization: entrepreneurs files.'], 'http://www.spaansehypotheek.nl', True, 'optional'),
        ('renovation', 'Renovation/<wbr>Refurbishment', ('ba', None), 'Would you like to refurbish you Spanish property? Property Consultancy Spain helps you with our <strong>refurbishment scan</strong>! Our experts provide you with insight in costs and time frame for the planned renovation. And whether or not the plan is juridical feasible. Support and guidance in preparation and during the proces!', ['Realistic time schedule and cost estimate', 'Legal check', 'Advice before and during the renovation'], 'en.html#contact', False, 'optional'),
        ('management', 'Property management', ('video', 'pool-house'), 'A property with a touristic licance is allowed to be used for short term letting. This is difficult to be managed from abroad. That is why you can use our partner in property management! They organize check-ins, check-out, cleaning and manage online bookings. This way you are completely care free!', ['Property management in Valencia, Moraira, and Balearic Islands.', 'You don’t have to worry about online bookings or dealing with guests.', 'Professional hospitality: Personal check-ins and check-outs.'], 'https://woningbeheervalencia.nl/', True, 'optional'),
    ]
    tones = ['stack__card--white', 'stack__card--navy on-dark', 'stack__card--sand', 'stack__card--ink on-dark', 'stack__card--white']
    cards = ''
    for i, (key, name, (kind, src), text, ticks, href, ext, pkg) in enumerate(xs):
        med = (f'<video muted loop playsinline preload="none" poster="assets/video/{src}.jpg" data-src="assets/video/{src}.mp4"></video>'
               if kind == 'video' else ba_html('x-' + key, 'Before', 'After', 'Compare before and after'))
        chips = ''.join(f'<li>{t}</li>' for t in ticks)
        cls = 'btn--light' if 'on-dark' in tones[i] else ''
        cards += f'''<article class="stack__card {tones[i]}" id="{key}" style="--i:{i}">
      <div class="stack__media">{med}</div>
      <div class="stack__body">
        <div class="stack__top"><span class="stack__n">{i + 1:02d}</span><span class="stack__pkg label">* Expertise: <b>{pkg}</b> in your package.</span></div>
        <span class="label label--brass">Expertises in Spain</span>
        <h2 class="h2">{name}</h2>
        <p class="stack__text">{text}</p>
        <ul class="stack__chips">{chips}</ul>
        {btn('More information', href, cls, ext)}
      </div>
    </article>'''
    idx = ''.join(f'<li><a href="#{k}"><span class="label">{i + 1:02d}</span><b>{n}</b><span class="idx__go" aria-hidden="true">{ARROW}</span></a></li>' for i, (k, n) in enumerate([
        ('purchasing', 'Purchasing support'), ('legal', 'Legal advice'), ('mortgage', 'Mortgage advice'), ('renovation', 'Refurbishment scan'), ('management', 'Property management')]))
    return f'''
<section class="xp-hero">
  <div class="wrap xp-hero__grid">
    <div>
      {crumbs([('Home', 'en.html'), ('Expertises in Spain', '')])}
      <h1 class="h1" data-split>Expertises in <span class="script">Spain</span></h1>
    </div>
    <div class="xp-hero__intro">
      <span class="label label--brass">How do we work?</span>
      <div class="body" data-reveal><p>To guarantee the quality of our service, we choose to work only with our partners. Our partners have experience in Spanish field of work. These are parties that we, but the client as well, <strong>can rely on</strong>. When you consult Property Consultancy Spain, you will always receive guidance and legal advice. You can choose to add specific experts. With this, it is not possible to choose your own party of which we can not guarantee its quality. This is because this brings confusion by communicating over multiple channels. To provide an <strong>exclusive service</strong>, you will receive the full package at Property Consultancy Spain. Read about the different expertises you can use below.</p></div>
    </div>
  </div>
  <div class="wrap"><ul class="idx">{idx}</ul></div>
</section>
<section class="stack wrap">{cards}</section>
''' + cta('Get to work in Spain!', 'Everything that has to do with buying or renting a property in Spain, you can find at Property Consultancy Spain. No interference in communication, as all parties work in one team. You have one contact point. This is felt to be very pleasant by our customers. Are you curious about how our commission formed?', 'Go to Prices!', 'en-prices.html', lang='en')


def en_prices():
    yt = '<div class="yt" data-id="4UjcDfP00PM"><img src="assets/media/yt-4UjcDfP00PM.jpg" alt="" loading="lazy"><button aria-label="Play video"><span class="label">Play</span></button></div>'
    timeline = [('Let&#x27;s get started!', 'Start-up invoice of € 2.995,-'), ('Real estate agent house hunting', 'Looking for your dream house!'),
                ('Consult a lawyer', 'For the legal check and support.'), ('Negotiations', 'For an honest and market-based price'),
                ('Your savings', 'After negotiating you will know your savings You also know our commission from which the <strong>start-up invoice will be deducted.</strong>'),
                ('Complete purchase', 'The contracts will be signed at the notary and you are now owner of your own Spanish property! Felicidades!')]
    rail = ''.join(f'<article class="rail__card"><span class="rail__n">{i:02d}</span><h3 class="h3">{h}</h3><p>{p}</p></article>' for i, (h, p) in enumerate(timeline, 1))
    example = ['You pay a <strong>start-up invoice of € 2.995</strong>. The real estate agent and lawyer can get to work.', 'A property is found with an asking price of € 400.000.',
               'Standard agent commission of 2,5% will be deducted from the purchase price and the agent negotiates a purchase price of € 285.00', 'Agent’s commision: 50% of € 15.000 = € 7.500',
               '<strong>You save</strong>: € 7.500', 'Lawyer’s commission: 0,6% from the purchase price with a minimum of € 2.450 = € 2.450.']
    ex = ''.join(f'<li><span class="label">{i + 1:02d}</span><p>{t}</p></li>' for i, t in enumerate(example))
    agent = ['You <strong>always</strong> have acces to our legal and real estate advice.', 'A party who clearly is <strong>on the side of the customer</strong>',
             'Always benefit from our lawyer who settles the legal part.', 'Transparency in pricing gives <strong>trust and clarity.</strong>',
             'As a purchaser you benefit from <strong>thorough negotiations</strong> from our real estate agent.', 'As a tenant you <strong>do not pay commission</strong> if the house is rented from our offer.',
             'You <strong>always</strong> end up saving money when working with Property Consultancy Spain']
    ag = ''.join(f'<li data-reveal="{i * .06:.2f}"><span class="label">{i + 1:02d}</span><p>{t}</p></li>' for i, t in enumerate(agent))
    return f'''
<section class="tf-hero">
  <div class="wrap tf-hero__grid">
    <div class="tf-hero__text">
      {crumbs([('Home', 'en.html'), ('Prices', '')])}
      <h1 class="h1" data-split>Transparent <span class="script">Prices</span></h1>
      <p class="tf-hero__lead" data-reveal=".3">In Spain there is often confusion about what the actual costs are for the services of a real estate agent. Sometimes commissions are calculated upfront, sometimes it is calculated in the purchase price and sometimes both! This is off course unpleasent for the customer, because it brings many uncertaincies.</p>
    </div>
    <aside class="ratecard on-dark" data-reveal=".2">
      <div class="ratecard__row"><span class="label">Start-up invoice</span><b>€ 2.995,-</b></div>
      <div class="ratecard__row"><span class="label">Team guidance real estate agent</span><b><span data-count="50">50</span>%</b><small class="label">commission on the difference</small></div>
      <div class="ratecard__row"><span class="label">Team guidance with legal advice</span><b>0,6%</b><small class="label">from the purchase price</small></div>
      <span class="ratecard__seal" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="seal" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text><textPath href="#seal">TRANSPARENT PRICES · PC-SPAIN · </textPath></text></svg></span>
    </aside>
  </div>
</section>

<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Transparent Prices</span></div>
    <div class="split__main"><p class="lead lead--xl" data-words>at Property Consultancy Spain, we do things different! As the first real agency in Spain, we make prices our transparent to our customers. This way the cooperation between you, the customer, and us will be based on confidence and transparency! We like to keep things easy and enjoyable for both parties!</p>
      <p class="muted" style="margin-top:28px"><em>We start with the commission charged for buying property in Spain</em></p></div>
  </div>
</section>

<section class="sec">
  <div class="wrap split split--wide split--rev">
    <div class="split__media"><div data-reveal>{yt}</div></div>
    <div class="split__text">
      <span class="label label--brass">Working method</span>
      <h2 class="h2" data-split>In this video we explain our working method.</h2>
      <div class="body" data-reveal><p>Our service is based to serve the client. That’s why we show how commissions are composed. The differency between the purchase price before and after our mediation, <strong>is shared</strong>! In our method, the real estate agent is rewarded for saving the customer money! This emphasises the fact that we work in <strong>the interest of the customer</strong>! We are not rewarded by the selling party.</p></div>
    </div>
  </div>
</section>

<section class="adv on-dark">
  <div class="wrap adv__grid">
    <p class="adv__fig" aria-hidden="true"><span>1,25</span>%</p>
    <h2 class="h2" data-split>A guaranteed 1,25% advantage on your Spanish purchase price!</h2>
  </div>
</section>

<section class="sec bg-white">
  <div class="wrap duo">
    <article data-reveal><span class="label label--brass">What many buyers do not know about</span><h2 class="h3">Purchase price construction in Spain</h2><p>In Spain it is very common to include the commissions for the selling and purchasing agent in the final purchasing price. The visible price for the customer has <strong>commission inluded</strong> in the price. We share our commission with you. That is why, at our first meeting, the purchasing price is lowered inmidiately. Purely as a result of our transparant communication. And because we like to keep things fun for our customers and our agent!</p></article>
    <article data-reveal=".15"><span class="label label--brass">Negotiations</span><h2 class="h3">Negotionating for the best price!</h2><p>Our team will pull out all the stops in negotiations so our customers will recieve a fair price for purchasers and sellers. Knowledge, experience and sense of negotiations are essential in this. That way we will generate <strong>segnificant cost savings again</strong>, on the purchase price. As with the commission, we will share the cost saving. The difference between asking price before and after the negociations will be shared. Property Consultancy Spain will do their absolute best to negociate the best possible price for their customer.</p></article>
  </div>
  <div class="ticker" aria-hidden="true"><div class="ticker__track">{''.join(f'<span>{c}</span>' for c in ['Standard commission', 'Working method', 'Share your cost reduction', 'Negotiations'] * 3)}</div></div>
</section>

<section class="sec">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Team of experts in Spain</span></div>
    <div class="split__main">
      <h2 class="h2" data-split>Team of experts in Spain</h2>
      <div class="body" data-reveal><p>We launch your file at the <strong>first invoice of € 2.995,-.</strong> For this amount our real estate agent and lawyer get to work! The real estate agent will search for suitable properties and the lawyer will give legal assistance. At the start of our cooperation, you will know you will always save money on the initial purchase price.</p></div>
    </div>
  </div>
  <div class="wrap plans" style="margin-top:clamp(48px,6vw,90px)">
    <article class="plan" data-reveal><div class="plan__top"><span class="plan__n">01</span></div><h3 class="h3">Team guidance real estate agent</h3><div class="plan__fig">50%</div><div class="plan__body"><p><strong>50% commission on the difference between the initial asking price and final purchase price.</strong></p></div></article>
    <article class="plan plan--navy on-dark" data-reveal=".15"><div class="plan__top"><span class="plan__n">02</span></div><h3 class="h3">Team guidance with legal advice</h3><div class="plan__fig">0,6%</div><div class="plan__body"><p><strong>0,6% from the purchase price</strong> <em>You pay the lawyer after the completion date at the notary.</em></p><div style="margin-top:26px">{btn('Contact us!', 'en.html#contact', 'btn--light')}</div></div></article>
  </div>
</section>

<section class="rail-sec bg-white" data-rail>
  <div class="rail__pin">
    <div class="wrap rail__head"><div><span class="label label--brass">Working method</span><h2 class="h2" data-split>Let&#x27;s get started!</h2></div></div>
    <div class="rail">
      <svg class="rail__line" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden="true"><line x1="0" y1="1" x2="100" y2="1"/><line class="rail__prog" x1="0" y1="1" x2="100" y2="1"/></svg>
      <div class="rail__track">{rail}</div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap receipt-wrap">
    <div><span class="label label--brass">Transparent benefits</span><h2 class="h2" data-split>Transparent benefits</h2></div>
    <div class="receipt" data-reveal><ol>{ex}</ol><div class="receipt__total"><span class="label">You save</span><b>€ 7.500</b></div></div>
  </div>
</section>

<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Renting</span></div>
    <div class="split__main">
      <h2 class="h2" data-split>Renting a Spanish property</h2>
      <div class="body" data-reveal><p>You prefer renting a Spanish property Use our network to find you desired property! It is important to keep a record of <strong>terms and conditions</strong> to avoid any possible problems in the future. Our (legal) team will help you put these together, Our start-up invoice does not apply to renting a property.</p></div>
      <div class="rent" data-reveal>
        <div><h3 class="h3">Renting a property by using our housing offer</h3><p>De landlord/letter pays the commission (one month rent)</p></div>
        <div><h3 class="h3">Renting a property via external housing offer</h3><p>The tenant pays the commission (one month rent)</p></div>
      </div>
      <div style="margin-top:40px" data-reveal><span class="label muted">Owner of a Spaninh property?</span><div style="margin-top:14px">{lk('More information!', 'en.html#contact')}</div></div>
    </div>
  </div>
</section>

<section class="sec bg-navy on-dark">
  <div class="wrap tailor">
    <div class="tailor__head"><span class="label muted">Prices</span><h2 class="h2" data-split>Your real estate agent in Spain!</h2></div>
    <ol class="tailor__list">{ag}</ol>
  </div>
</section>
''' + cta('Curious to find out about the possibilities?', 'Feel free to contact us!', 'Contact', 'en.html#contact', lang='en')


def en_success():
    form = '''<form class="form" data-form data-endpoint="" data-offline="This form is not connected yet. Please contact us via Instagram @pc_spain." data-sending="Sending…" data-ok="Thank you! Your success story has been sent." data-fail="Sending failed. Please try again later.">
  <div class="field"><label for="ss-name">Name *</label><input id="ss-name" name="name" required autocomplete="name"></div>
  <div class="field"><label for="ss-mail">E-mail *</label><input id="ss-mail" name="email" type="email" required autocomplete="email"></div>
  <div class="field field--full"><label for="ss-tel">Telephone</label><input id="ss-tel" name="telephone" type="tel" autocomplete="tel"></div>
  <div class="field field--full"><label for="ss-msg">Message *</label><textarea id="ss-msg" name="message" required></textarea></div>
  <div class="form__foot"><button class="btn btn--solid" type="submit">Send success story ''' + ARROW + '''</button><span class="form__msg" role="status"></span></div>
</form>'''
    return f'''
<section class="pf-hero">
  <div class="wrap">
    {crumbs([('Home', 'en.html'), ('Success stories', '')])}
    <div class="pf-hero__grid">
      <h1 class="h1" data-split>Success <span class="script">stories</span></h1>
      <p class="lead" data-reveal=".25">Have you consulted Property Consultanct Group for you purchase? Then leave your success story here! This helps new customers find their way to us.</p>
    </div>
  </div>
</section>

<section class="case">
  <div class="wrap case__grid">
    <div class="case__media">
      {ba_html('case-en', 'Before', 'After', 'Before and after', 'ba--portrait')}
      <p class="label muted case__hint">Drag to compare</p>
    </div>
    <div class="case__body">
      <div class="case__no"><span class="label label--brass">Project</span><b>01</b></div>
      <h2 class="h1 case__title" data-split>Transitie <span class="script">Valencia</span></h2>
      <dl class="case__facts" data-reveal>
        <div><dt class="label">Location</dt><dd>Valencia</dd></div>
        <div><dt class="label">Before</dt><dd>Old office</dd></div>
        <div><dt class="label">After</dt><dd>Modern home</dd></div>
      </dl>
      <div data-reveal>{btn('Contact', 'en.html#contact')}</div>
    </div>
  </div>
</section>

{reviews_all('What customers say about us', 'Customer of PC-Spain').replace('>Succesverhalen<', '>Success stories<')}

<section class="sec bg-white">
  <div class="wrap share">
    <div class="share__head"><span class="label label--brass">Success stories</span><h2 class="h2" data-split>Share your success story</h2><div class="body" data-reveal><p>Have you consulted Property Consultanct Group for you purchase? Then leave your success story here! This helps new customers find their way to us.</p></div></div>
    <div class="share__form" data-reveal=".15">{form}</div>
  </div>
</section>'''


def en_buying():
    return listings_hero('en') + f'''
<section class="sec"><div class="wrap">{listings_section('All', 'Load more')}</div></section>
<section class="sec bg-navy on-dark">
  <div class="wrap split">
    <div class="split__label"><span class="label muted">Prices</span></div>
    <div class="split__main"><h2 class="h2" data-split>Transparent commission</h2><div class="body" data-reveal><p>Are you curious about how our commission is formed? Because of our effort en thorough negotiations we achieve a purchase price reduction. Our commission is based on this reduction. This clarifies expectations from both parties. Want to know more?</p></div>
    <div style="margin-top:40px">{btn('Download!', media('https://pc-spain.com/wp-content/uploads/2020/04/Voordeel-met-Property-Consultancy-Spain.pdf'), 'btn--light', True)}</div></div>
  </div>
</section>'''


def build_en():
    write('en.html', 'Dutch Real Estate Agent in Spain - Property Consultancy Spain', 'Want to buy or rent a property in Spain? Let us advice you.', home_en(), lang='en')
    write('en-working-method.html', 'Working method - Property Consultancy Spain', 'Real Estate Agency in Spain – working method.', en_working_method(), lang='en')
    write('en-expertises.html', 'Expertises in Spain - Property Consultancy Spain', 'Purchasing support, legal advice, mortgage advice, refurbishment scan and property management.', en_expertises(), lang='en')
    write('en-prices.html', 'Prices - Property Consultancy Spain', 'Transparent prices for buying property in Spain.', en_prices(), lang='en')
    write('en-success-stories.html', 'Success stories - Property Consultancy Spain', 'Share your success story.', en_success(), lang='en')
    write('en-buying-property.html', 'Buying property Spain - Property Consultancy Spain', 'Property for sale in Spain.', en_buying(), lang='en')


# menu thumbnails: relevant footage stills instead of the old stock photos
_NAV_IMG = {'over-pc-spain.html': 'assets/video/valencia-oldtown.jpg', 'tarieven.html': 'assets/video/contract-keys.jpg',
            'woning-kopen.html': 'assets/video/villa.jpg', 'intake.html': 'assets/video/valencia-waves.jpg',
            'en-expertises.html': 'assets/video/lawyer-contract.jpg', 'en-success-stories.html': 'assets/video/pool-house.jpg',
            'en-prices.html': 'assets/video/contract-keys.jpg', 'en-buying-property.html': 'assets/video/villa.jpg'}
for _lang in NAV:
    NAV[_lang] = [(l, h, _NAV_IMG.get(h, im), sub) for l, h, im, sub in NAV[_lang]]
