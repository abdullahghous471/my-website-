# v7 – floating contact button, privacy & cookie policy (NL/EN), 404, and the files Netlify needs.

PHONE, PHONE_TEL, EMAIL = '+31 6 11 88 34 33', '+31611883433', 'info@pc-spain.com'
SITE_URL = 'https://pc-spain.com'
LEGAL_DATE = {'nl': '25 september 2026', 'en': '25 September 2026'}

ALT.update({'privacy.html': 'en-privacy.html', 'cookies.html': 'en-cookies.html'})
ALT_REV.update({'en-privacy.html': 'privacy.html', 'en-cookies.html': 'cookies.html'})

WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>'
PHONE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>'
MAIL_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M3 5h18v14H3z M3 6l9 7 9-7"/></svg>'
CHAT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M4 5h16v11H9l-5 4z"/><circle cx="9" cy="10.5" r="1" fill="currentColor"/><circle cx="12" cy="10.5" r="1" fill="currentColor"/><circle cx="15" cy="10.5" r="1" fill="currentColor"/></svg>'


def contact_fab(lang):
    nl = lang == 'nl'
    msg = 'Hallo PC-Spain, ik heb een vraag over het kopen van een woning in Spanje.' if nl else 'Hello PC-Spain, I have a question about buying a property in Spain.'
    wa = 'https://wa.me/' + PHONE_TEL.lstrip('+') + '?text=' + msg.replace(' ', '%20').replace(',', '%2C')
    L = (lambda a, b: a if nl else b)
    return f'''
<div class="fab" data-fab>
  <div class="fab__panel" id="fab-panel" role="dialog" aria-label="{L('Contact opnemen', 'Get in touch')}">
    <p class="fab__head"><b>{L('Direct contact', 'Talk to us')}</b><span>{L('Maandag- Zaterdag: 10:00 - 18:00', 'Monday - Saturday: 10:00 - 18:00')}</span></p>
    <a class="fab__item fab__item--wa" href="{wa}" target="_blank" rel="noopener">{WA_SVG}<span><b>WhatsApp</b><small>{L('Stuur ons een bericht', 'Send us a message')}</small></span></a>
    <a class="fab__item" href="tel:{PHONE_TEL}">{PHONE_SVG}<span><b>{L('Bellen', 'Call')}</b><small>{PHONE}</small></span></a>
    <a class="fab__item" href="mailto:{EMAIL}">{MAIL_SVG}<span><b>E-mail</b><small>{EMAIL}</small></span></a>
    <a class="fab__intake" href="{'intake.html' if nl else 'en-intake.html'}">{L('Of doe de intake', 'Or do the intake')} {ARROW}</a>
  </div>
  <button class="fab__btn" type="button" aria-expanded="false" aria-controls="fab-panel">{CHAT_SVG}<span class="fab__lbl">{L('Contact', 'Contact')}</span><i class="fab__x" aria-hidden="true"></i></button>
</div>'''


_footer_v6 = footer


def footer(lang):
    nl = lang == 'nl'
    legal = (f'<nav class="ft__legal" aria-label="{"Juridisch" if nl else "Legal"}">'
             f'<a href="{"privacy.html" if nl else "en-privacy.html"}">{"Privacybeleid" if nl else "Privacy policy"}</a>'
             f'<a href="{"cookies.html" if nl else "en-cookies.html"}">{"Cookiebeleid" if nl else "Cookie policy"}</a></nav>')
    f = _footer_v6(lang).replace('<span>© Property Consultant Spain - All rights reserved.</span>', '<span>© Property Consultant Spain - All rights reserved.</span>' + legal)
    return f.replace('</footer>', '</footer>' + contact_fab(lang), 1)


