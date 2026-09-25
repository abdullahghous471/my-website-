# Putting the PC-Spain website online

The website is the `pc-spain/` folder: finished HTML, CSS, JavaScript, images and videos.
There is nothing to build on the server. `netlify.toml` (in this folder) tells Netlify to publish `pc-spain/`.

## Phase 1 – free review site on Netlify

1. Merge the pull request into `main` on GitHub (or keep using the branch – see step 4).
2. Go to <https://app.netlify.com> and sign up with GitHub.
3. **Add new site → Import an existing project → GitHub**, and pick `abdullahghous471/my-website-`.
4. Choose the branch to publish (`main`, or `claude/laughing-gauss-fl0bjn`).
   Netlify reads `netlify.toml`, so leave the build settings as they are:
   base directory `pc-spain`, build command filled in, publish directory `pc-spain`.
5. Click **Deploy**. After about a minute the site is live on an address like `https://random-name.netlify.app`.
6. **Site configuration → Change site name** to something readable, e.g. `pc-spain-preview` → `https://pc-spain-preview.netlify.app`.
7. Every new push to that branch updates the site automatically.

While the client reviews the site, `pc-spain/robots.txt` keeps it out of Google.

### Intake form – one-time activation
The intake form sends every submission to **info@pc-spain.com** through FormSubmit.
The **first** time someone submits the form on the live site, FormSubmit sends an activation e-mail to
info@pc-spain.com. Open it and click **Activate**. From then on, every intake arrives as an e-mail.
Do one test submission yourself right after going live so the client can activate it.

## Phase 2 – move pc-spain.com to the new site (after the client approves)

1. **Let Google index the site:** rebuild with `ALLOW_INDEXING=1 python3 pc-spain/_build/build.py`
   (or replace `pc-spain/robots.txt` with the version described in `_build/pages_v7.py`), commit and push.
2. In Netlify: **Domain management → Add a domain** → `pc-spain.com`, and also add `www.pc-spain.com`.
3. Netlify shows the DNS records to use. At the company where pc-spain.com is registered, change:
   - the **A record** for `pc-spain.com` to Netlify’s load balancer IP (shown in Netlify, currently `75.2.60.5`), and
   - the **CNAME** for `www` to `your-site-name.netlify.app`.

   (Alternative: switch the domain’s nameservers to Netlify DNS – Netlify shows the four nameservers.)

   **Do not touch the MX records** – those deliver the e-mail for info@pc-spain.com.
4. Wait for DNS to update (minutes to a few hours). Netlify then issues the free HTTPS certificate automatically.
5. Old WordPress addresses (e.g. `/werkwijze/`, property and article pages) are forwarded to the new pages by
   `pc-spain/_redirects`, so existing Google results and links keep working.
6. In Google Search Console, add `https://pc-spain.com` and submit `https://pc-spain.com/sitemap.xml`.
7. Keep the old WordPress hosting for a few weeks as a backup, then cancel it.

## Editing content later
Content lives in `pc-spain/_build/` (Python files). After a change run `python3 pc-spain/_build/build.py`,
then commit and push – Netlify republishes automatically.
