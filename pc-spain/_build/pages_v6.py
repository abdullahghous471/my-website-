# v6 – one English twin for every Dutch page, identical menu structure in both languages,
# and a language switch that always lands on the same page in the other language.
exec((HERE / 'en_listings.py').read_text())
exec((HERE / 'en_articles.py').read_text())

SLUG = lambda c: c['url'].rstrip('/').split('/')[-1]
EN_LISTING_FILES = {s: f'en-property-{s}.html' for s in C['listings']}
EN_ART_FILES = {s: f'en-article-{s}.html' for s in C['articles']}

# ---------------------------------------------------------------- page pairs (NL <-> EN)
ALT.clear()
ALT.update({
    'index.html': 'en.html', 'over-pc-spain.html': 'en-about.html', 'expertises.html': 'en-expertises.html',
    'werkwijze.html': 'en-working-method.html', 'portfolio.html': 'en-success-stories.html', 'partners.html': 'en-partners.html',
    'tarieven.html': 'en-prices.html', 'woning-kopen.html': 'en-buying-property.html', 'informatie-tips.html': 'en-information-tips.html',
    'intake.html': 'en-intake.html',
})
ALT.update({LISTING_FILES[s]: EN_LISTING_FILES[s] for s in C['listings']})
ALT.update({ART_FILES[s]: EN_ART_FILES[s] for s in C['articles']})
ALT_REV.clear()
ALT_REV.update({v: k for k, v in ALT.items()})

# ---------------------------------------------------------------- menus: same structure, same images
_IMGS = ['assets/video/valencia-ciencias.jpg', 'assets/video/valencia-oldtown.jpg', 'assets/video/contract-keys.jpg', 'assets/video/villa.jpg', 'assets/video/valencia-waves.jpg']
NAV['nl'] = [
    ('Home', 'index.html', _IMGS[0], []),
    ('Over ons', 'over-pc-spain.html', _IMGS[1], [('Over PC-Spain', 'over-pc-spain.html'), ('Expertises', 'expertises.html'), ('Werkwijze', 'werkwijze.html'), ('Portfolio', 'portfolio.html'), ('Partners', 'partners.html')]),
    ('Tarieven', 'tarieven.html', _IMGS[2], []),
    ('Woning kopen', 'woning-kopen.html', _IMGS[3], [('Informatie &amp; Tips', 'informatie-tips.html')]),
    ('Intake', 'intake.html', _IMGS[4], []),
]
NAV['en'] = [
    ('Home', 'en.html', _IMGS[0], []),
    ('About us', 'en-about.html', _IMGS[1], [('About PC-Spain', 'en-about.html'), ('Expertises', 'en-expertises.html'), ('Working method', 'en-working-method.html'), ('Portfolio', 'en-success-stories.html'), ('Partners', 'en-partners.html')]),
    ('Prices', 'en-prices.html', _IMGS[2], []),
    ('Buying property', 'en-buying-property.html', _IMGS[3], [('Information &amp; Tips', 'en-information-tips.html')]),
    ('Intake', 'en-intake.html', _IMGS[4], []),
]
T['nl'].update(foot_links=[('Over PC-Spain', 'over-pc-spain.html'), ('Expertises in Spanje', 'expertises.html'), ('Tarieven', 'tarieven.html'), ('Woning kopen Spanje', 'woning-kopen.html'), ('Informatie &amp; Tips', 'informatie-tips.html'), ('Intake', 'intake.html')])
T['en'].update(quick=('Buying property', 'en-buying-property.html'), cta=('Do the intake', 'en-intake.html'),
               offices='Offices:', hours='Opening hours:', hours_v='Monday - Saturday: 10:00 - 18:00', find='Find us on:',
               tagline='Buying or renting a home in Spain',
               foot_links=[('About PC-Spain', 'en-about.html'), ('Expertises in Spain', 'en-expertises.html'), ('Prices', 'en-prices.html'), ('Buying property Spain', 'en-buying-property.html'), ('Information &amp; Tips', 'en-information-tips.html'), ('Intake', 'en-intake.html')])

# ---------------------------------------------------------------- NL -> EN helpers
def remap_links(h):
    return re.sub(r'href="([a-z0-9-]+\.html)(#[^"]*)?"', lambda m: f'href="{ALT.get(m.group(1), m.group(1))}{m.group(2) or ""}"', h)

SPEC_WORDS = [('slaapkamers', 'bedrooms'), ('slaapkamer', 'bedroom'), ('badkamers', 'bathrooms'), ('badkamer', 'bathroom'),
              ('levensbestendige woning', 'lifetime-proof home'), ('bewaakt wooncomplex', 'gated complex'), ('gedeeld zwembad', 'shared pool'),
              ('moderne villa', 'modern villa'), ('nieuwbouw', 'new build'), ('zwembad', 'swimming pool'), ('modellen', 'models'),
              ('te restaureren', 'to restore'), ('Inclusief meubels', 'Including furniture'), ('PCS prijs', 'PCS price'), ('Eerste verdieping', 'First floor')]

def spec_en(s):
    for a, b in SPEC_WORDS:
        s = s.replace(a, b)
    return re.sub(r'\b1 bedrooms\b', '1 bedroom', re.sub(r'\b1 bathrooms\b', '1 bathroom', s))

def card_en(block):
    m = re.search(r'href="woning-([^"]+)\.html"', block)
    if not m or m.group(1) not in EN_LISTINGS:
        return block
    s = m.group(1)
    nl_title = esc(next(c['title'] for c in CARDS if SLUG(c) == s))
    en_title = esc(EN_LISTINGS[s][0])
    block = block.replace(f'alt="{nl_title}"', f'alt="{en_title}"').replace(f'<h3>{nl_title}</h3>', f'<h3>{en_title}</h3>')
    block = re.sub(r'(<div class="lcard__(?:specs|meta label)">)(.*?)(</div>)', lambda k: k.group(1) + spec_en(k.group(2)) + k.group(3), block, flags=re.S)
    return block

def cards_en(h):
    return re.sub(r'<a class="lcard".*?</a>', lambda m: card_en(m.group(0)), h, flags=re.S)

CTA_EN = [('Benieuwd naar de mogelijkheden?', 'Curious to find out about the possibilities?'),
          ('Doe de intake en start direct met uw belegging in Spanje.', 'Do the intake and start your investment in Spain right away.'),
          ('Hulp nodig bij je woning aankoop in Spanje?', 'Need help buying your home in Spain?'),
          ('>Contact opnemen <', '>Get in touch <'), ('>Laadt meer <', '>Load more <'), ('>Allemaal<sup>', '>All<sup>')]

def to_en(h, pairs=()):
    h = remap_links(cards_en(h))
    for a, b in sorted(list(pairs) + CTA_EN, key=lambda p: -len(p[0])):
        h = h.replace(a, b)
    return h


