/* PC-Spain site assistant "Sol" — a built-in FAQ assistant.
   Answers come only from the website's own content; nothing is sent anywhere.
   Loaded on demand by main.js the first time someone opens the chat. */
(() => {
  if (window.PCSChat) return;
  const EN = (document.documentElement.lang || '').startsWith('en');
  const L = (nl, en) => (EN ? en : nl);
  const PHONE = '+31 6 11 88 34 33', TEL = '+31611883433', MAIL = 'info@pc-spain.com';
  const WA = 'https://wa.me/31611883433?text=' + encodeURIComponent(L('Hallo PC-Spain, ik heb een vraag: ', 'Hello PC-Spain, I have a question: '));
  const page = (nl, en) => (EN ? en : nl);
  const URL = {
    prices: page('tarieven.html', 'en-prices.html'), calc: page('tarieven.html#tt-calc', 'en-prices.html#tt-calc'),
    work: page('werkwijze.html', 'en-working-method.html'), exp: page('expertises.html', 'en-expertises.html'),
    buy: page('woning-kopen.html', 'en-buying-property.html'), intake: page('intake.html', 'en-intake.html'),
    about: page('over-pc-spain.html', 'en-about.html'), tips: page('informatie-tips.html', 'en-information-tips.html'),
    partners: page('partners.html', 'en-partners.html'), portfolio: page('portfolio.html', 'en-success-stories.html'),
    art: s => page('artikel-' + s + '.html', 'en-article-' + s + '.html'),
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9€.,%\s-]/g, ' ');
  const eur = n => '€ ' + Math.round(n).toLocaleString(EN ? 'en-GB' : 'nl-NL');
  const LIST = window.PCS_LISTINGS || [];

  /* ---------------------------------------------------------------- knowledge (from the site) */
  const CITY_ALIASES = { javea: 'Javeá', xabia: 'Javeá', denia: 'Denia', xativa: 'Xativa', jativa: 'Xativa', alacant: 'Gran Alacant' };
  const CITIES = [...new Set(LIST.map(x => x.c))];
  const ALICANTE = ['Altea', 'Benidorm', 'Benissa', 'Denia', 'Finestrat', 'Gran Alacant', 'Javeá', 'Moraira', 'Orihuela', 'Santa Pola', 'Tarbena'];
  const TIERS = [[100000, 5750], [150000, 6750], [200000, 7750]];
  const fee = v => { for (const [max, f] of TIERS) if (v <= max) return f; return v * 0.04; };

  const link = (href, label) => `<a class="chat__lk" href="${href}">${label}<svg viewBox="0 0 26 10" aria-hidden="true"><path d="M0 5h25M21 1l4 4-4 4" fill="none" stroke="currentColor"/></svg></a>`;
  const list = items => '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
  const contactRow = () => `<div class="chat__acts"><a href="${WA}" target="_blank" rel="noopener">WhatsApp</a><a href="tel:${TEL}">${L('Bellen', 'Call')}</a><a href="mailto:${MAIL}">E-mail</a><a href="${URL.intake}">${L('Doe de intake', 'Do the intake')}</a></div>`;

  const CHIPS = {
    start: [L('Wat kost het?', 'What does it cost?'), L('Hoe werkt het?', 'How does it work?'), L('Woningaanbod', 'Properties'), L('Beleggen', 'Investing'), L('Contact', 'Contact')],
    price: [L('Bereken voor € 250.000', 'Calculate for € 250,000'), L('Wat zit in de opstartnota?', 'What is in the start-up invoice?'), L('Bijkomende kosten', 'Additional costs')],
    work: [L('Juridische controle', 'Legal check'), L('Hypotheek', 'Mortgage'), L('Doe de intake', 'Do the intake')],
    homes: [L('Woningen onder € 300.000', 'Homes under € 300,000'), L('Villa met zwembad', 'Villa with pool'), L('Woningen in Denia', 'Homes in Denia')],
    invest: [L('Wat kost begeleiding?', 'What does guidance cost?'), L('Transformatieprojecten', 'Transformation projects'), L('Contact', 'Contact')],
    more: [L('Wat kost het?', 'What does it cost?'), L('Woningaanbod', 'Properties'), L('Contact', 'Contact')],
  };

  const INTENTS = [
    { id: 'greet', k: ['hoi', 'hallo', 'hey', 'hi', 'hello', 'goedemorgen', 'goedemiddag', 'goedenavond', 'good morning', 'good afternoon', 'dag sol', 'hola'],
      a: () => ({ t: L('Hallo! Ik ben Sol, de digitale assistent van PC-Spain. Waar kan ik u mee helpen?', 'Hello! I am Sol, the digital assistant of PC-Spain. How can I help you?'), c: CHIPS.start }) },
    { id: 'thanks', k: ['nee bedankt', 'no thanks', 'bedankt', 'dank je', 'dankjewel', 'dank u', 'thanks', 'thank you', 'top', 'super', 'perfect', 'fijn', 'great'],
      a: () => ({ t: L('Graag gedaan! Kan ik u nog ergens anders mee helpen?', 'You are welcome! Is there anything else I can help with?'), c: CHIPS.more }) },
    { id: 'bye', k: ['doei', 'tot ziens', 'bye', 'goodbye', 'fijne dag', 'have a nice day'],
      a: () => ({ t: L('Tot ziens! U kunt ons altijd bereiken via WhatsApp of ' + PHONE + '.', 'Goodbye! You can always reach us via WhatsApp or ' + PHONE + '.') }) },
    { id: 'buycosts', k: ['bijkomende', 'overdrachtsbelasting', 'belasting', 'notaris', 'kosten koper', 'registratie', 'itp', 'iva', 'extra costs', 'additional costs', 'taxes', 'tax', 'notary', 'eigen geld', 'own money', 'deposit'],
      a: () => ({ t: L('Bij de aankoop van een woning in Spanje komen er naast de koopsom nog kosten bij, zoals belastingen en notaris- en registratiekosten. We leggen dat uitgebreid uit in deze artikelen:', 'When you buy a home in Spain there are costs on top of the purchase price, such as taxes and notary and registration fees. We explain this in detail in these articles:')
        + '<div class="chat__links">' + link(URL.art('huis-kopen-in-spanje-bijkomende-kosten'), L('Bijkomende kosten', 'Additional costs')) + link(URL.art('kosten-bij-aankoop-huis-in-spanje'), L('Kosten bij aankoop', 'Costs when buying')) + link(URL.art('hoeveel-eigen-geld-om-een-woning-te-kopen-in-spanje'), L('Hoeveel eigen geld?', 'How much own money?')) + '</div>', c: CHIPS.price }) },
    { id: 'startup', k: ['opstartnota', 'start-up', 'startup', 'opstart', 'wat zit in'],
      a: () => ({ t: L('De opstartnota voor begeleiding bij een vastgoedbelegging is <b>€ 1.750,- exclusief btw</b> en bevat:', 'The start-up invoice for guidance with a property investment is <b>€ 1,750 excluding VAT</b> and includes:')
        + list(EN ? ['A consultation with an international tax adviser', 'Legal advice from a property lawyer', 'A two-day tour of Valencia and the surrounding area', 'Viewing ongoing projects and potential investments', 'Two days of guidance by a consultant'] : ['Consult met een internationale belastingadviseur', 'Juridisch advies door een vastgoedadvocaat', 'Twee dagen rondleiding door Valencia en omgeving', 'Bezichtigen van lopende projecten en potentiële investeringen', 'Twee dagen begeleiding door een consultant'])
        + link(URL.prices, L('Alle tarieven', 'All prices')), c: CHIPS.invest }) },
    { id: 'price', k: ['tarief', 'tarieven', 'kosten', 'kost', 'commissie', 'courtage', 'prijs', 'prijzen', 'honorarium', 'betalen', 'fee', 'fees', 'cost', 'costs', 'price', 'prices', 'pricing', 'commission', 'pay', 'charge', 'wat kost', 'what does it cost', 'how much', 'hoeveel'],
      a: () => ({ t: L('Onze tarieven zijn transparant, exclusief btw:', 'Our prices are transparent, excluding VAT:')
        + list(EN ? ['<b>Buying a second home:</b> 3% commission, minimum € 5,750', '<b>Property investment:</b> start-up invoice of € 1,750'] : ['<b>Aanschaf tweede woning:</b> 3% commissie, minimum € 5.750', '<b>Vastgoedbelegging:</b> opstartnota van € 1.750'])
        + L('Schuif hieronder om uw commissie direct te berekenen:', 'Slide below to calculate your commission instantly:'), w: 'calc', v: 250000, c: CHIPS.price }) },
    { id: 'invest', k: ['belegging', 'beleggen', 'belegger', 'investeren', 'investering', 'rendement', 'verhuur', 'verhuren', 'invest', 'investment', 'investor', 'rental', 'yield', 'return', 'bankbeslag', 'veiling', 'auction', 'transformatie', 'transformation', 'co-living', 'studentenwoning'],
      a: () => ({ t: L('Voor beleggers verloopt het in drie stappen: een vrijblijvend gesprek (videocall of in Spanje), het bespreken van investeringsopties en een tweedaags bezoek aan investeringsobjecten in en rond Valencia. Denk aan bankbeslagen, vastgoedveilingen, transformatieobjecten, het splitsen van woningen, studentenwoningen, co-living en historische panden. De opstartnota is <b>€ 1.750,- excl. btw</b>.', 'For investors there are three steps: a no-obligation conversation (video call or in Spain), discussing investment options and a two-day visit to investment properties in and around Valencia. Think of bank repossessions, property auctions, transformation projects, splitting homes, student housing, co-living and historic buildings. The start-up invoice is <b>€ 1,750 excl. VAT</b>.')
        + '<div class="chat__links">' + link(URL.work, L('Werkwijze beleggen', 'Investing step by step')) + link(URL.portfolio, L('Portfolio', 'Portfolio')) + '</div>', c: CHIPS.invest }) },
    { id: 'work', k: ['werkwijze', 'hoe werkt', 'hoe gaat', 'proces', 'stappen', 'procedure', 'aanpak', 'how does', 'how it works', 'process', 'steps', 'working method', 'approach'],
      a: () => ({ t: L('Zo kopen we samen een woning in Spanje:', 'This is how we buy a home in Spain together:')
        + '<ol>' + (EN ? ['Getting to know you', 'House hunting', 'Planning viewings', 'Ideal home found (legal check)', 'Price agreement', 'Deal!'] : ['Kennismaken', 'Huizenjacht', 'Bezichtiging inplannen', 'Ideale woning gevonden (juridische controle)', 'Prijsovereenstemming', 'Deal!']).map(s => `<li>${s}</li>`).join('') + '</ol>'
        + L('Standaard krijgt u aankoopbegeleiding én juridische begeleiding, met één aanspreekpunt.', 'As standard you get purchase guidance and legal guidance, with one point of contact.')
        + link(URL.work, L('Lees de werkwijze', 'Read the working method')), c: CHIPS.work }) },
    { id: 'legal', k: ['juridisch', 'advocaat', 'jurist', 'contract', 'nie', 'vergunning', 'registraties', 'legal', 'lawyer', 'permit', 'wet', 'law'],
      a: () => ({ t: L('Juridisch advies zit standaard in uw pakket. We werken met ons vaste advocatenkantoor dat de Spaanse wet- en regelgeving kent. Zodra de ideale woning gevonden is, controleert onze juridische afdeling de registraties, (woon)vergunningen en de achtergrond van de verkoper, zodat u een woning zonder gebreken koopt.', 'Legal advice is standard in your package. We work with our trusted law firm that knows Spanish law and regulations. Once the ideal home is found, our legal department checks the registrations, (occupancy) permits and the background of the seller, so you buy a home without defects.')
        + link(URL.exp, L('Alle expertises', 'All expertises')), c: CHIPS.work }) },
    { id: 'mortgage', k: ['hypotheek', 'financiering', 'financieren', 'lening', 'bank', 'mortgage', 'finance', 'financing', 'loan'],
      a: () => ({ t: L('Voor hypotheekadvies schakelen we onze Nederlandstalige partner Spaanse Hypotheek in. Zij hebben meerdere banken in hun netwerk, geven onafhankelijk advies en zijn gespecialiseerd in ondernemersdossiers.', 'For mortgage advice we bring in our Dutch-speaking partner Spaanse Hypotheek. They have several banks in their network, give independent advice and specialise in cases for entrepreneurs.')
        + link(URL.exp, L('Meer over hypotheekadvies', 'More about mortgage advice')), c: CHIPS.work }) },
    { id: 'renovation', k: ['renovatie', 'renoveren', 'verbouwing', 'verbouwen', 'verbouw', 'renovation', 'renovate', 'rebuild', 'refurbish', 'bouw'],
      a: () => ({ t: L('Met onze verbouwingscan maken experts inzichtelijk wat de kosten en het tijdsbestek van een renovatie zijn: een realistische planning en begroting, een juridische check en advies vóór en tijdens de verbouwing.', 'With our renovation scan, experts show what a renovation will cost and how long it will take: a realistic schedule and budget, a legal check and advice before and during the work.')
        + '<div class="chat__links">' + link(URL.exp, L('Expertises', 'Expertises')) + link(URL.portfolio, L('Bekijk ons portfolio', 'See our portfolio')) + '</div>', c: CHIPS.more }) },
    { id: 'services', k: ['expertise', 'expertises', 'diensten', 'dienst', 'service', 'services', 'wat doen jullie', 'what do you do', 'beheer', 'woningbeheer', 'management', 'aankoopbegeleiding'],
      a: () => ({ t: L('Onze expertises:', 'Our expertises:') + list(EN ? ['Purchase guidance <small>(standard)</small>', 'Legal advice <small>(standard)</small>', 'Mortgage advice', 'Renovation scan', 'Property management'] : ['Aankoopbegeleiding <small>(standaard)</small>', 'Juridisch advies <small>(standaard)</small>', 'Hypotheekadvies', 'Verbouwingscan', 'Woningbeheer'])
        + link(URL.exp, L('Bekijk de expertises', 'View the expertises')), c: CHIPS.work }) },
    { id: 'offices', k: ['kantoor', 'kantoren', 'adres', 'waar zitten', 'vestiging', 'office', 'offices', 'address', 'where are you', 'located', 'barcelona', 'amsterdam', 'florida'],
      a: () => ({ t: L('Onze kantoren zitten in <b>Valencia, Dénia, Barcelona en Amsterdam</b>. Een gesprek kan op kantoor, in Spanje of via videocall.', 'Our offices are in <b>Valencia, Dénia, Barcelona and Amsterdam</b>. We can meet at the office, in Spain or by video call.') + contactRow() }) },
    { id: 'hours', k: ['open', 'openingstijden', 'bereikbaar', 'tijden', 'zaterdag', 'zondag', 'hours', 'opening', 'saturday', 'sunday', 'when can'],
      a: () => ({ t: L('We zijn bereikbaar van <b>maandag t/m zaterdag, 10:00 – 18:00</b>. Buiten die tijden kunt u een WhatsApp sturen; we reageren zo snel mogelijk.', 'We are available <b>Monday to Saturday, 10:00 – 18:00</b>. Outside those hours you can send a WhatsApp; we reply as soon as possible.') + contactRow() }) },
    { id: 'intake', k: ['intake', 'formulier', 'aanmelden', 'beginnen', 'starten', 'form', 'sign up', 'get started', 'start'],
      a: () => ({ t: L('Via de intake vertelt u in drie korte stappen wat u zoekt: uw wens, uw plannen en uw gegevens. Daarna nemen we contact met u op voor een vervolgafspraak.', 'In the intake you tell us in three short steps what you are looking for: your wish, your plans and your details. We then contact you for a follow-up appointment.')
        + link(URL.intake, L('Start de intake', 'Start the intake')) }) },
    { id: 'about', k: ['wie zijn', 'over jullie', 'bedrijf', 'team', 'ervaring', 'experts', 'about', 'who are', 'company', 'experience', 'makelaar', 'agent', 'consultant', 'betrouwbaar', 'reviews', 'review'],
      a: () => ({ t: L('PC-Spain is een team van vastgoedconsultants, geen traditionele makelaar: we staan aan de kant van de koper. <b>23 jaar ervaring in Spanje, 16 experts en 120+ tevreden klanten.</b> U heeft één aanspreekpunt voor het hele traject.', 'PC-Spain is a team of property consultants, not a traditional estate agent: we are on the buyer’s side. <b>23 years of experience in Spain, 16 experts and 120+ satisfied customers.</b> You have one point of contact for the whole process.')
        + '<div class="chat__links">' + link(URL.about, L('Over PC-Spain', 'About PC-Spain')) + link(URL.partners, L('Onze partners', 'Our partners')) + '</div>', c: CHIPS.more }) },
    { id: 'language', k: ['nederlands', 'taal', 'engels', 'spaans', 'duits', 'dutch', 'language', 'english', 'spanish', 'german', 'speak'],
      a: () => ({ t: L('Ons team adviseert u in uw eigen taal. In ons netwerk werken Nederlands-, Engels-, Spaans- en Duitssprekende partners.', 'Our team advises you in your own language. Our network includes Dutch, English, Spanish and German-speaking partners.'), c: CHIPS.more }) },
    { id: 'tips', k: ['tips', 'tip', 'artikel', 'artikelen', 'blog', 'informatie', 'lezen', 'guide', 'information', 'article', 'articles', 'read'],
      a: () => ({ t: L('Handige artikelen om mee te beginnen:', 'Useful articles to start with:') + '<div class="chat__links">'
        + link(URL.art('procedure-aankoop-woning-spanje'), L('Procedure aankoop woning', 'Buying procedure'))
        + link(URL.art('huis-kopen-spanje-wat-moet-je-weten'), L('Wat moet je weten?', 'What should you know?'))
        + link(URL.art('uitleg-aankoop-commissie-spanje'), L('Uitleg aankoopcommissie', 'Purchase commission explained'))
        + link(URL.tips, L('Alle tips', 'All tips')) + '</div>' }) },
    { id: 'callback', k: ['terugbellen', 'bel mij', 'bel me', 'terugbel', 'call me back', 'call back', 'callback', 'bezichtiging plannen', 'plan een bezichtiging', 'plan a viewing', 'viewing', 'adviseur spreken', 'spreek een adviseur', 'talk to an adviser', 'speak to an adviser'],
      a: () => ({ t: L('Graag! Laat uw gegevens achter, dan neemt een adviseur binnen één werkdag contact met u op.', 'Gladly! Leave your details and an adviser will contact you within one working day.'), w: 'lead' }) },
    { id: 'contact', k: ['contact', 'bellen', 'bel', 'telefoon', 'telefoonnummer', 'nummer', 'whatsapp', 'mail', 'email', 'e-mail', 'afspraak', 'videocall', 'spreken', 'medewerker', 'mens', 'persoon', 'call', 'phone', 'reach', 'appointment', 'meeting', 'human', 'person', 'talk'],
      a: () => ({ t: L('U kunt ons direct bereiken: <b>' + PHONE + '</b> of <b>' + MAIL + '</b>, ma t/m za 10:00 – 18:00.', 'You can reach us directly: <b>' + PHONE + '</b> or <b>' + MAIL + '</b>, Mon–Sat 10:00 – 18:00.') + contactRow() }) },
    { id: 'rent', k: ['huren', 'huur', 'rent', 'renting', 'lease'],
      a: () => ({ t: L('Ook bij het huren van een woning in Spanje denken we mee, en we onderhandelen over het maandelijkse huurbedrag. Vertel ons wat u zoekt:', 'We can also help when you rent a home in Spain, including negotiating the monthly rent. Tell us what you are looking for:') + contactRow() }) },
  ];

  /* ---------------------------------------------------------------- understanding a message */
  const parseAmount = raw => {
    const s = norm(raw).replace(/€/g, ' ');
    const m = s.match(/(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)\s*(k|duizend|thousand|m|mln|miljoen|million|ton)?\b/);
    if (!m) return null;
    let n = m[1];
    if (/^\d{1,3}([.,\s]\d{3})+$/.test(n)) n = +n.replace(/[.,\s]/g, '');
    else n = +n.replace(',', '.');
    const u = m[2];
    if (u === 'k' || u === 'duizend' || u === 'thousand') n *= 1e3;
    else if (u === 'm' || u === 'mln' || u === 'miljoen' || u === 'million') n *= 1e6;
    else if (u === 'ton') n *= 1e5;
    return n >= 20000 && n <= 50e6 ? n : null;
  };
  const findCity = s => {
    for (const [a, c] of Object.entries(CITY_ALIASES)) if (new RegExp('\\b' + a + '\\b').test(s)) return c;
    return CITIES.find(c => s.includes(norm(c).trim())) || null;
  };
  const HOME_WORDS = ['woning', 'woningen', 'huis', 'huizen', 'villa', 'appartement', 'appartementen', 'aanbod', 'te koop', 'finca', 'chalet', 'penthouse', 'nieuwbouw', 'kopen', 'house', 'houses', 'home', 'homes', 'apartment', 'apartments', 'property', 'properties', 'for sale', 'new build', 'buy', 'budget', 'onder', 'under', 'tot', 'up to', 'max', 'maximaal', 'below', 'zwembad', 'pool', 'slaapkamer', 'bedroom'];
  const hit = (s, w) => (w.includes(' ') ? s.includes(w) : new RegExp('\\b' + w + (w.length >= 5 ? '' : '\\b')).test(s));
  const has = (s, words) => words.some(w => hit(s, w));
  const score = (s, words) => words.reduce((n, w) => n + (hit(s, w) ? (w.length > 5 ? 2 : 1) : 0), 0);

  const homesAnswer = (s, amount, city) => {
    const kind = has(s, ['villa']) ? 'villa' : has(s, ['appartement', 'appartementen', 'apartment', 'apartments', 'penthouse']) ? 'apart' : null;
    const pool = has(s, ['zwembad', 'pool']);
    let r = LIST.slice();
    if (city) r = r.filter(x => x.c === city);
    if (kind === 'villa') r = r.filter(x => /villa|chalet|finca/i.test(x.t));
    if (kind === 'apart') r = r.filter(x => /appartement|apartment|penthouse/i.test(x.t));
    if (pool) r = r.filter(x => /zwembad|pool|villa/i.test(x.t + ' ' + x.b));
    if (amount) r = r.filter(x => x.p && x.p <= amount);
    r.sort((a, b) => (a.p || 9e9) - (b.p || 9e9));
    const where = city ? L(' in ' + city, ' in ' + city) : '';
    const under = amount ? L(' tot ' + eur(amount), ' up to ' + eur(amount)) : '';
    if (!r.length) {
      return { t: L('Ik vind in ons huidige aanbod geen woning' + where + under + '. Ons team zoekt ook buiten het eigen aanbod, bij collega-makelaars. Laat weten wat u zoekt:', 'I cannot find a home' + where + under + ' in our current listings. Our team also searches beyond our own listings, with fellow agents. Tell us what you are looking for:') + contactRow() };
    }
    const price = x => (x.pr ? (EN ? x.pr.replace(/\./g, ',') : x.pr) : L('Prijs op aanvraag', 'Price on request'));
    const beds = x => (x.b ? (EN ? x.b.replace('slaapkamers', 'bedrooms').replace('slaapkamer', 'bedroom') : x.b) : '');
    const cards = r.slice(0, 6).map(x => `<a class="chat__hcard" href="${EN ? x.ue : x.u}"><span class="chat__hcard-img">${x.i ? `<img src="${x.i}" alt="" loading="lazy">` : ''}<span class="label">${esc(x.c)}</span></span><span class="chat__hcard-tx"><b>${esc(EN ? x.te : x.t)}</b><span>${esc(price(x))}</span>${beds(x) ? `<small>${esc(beds(x))}</small>` : ''}<em>${L('Bekijk', 'View')} <svg viewBox="0 0 26 10" aria-hidden="true"><path d="M0 5h25M21 1l4 4-4 4" fill="none" stroke="currentColor"/></svg></em></span></a>`).join('');
    const more = r.length > 6 ? link(URL.buy + (city ? '#' + norm(city).trim().replace(/\s+/g, '-') : ''), L('Bekijk alle ' + r.length + ' woningen', 'View all ' + r.length + ' homes')) : link(URL.buy, L('Volledig aanbod', 'All properties'));
    return { t: L(r.length + (r.length === 1 ? ' woning' : ' woningen') + where + under + ' in ons aanbod, bijvoorbeeld:', r.length + (r.length === 1 ? ' home' : ' homes') + where + under + ' in our listings, for example:') + `<div class="chat__row" data-row>${cards}</div>` + more, c: [L('Plan een bezichtiging', 'Plan a viewing'), ...CHIPS.homes.slice(0, 2)] };
  };

  const answer = raw => {
    const s = ' ' + norm(raw) + ' ';
    const amount = parseAmount(raw);
    const city = findCity(s);
    const priceWords = ['commissie', 'tarief', 'kost', 'kosten', 'betaal', 'betalen', 'fee', 'commission', 'cost', 'costs', 'pay', 'bereken', 'calculate', 'reken'];
    if (amount && has(s, priceWords) && !has(s, ['woning', 'woningen', 'villa', 'appartement', 'home', 'homes', 'house', 'apartment'])) {
      const f = fee(amount);
      return { t: L('Bij een aankoopsom van <b>' + eur(amount) + '</b> is onze commissie <b>' + eur(f) + ',-</b> exclusief btw' + (amount > 200000 ? ' (4% boven € 200.000).' : ' (volgens onze staffel).'), 'For a purchase price of <b>' + eur(amount) + '</b> our commission is <b>' + eur(f) + '</b> excluding VAT' + (amount > 200000 ? ' (4% above € 200,000).' : ' (according to our fee scale).'))
        , w: 'calc', v: amount, c: [L('Woningen tot ' + eur(amount), 'Homes up to ' + eur(amount)), L('Bijkomende kosten', 'Additional costs'), L('Bel mij terug', 'Call me back')] };
    }
    if (!city && has(s, ['alicante', 'costa blanca'])) {
      const n = LIST.filter(x => ALICANTE.includes(x.c)).length;
      return { t: L('Ja! Een groot deel van ons aanbod ligt aan de Costa Blanca in de provincie Alicante: ' + n + ' woningen in onder meer ' + ALICANTE.slice(0, 7).join(', ') + '. Daarnaast zitten we in en rond Valencia.', 'Yes! A large part of our listings is on the Costa Blanca in the province of Alicante: ' + n + ' homes in places such as ' + ALICANTE.slice(0, 7).join(', ') + '. We also cover Valencia and its surroundings.')
        + link(URL.buy, L('Bekijk het aanbod', 'View the listings')), c: CHIPS.homes };
    }
    if (city || (amount && has(s, HOME_WORDS)) || has(s, ['villa', 'appartement', 'appartementen', 'apartment', 'apartments', 'penthouse', 'finca', 'woningaanbod', 'aanbod', 'properties', 'listings', 'zwembad', 'pool', 'te koop', 'for sale'])) {
      if (!city && has(s, ['alicante', 'costa blanca'])) {
        const n = LIST.filter(x => ALICANTE.includes(x.c)).length;
        return { t: L('Ja! Een groot deel van ons aanbod ligt aan de Costa Blanca in de provincie Alicante: ' + n + ' woningen in onder meer ' + ALICANTE.slice(0, 7).join(', ') + '. Daarnaast zitten we in en rond Valencia.', 'Yes! A large part of our listings is on the Costa Blanca in the province of Alicante: ' + n + ' homes in places such as ' + ALICANTE.slice(0, 7).join(', ') + '. We also cover Valencia and its surroundings.')
          + link(URL.buy, L('Bekijk het aanbod', 'View the listings')), c: CHIPS.homes };
      }
      return homesAnswer(s, amount, city);
    }
    if (has(s, ['regio', 'region', 'gebied', 'where do you work', 'waar werken', 'welke plaatsen', 'which areas', 'which towns'])) {
      return { t: L('Ons aanbod ligt aan de Costa Blanca en rond Valencia, onder meer in ' + CITIES.slice(0, 8).join(', ') + '. Onze kantoren zitten in Valencia, Dénia, Barcelona en Amsterdam. Zoekt u elders in Spanje? Vraag het ons gerust.', 'Our listings are on the Costa Blanca and around Valencia, including ' + CITIES.slice(0, 8).join(', ') + '. Our offices are in Valencia, Dénia, Barcelona and Amsterdam. Looking elsewhere in Spain? Just ask us.')
        + link(URL.buy, L('Bekijk het aanbod', 'View the listings')), c: CHIPS.homes };
    }
    if (amount) {
      const f = fee(amount);
      const n = LIST.filter(x => x.p && x.p <= amount).length;
      return { t: L('Bij een aankoopsom van <b>' + eur(amount) + '</b> is onze commissie <b>' + eur(f) + ',-</b> excl. btw. In ons aanbod staan <b>' + n + '</b> woningen tot dat bedrag.', 'For a purchase price of <b>' + eur(amount) + '</b> our commission is <b>' + eur(f) + '</b> excl. VAT. Our listings include <b>' + n + '</b> homes up to that amount.'),
        w: 'calc', v: amount, c: [L('Woningen tot ' + eur(amount), 'Homes up to ' + eur(amount)), L('Wat kost het?', 'What does it cost?'), L('Bel mij terug', 'Call me back')] };
    }
    let best = null, bestScore = 0;
    INTENTS.forEach((it, i) => { const sc = score(s, it.k) - i * 0.001; if (sc > bestScore) { bestScore = sc; best = it; } });
    if (best && bestScore > 0) return best.a();
    if (has(s, HOME_WORDS)) return homesAnswer(s, null, null);
    return { t: L('Goede vraag! Daar kan ik u niet direct een zeker antwoord op geven. Een van onze adviseurs helpt u graag persoonlijk verder:', 'Good question! I cannot give you a reliable answer to that straight away. One of our advisers will gladly help you personally:') + contactRow(), c: CHIPS.start };
  };

  /* ---------------------------------------------------------------- interface */
  const KEY = 'pcs-chat-' + (EN ? 'en' : 'nl');
  const ENDPOINT = 'https://formsubmit.co/ajax/' + MAIL;
  let log = [];
  try { log = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) {}
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(log.slice(-40))); } catch (e) {} };
  const time = () => new Date().toLocaleTimeString(EN ? 'en-GB' : 'nl-NL', { hour: '2-digit', minute: '2-digit' });

  // office status in Spanish time: Mon–Sat 10:00–18:00
  const officeOpen = () => {
    try {
      const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
      const d = p.find(x => x.type === 'weekday').value, h = +p.find(x => x.type === 'hour').value;
      return d !== 'Sun' && h >= 10 && h < 18;
    } catch (e) { return true; }
  };

  const BOT = document.querySelector('.cbtn--bot .bot');
  const face = BOT ? BOT.outerHTML.replace('class="bot"', 'class="bot bot--mini"') : '';
  const ARROW = '<svg viewBox="0 0 26 10" aria-hidden="true"><path d="M0 5h25M21 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
  const IC = {
    price: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><path d="M20 11.5a5.5 5.5 0 1 0 0 9M9 14.5h8M9 17.5h8"/></svg>',
    homes: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 15 16 6l11 9M8 13v13h16V13M13 26v-7h6v7"/></svg>',
    work: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 8h4M6 16h4M6 24h4M14 8h12M14 16h12M14 24h8"/></svg>',
    talk: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 7h20v14H14l-6 5v-5H6z"/><path d="M11 12h10M11 16h6"/></svg>',
  };
  const TILES = [
    ['price', L('Wat kost het?', 'What does it cost?'), L('Tarieven & rekentool', 'Prices & calculator')],
    ['homes', L('Woningaanbod', 'Properties'), L('41 woningen aan de kust', '41 homes on the coast')],
    ['work', L('Hoe werkt het?', 'How does it work?'), L('Van kennismaking tot deal', 'From first talk to deal')],
    ['talk', L('Spreek een adviseur', 'Talk to an adviser'), L('Wij bellen u terug', 'We call you back')],
  ];

  const root = document.createElement('div');
  root.className = 'chat';
  root.id = 'pcs-chat';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', L('Chat met Sol, de assistent van PC-Spain', 'Chat with Sol, the PC-Spain assistant'));
  root.innerHTML = `
    <div class="chat__grab" aria-hidden="true"><i></i></div>
    <div class="chat__hd">
      <span class="chat__av">${face}</span>
      <div class="chat__who"><b>Sol</b><span class="chat__status"><i></i><em></em></span></div>
      <button type="button" class="chat__reset" aria-label="${L('Nieuw gesprek', 'New conversation')}" title="${L('Nieuw gesprek', 'New conversation')}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10a6 6 0 1 0 2-4.5M4 3v3.5h3.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
      <button type="button" class="chat__x" aria-label="${L('Sluiten', 'Close')}"><i></i></button>
    </div>
    <div class="chat__log" aria-live="polite"></div>
    <div class="chat__chips"></div>
    <form class="chat__form" autocomplete="off">
      <label class="sr-only" for="chat-in">${L('Uw vraag', 'Your question')}</label>
      <input id="chat-in" type="text" maxlength="300" placeholder="${L('Stel uw vraag aan Sol…', 'Ask Sol a question…')}">
      <button type="submit" aria-label="${L('Versturen', 'Send')}">${ARROW}</button>
    </form>
    <div class="chat__foot"><a class="chat__wa" href="${WA}" target="_blank" rel="noopener">WhatsApp</a><a href="tel:${TEL}">${PHONE}</a><a href="mailto:${MAIL}">E-mail</a></div>`;
  document.body.appendChild(root);
  const logEl = root.querySelector('.chat__log'), chipsEl = root.querySelector('.chat__chips'), form = root.querySelector('.chat__form'), input = root.querySelector('input');
  const btn = document.querySelector('.cbtn--bot'), waLink = root.querySelector('.chat__wa');
  const setStatus = () => {
    const on = officeOpen();
    root.querySelector('.chat__status').classList.toggle('off', !on);
    root.querySelector('.chat__status em').textContent = on ? L('Online · adviseurs bereikbaar', 'Online · advisers available') : L('Antwoordt direct · team ma–za', 'Replies instantly · team Mon–Sat');
  };
  setStatus();

  /* widgets inside answers */
  const calcHTML = v => `<div class="chat__calc" data-calc-chat>
      <div class="chat__calc-io"><span><small>${L('Aankoopsom', 'Purchase price')}</small><b data-cv>${eur(v)}</b></span><span><small>${L('Commissie excl. btw', 'Commission excl. VAT')}</small><b data-cf>${eur(fee(v))}</b></span></div>
      <input type="range" min="50000" max="1000000" step="5000" value="${Math.min(1e6, Math.max(5e4, v))}" aria-label="${L('Aankoopsom', 'Purchase price')}">
      <div class="chat__calc-sc"><span>€ 50k</span><span>€ 1M</span></div>
      <a class="chat__lk" href="${URL.calc}">${L('Volledige rekentool', 'Full calculator')}${ARROW}</a></div>`;
  const leadHTML = () => `<form class="chat__lead" novalidate>
      <label><span>${L('Naam', 'Name')}</span><input name="Naam" autocomplete="name" required></label>
      <label><span>${L('Telefoon of e-mail', 'Phone or e-mail')}</span><input name="Contact" autocomplete="tel" required></label>
      <label class="chat__lead-pref"><span>${L('Voorkeur', 'Preference')}</span><select name="Voorkeur"><option>${L('Bellen', 'Phone call')}</option><option>WhatsApp</option><option>E-mail</option><option>${L('Videocall', 'Video call')}</option></select></label>
      <input type="text" name="_honey" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button type="submit">${L('Bel mij terug', 'Call me back')}${ARROW}</button>
      <p class="chat__lead-note">${L('Uw gegevens gebruiken we alleen om contact op te nemen.', 'We only use your details to contact you.')} <a href="${EN ? 'en-privacy.html' : 'privacy.html'}">${L('Privacy', 'Privacy')}</a></p>
      <p class="chat__lead-err" hidden></p>
    </form>`;

  const fitCalc = box => {
    const r = box.querySelector('input'), v = +r.value;
    r.style.setProperty('--p', ((v - r.min) / (r.max - r.min) * 100) + '%');
    box.querySelector('[data-cv]').textContent = eur(v);
    box.querySelector('[data-cf]').textContent = eur(fee(v));
  };
  logEl.addEventListener('input', e => { const box = e.target.closest('[data-calc-chat]'); if (box) fitCalc(box); });
  logEl.addEventListener('submit', e => {
    const f = e.target.closest('.chat__lead'); if (!f) return;
    e.preventDefault();
    const err = f.querySelector('.chat__lead-err'), name = f.Naam.value.trim(), contact = f.Contact.value.trim();
    if (!name || !(/\S+@\S+\.\S+/.test(contact) || contact.replace(/\D/g, '').length >= 8)) {
      err.hidden = false; err.textContent = L('Vul uw naam en een geldig telefoonnummer of e-mailadres in.', 'Please enter your name and a valid phone number or e-mail address.'); return;
    }
    err.hidden = true; f.classList.add('is-sending');
    const asked = log.filter(m => m.who === 'me').map(m => m.t).slice(-6).join(' | ');
    const body = { _subject: L('Terugbelverzoek via chat (Sol)', 'Call-back request via chat (Sol)'), _template: 'table', _captcha: 'false', _honey: f._honey.value,
      Naam: name, Contact: contact, Voorkeur: f.Voorkeur.value, Taal: EN ? 'English' : 'Nederlands', Pagina: location.pathname, 'Vragen in de chat': asked || '-' };
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(r => { if (!r.ok) throw 0; return r.json(); })
      .then(() => {
        f.outerHTML = `<div class="chat__done"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18"/><path d="M12 20.5l5.5 5.5L28 15"/></svg><p><b>${L('Dank u, ' + esc(name.split(' ')[0]) + '!', 'Thank you, ' + esc(name.split(' ')[0]) + '!')}</b>${L('Een adviseur neemt binnen één werkdag contact met u op.', 'An adviser will contact you within one working day.')}</p></div>`;
        const last = [...log].reverse().find(m => m.w === 'lead'); if (last) { last.w = 'done'; last.name = name; save(); }
      })
      .catch(() => { f.classList.remove('is-sending'); err.hidden = false; err.innerHTML = L('Versturen lukte niet. Stuur ons een <a href="' + WA + '" target="_blank" rel="noopener">WhatsApp</a> of bel ' + PHONE + '.', 'Sending failed. Send us a <a href="' + WA + '" target="_blank" rel="noopener">WhatsApp</a> or call ' + PHONE + '.'); });
  });

  const welcome = () => {
    const hour = new Date().getHours();
    const hi = hour < 12 ? L('Goedemorgen', 'Good morning') : hour < 18 ? L('Goedemiddag', 'Good afternoon') : L('Goedenavond', 'Good evening');
    const w = document.createElement('div');
    w.className = 'chat__welcome';
    w.innerHTML = `<span class="label label--brass">${L('Digitale assistent', 'Digital assistant')}</span>
      <h2>${hi}.<br>${L('Waarmee kan ik u helpen?', 'How can I help you?')}</h2>
      <p>${L('Ik ben Sol. Ik ken onze woningen, tarieven en werkwijze, en breng u in contact met een adviseur.', 'I am Sol. I know our homes, prices and way of working, and can put you in touch with an adviser.')}</p>
      <div class="chat__tiles">${TILES.map(([ic, t, sub], k) => `<button type="button" style="--k:${k}" data-q="${t}">${IC[ic]}<b>${t}</b><small>${sub}</small></button>`).join('')}</div>`;
    w.querySelectorAll('button').forEach(b => b.addEventListener('click', () => ask(b.dataset.q)));
    logEl.appendChild(w);
    chips([]);
  };

  const render = (m, animate) => {
    const welcomeEl = logEl.querySelector('.chat__welcome'); if (welcomeEl) welcomeEl.remove();
    const el = document.createElement('div');
    el.className = 'chat__msg chat__msg--' + m.who + (animate ? ' is-new' : '');
    if (m.who === 'me') el.innerHTML = `<p>${esc(m.t)}</p><time>${m.at || ''}</time>`;
    else {
      let extra = '';
      if (m.w === 'calc') extra = calcHTML(m.v || 250000);
      if (m.w === 'lead') extra = leadHTML();
      if (m.w === 'done') extra = `<div class="chat__done"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18"/><path d="M12 20.5l5.5 5.5L28 15"/></svg><p><b>${L('Verzonden', 'Sent')}</b>${L('Een adviseur neemt contact met u op.', 'An adviser will contact you.')}</p></div>`;
      el.innerHTML = `<span class="chat__mav">${face}</span><div class="chat__txt">${m.t}${extra}</div>`;
    }
    logEl.appendChild(el);
    el.querySelectorAll('[data-calc-chat]').forEach(fitCalc);
    el.querySelectorAll('[data-row]').forEach(row => {           // drag the card row with a mouse
      let x0 = 0, s0 = 0, down = false, moved = false;
      row.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = row.scrollLeft; });
      row.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; row.scrollLeft = s0 - dx; });
      ['pointerup', 'pointerleave'].forEach(t => row.addEventListener(t, () => { down = false; }));
      row.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
      row.addEventListener('dragstart', e => e.preventDefault());
    });
    if (m.who === 'bot' && animate) logEl.scrollTop = Math.max(0, el.offsetTop - logEl.offsetTop - 16);
    else logEl.scrollTop = logEl.scrollHeight;
  };
  const chips = list2 => {
    chipsEl.innerHTML = '';
    (list2 || []).forEach((c, k) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.style.setProperty('--k', k); b.addEventListener('click', () => ask(c)); chipsEl.appendChild(b); });
  };
  let busy = false;
  const ask = text => {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    const me = { who: 'me', t: text, at: time() };
    log.push(me); render(me, true); chips([]);
    waLink.href = 'https://wa.me/' + TEL.replace('+', '') + '?text=' + encodeURIComponent(L('Hallo PC-Spain, ik heb een vraag: ', 'Hello PC-Spain, I have a question: ') + text);
    const typing = document.createElement('div');
    typing.className = 'chat__msg chat__msg--bot chat__typing';
    typing.innerHTML = `<span class="chat__mav">${face}</span><div><span></span><span></span><span></span></div>`;
    logEl.appendChild(typing); logEl.scrollTop = logEl.scrollHeight;
    const a = answer(text);
    setTimeout(() => {
      typing.remove();
      const m = { who: 'bot', t: a.t, c: a.c, w: a.w, v: a.v };
      log.push(m); render(m, true); chips(a.c);
      // after a few questions, offer a personal call-back once
      const asked = log.filter(x => x.who === 'me').length;
      if (asked === 3 && !log.some(x => x.w === 'lead' || x.w === 'done' || x.offered)) {
        setTimeout(() => {
          const o = { who: 'bot', offered: 1, t: L('Zal een adviseur u persoonlijk terugbellen? Dat is vrijblijvend.', 'Shall an adviser call you back personally? No obligation.'), c: [L('Bel mij terug', 'Call me back'), L('Nee, bedankt', 'No, thanks')] };
          log.push(o); save(); render(o, true); chips(o.c);
        }, 1100);
      }
      save(); busy = false;
    }, 500 + Math.min(900, a.t.length * 1.6));
  };
  const restore = () => {
    logEl.innerHTML = '';
    if (!log.length) { welcome(); return; }
    log.forEach(m => render(m, false));
    const last = [...log].reverse().find(m => m.who === 'bot'); chips(last ? last.c : CHIPS.start);
  };

  form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; ask(v); });
  root.querySelector('.chat__reset').addEventListener('click', () => { log = []; save(); restore(); input.focus(); });

  // phones: drag the sheet down to close
  let dy0 = null;
  const grab = e => { if (matchMedia('(min-width: 701px)').matches) return; dy0 = e.clientY; root.style.transition = 'none'; };
  [root.querySelector('.chat__grab'), root.querySelector('.chat__hd')].forEach(h => h.addEventListener('pointerdown', grab));
  addEventListener('pointermove', e => { if (dy0 === null) return; const d = Math.max(0, e.clientY - dy0); root.style.transform = `translateY(${d}px)`; });
  addEventListener('pointerup', e => {
    if (dy0 === null) return;
    const d = e.clientY - dy0; dy0 = null; root.style.transition = ''; root.style.transform = '';
    if (d > 110) close();
  });

  const open = () => {
    setStatus();
    root.classList.add('open'); document.body.classList.add('chat-open');
    btn && btn.setAttribute('aria-expanded', 'true');
    if (!logEl.children.length) restore();
    setTimeout(() => { if (matchMedia('(min-width: 701px)').matches) input.focus(); }, 380);
  };
  const close = () => {
    root.classList.remove('open'); document.body.classList.remove('chat-open');
    btn && btn.setAttribute('aria-expanded', 'false'); btn && btn.focus({ preventScroll: true });
  };
  root.querySelector('.chat__x').addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && root.classList.contains('open')) close();
    if (e.key === '/' && !root.classList.contains('open') && !/input|textarea|select/i.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); open(); }
  });
  window.PCSChat = { open, close, toggle: () => (root.classList.contains('open') ? close() : open()), answer };
})();
