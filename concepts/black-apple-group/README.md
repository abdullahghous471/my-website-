# Black Apple Group · homepage redesign (concept)

Static homepage concept for blackapplegroup.com. Open `index.html` through any static server, e.g. `python3 -m http.server` in this folder.

- `assets/js/hero.js`: Three.js hero (black apple, gold rings). Pauses off screen; still frame for reduced motion; logo fallback without WebGL.
- `assets/js/main.js`: calculator, lead form with TCPA consent, booking picker, video modal, mobile call/book bar, `dataLayer` events for GA4 / Meta Pixel.
- Forms are front-end only in this concept. Connect them to the CRM / email service and the booking picker to Calendly or Google Calendar before launch.
- `noindex` is set so the concept is never indexed. Remove it at launch.