# ---------------------------------------------------------------- About (translation of Over PC-Spain)
ABOUT_EN = [
    ('<a class="label" href="en.html">Home</a><span class="label" aria-hidden="true">/</span><span class="label">Over ons</span>', '<a class="label" href="en.html">Home</a><span class="label" aria-hidden="true">/</span><span class="label">About us</span>'),
    ('Over <span class="script">PC-Spain</span>', 'About <span class="script">PC-Spain</span>'),
    ('>Woning kopen of huren in Spanje<', '>Buying or renting a home in Spain<'),
    ('Kantoren in Spanje, Nederland en de Verenigde Staten (Zuid-Florida)', 'Offices in Spain, the Netherlands and the United States (South Florida)'),
    ('Zuid-Florida', 'South Florida'),
    ('>Wie of wat?<', '>Who or what?<'),
    ('Property Consultancy Spain is een bedrijf van vastgoedexperts die zich richten op klanten die niet per se een makelaar zoeken, maar wel een consultant die hen kan bijstaan in de zoektocht naar een woning en/of belegging in Spanje. Als jij op zoek bent naar een ervaren partij in Spanje die jou kan bijstaan tijdens het gehele (ver)koopproces van vastgoed, zijn wij een goede match!',
     'Property Consultancy Spain is a company of real-estate experts focused on clients who are not necessarily looking for an estate agent, but for a consultant who can support them in the search for a home and/or investment in Spain. If you are looking for an experienced party in Spain to support you throughout the entire process of buying or selling property, we are a good match!'),
    ('Waarom PC-Spain?', 'Why PC-Spain?'),
    ('Met kantoren in diverse plaatsen in Spanje en ook op verschillende locaties in Nederland en de Verenigde Staten (Zuid-Florida), kunnen wij klanten in Nederland en een deel van België en Duitsland goed bedienen en ondersteunen bij de aankoop van hun (tweede) woning of belegging. Dankzij onze ruime ervaring in vastgoed in Nederland en Spanje heeft ons team alle kennis in huis om jou bij te staan bij het aankopen van vastgoed in Spanje.',
     'With offices in several places in Spain and at various locations in the Netherlands and the United States (South Florida), we can serve clients in the Netherlands and parts of Belgium and Germany well and support them in buying their (second) home or investment. Thanks to our extensive experience in real estate in the Netherlands and Spain, our team has all the knowledge in-house to help you buy property in Spain.'),
    ('Mede door ons ruime en goed geselecteerde netwerk van makelaars, projectontwikkelaars, notarissen, financiële adviseurs, veilingen en advocaten kunnen wij jou volledig ondersteunen gedurende het gehele aankoopproces.',
     'Thanks in part to our broad, carefully selected network of estate agents, property developers, notaries, financial advisers, auctions and lawyers, we can support you fully throughout the entire buying process.'),
    ('<b>Makelaars</b>', '<b>Estate agents</b>'), ('<b>Projectontwikkelaars</b>', '<b>Property developers</b>'), ('<b>Notarissen</b>', '<b>Notaries</b>'),
    ('<b>Financiële adviseurs</b>', '<b>Financial advisers</b>'), ('<b>Veilingen</b>', '<b>Auctions</b>'), ('<b>Advocaten</b>', '<b>Lawyers</b>'),
    ('Tot ons netwerk behoren Engels, Nederlands, Spaans en Duits sprekende partners.', 'Our network includes English, Dutch, Spanish and German-speaking partners.'),
    ('<span class="label">Engels</span>', '<span class="label">English</span>'), ('<span class="label">Nederlands</span>', '<span class="label">Dutch</span>'),
    ('<span class="label">Spaans</span>', '<span class="label">Spanish</span>'), ('<span class="label">Duits</span>', '<span class="label">German</span>'),
    ('<span class="label" data-reveal>Over PC-Spain</span>', '<span class="label" data-reveal>About PC-Spain</span>'),
    ('Wat kan PC-Spain voor jou doen?', 'What can PC-Spain do for you?'),
    ('Of je nu een appartement of (tweede) woning zoekt of een belegging wilt doen in Spanje, wij kunnen je ondersteunen met ons team van consultants en ons uitgebreide netwerk. Het kopen van vastgoed in Spanje gaat alles behalve hetzelfde als in Nederland. Buiten de taal zijn de wetten, regels en de cultuur anders.',
     'Whether you are looking for an apartment or a (second) home or want to make an investment in Spain, we can support you with our team of consultants and our extensive network. Buying property in Spain is anything but the same as in the Netherlands: besides the language, the laws, rules and culture are different.'),
    ('Ons team kan jou ondersteunen, zowel voordat je afreist naar Spanje, als direct op een van onze kantoren aldaar. Gedurende het proces staan wij je bij. De consultants van PC-Spain zijn geen traditionele makelaars die voor de verkoop gaan, maar vastgoedspecialisten die je begeleiden bij de aankoop van vastgoed. Tevens kunnen wij adviseren bij de verkoop van jouw woning, zowel in Nederland als in Spanje.',
     'Our team can support you both before you travel to Spain and in person at one of our offices there, and we stand by you throughout the process. PC-Spain’s consultants are not traditional agents chasing a sale, but property specialists who guide you in buying property. We can also advise on selling your home, both in the Netherlands and in Spain.'),
    ('Investeren in jouw Spaanse toekomst doe je met de hulp van', 'You invest in your Spanish future with the help of'),
    ('<span class="label">Woningaanbod</span><h2 class="h2" data-split>Woningaanbod</h2>', '<span class="label">Properties</span><h2 class="h2" data-split>Properties for sale</h2>'),
    ('← Sleep →', '← Drag →'), ('>Woning kopen <svg', '>Buying property <svg'),
]


def en_about():
    return to_en(over_pc_spain(), ABOUT_EN)


# ---------------------------------------------------------------- Partners
PARTNER_EN = {
    'BeleggenInValencia.nl': ['Beleggeninvalencia.nl specialises in guiding international investors in buying and developing property in Valencia. With in-depth knowledge of the local market and a strong network of legal, tax and construction experts, Beleggeninvalencia.nl offers a complete service.', 'From finding the right properties to project management and optimising investment returns, they make sure every step runs professionally and efficiently. Beleggeninvalencia.nl makes investing in Valencia accessible and successful for private and business investors alike.'],
    'Ambau': ['Ambau is a young, dynamic architecture practice from Valencia, specialising in modern, efficient solutions for every project. Thanks to their innovative approach and fast way of working, they deliver bespoke designs that match their clients’ wishes perfectly.', 'Whether it is a new build or a renovation, Ambau combines creativity with functionality to create high-quality, unique designs. Together with PC Spain they provide seamless architectural solutions within every investment project.'],
    'Santander': ['Santander is a leading bank in Spain with a strong focus on both national and international markets. It offers a wide range of financial services, from personal banking to business solutions, and is known for its innovative digital solutions.', 'Santander plays an important role in financing property and investment projects, making it a reliable partner for anyone active in the Spanish property market. Thanks to their many years of experience, they can offer investors tailored financial solutions.'],
    'Cajamar': ['Cajamar is a leading cooperative bank in Spain with a strong focus on the agricultural sector and sustainable projects. With an extensive branch network and a client-focused approach, Cajamar offers financial solutions for private individuals and businesses alike.', 'Their expertise in property finance makes them an ideal partner for investors looking for reliable mortgage and investment options in Spain. Cajamar is known for its innovation in banking and its commitment to regional economic development.'],
    'Fides – ETL Global': ['Fides Auditores is a renowned accountancy firm specialising in tax, accounting and audit services. With an experienced team of professionals, Fides Auditores offers tailored solutions for companies and individuals who want to optimise their financial affairs in Spain. Their expertise and thorough knowledge of local legislation make them a reliable partner for investors and entrepreneurs alike. By working closely with clients, they ensure transparency and compliance with tax obligations, so financial processes are managed efficiently.'],
    'Gimbrere Legal': ['Gimbrere Legal is an international law firm specialising in legal services in areas including real estate, corporate law and immigration law. With offices in both Spain and the Netherlands, Gimbrere Legal provides cross-border legal support for individuals and companies doing business in Spain.', 'Their team of experienced lawyers is known for its commitment, expertise and personal approach, guiding clients through complex legal questions. Together with PC Spain they provide seamless legal support for investment projects.'],
    'To Do': ['To Do is a high-end architecture practice specialising in luxurious, modern projects. With a refined, innovative approach they create unique designs that combine aesthetics and functionality. To Do creates exclusive living and working spaces that meet the highest standards. With their eye for detail and use of high-quality materials, they deliver impressive architectural masterpieces time and again.', 'Together with PC Spain they deliver luxury property solutions that perfectly match the wishes of the most demanding investors.'],
    'Handy Valencia': ['Handy Valencia is a contractor known for its excellent communication and fast approach. With continuous progress updates, they keep clients closely involved in the project. Handy Valencia delivers top-quality alterations and renovations, with no detail overlooked.', 'Their personal approach and focus on client satisfaction ensure every project is completed not only on schedule, but to the highest quality standards.'],
    'Orange Estates': ['Orange Estates is a global network of experienced property professionals, including estate agents, notaries, legal experts, architects and contractors. They are dedicated to achieving their clients’ property goals through a seamless, collaborative approach. Whether it concerns buying or selling, development or advice,', 'Orange Estates provides the expertise and guidance needed to make property projects a success. Their network guarantees reliable and efficient transactions and developments.'],
    'Ennumera Consultores': ['Ennumera Consultores is a renowned gestor in Dénia supporting individuals and companies with administrative, tax and legal matters. They offer tailored solutions, from tax advice and business administration to immigration procedures and property transactions.', 'With their in-depth knowledge of Spanish regulations and their client-focused approach, they make sure every procedure runs smoothly. Whether it is residency applications or business obligations, Ennumera Consultores is a reliable partner for anyone who wants to do business in Spain without worries.'],
    'Orange Brokers': ['Orange Brokers is an experienced estate agency specialising in property on the Spanish costas. They offer comprehensive services for both buying and selling homes, with a strong focus on personal guidance and tailored service.', 'Orange Brokers stands out for its in-depth knowledge of the local market and a broad network of partners, so they can give clients detailed advice and support at every step of the process. Together with PC Spain they ensure a smooth and successful property transaction in Spain.'],
}
CAT_EN = {'Beleggen': 'Investing', 'Architectuur': 'Architecture', 'Bank': 'Bank', 'Fiscaal & audit': 'Tax & audit', 'Juridisch': 'Legal',
          'Aannemer': 'Contractor', 'Vastgoednetwerk': 'Property network', 'Gestor': 'Gestor', 'Makelaar': 'Estate agent'}