# ---------------------------------------------------------------- legal pages
def legal_page(fname, lang, h1, script, lead, sections, crumb):
    home = 'index.html' if lang == 'nl' else 'en.html'
    toc = ''.join(f'<li><a href="#s{i + 1}"><span>{i + 1:02d}</span>{t}</a></li>' for i, (t, _) in enumerate(sections))
    body = ''.join(f'<section id="s{i + 1}" class="legal__sec"><h2 class="h3"><span>{i + 1:02d}</span>{t}</h2>{c}</section>' for i, (t, c) in enumerate(sections))
    upd = ('Laatst bijgewerkt: ' if lang == 'nl' else 'Last updated: ') + LEGAL_DATE[lang]
    html_ = f'''
<section class="tp-hero lg-hero">
  <div class="wrap">
    {crumbs([('Home', home), (crumb, '')])}
    <div class="tp-hero__grid">
      <h1 class="h1" data-split>{h1} <span class="script">{script}</span></h1>
      <p class="tp-hero__q" data-reveal=".25">{lead}</p>
    </div>
    <p class="label muted lg-upd">{upd}</p>
  </div>
</section>
<section class="sec bg-white legal">
  <div class="wrap legal__grid">
    <nav class="legal__toc" aria-label="{'Inhoud' if lang == 'nl' else 'Contents'}"><ol>{toc}</ol></nav>
    <div class="legal__body rich rich--nodrop">{body}</div>
  </div>
</section>'''
    return html_


