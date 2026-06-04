<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:scope-admin-only -->
# Scope: solo admin (home bloccata)

Da qui in avanti **non modificare la sezione home / sito pubblico** salvo richiesta esplicita dell'utente.

## Fuori scope (non toccare)

- Homepage e sezioni pubbliche: `app/page.tsx`, `components/sections/` (hero, contatti, listing showcase, listing row, ecc.)
- Layout pubblico: `components/layout/` (Navbar, Footer, SiteChrome) — salvo necessità admin
- Stili homepage in `app/globals.css` legati a hero, listing row, editorial showcase, home contact
- Pagine inventario/dettaglio auto lato pubblico (`app/inventory/`, `components/car/`)

## In scope (ok modificare)

- Admin: `app/admin/**`, `components/admin/**`
- API e dati usati dall'admin (es. route annunci, upload, media store)
- Stili o componenti **nuovi e dedicati** all'admin, preferibilmente scoped sotto `/admin`

Se un fix richiede cambi in home, **fermarsi e chiedere** prima di procedere.
<!-- END:scope-admin-only -->