def en_partners():
    pairs = [('<a class="label" href="en.html">Home</a><span class="label" aria-hidden="true">/</span><a class="label" href="en-about.html">Over ons</a>',
              '<a class="label" href="en.html">Home</a><span class="label" aria-hidden="true">/</span><a class="label" href="en-about.html">About us</a>'),
             ('>Alle<sup>', '>All<sup>')]
    for n, _l, _u, ps in PARTNERS:
        for a, b in zip(ps, PARTNER_EN[n]):
            pairs.append((a, b))
    for a, b in CAT_EN.items():
        pairs += [(f'>{a}<sup>', f'>{b}<sup>'), (f'pt__cat label">{a}<', f'pt__cat label">{b}<')]
    return to_en(partners(), pairs)


# ---------------------------------------------------------------- Information & Tips + articles
def en_tindex(slugs, start=1):
    rows, imgs = '', ''
    for i, s in enumerate(slugs):
        im = sm(article_hero(s))
        rows += f'''<li><a href="{EN_ART_FILES[s]}" data-i="{i}">
          <span class="tindex__n label">{i + start:02d}</span>
          <img class="tindex__thumb" src="{im}" alt="" loading="lazy" decoding="async">
          <span class="tindex__t">{EN_ARTICLES[s][0]}</span>
          <span class="tindex__go" aria-hidden="true">{ARROW}</span></a></li>'''
        on = ' class="on"' if i == 0 else ''
        imgs += f'<img src="{im}" alt="" loading="lazy" decoding="async"{on}>'
    return f'''<div class="tindex" data-tindex>
      <div class="tindex__view" aria-hidden="true"><div class="tindex__frame">{imgs}</div></div>
      <ol class="tindex__list">{rows}</ol>
    </div>'''


def en_tips():
    return f'''
<section class="tp-hero">
  <div class="wrap">
    {crumbs([('Home', 'en.html'), ('Buying property', 'en-buying-property.html'), ('Information &amp; Tips', '')])}
    <div class="tp-hero__grid">
      <h1 class="h1" data-split>Information &amp; <span class="script">Tips</span></h1>
      <p class="tp-hero__q" data-reveal=".25">How do you buy a home or make an investment in Spain? We give you tips!</p>
    </div>
  </div>
</section>
<section class="sec bg-white">
  <div class="wrap split">
    <div class="split__label"><span class="label label--brass">Information &amp; Tips</span></div>
    <div class="split__main"><div class="body" data-reveal><p>Once you have decided to buy a home in Spain, you are at the start of an exciting adventure. For many Dutch-speaking buyers it is far from clear how exactly the process works. Below we regularly publish articles explaining how to buy a home in Spain. As a <a href="en.html" style="border-bottom:1px solid var(--brass)">Dutch estate agent in Spain</a> we are happy to help you. Our group of consultants and affiliated partners helps you find a beautiful home in Spain. We and our network have years of experience, so we know how to make the best match. A new-build home close to a Spanish beach? Or a cosy apartment in a city? We are happy to get to work on your wishes!</p></div></div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><span class="label">Articles</span><h2 class="h2" data-split>All tips for buying a house in Spain</h2></div>
    {en_tindex(TIPS_ORDER)}
  </div>
</section>
''' + cta('Need help buying your home in Spain?', '', 'Get in touch', 'en-intake.html', lang='en')


def en_article_page(slug):
    title, h = EN_ARTICLES[slug]
    hero = article_hero(slug)
    n = TIPS_ORDER.index(slug) if slug in TIPS_ORDER else 0
    others = [TIPS_ORDER[(n + k) % len(TIPS_ORDER)] for k in (1, 2, 3)]
    body = f'''<div class="readbar" aria-hidden="true"><i></i></div>
<section class="ar-hero">
  <div class="wrap">
    {crumbs([('Home', 'en.html'), ('Information &amp; Tips', 'en-information-tips.html'), (title, '')])}
    <div class="ar-hero__grid">
      <div class="ar-hero__meta"><span class="label label--brass">Information &amp; Tips</span><span class="label muted">{n + 1:02d} / {len(TIPS_ORDER):02d}</span><span class="label muted">{read_min(h)} min read</span></div>
      <h1 class="h1 ar-hero__title" data-split>{title}</h1>
    </div>
  </div>
  <div class="wrap"><figure class="ar-hero__img" data-img><img src="{hero}" alt="" data-parallax="8"></figure></div>
</section>
<section class="sec bg-white ar-sec">
  <div class="wrap ar-grid">
    <article class="rich ar-body" data-reveal>{h}</article>
    <aside class="ar-aside"><div class="ar-aside__box on-dark">
      <span class="label">Property Consultancy Spain</span>
      <h2 class="h3">Need help buying your home in Spain?</h2>
      {btn('Get in touch', 'en-intake.html', 'btn--light')}
    </div></aside>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><span class="label">Information &amp; Tips</span><h2 class="h2" data-split>All tips for buying a house in Spain</h2></div>
    {en_tindex(others, 1)}
    <div style="margin-top:48px">{lk('Information &amp; Tips', 'en-information-tips.html')}</div>
  </div>
</section>'''
    write(EN_ART_FILES[slug], f'{title} - Property Consultancy Spain', re.sub('<[^>]+>', '', h)[:150].rsplit(' ', 1)[0] + '…', body, lang='en', active='en-information-tips.html')


# ---------------------------------------------------------------- Intake
def en_intake():
    steps = [('Intake form', 'To serve you as well as possible, we kindly ask you to fill in this short intake form.'),
             ('Your wishes', 'This helps us get a clear picture of your wishes and needs, so we can support your property plans in a tailored way.'),
             ('Follow-up meeting', 'As soon as we have received your information, we will contact you promptly to arrange a follow-up meeting. That way we can offer you the best possible service, tailored to your personal situation.')]
    st = ''.join(f'<li data-reveal="{.1 * i:.1f}"><span class="in-steps__n">{i + 1:02d}</span><div><h2 class="h3">{h}</h2><p>{p}</p></div></li>' for i, (h, p) in enumerate(steps))
    return f'''
<section class="in-hero">
  <div class="wrap in-grid">
    <div class="in-side">
      {crumbs([('Home', 'en.html'), ('Intake', '')])}
      <h1 class="h1" data-split>Do the <span class="script">intake</span></h1>
      <p class="in-lead" data-reveal=".25">Do the intake and start your investment in Spain right away.</p>
      <ol class="in-steps">{st}</ol>
      <dl class="in-contact" data-reveal>
        <div><dt class="label">Offices:</dt><dd>Valencia · Dénia · Amsterdam · Barcelona</dd></div>
        <div><dt class="label">Opening hours:</dt><dd>Monday - Saturday: 10:00 - 18:00</dd></div>
        <div><dt class="label">Find us on:</dt><dd>{IG}</dd></div>
      </dl>
    </div>
    <div class="in-form" data-reveal=".15">
      <div class="in-form__bar"><span class="label">Intake</span><span class="label muted">Property Consultancy Spain</span></div>
      <div class="in-form__body"><div data-tf-live="01J8J7W38XSF5PMAV91S5H8HA1"></div></div>
    </div>
  </div>
</section>'''


