# Putting the PC-Spain website online (Cloudflare Pages – free)

The website is the `pc-spain/` folder: finished HTML, CSS, JavaScript, images and videos.
Cloudflare Pages hosts it for free, also for a business site, with no limit on visitors or bandwidth.
Every push to the GitHub branch updates the live site automatically.

## Phase 1 – free review site on Cloudflare Pages

1. Go to <https://dash.cloudflare.com/sign-up> and create a free account (confirm the e-mail).
2. In the left menu open **Compute (Workers & Pages)** → **Create** → tab **Pages** → **Connect to Git**.
3. Connect **GitHub**, allow access to **abdullahghous471/my-website-**, select it and click **Begin setup**.
4. Fill in:
   | Setting | Value |
   |---|---|
   | Project name | `pc-spain` (gives the address `pc-spain.pages.dev`) |
   | Production branch | `claude/laughing-gauss-fl0bjn` |
   | Framework preset | **None** |
   | Build command | `rm -rf _build` |
   | Build output directory | `.` |
   | Root directory (advanced) | `pc-spain` |
5. Click **Save and Deploy**. After about a minute the site is live at `https://pc-spain.pages.dev`.
6. In Netlify: **Site configuration → Build & deploy → Stop builds** (or delete the Netlify site), so it no longer uses credits.

Notes
- Addresses look cleaner on Cloudflare: `pc-spain.pages.dev/werkwijze` instead of `…/werkwijze.html`. Old links with `.html` keep working (they are forwarded automatically).
- `pc-spain/_headers` holds the caching and security settings; `pc-spain/_redirects` forwards the old WordPress addresses.
- While the client reviews the site, `pc-spain/robots.txt` keeps it out of Google.

### Intake form and chat – one-time activation
The intake form and the "Bel mij terug" form in the chat send to **info@pc-spain.com** through FormSubmit (independent of the host).
The **first** submission triggers an activation e-mail to info@pc-spain.com: open it and click **Activate**.

## Phase 2 – move pc-spain.com to the new site (after the client approves)

1. **Let Google index the site:** rebuild with `ALLOW_INDEXING=1 python3 pc-spain/_build/build.py`, commit and push.
2. In Cloudflare: **Websites → Add a domain** → `pc-spain.com` → choose the **Free** plan.
   Cloudflare copies the existing DNS records. **Check that the MX records (e-mail for info@pc-spain.com) are in the list** before continuing.
3. Cloudflare shows two nameservers. At the company where pc-spain.com is registered, replace the nameservers with these two.
   (E-mail keeps working because the MX records were copied.)
4. When the domain shows **Active** in Cloudflare: open the Pages project **pc-spain → Custom domains → Set up a custom domain**,
   add `pc-spain.com`, then add `www.pc-spain.com` as well. Cloudflare creates the records and the free HTTPS certificate.
5. Old WordPress addresses (e.g. `/werkwijze/`, property and article pages) are forwarded to the new pages, so existing Google results keep working.
6. In Google Search Console, add `https://pc-spain.com` and submit `https://pc-spain.com/sitemap.xml`.
7. Keep the old WordPress hosting for a few weeks as a backup, then cancel it.

## Editing content later
Content lives in `pc-spain/_build/` (Python files). After a change run `python3 pc-spain/_build/build.py`,
then commit and push – Cloudflare republishes automatically.