PRIV_NL = [
    ('Wie wij zijn', f'<p>Deze website wordt beheerd door Property Consultancy Spain (hierna: “PC-Spain”, “wij”), met kantoren in Valencia, Dénia, Amsterdam en Barcelona. PC-Spain is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in dit privacybeleid.</p><p>Vragen over privacy? Neem contact op via <a href="mailto:{EMAIL}">{EMAIL}</a> of <a href="tel:{PHONE_TEL}">{PHONE}</a>.</p>'),
    ('Welke gegevens wij verwerken', '<p>Wij verwerken alleen de gegevens die u zelf aan ons verstrekt:</p><ul><li><strong>Intakeformulier:</strong> naam, e-mailadres, telefoonnummer (optioneel), contactvoorkeur, uw wensen en de antwoorden die u kiest (type aankoop, budget, regio en termijn).</li><li><strong>Contact via e-mail, telefoon of WhatsApp:</strong> de gegevens en berichten die u ons stuurt.</li><li><strong>Technische gegevens:</strong> bij elk bezoek registreert onze hostingpartij automatisch gegevens zoals uw IP-adres, browsertype en het tijdstip van bezoek (serverlogs). Deze gebruiken wij niet om u te identificeren.</li></ul><p>Wij verzamelen geen bijzondere persoonsgegevens en bieden onze diensten niet aan kinderen jonger dan 16 jaar.</p>'),
    ('Waarvoor wij uw gegevens gebruiken', '<ul><li>Om contact met u op te nemen naar aanleiding van uw intake of vraag, en om een vervolgafspraak te plannen.</li><li>Om u te adviseren en te begeleiden bij de aankoop, huur, verkoop of verhuur van vastgoed in Spanje.</li><li>Om de website veilig en goed werkend te houden.</li></ul><p>Wij gebruiken uw gegevens niet voor geautomatiseerde besluitvorming of profilering en verkopen ze nooit aan derden.</p>'),
    ('Grondslagen', '<ul><li><strong>Toestemming</strong> – wanneer u het intakeformulier verstuurt en daarbij akkoord geeft.</li><li><strong>Uitvoering van een overeenkomst</strong> – wanneer u ons inschakelt voor onze dienstverlening, of stappen zet die daaraan voorafgaan.</li><li><strong>Gerechtvaardigd belang</strong> – voor de beveiliging en het technisch beheer van de website.</li><li><strong>Wettelijke verplichting</strong> – bijvoorbeeld fiscale bewaarplichten.</li></ul>'),
    ('Met wie wij gegevens delen', '<p>Wij delen uw gegevens alleen wanneer dat nodig is voor de doelen hierboven:</p><ul><li><strong>Netlify</strong> – hosting van deze website (serverlogs).</li><li><strong>FormSubmit</strong> – verzorgt het doorsturen van het intakeformulier naar onze mailbox.</li><li><strong>Cloudflare (cdnjs) en jsDelivr</strong> – leveren scripts voor de animaties van de website; hierbij wordt uw IP-adres verwerkt.</li><li><strong>WhatsApp (Meta)</strong> – alleen als u er zelf voor kiest ons via WhatsApp te benaderen.</li><li><strong>Onze partners</strong> (zoals advocaten, makelaars en hypotheekadviseurs) – uitsluitend met uw toestemming of wanneer dat nodig is voor de dienstverlening die u bij ons afneemt.</li></ul><p>Sommige van deze partijen zijn gevestigd buiten de Europese Economische Ruimte (zoals de Verenigde Staten). In dat geval gebeurt de doorgifte op basis van passende waarborgen, zoals het EU-VS Data Privacy Framework of de standaardcontractbepalingen van de Europese Commissie.</p>'),
    ('Hoe lang wij gegevens bewaren', '<p>Wij bewaren uw gegevens niet langer dan nodig. Gegevens uit het intakeformulier en contactverzoeken bewaren wij maximaal 24 maanden na het laatste contact, tenzij u klant wordt. Gegevens die wij op grond van de wet moeten bewaren (bijvoorbeeld voor de administratie) bewaren wij zo lang als de wet voorschrijft.</p>'),
    ('Uw rechten', f'<p>U heeft het recht op inzage, correctie, verwijdering en beperking van uw gegevens, het recht op overdraagbaarheid en het recht om bezwaar te maken. Een gegeven toestemming kunt u altijd intrekken. Stuur uw verzoek naar <a href="mailto:{EMAIL}">{EMAIL}</a>; wij reageren binnen een maand.</p><p>Heeft u een klacht? Laat het ons eerst weten. U kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens (Nederland) of de Agencia Española de Protección de Datos (Spanje).</p>'),
    ('Beveiliging', '<p>Deze website maakt gebruik van een beveiligde verbinding (HTTPS). Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen tegen verlies en onrechtmatig gebruik.</p>'),
    ('Wijzigingen', '<p>Wij kunnen dit privacybeleid aanpassen, bijvoorbeeld wanneer onze dienstverlening of de wet verandert. De meest recente versie staat altijd op deze pagina.</p>'),
]
PRIV_EN = [
    ('Who we are', f'<p>This website is operated by Property Consultancy Spain (“PC-Spain”, “we”), with offices in Valencia, Dénia, Amsterdam and Barcelona. PC-Spain is responsible for processing personal data as described in this privacy policy.</p><p>Questions about privacy? Contact us at <a href="mailto:{EMAIL}">{EMAIL}</a> or <a href="tel:{PHONE_TEL}">{PHONE}</a>.</p>'),
    ('What data we process', '<p>We only process the data you provide to us yourself:</p><ul><li><strong>Intake form:</strong> name, e-mail address, telephone number (optional), contact preference, your wishes and the answers you choose (type of purchase, budget, region and timing).</li><li><strong>Contact by e-mail, phone or WhatsApp:</strong> the details and messages you send us.</li><li><strong>Technical data:</strong> with every visit our hosting provider automatically records data such as your IP address, browser type and time of visit (server logs). We do not use this to identify you.</li></ul><p>We do not collect special categories of personal data and do not offer our services to children under 16.</p>'),
    ('What we use your data for', '<ul><li>To contact you about your intake or question and to plan a follow-up meeting.</li><li>To advise and guide you in buying, renting, selling or letting property in Spain.</li><li>To keep the website secure and working properly.</li></ul><p>We do not use your data for automated decision-making or profiling and never sell it to third parties.</p>'),
    ('Legal bases', '<ul><li><strong>Consent</strong> – when you submit the intake form and agree to this.</li><li><strong>Performance of a contract</strong> – when you engage us for our services, or take steps before doing so.</li><li><strong>Legitimate interest</strong> – for the security and technical management of the website.</li><li><strong>Legal obligation</strong> – for example tax record-keeping requirements.</li></ul>'),
    ('Who we share data with', '<p>We only share your data where needed for the purposes above:</p><ul><li><strong>Netlify</strong> – hosting of this website (server logs).</li><li><strong>FormSubmit</strong> – forwards the intake form to our mailbox.</li><li><strong>Cloudflare (cdnjs) and jsDelivr</strong> – deliver the scripts for the website’s animations; your IP address is processed in doing so.</li><li><strong>WhatsApp (Meta)</strong> – only if you choose to contact us via WhatsApp.</li><li><strong>Our partners</strong> (such as lawyers, estate agents and mortgage advisers) – only with your consent or where necessary for the services you engage us for.</li></ul><p>Some of these parties are based outside the European Economic Area (such as the United States). In that case the transfer is based on appropriate safeguards, such as the EU-US Data Privacy Framework or the European Commission’s standard contractual clauses.</p>'),
    ('How long we keep data', '<p>We do not keep your data longer than necessary. Data from the intake form and contact requests is kept for up to 24 months after the last contact, unless you become a client. Data we are legally required to keep (for example for our accounts) is kept for as long as the law requires.</p>'),
    ('Your rights', f'<p>You have the right to access, correct, delete and restrict your data, the right to data portability and the right to object. You can withdraw any consent at any time. Send your request to <a href="mailto:{EMAIL}">{EMAIL}</a>; we will respond within one month.</p><p>Do you have a complaint? Please let us know first. You can also lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) or the Spanish Data Protection Agency (AEPD).</p>'),
    ('Security', '<p>This website uses a secure connection (HTTPS). We take appropriate technical and organisational measures to protect your data against loss and unlawful use.</p>'),
    ('Changes', '<p>We may update this privacy policy, for example when our services or the law change. The latest version is always on this page.</p>'),
]
COOK_NL = [
    ('Wat zijn cookies?', '<p>Cookies zijn kleine tekstbestanden die een website op uw apparaat kan opslaan, bijvoorbeeld om voorkeuren te onthouden of bezoek te meten.</p>'),
    ('Gebruikt deze website cookies?', '<p><strong>Nee.</strong> Deze website plaatst geen cookies en gebruikt geen vergelijkbare technieken (zoals lokale opslag) om u te volgen. Wij gebruiken geen analyse-, advertentie- of trackingcookies en daarom vragen wij ook niet om cookietoestemming.</p>'),
    ('Diensten van derden', f'<p>Om de website snel en goed te laten werken, laden wij scripts voor de animaties via Cloudflare (cdnjs) en jsDelivr. Lettertypen en video’s worden vanaf onze eigen website geleverd. Bij het laden van scripts van derden wordt uw IP-adres verwerkt; deze diensten plaatsen via onze website geen cookies. Meer hierover leest u in ons <a href="privacy.html">privacybeleid</a>.</p><p>Klikt u op een link naar WhatsApp of Instagram, dan gelden op die websites de cookie- en privacyregels van Meta.</p>'),
    ('Cookies beheren', '<p>In de instellingen van uw browser kunt u cookies altijd bekijken, blokkeren en verwijderen. Omdat deze website geen cookies gebruikt, heeft dat geen invloed op de werking van de site.</p>'),
    ('Wijzigingen', f'<p>Gaan wij in de toekomst wel cookies gebruiken, bijvoorbeeld voor bezoekersstatistieken, dan passen wij dit cookiebeleid aan en vragen wij waar nodig eerst uw toestemming. Vragen? Mail naar <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>'),
]
COOK_EN = [
    ('What are cookies?', '<p>Cookies are small text files that a website can store on your device, for example to remember preferences or measure visits.</p>'),
    ('Does this website use cookies?', '<p><strong>No.</strong> This website does not place cookies and does not use similar techniques (such as local storage) to track you. We do not use analytics, advertising or tracking cookies, which is why we do not ask for cookie consent.</p>'),
    ('Third-party services', f'<p>To keep the website fast and working well, we load the scripts for its animations from Cloudflare (cdnjs) and jsDelivr. Fonts and videos are served from our own website. When third-party scripts load, your IP address is processed; these services do not place cookies through our website. Read more in our <a href="en-privacy.html">privacy policy</a>.</p><p>If you click a link to WhatsApp or Instagram, Meta’s cookie and privacy rules apply on those websites.</p>'),
    ('Managing cookies', '<p>You can always view, block and delete cookies in your browser settings. Because this website uses no cookies, this does not affect how the site works.</p>'),
    ('Changes', f'<p>If we start using cookies in the future, for example for visitor statistics, we will update this cookie policy and ask for your consent first where required. Questions? E-mail <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>'),
]