# ---------------------------------------------------------------- Property pages
def en_listing_page(i, card):
    s = SLUG(card)
    title, desc = EN_LISTINGS[s]
    d = C['listings'][s]
    gal = [media(u) for u in d['gallery']] or [media(d['hero'] or card['img'])]
    if GALLERY_CAP:
        gal = gal[:GALLERY_CAP]
    hero = sm(gal[0]) if PREVIEW_SM else gal[0]
    price = next((x for x in card['specs'] if '€' in x), '')
    lab = {'Prijs': 'Price', 'Oppervlakte': 'Area', 'Slaapkamers': 'Bedrooms', 'Badkamers': 'Bathrooms', 'Kenmerk': 'Feature'}
    specs = ''.join(f'<div><dt class="label">{lab[k]}</dt><dd>{esc(spec_en(v))}</dd></div>' for k, v in spec_rows(card['specs']))
    gallery = ''.join(f'<button data-full="{sm(g) if PREVIEW_SM else g}" aria-label="Photo {n + 1}"><img src="{sm(g)}" decoding="async" alt="{esc(title)} – photo {n + 1}" loading="lazy"></button>' for n, g in enumerate(gal))
    prev_c, next_c = CARDS[i - 1], CARDS[(i + 1) % len(CARDS)]
    related = [c for c in CARDS if c['city'] == card['city'] and c is not card][:3]
    if len(related) < 3:
        related += [c for c in CARDS if c not in related and c is not card][: 3 - len(related)]
    rel = remap_links(cards_en(''.join(listing_card(c, n) for n, c in enumerate(related))))
    body = f'''
<section class="lx-hero">
  <img src="{hero}" alt="{esc(title)}">
  <div class="lx-hero__in">
    <div style="grid-column:1 / span 8"><a class="label" href="en-buying-property.html#{slug_city(card['city'])}" style="opacity:.8">{esc(card['city'])}</a><h1 class="h1" data-split style="margin-top:18px;font-size:clamp(2.6rem,6.6vw,7rem)">{esc(title)}</h1></div>
    <div class="lx-hero__meta">{f'<span class="lx-price">{esc(spec_en(price))}</span>' if price else ''}<span class="label" style="opacity:.8">{len(gal)} photos</span></div>
  </div>
</section>
<section class="bg-white"><div class="wrap"><dl class="specs">{specs}</dl></div></section>
<section class="sec bg-white" style="padding-top:clamp(64px,7vw,110px)">
  <div class="wrap lx-body">
    <div class="rich rich--nodrop" data-reveal>{desc}</div>
    <aside class="lx-aside"><div class="lx-aside__box">
      <span class="label" style="opacity:.6">Property Consultancy Spain</span>
      <h2 class="h3">Curious to find out about the possibilities?</h2>
      <p>Do the intake and start your investment in Spain right away.</p>
      {btn('Do the intake', 'en-intake.html', 'btn--light')}
      <p style="border-top:1px solid var(--line-d);padding-top:18px">Offices: Valencia · Dénia · Amsterdam · Barcelona<br>Monday - Saturday: 10:00 - 18:00</p>
    </div></aside>
  </div>
</section>
<section class="sec" style="padding-top:clamp(64px,7vw,110px)">
  <div class="wrap">
    <div class="sec-head"><span class="label">Photos</span><h2 class="h2" data-split>{esc(title)}</h2></div>
    <div class="gallery">{gallery}</div>
  </div>
</section>
<section class="sec bg-white">
  <div class="wrap">
    <div class="sec-head"><span class="label">Properties</span><h2 class="h2" data-split>More properties</h2></div>
    <div class="lgrid">{rel}</div>
    <nav class="lx-nav" style="margin-top:clamp(64px,7vw,110px)">
      <a href="{EN_LISTING_FILES[SLUG(prev_c)]}"><span class="label muted">← Previous property</span><span class="h3">{esc(EN_LISTINGS[SLUG(prev_c)][0])}</span></a>
      <a href="{EN_LISTING_FILES[SLUG(next_c)]}"><span class="label muted">Next property →</span><span class="h3">{esc(EN_LISTINGS[SLUG(next_c)][0])}</span></a>
    </nav>
  </div>
</section>'''
    write(EN_LISTING_FILES[s], f'{esc(title)} - Property Consultancy Spain', f'{title} in {card["city"]} – ' + ', '.join(spec_en(x) for x in card['specs']), body, lang='en', active='en-buying-property.html')


# ---------------------------------------------------------------- Success stories = English twin of Portfolio
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
    {crumbs([('Home', 'en.html'), ('About us', 'en-about.html'), ('Portfolio', '')])}
    <div class="pf-hero__grid">
      <h1 class="h1" data-split>Portfolio</h1>
      <p class="lead" data-reveal=".25">At Property Consultancy Spain we guide clients in transforming old buildings, such as offices and warehouses, into modern living or working spaces. Whether it concerns co-living projects or office space, we make sure every building is turned into an innovative, functional space.</p>
    </div>
    <p class="pf-hero__note body" data-reveal=".35">Below you will find a selection of our portfolio, showing some of our most successful transformation projects. These examples give a good picture of our craftsmanship and dedication to quality and design.</p>
  </div>
</section>

<section class="case">
  <div class="wrap case__grid">
    <div class="case__media">
      {ba_html('case-en', 'Before', 'After', 'Compare before and after', 'ba--portrait')}
      <p class="label muted case__hint">Drag to compare</p>
    </div>
    <div class="case__body">
      <div class="case__no"><span class="label label--brass">Project</span><b>01</b></div>
      <h2 class="h1 case__title" data-split>Transition <span class="script">Valencia</span></h2>
      <dl class="case__facts" data-reveal>
        <div><dt class="label">Location</dt><dd>Valencia</dd></div>
        <div><dt class="label">Before</dt><dd>Old office building</dd></div>
        <div><dt class="label">After</dt><dd>Modern living space</dd></div>
      </dl>
      <div class="body" data-reveal><p>This beautiful apartment in Valencia is the result of transforming an old office building into a modern living space. With attention to detail and high-quality finishes, the office was completely converted into a stylish apartment. Its location in the heart of Valencia, combined with the renewed, comfortable interior, makes it the perfect place to live or invest. The apartment offers a unique mix of history and modern amenities, making it a special and attractive option for lovers of contemporary living.</p></div>
    </div>
  </div>
</section>

{reviews_all('What customers say about us', 'Customer of PC-Spain').replace('>Succesverhalen<', '>Success stories<')}

<section class="band">
  <div class="band__media"><video muted loop playsinline preload="none" poster="assets/video/valencia-oldtown.jpg" data-src="assets/video/valencia-oldtown.mp4" data-parallax="10"></video></div>
  <div class="band__inner wrap"><div class="grid-12">
    <div class="band__title"><span class="label" data-reveal>Transformation</span><h2 class="h1" data-split style="margin-top:22px;font-size:clamp(2.4rem,5.6vw,5.8rem)">Start your property transformation!</h2></div>
    <div class="band__text" data-reveal=".2"><p>Ready to turn an old space into a modern place to live or work? We guide you from start to finish, with innovative solutions and a team of experts. Take the first step towards your successful transformation today!</p><p>Let us support you in optimising your investments with professional advice and guidance. Property Consultancy Group is happy to help with expertise in investments, legal support and mortgage advice.</p>{btn('More information!', 'en-intake.html', 'btn--light')}</div>
  </div></div>
</section>'''


def en_buying():
    return to_en(listings_hero('en') + f'''
