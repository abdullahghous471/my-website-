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