def page_404(lang):
    nl = lang == 'nl'
    return f'''
<section class="tp-hero nf">
  <div class="wrap">
    <p class="nf__n" aria-hidden="true">404</p>
    <h1 class="h1" data-split>{'Pagina niet' if nl else 'Page not'} <span class="script">{'gevonden' if nl else 'found'}</span></h1>
    <p class="tp-hero__q" style="margin-top:24px">{'Deze pagina bestaat niet (meer). Misschien vindt u hieronder wat u zoekt.' if nl else 'This page does not exist (any more). Perhaps you will find what you are looking for below.'}</p>
    <div class="nf__links">{btn('Home', 'index.html' if nl else 'en.html', 'btn--solid')}{btn('Woning kopen' if nl else 'Buying property', 'woning-kopen.html' if nl else 'en-buying-property.html')}{btn('Doe de intake' if nl else 'Do the intake', 'intake.html' if nl else 'en-intake.html')}</div>
  </div>
</section>'''


# ---------------------------------------------------------------- Netlify: redirects from the old site, sitemap, robots
def netlify_files():
    lines = ['# Keep the build scripts private', '/_build/*  /404.html  404!', '', '# Old pc-spain.com (WordPress) addresses -> new pages']
    seen = set()
    old = {k: v for k, v in PAGES.items() if k and v.endswith('.html')}
    old.update({s: LISTING_FILES[s] for s in C['listings']})
    old.update({s: ART_FILES[s] for s in C['articles']})
    old.update({'category/*': 'woning-kopen.html', 'en/*': 'en.html'})
    for k, v in old.items():
        for path in (f'/{k}', f'/{k}/') if not k.endswith('*') else (f'/{k}',):
            if path in seen:
                continue
            seen.add(path)
            lines.append(f'{path:<60} /{v}  301')
    (OUT / '_redirects').write_text('\n'.join(lines) + '\n')
    pages = sorted(p.name for p in OUT.glob('*.html') if p.name != '404.html')
    urls = ''.join(f'  <url><loc>{SITE_URL}/{"" if p == "index.html" else p}</loc></url>\n' for p in pages)
    (OUT / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    # While the client reviews the site on Netlify it stays out of search engines. At launch on pc-spain.com
    # set ALLOW_INDEXING=1 when building (or edit robots.txt) so Google can index it.
    if os.environ.get('ALLOW_INDEXING') == '1':
        robots = f'User-agent: *\nAllow: /\nDisallow: /_build/\n\nSitemap: {SITE_URL}/sitemap.xml\n'
    else:
        robots = 'User-agent: *\nDisallow: /\n'
    (OUT / 'robots.txt').write_text(robots)


_build_en_v6 = build_en


def build_en():
    _build_en_v6()
    write('privacy.html', 'Privacybeleid - Property Consultancy Spain', 'Hoe Property Consultancy Spain omgaat met uw persoonsgegevens.',
          legal_page('privacy.html', 'nl', 'Privacy', 'beleid', 'Hoe wij omgaan met uw persoonsgegevens.', PRIV_NL, 'Privacybeleid'))
    write('cookies.html', 'Cookiebeleid - Property Consultancy Spain', 'Deze website gebruikt geen cookies.',
          legal_page('cookies.html', 'nl', 'Cookie', 'beleid', 'Deze website gebruikt geen cookies.', COOK_NL, 'Cookiebeleid'))
    write('en-privacy.html', 'Privacy policy - Property Consultancy Spain', 'How Property Consultancy Spain handles your personal data.',
          legal_page('en-privacy.html', 'en', 'Privacy', 'policy', 'How we handle your personal data.', PRIV_EN, 'Privacy policy'), lang='en')
    write('en-cookies.html', 'Cookie policy - Property Consultancy Spain', 'This website does not use cookies.',
          legal_page('en-cookies.html', 'en', 'Cookie', 'policy', 'This website does not use cookies.', COOK_EN, 'Cookie policy'), lang='en')
    write('404.html', 'Pagina niet gevonden - Property Consultancy Spain', 'Deze pagina bestaat niet (meer).', page_404('nl'))
    netlify_files()


# intake: link the consent line to the privacy policy
_intake_form_v6 = intake_form


def intake_form(lang):
    h = _intake_form_v6(lang)
    if lang == 'nl':
        return h.replace('over deze aanvraag.</span>', 'over deze aanvraag (zie ons <a href="privacy.html">privacybeleid</a>).</span>')
    return h.replace('about this request.</span>', 'about this request (see our <a href="en-privacy.html">privacy policy</a>).</span>')


# ---------------------------------------------------------------- contact v2: discreet button + slide-in panel
def contact_fab(lang):
    nl = lang == 'nl'
    L = (lambda a, b: a if nl else b)
    msg = L('Hallo PC-Spain, ik heb een vraag over het kopen van een woning in Spanje.', 'Hello PC-Spain, I have a question about buying a property in Spain.')
    wa = 'https://wa.me/' + PHONE_TEL.lstrip('+') + '?text=' + msg.replace(' ', '%20').replace(',', '%2C')
    rows = [
        (wa, WA_SVG, 'WhatsApp', L('Stuur ons direct een bericht', 'Send us a message directly'), ' target="_blank" rel="noopener"'),
        (f'tel:{PHONE_TEL}', PHONE_SVG, L('Bellen', 'Call us'), PHONE, ''),
        (f'mailto:{EMAIL}', MAIL_SVG, 'E-mail', EMAIL, ''),
    ]
    items = ''.join(f'<li><a href="{h}"{x}><span class="cd__ic">{ic}</span><span class="cd__tx"><b>{t}</b><small>{s}</small></span><span class="cd__go" aria-hidden="true">{ARROW}</span></a></li>' for h, ic, t, s, x in rows)
    return f'''
<button class="cbtn" type="button" data-copen aria-controls="cdrawer" aria-expanded="false">{PHONE_SVG}<span>Contact</span></button>
<div class="cd" id="cdrawer" data-cd aria-hidden="true">
  <div class="cd__shade" data-cclose></div>
  <aside class="cd__panel" role="dialog" aria-modal="true" aria-labelledby="cd-title">
    <button class="cd__close label" type="button" data-cclose><i></i>{L('Sluiten', 'Close')}</button>
    <span class="label label--brass">Property Consultancy Spain</span>
    <h2 class="cd__title" id="cd-title">{L('Spreek met een', 'Talk to an')} <span class="script">{L('adviseur', 'adviser')}</span></h2>
    <p class="cd__lead">{L('Heeft u een vraag over een woning of belegging in Spanje? Wij helpen u graag verder.', 'Do you have a question about a property or investment in Spain? We are happy to help.')}</p>
    <ul class="cd__list">{items}</ul>
    <dl class="cd__meta">
      <div><dt class="label">{L('Openingstijden', 'Opening hours')}</dt><dd>{L('Maandag- Zaterdag: 10:00 - 18:00', 'Monday - Saturday: 10:00 - 18:00')}</dd></div>
      <div><dt class="label">{L('Kantoren', 'Offices')}</dt><dd>Valencia · Dénia · Amsterdam · Barcelona</dd></div>
    </dl>
    <a class="btn btn--solid cd__cta" href="{'intake.html' if nl else 'en-intake.html'}">{L('Doe de intake', 'Do the intake')} {ARROW}</a>
  </aside>
</div>'''