<section class="sec" id="aanbod"><div class="wrap">{listings_section('All', 'Load more')}</div></section>
<section class="sec bg-navy on-dark">
  <div class="wrap split">
    <div class="split__label"><span class="label muted">Prices</span></div>
    <div class="split__main"><h2 class="h2" data-split>Transparent commission</h2><div class="body" data-reveal><p>Are you curious about how our commission is formed? Because of our effort en thorough negotiations we achieve a purchase price reduction. Our commission is based on this reduction. This clarifies expectations from both parties. Want to know more?</p></div>
    <div style="margin-top:40px">{btn('Download!', media('https://pc-spain.com/wp-content/uploads/2020/04/Voordeel-met-Property-Consultancy-Spain.pdf'), 'btn--light', True)}</div></div>
  </div>
</section>''', [('>Properties</span>', '>Properties</span>')])


_build_en_v5 = build_en


def build_en():
    _build_en_v5()
    write('en-about.html', 'About PC-Spain - Property Consultancy Spain', 'Property Consultancy Spain is a company of real-estate experts.', en_about(), lang='en', active='en-about.html')
    write('en-partners.html', 'Partners - Property Consultancy Spain', 'The partner network of Property Consultancy Spain.', en_partners(), lang='en', active='en-about.html')
    write('en-information-tips.html', 'Information & Tips - Property Consultancy Spain', 'How do you buy a home or make an investment in Spain? We give you tips!', en_tips(), lang='en', active='en-buying-property.html')
    write('en-intake.html', 'Intake - Property Consultancy Spain', 'Do the intake and start your investment in Spain right away.', en_intake(), lang='en', extra='<script defer src="https://embed.typeform.com/next/embed.js"></script>\n')
    for i, card in enumerate(CARDS):
        en_listing_page(i, card)
    for s in C['articles']:
        en_article_page(s)


# ---------------------------------------------------------------- reviews in English on English pages
QUOTES_EN = {
    QUOTES[0][2]: 'PC Spain helped me optimise my investment in Spanish property. With their guidance and network I was able to set up the rental process professionally, and now everything runs almost automatically. The result? A carefree, passive income that comes in every month. Thanks to their advice and connections I really got the most out of my investment. I…',
    QUOTES[1][2]: 'As an investor I was looking for a reliable team to help me set up the rental process. Thanks to PC Spain everything now runs almost automatically, and I can enjoy a stable extra income passively. They connected me with the right partners and guided me at every step. The system they…',
    QUOTES[2][2]: 'As an investor I wanted not only good advice, but also access to a strong network. Thanks to PC Spain I could use their connections with top lawyers, architects and local estate agents. Their partners helped me buy and renovate a property, which I was able to flip at a good profit. The team…',
    QUOTES[3][2]: 'I invested in a holiday apartment in Spain through Property Consultancy Group. The process went smoothly and the team gave excellent guidance on both the legal and tax aspects. They really think along with you!',
}
EN_UI = [('>Klant van PC-Spain<', '>Customer of PC-Spain<'), ('>Succesverhalen<', '>Success stories<'), ('aria-label="Vorige"', 'aria-label="Previous"'),
         ('aria-label="Volgende"', 'aria-label="Next"'), ('>Voor</span>', '>Before</span>'), ('>Na</span>', '>After</span>'),
         ('aria-label="Voor en na vergelijken"', 'aria-label="Compare before and after"'), ('>Bekijk video <', '>Watch video <'), ('Vorige / Previous', 'Previous'), ('Volgende / Next', 'Next'), ('Sluiten / Close', 'Close')]
_write_v5 = write


def write(fname, title, desc, body, lang='nl', active=None, extra=''):
    if lang == 'en':
        for a, b in QUOTES_EN.items():
            body = body.replace(a, b)
        for a, b in EN_UI:
            body = body.replace(a, b)
    _write_v5(fname, title, desc, body, lang, active, extra)


# ================================================================= v6b – English pages as direct translations of the Dutch pages
COMMON_EN = [('>Over ons<', '>About us<'), ('>Tarieven<', '>Prices<'), ('>Woning kopen<', '>Buying property<'),
             ('>Werkwijze<', '>Working method<'), ('>Expertises in Spanje<', '>Expertises in Spain<'), ('>Meer weten ', '>Learn more '),
             ('>Meer informatie! ', '>More information! '), ('>Start intake ', '>Start intake ')]


def home_en():
    pillars = [
        ('Multiple expertises', 'From purchase guidance and advice on your property portfolio to legal advice: we take care of it all.'),
        ('Completely carefree', 'We guide you from the house hunt to signing the purchase contract, and beyond.'),
        ('Advice in your own language', 'The quality, knowledge and strength of experts from both countries, combined in one team.'),
    ]
    advies = [
        ('Completely carefree', 'Multiple experts join forces to guide you as well and as completely as possible in buying property in Spain, while you have one single point of contact.'),
        ('Professional support', 'Our team has extensive knowledge of Spanish property. When you buy a home you always receive guidance with legal advice. PC-Spain stands on the client’s side as one party.'),
        ('A property without defects', 'Our properties are carefully selected and checked by our legal department, so you don’t have to worry about (hidden) defects in a home.'),
        ('Transparent prices', 'No vague commissions, but transparent conversations about prices.'),
        ('Quality and experience', 'All parties involved have extensive experience in buying homes in Spain.'),
    ]
    voordelen = [
        ('Completely carefree', 'Multiple experts join forces to guide you as well and as completely as possible in buying property in Spain, while you have one single point of contact.', LPH('luxe-villa-moraira')),
        ('Professional support', 'Our team has extensive knowledge of Spanish property. When you buy a home you always receive guidance with legal advice. PC-Spain stands on the client’s side as one party.', LPH('luxe-penthouse-valencia')),
        ('A property without defects', 'Our properties are carefully selected and checked by our legal department, so you don’t have to worry about (hidden) defects in a home.', IMG['after']),
        ('Tailor-made investing in Spain', 'Specialised in tailor-made plans to find your ideal property investment in Spain and make it perform at its best.', LPH('luxe-design-villa-in-benissa')),
        ('Transparent prices', 'No vague commissions, but transparent conversations about prices. When you work with us, you won’t face any unwelcome surprises.', LPH('villa-6-slaapkamers-javea')),
        ('Quality and experience', 'All parties involved with PC-Spain have proven, extensive experience in buying homes in Spain.', IMG['mijas']),
    ]
    return home_body(
        lang='en', title_rows=['Investing in', 'property in'], script='Spain?', sides=('Valencia', 'Dénia'),
        over_title='Investing in property in <span class="script">Spain?</span>',
        over_text='Meet our team of experts who connect you with top lawyers, architects and estate agents.',
        over_cta=('Do the intake', 'en-intake.html'), video_label='Watch video',
        pillars_label='Property Consultancy Spain', pillars_heading='Buying or renting a home in Spain', pillars=pillars,
        advies_label='Why PC-Spain', advies_title='Investing in Spain? Get expert advice', advies=advies,
        advies_cta=('Do the intake', 'en-intake.html'),
        hs_label='Advantages', hs_title='Advantages of Property Consultancy Spain', hs=voordelen,
        band_label='Working method', band_title='Completely carefree in Spain',
        band_text='<p>To guarantee the quality of our service, we work exclusively with our partners. In our standard package this means an estate agent and a lawyer. You can optionally add further experts to the team, such as a mortgage adviser at a Spanish bank. These are parties with <strong>years of experience</strong> in their field, in both the Dutch and Spanish markets. When you engage Property Consultancy Spain you receive the full service of all these experts in one place. Handy, right?</p>',
        band_cta=('Working method', 'en-working-method.html'),
        exp_label='Expertises', exp_title='Are you an investor in Spanish property?',
        exp_text='<p>Let us support you in optimising your investments with professional advice and guidance. Property Consultancy Group is happy to help with expertise in investments, legal support and mortgage advice.</p>',
        exp_cta=('More information!', 'en-expertises.html'),
        quotes=('What customers say about us', 'Success stories', 'en-success-stories.html#reviews', 'Customer of PC-Spain', 'All reviews'),
        nb_label='New build', nb_title='Looking for a new-build home in Spain?',
        nb_text='<p>We are happy to help you find new-build projects for your own use or as an investment with excellent rental returns. Thanks to our connections with the largest property developers in Spain, we have access to exclusive new-build opportunities.</p><p><strong>Let us guide you in finding the perfect home or investment!</strong></p>',
        nb_cta=('More information!', 'en-buying-property.html'),
        cta_block=('Curious to find out about the possibilities?', 'Do the intake and start your investment in Spain right away.', 'Start intake', 'en-intake.html'),
    )


WK_EN = COMMON_EN + [
    ('Makelaardij in <span class="script">Spanje</span>', 'Real estate agency in <span class="script">Spain</span>'),
    ('Het relaxte leven en de dagelijkse zonnestralen maken jou een <em>liefhebber van Spanje</em>. Echter is dit zakelijk gezien even schakelen! Er komt namelijk veel kijken bij de koop van een Spaanse woning. De <em>mañana mañana</em> cultuur en de taalbarrière kunnen dan een struikelblok vormen.',
     'The relaxed way of life and daily sunshine make you a true <em>lover of Spain</em>. From a business point of view, however, it takes some adjusting: there is a lot involved in buying a Spanish home, and the <em>mañana mañana</em> culture and the language barrier can be a stumbling block.'),
    ('>Makelaardij in Spanje<', '>Real estate agency in Spain<'),
    ('Property Consultancy Spain is er om jouw zorgen uit handen te nemen! Onze volledige expertise op verschillende vakgebieden is wat ons <strong>uniek maakt in de makelaardij</strong> in Spanje. Er zijn geen onduidelijke afspraken tussen meerdere externe partijen, omdat wij alle expertise onder één dak hebben die nodig is bij de begeleiding in de koop van een woning in Spanje. Hierdoor is het gehele proces vanaf het begin af aan transparant en zijn er geen onaangename verrassingen. Wij zijn één team met alle expertise!',
     'Property Consultancy Spain is here to take your worries off your hands! Our complete expertise across different fields is what makes us <strong>unique in real estate</strong> in Spain. There are no vague arrangements between multiple external parties, because we have all the expertise needed to guide the purchase of a home in Spain under one roof. That makes the whole process transparent from the start, with no unpleasant surprises. We are one team with all the expertise!'),
    ('>Jaar ervaring in Spanje<', '>Years of experience in Spain<'), ('>Tevreden klanten<', '>Satisfied customers<'),
    ('Werkwijze - Woning kopen in Spanje', 'Working method – Buying a home in Spain'),
    ('Je kan ons inschakelen voor het kopen van een woning in Spanje. Je schakelt een team in met persoonlijke adviseurs. Standaard ontvang jij <strong>aankoopbegeleiding en juridische begeleiding</strong>. Is aanvullend advies nodig? Dan kan je het team uitbreiden. Hieronder krijg je inzicht hoe de koop van een woning werkt.',
     'You can engage us to buy a home in Spain. You engage a team of personal advisers, and as standard you receive <strong>purchase guidance and legal guidance</strong>. Need additional advice? Then you can expand the team. Below you can see how buying a home works.'),
    ('>Kennismaken<', '>Getting to know you<'),
    ('We luisteren naar de wensen en behoeften van de klant. Wat zijn de voorkeuren? Een villa in Moraira of een appartement in een stad als Valencia? Elke type woning heeft zijn eigen kenmerken, de klant wordt hier daarom al voorzien van <strong>advies op maat</strong>. Tevens worden in deze fase de financiële mogelijkheden van de klant bekeken.',
     'We listen to the client’s wishes and needs. What are the preferences? A villa in Moraira or an apartment in a city like Valencia? Every type of home has its own characteristics, so the client already receives <strong>tailored advice</strong> here. The client’s financial possibilities are also reviewed in this phase.'),
    ('>Huizenjacht<', '>House hunting<'),
    ('Samen gaan we op zoek naar jouw Spaanse woning of belegging! Je mag hierbij een <strong>actieve houding</strong> verwachten vanuit onze adviseurs. Zit jouw woning naar wens niet tussen ons aanbod? Geen probleem, dan kijken we verder bij makelaar collega’s. Alles om een woning te vinden die aansluit op jouw wensen!',
     'Together we search for your Spanish home or investment! You can expect an <strong>active attitude</strong> from our advisers. Is your ideal home not among our listings? No problem, we look further with fellow agents – anything to find a home that matches your wishes!'),
    ('>Bezichtiging inplannen<', '>Planning a viewing<'),
    ('Een woning naar wens is gevonden! Wij hechten in het proces veel waarde aan persoonlijke aandacht. Daarom ontvang je ook bij het boeken van een bezichtigingsreis hulp en advies.',
     'A home that matches your wishes has been found! We value personal attention throughout the process, so you also receive help and advice when booking a viewing trip.'),
    ('>Ideale woning of belegging gevonden<', '>Ideal home or investment found<'),
    ('In Spanje is het van groot belang om een <strong>woning zonder gebreken</strong> aan te kopen. Daarom wordt in deze fase de woning al gecontroleerd door onze juridische afdeling. Kloppen de registraties en (woon)vergunningen? Is de achtergrond van de verhuurder/verkoper correct?',
     'In Spain it is very important to buy a <strong>home without defects</strong>. That is why our legal department already checks the property in this phase. Are the registrations and (occupancy) permits correct? Is the background of the landlord/seller in order?'),
    ('>Prijsovereenstemming<', '>Price agreement<'),
    ('Een woning zonder zorgen start bij het maken van goede afspraken. Onderhandelingen voor de aankoopprijs of het maandelijkse huurbedrag nemen wij voor onze rekening. Hierbij staan we <strong>aan de kant van de klant</strong>, onze commissie is immers al <a href="en-prices.html">bij aanvang gecommuniceerd</a>. Geen verborgen afspraken, maar transparante overeenkomsten!',
     'A worry-free home starts with making good agreements. We handle the negotiations on the purchase price or the monthly rent, and we stand <strong>on the client’s side</strong> – after all, our commission was <a href="en-prices.html">communicated at the start</a>. No hidden deals, but transparent agreements!'),
    ('Na een prijsovereenstemming worden bepaalde zaken afgerond. Denk bij een aankoop aan de financiering bij de Spaanse bank. Hierna kunnen we samen <strong>proosten</strong>!',
     'After a price agreement, certain matters are wrapped up – for a purchase, think of the financing with the Spanish bank. After that, we can <strong>raise a glass</strong> together!'),
    ('Wilt u een belegging aankopen in Spanje?', 'Would you like to buy an investment in Spain?'),
    ('Werkwijze - Belegging aankopen in Spanje', 'Working method – Buying an investment in Spain'),
    ('Je kunt ons inschakelen voor het aankopen van een vastgoedbelegging in Spanje. Met jarenlange ervaring in het begeleiden van investeerders, biedt PC-Spain een volledig team van persoonlijke adviseurs. Standaard bieden we aankoop- en juridische begeleiding, en indien nodig kan het team worden uitgebreid met fiscale experts en ontwikkelaars.',
     'You can engage us to buy a property investment in Spain. With years of experience guiding investors, PC-Spain offers a complete team of personal advisers. As standard we provide purchase and legal guidance, and if needed the team can be expanded with tax experts and developers.'),
    ('Wij helpen u bij het benutten van investeringskansen, zoals bankbeslagen, vastgoedveilingen, transformatieobjecten, het splitsen van woningen, het creëren van studentenwoningen, co-living projecten, en het renoveren van historische panden. Hieronder leest u hoe het proces van een vastgoedbelegging verloopt.',
     'We help you make the most of investment opportunities such as bank repossessions, property auctions, transformation projects, splitting homes, creating student housing, co-living projects and renovating historic buildings. Below you can read how the process of a property investment works.'),
    ('<span>Bankbeslagen</span>', '<span>Bank repossessions</span>'), ('<span>Vastgoedveilingen</span>', '<span>Property auctions</span>'),
    ('<span>Transformatieobjecten</span>', '<span>Transformation projects</span>'), ('<span>Splitsen van woningen</span>', '<span>Splitting homes</span>'),
    ('<span>Studentenwoningen</span>', '<span>Student housing</span>'), ('<span>Co-living projecten</span>', '<span>Co-living projects</span>'),
    ('<span>Historische panden</span>', '<span>Historic buildings</span>'),
    ('>Vrijblijvend gesprek<', '>No-obligation conversation<'),
    ('Wij bieden een vrijblijvend gesprek aan, dat zowel via videocall als op locatie in Spanje kan plaatsvinden. Tijdens dit gesprek krijgt u de kans om uw wensen en doelen te bespreken met een van onze ervaren consultants.',
     'We offer a no-obligation conversation, by video call or in person in Spain. In this conversation you can discuss your wishes and goals with one of our experienced consultants.'),
    ('>Bespreken van investeringsopties<', '>Discussing investment options<'),
    ('In dit gesprek nemen we het volledige proces met u door en bespreken we diverse investeringsopties, zoals bankbeslagen, vastgoedveilingen of transformatieprojecten. We helpen u om de beste keuze te maken die aansluit bij uw investeringsstrategie.',
     'In this conversation we walk you through the complete process and discuss various investment options, such as bank repossessions, property auctions or transformation projects. We help you make the best choice for your investment strategy.'),
    ('>Bezoek aan investeringsobjecten<', '>Visiting investment properties<'),
    ('Wanneer u besluit om met ons samen te werken, plannen we een bezoek in naar Valencia of een andere door ons geselecteerde regio. Gedurende twee dagen begeleiden we u langs verschillende investeringsobjecten en bouwprojecten.',
     'When you decide to work with us, we plan a visit to Valencia or another region we have selected. Over two days we take you to various investment properties and construction projects.'),
    ('Tijdens deze dagen vinden er ook informatieve gesprekken plaats met internationale belastingadviseurs, bouwers en juristen.', 'During these days there are also informative meetings with international tax advisers, builders and lawyers.'),
    ('Op deze manier bent u goed geïnformeerd en kunnen onze consultants al uw vragen beantwoorden.', 'That way you are well informed and our consultants can answer all your questions.'),
    ('Bent u klaar voor uw tweede woning of belegging in Spanje?', 'Are you ready for your second home or investment in Spain?'), ('>Ga van start! ', '>Get started! '),
]

XP_EN = COMMON_EN + [
    ('Expertises in <span class="script">Spanje</span>', 'Expertises in <span class="script">Spain</span>'),
    ('>Hoe gaan wij te werk?<', '>How do we work?<'),
    ('Om de kwaliteit van onze dienstverlening te garanderen, werken wij uitsluitend met onze partners samen. Onze partners hebben ervaring in het Spaanse werkgebied. Het zijn partijen waar wij, maar ook de klant, <strong>op kan bouwen</strong>. Je schakelt Property Consultancy Spain in en ontvangt altijd begeleiding + juridisch advies. Optioneel voeg jij deskundige waar jij behoefte aan hebt toe! Hierbij is het niet mogelijk om zelf partijen in te schakelen, waarvan wij de kwaliteit niet kunnen garanderen. Dit brengt onduidelijkheid met zich mee door communiceren over meerdere kanalen. Om een <strong>exclusieve service</strong> te kunnen bieden ontvang je bij Property Consultancy Spain daarom het volledige pakket. Lees hieronder de verschillende expertises waar jij gebruik van kan maken.',
     'To guarantee the quality of our service, we work exclusively with our partners. Our partners have experience in the Spanish market; they are parties that we, and the client, <strong>can rely on</strong>. When you engage Property Consultancy Spain you always receive guidance + legal advice, and you can optionally add the experts you need! It is not possible to bring in your own parties whose quality we cannot guarantee, as communicating over multiple channels creates confusion. To offer an <strong>exclusive service</strong>, Property Consultancy Spain therefore gives you the complete package. Read below about the different expertises you can use.'),
    ('<b>Aankoopbegeleiding</b>', '<b>Purchase guidance</b>'), ('<b>Juridisch advies</b>', '<b>Legal advice</b>'), ('<b>Hypotheekadvies</b>', '<b>Mortgage advice</b>'),
    ('<b>Verbouwingscan</b>', '<b>Renovation scan</b>'), ('<b>Woningbeheer</b>', '<b>Property management</b>'),
    ('<h2 class="h2">Aankoopbegeleiding</h2>', '<h2 class="h2">Purchase guidance</h2>'), ('<h2 class="h2">Juridisch advies</h2>', '<h2 class="h2">Legal advice</h2>'),
    ('<h2 class="h2">Hypotheekadvies</h2>', '<h2 class="h2">Mortgage advice</h2>'), ('<h2 class="h2">Renovatie/<wbr>Verbouwing</h2>', '<h2 class="h2">Renovation/<wbr>Refurbishment</h2>'),
    ('>Expertises in Spanje<', '>Expertises in Spain<'),
    ('Expertise: <b>standaard</b> in jouw pakket', 'Expertise: <b>standard</b> in your package'), ('Expertise: <b>optioneel</b> in jouw pakket', 'Expertise: <b>optional</b> in your package'),
    ('Ons team helpt jou met het zoeken van een droomhuis in Spanje. Door jarenlang zaken te doen in Spanje weten ze de beste match te maken. Een nieuwbouwwoning dicht aan het Spaanse strand? Of juist een knus appartement in een stad? Ze gaan graag met jouw wensen aan de slag! Er is een eigen aanbod van woningen beschikbaar, waar een match wordt gezocht. Zit jouw woning hier niet tussen? Geen probleem, dan kijken ze verder bij collega makelaars. De commissie voor de dienstverlening ons team wordt transparant besproken. Je hoeft je dus geen zorgen te maken dat je onbewust hoge commissies moet betalen.',
     'Our team helps you search for your dream home in Spain. With years of doing business in Spain, they know how to make the best match. A new-build home close to a Spanish beach? Or a cosy apartment in a city? They are happy to get to work on your wishes! There is our own selection of homes to find a match in, and if your home isn’t among them, no problem – they look further with fellow agents. The commission for our team’s services is discussed transparently, so you never have to worry about unknowingly paying high commissions.'),
    ('<li>Betrouwbare partner</li>', '<li>Reliable partner</li>'), ('<li>Transparante tarieven</li>', '<li>Transparent prices</li>'), ('<li>100% persoonlijke aandacht</li>', '<li>100% personal attention</li>'),
    ('Voor juridisch advies nemen we onze betrouwbaar advocatenkantoor in de arm! Een partij die zijn weg kent in de <strong>Spaanse wet- en regelgeving</strong>. De diensten van hen wordt niet enkel beperkt tot begeleiding bij de aankoop van een woning. Er zijn veel meer mogelijkheden! Wens jij bijvoorbeeld een bedrijf op te starten of dien je aangifte te doen in Spanje? Wij helpen jou graag verder.',
     'For legal advice we bring in our trusted law firm – a party that knows its way around <strong>Spanish laws and regulations</strong>. Their services are not limited to guidance when buying a home; there are many more possibilities! Do you want to start a business, or do you need to file a tax return in Spain? We are happy to help.'),
    ('<li>Advies op meerdere rechtsgebieden</li>', '<li>Advice in multiple areas of law</li>'), ('<li>Professionele dienstverlening</li>', '<li>Professional service</li>'), ('<li>Ervaring in de Spaanse wet- en regelgeving</li>', '<li>Experience with Spanish laws and regulations</li>'),
    ('Is een hypotheek noodzakelijk of gewenst in jouw dossier? Ook op dit gebied is er expertise in ons team. We schakelen hiervoor Spaanse Hypotheek en haar team in. Een Nederlandstalige partner welke advies kan uitbrengen over een financiering bij een Spaanse bank. Met meerdere banken in hun netwerk, kunnen ze <strong>onafhankelijk hypotheekadvies</strong> uitbrengen. Gebaseerd op het klantprofiel. Iets wat hen uniek maakt!',
     'Is a mortgage necessary or desired in your case? Our team has expertise here too. We bring in Spaanse Hypotheek and its team: a Dutch-speaking partner who can advise on financing with a Spanish bank. With several banks in their network, they give <strong>independent mortgage advice</strong> based on the client profile – something that makes them unique!'),
    ('<li>Onafhankelijke hypotheekadvies</li>', '<li>Independent mortgage advice</li>'), ('<li>Schakel tussen klant en Spaanse bank</li>', '<li>Link between client and Spanish bank</li>'), ('<li>Specialisatie: ondernemerdossiers</li>', '<li>Specialisation: entrepreneurs’ files</li>'),
    ('Wil je een Spaanse woning laten verbouwen? Property Consultancy Spain helpt jou met een <strong>verbouwing scan</strong>! Met onze experts maken we het voor de klant inzichtelijk wat de kosten en het tijdsbestek zal zijn voor de geplande renovatie. Maar ook of het plan juridisch gezien haalbaar is. Ondersteuning in de voorbereiding en/of begeleiding in het proces!',
     'Want to renovate a Spanish home? Property Consultancy Spain helps you with a <strong>renovation scan</strong>! With our experts we show the client what the costs and timeframe of the planned renovation will be, and whether the plan is legally feasible. Support in the preparation and/or guidance during the process!'),
    ('<li>Realistische tijdsplanning en kostenbegroting</li>', '<li>Realistic schedule and cost estimate</li>'), ('<li>Juridische check</li>', '<li>Legal check</li>'), ('<li>Advies voor- en tijdens de renovatie</li>', '<li>Advice before and during the renovation</li>'),
    ('Aan de slag in Spanje!', 'Get to work in Spain!'),
    ('Alles wat met de koop of huur van de woning te maken heeft is bij Property Consultancy Spain te vinden. Er is geen ruis in de communicatie, aangezien alle partijen in één team samenwerken. Je hebt dus één aanspreekpunt, wat door onze klanten als zeer prettig wordt ervaren. Benieuwd hoe onze commissie is opgebouwd?',
     'Everything to do with buying or renting a home can be found at Property Consultancy Spain. There is no noise in communication, as all parties work together in one team. You have one point of contact, which our clients find very pleasant. Curious how our commission is made up?'),
    ('>Naar tarieven! ', '>To our prices! '), ('alt="Renovatie – na"', 'alt="Renovation – after"'), ('alt="Renovatie – voor"', 'alt="Renovation – before"'),
]

TF_EN = COMMON_EN + [
    ('Transparante <span class="script">tarieven</span>', 'Transparent <span class="script">prices</span>'),
    ('Bij Property Consultancy Spain hanteren we transparante tarieven, afgestemd op uw specifieke situatie. Onze kosten variëren afhankelijk van het type aankoop: of u nu begeleiding zoekt bij de aankoop van een tweede woning voor eigen gebruik, of investeert in vastgoed voor verhuur en rendement.',
     'At Property Consultancy Spain we use transparent prices, tailored to your specific situation. Our fees vary with the type of purchase: whether you want guidance buying a second home for your own use, or you are investing in property for rental and returns.'),
    ('01 · Aanschaf tweede woning', '01 · Buying a second home'), ('02 · Vastgoedbelegging', '02 · Property investment'),
    ('Minimum €5.750 exclusief btw', 'Minimum €5,750 excluding VAT'), ('Opstartnota, exclusief btw', 'Start-up invoice, excluding VAT'),
    ('TRANSPARANTE TARIEVEN · PC-SPAIN · ', 'TRANSPARENT PRICES · PC-SPAIN · '), ('>Transparante tarieven<', '>Transparent prices<'),
    ('Wij zorgen ervoor dat u precies weet waar u aan toe bent, zodat u met vertrouwen kunt investeren in de Spaanse vastgoedmarkt. Neem contact met ons op voor meer informatie over onze op maat gemaakte tarieven!',
     'We make sure you know exactly where you stand, so you can invest in the Spanish property market with confidence. Contact us for more information about our tailored prices!'),
    ('Tarieven - Aanschaf tweede woning in Spanje', 'Prices – Buying a second home in Spain'),
    ('In Spanje werken commissies anders dan in Nederland. Bijna 90% van de verkopen bevat een commissie van 5% in de verkoopprijs. In de regio Valencia betaalt de verkoper 3% aan de makelaar en de koper 3% aan zijn eigen makelaar. Bij PC-Spain hanteren wij dezelfde werkwijze, met een minimum van €5.750 exclusief btw. Voor aankopen buiten Valencia worden wij betaald door de verkopende makelaar. Eventuele afwijkingen communiceren wij altijd transparant vooraf.',
     'Commissions work differently in Spain than in the Netherlands. Almost 90% of sales include a 5% commission in the sale price. In the Valencia region the seller pays 3% to their agent and the buyer pays 3% to their own agent. At PC-Spain we work the same way, with a minimum of €5,750 excluding VAT. For purchases outside Valencia we are paid by the selling agent. We always communicate any deviations transparently in advance.'),
    ('Tarieven - Begeleiding bij aankoop vastgoedbelegging', 'Prices – Guidance when buying a property investment'),
    ('Bij de aankoop van een vastgoedbelegging bieden wij uitgebreide begeleiding om ervoor te zorgen dat u het maximale uit uw investering haalt. Onze opstartkosten omvatten essentiële consulten, rondleidingen en projectbezoeken die u volledig inzicht geven in de markt en potentiële kansen. Wij hanteren transparante tarieven zodat u precies weet waar u aan toe bent gedurende het gehele proces.',
     'When you buy a property investment we provide extensive guidance to make sure you get the most out of it. Our start-up costs include essential consultations, tours and project visits that give you full insight into the market and potential opportunities. Our prices are transparent, so you know exactly where you stand throughout the process.'),
    ('<strong>Opstartnota: € 1.750,- exclusief btw</strong>', '<strong>Start-up invoice: € 1,750 excluding VAT</strong>'), ('<p>De opstartnota bevat:</p>', '<p>The start-up invoice includes:</p>'),
    ('<li>Consult met een internationale belastingadviseur.</li>', '<li>A consultation with an international tax adviser.</li>'), ('<li>Juridisch advies door een vastgoedadvocaat.</li>', '<li>Legal advice from a property lawyer.</li>'),
    ('<li>Twee dagen rondleiding door Valencia en omgeving.</li>', '<li>A two-day tour of Valencia and the surrounding area.</li>'), ('<li>Bezichtigen van lopende projecten en potentiële investeringen.</li>', '<li>Viewing ongoing projects and potential investments.</li>'),
    ('<li>Twee dagen begeleiding door een consultant met kennis van Spaanse investeringsmogelijkheden.</li>', '<li>Two days of guidance by a consultant with knowledge of Spanish investment opportunities.</li>'),
    ('Tarieven bij aankoop:', 'Prices when buying:'), ('>Tarieven bij aankoop<', '>Prices when buying<'), ('Alle commissies zijn exclusief btw (VAT).', 'All commissions exclude VAT.'),
    ('>Aankoopsom<', '>Purchase price<'), ('>Commissie<', '>Commission<'),
    ('voor aankopen tot € 100.000,-', 'for purchases up to € 100,000'), ('voor aankopen tot € 150.000,-', 'for purchases up to € 150,000'), ('voor aankopen tot € 200.000,-', 'for purchases up to € 200,000'),
    ('van de aankoopsom voor aankopen boven € 200.000,-', 'of the purchase price for purchases above € 200,000'),
    ('<span class="label label--brass">Tarieven</span>', '<span class="label label--brass">Prices</span>'), ('<span class="label">Tarieven</span>', '<span class="label">Prices</span>'),
]


def en_working_method():
    return to_en(werkwijze(), WK_EN)


def en_expertises():
    return to_en(expertises(), XP_EN)


def en_prices():
    return to_en(tarieven(), TF_EN)


def en_buying():
    return to_en(woning_kopen(), COMMON_EN + [('>Woningaanbod<', '>Properties<')])
