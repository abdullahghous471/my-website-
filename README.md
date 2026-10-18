# Helmwork – Abdullah's portfolio

Static site in this folder (`index.html`, `assets/`). No build step.

## Put it online free (Cloudflare)
1. Cloudflare dashboard → **Compute (Workers & Pages)** → **Create** → **Import a repository** → `abdullahghous471/my-website-`.
2. Project name `helmwork` (gives `helmwork.<your-subdomain>.workers.dev`).
3. Settings: production branch `claude/laughing-gauss-fl0bjn`, **root directory `portfolio`**, build command empty, deploy command `npx wrangler deploy`.
4. Later add your own domain under **Settings → Domains & Routes**.

## Change the brand name
Search for `Helmwork` in `index.html`, `404.html` and `assets/img/og.jpg` (re-render) and replace it.
