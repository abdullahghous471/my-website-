# Helmwork – Abdullah's portfolio

Static site in this folder (`index.html`, `assets/`). No build step.
Older design versions live in `versions/` and are not published (see `.assetsignore`).

## Put it online free (Cloudflare)
1. Cloudflare dashboard → **Compute (Workers & Pages)** → **Create** → **Import a repository** → `abdullahghous471/my-website-`.
2. Project name: `helmwork`.
3. Settings:
   | Setting | Value |
   |---|---|
   | Production branch | `claude/laughing-gauss-fl0bjn` |
   | Root directory | `portfolio` |
   | Build command | *(empty)* |
   | Deploy command | `npx wrangler deploy` |
   *Alternative if Cloudflare says the root directory is not found:* leave Root directory empty (`/`)
   and use the deploy command `npx wrangler deploy --config portfolio/wrangler.jsonc`.
4. **Save and Deploy.** The site goes live at `https://helmwork.<your-subdomain>.workers.dev`.
   Every push to the branch republishes it automatically.

## SEO: the site address
The address is written in `index.html` (canonical, Open Graph, structured data), `sitemap.xml` and `robots.txt`.
It is set to `https://helmwork.pc-spain.workers.dev/`. If Cloudflare gives a different address, or when you add
your own domain (Settings → Domains & Routes), replace that address in those three files and push.
Then add the site in Google Search Console and submit `sitemap.xml`.

## Bookings
Booking requests go to abdullahghous412@gmail.com through FormSubmit. The first request sends a one-time
"Activate" e-mail to that inbox: click it once.
