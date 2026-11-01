## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Typefaces

The portals' typefaces, through Astro's Fonts API (`fonts` in `astro.config.mjs`, downloaded when building, never from Google by the visitor): Chakra Petch (`--font-brand`: site title and headings), Inter (`--font-sans`, Starlight's `--sl-font`), JetBrains Mono (`--font-mono`, Starlight's `--sl-font-mono`). `src/components/Head.astro` overrides Starlight's `Head` to add them; `src/styles/fonts.css` (Starlight `customCss`) applies them.

## Identity colour

Yellow `#f2b705` is docu's identity, the same in both themes: Starlight's `--sl-color-accent*` in `src/styles/theme.css` (Starlight `customCss`). On the dark theme it is also the text accent; on the light one, links take a dark gold of the same hue (`#6b4f00`), since yellow text cannot be read on white, while backgrounds, highlights, the Almena mark and the primary button keep the yellow (with dark text).

## Header and footer

The portals' header and footer, as in catalog, through Starlight component overrides (`components` in `astro.config.mjs`). The header (`src/components/Header.astro`) holds the brand — `src/components/SiteTitle.astro`, the Almena mark (`src/components/Logo.astro`, in the identity colour) and "Almena **Docs**" in Chakra Petch, in the text colour — and, at the far end, Starlight's search (Pagefind; on a phone only its button). No social links. It is 53px tall, on the page background at 80% with a blur.

Header, sidebar, content and footer share catalog's page frame, set in `src/styles/layout.css`: up to `--page-width` (1920px) and centred, with `--gutter` (`clamp(16px, 3vw, 48px)`) on each side. Backgrounds and borders run across the whole width; what they hold starts at the gutter, so the brand, the sidebar's links and the footer line up. Starlight's header and sidebar are fixed and cannot be centred with margins, so on screens wider than the frame everything takes the same `--frame-offset` (`--frame-pad` is the offset plus the gutter): the header through `--sl-nav-pad-x`, the sidebar's position and the main frame's padding in `src/components/PageFrame.astro`, the footer's padding. Content and the table of contents keep the gutter on their outer sides (`--sl-content-pad-x`), and the sidebar is as much wider than Starlight's as the gutter adds to its 1rem. The text takes the whole width of the content column (`--sl-content-width: 100%`), between the sidebar and the table of contents, on every page, instead of Starlight's 45rem (67.5rem without a sidebar). The footer (`src/components/SiteFooter.astro`) comes after everything else, placed by `src/components/PageFrame.astro` (Starlight's own with the footer added after the main frame, which grows to keep it at the bottom of a short page, and the sidebar and the main frame placed within the page frame): across the whole width like the header, above the fixed sidebar. It holds the mark and the name, then "© year Almena ID · almena.id" and catalog's language and theme menus: `src/components/ChoiceMenu.astro` (catalog's `ChoiceMenu`: a ghost trigger with an icon and the current choice, opening above it a titled list with a dot on the current one, operable with the keyboard), used by `LanguageMenu.astro` (each language named in itself, leading to the same page in it) and `ThemeMenu.astro` (System, Light, Dark, with Lucide icons from `LucideIcon.astro`, kept in Starlight's `localStorage` key `starlight-theme` so Starlight's ThemeProvider applies it before the page paints). Starlight's own footer (edit link, last update, pagination) stays in the content column. `src/components/MobileMenuFooter.astro` is empty, so the menus appear only in the footer.

## Languages

English and Spanish, through Starlight's i18n (`locales` in `astro.config.mjs`): English is the root locale (`src/content/docs/`, paths without a prefix) and the default, Spanish lives in `src/content/docs/es/` under `/es/`. Every page is written in both, with the same file name; a page not yet translated shows the English one with Starlight's notice. Sidebar labels take a `translations: { es: … }`. Starlight translates its own UI; the footer's strings (`almena.*`) are in `src/content/i18n/en.json` and `es.json`, declared in `src/content.config.ts`.

## Tab title and icon

The browser tab reads "Page · Almena Docs", as in catalog, and just "Almena Docs" on each language's home page: `src/routeData.ts` (Starlight `routeMiddleware`) rewrites Starlight's `<title>`. The tab icon, `public/favicon.svg`, is the Almena mark in docu's yellow.

## Organisation

The home page (each language's `index.mdx`, Starlight's splash) draws the trust triangle beside the hero's text — text on the left, drawing on the right, on one line from 50rem up, the drawing under the text on a phone: `src/components/Hero.astro` overrides Starlight's `Hero` when the page's frontmatter gives the drawing's words (`trust`, declared in `src/content.config.ts`); any other hero is Starlight's own.

Three audiences, each with its door, over two shared layers, as topics of `starlight-sidebar-topics` (`plugins` in `astro.config.mjs`), each with its own sidebar; the home page belongs to none:

- **Concepts** (`concepts/`): how Almena works, the life of a credential and the glossary, for everyone — no technical words.
- **Use Almena** (`use/`): the end user's guides, in two halves — **Your wallet** (`use/wallet/`, the holder: setting it up, applying in the catalog — searching it, an issuer's page, the applications kept in the browser —, the credentials held, showing one, messages and calls, settings) and **Your organisation** (`use/organisation/`, an account in the registry: signing in, what waits (pending, activity, health), then sidebar groups — giving credentials (issuers, forms, applications), checking them (verifiers and the Verify tab), publishing and queues, templates, and the account itself (settings and signing, domains, users, subscription, profile and API tokens)), then **Good to know** for both: choosing a mediator (`use/mediator`) and the status page (`use/status`). Written for people who know nothing technical: short sentences, the buttons' exact words in bold (as each portal's messages say them, in each language), a screenshot of every screen and a diagram wherever a flow is explained.
- **Integrate** (`integrate/`): whoever connects their systems — the API, the CLI, the standards spoken; a quick start; verifying by QR from its own systems (`integrate/verify-by-qr`); an issuer's or verifier's AMQP queue and its messages (`integrate/queues`), the API's MCP endpoint and its tools (`integrate/mcp`), the A2A agent and its token, limits and per-account tasks (`integrate/agent`); the protocols (`integrate/protocols/`: which standard at each step, and Almena's own specifications, published from their repositories).
- **Build** (`build/`): whoever works on the platform — what every change keeps, the architecture. In English only, like the code: the Spanish side has a landing that says so and links to it.
- **Reference** (`reference/`): generated, never written by hand — the API (every operation and schema), the CLI (every command) and the errors (`ErrorCodes.astro`); the technical pages in English only.

Spanish speaks of **el** wallet, as the portals and the wallet itself do.

## Diagrams and screenshots

The documentation's components are in `src/components/docs/`, imported as `@docs/…` (`tsconfig.json` paths): `Icon` (the Lucide icons they use, `@lucide/astro`, by name, inline at build time), `TrustTriangle` (issuer, holder, verifier; wide, or one above the other on a phone; its boxes wider than the drawing so long words in any language fit), `Flow` (numbered steps with icons, side by side or stacked), `Paths` (large cards leading somewhere), `Architecture` (the projects in layers), `Screenshot` and `Mark`. Their words come from the page, in its language; their colours are Starlight's tokens, so they follow the theme. Everything fits a 320px phone.

`Screenshot` shows a portal's screen in the page's language and the site's theme (both pictures are there, CSS picks one), opening at full size when pressed, with numbered yellow marks over it; the text names the same numbers with `<Mark n={…} />`. The pictures (`src/assets/screenshots/{lang}/{theme}/{name}.webp`) and where each mark sits (`src/data/screenshots.json`, in percent, found by selectors that do not depend on the language) are generated and committed: `task demo` serves the real API (a `../api` checkout) on SQLite with a demo account — Nova University, its issuers, verifiers, weeks of activity and applications a holder really sent and signed (`scripts/demo_api.py`, on the API's test helpers) —, then registry and catalog are served against it (`REGISTRY_API_URL` / `CATALOG_API_URL` = `http://127.0.0.1:8766`, production builds on 3107 and 3199) and `task screenshots` (`scripts/screenshots.mjs`, Playwright) takes each screen of its list in every language and theme (`SHOTS=name,name` retakes only those). A new screen is a new entry there; retake them all when a portal changes. The status page's (`status-home`) comes from `../status` served on its own history (`STATUS_URL`, default `http://localhost:3200`); it is English-only and dark-only, so every language and theme takes the same picture, and offline its probes show **No data**. The seed also has a published verifier (Campus Access), a form asking for a membership card, a domain awaiting its TXT record, an invitation, the academic office's queue and an API token; no wallet answers the Verify tab's code there, so `registry-verify-result` writes the verdict of Amina's card into the demo's database (`.demo/demo.db`) while the tab polls.

The wallet's screens (`wallet-*`) are its real interface, `pnpm dev` in `../wallet` (port 1420), in a phone-sized browser: `scripts/wallet-mock.js` stands in for its Rust side (Tauri's IPC, `window.__TAURI_INTERNALS__`) with a demo identity and credentials, each scene — new, locked, a link to open with its request (or a contact's or mediator's invitation: `kind`, `details`), a computer (`platform: "desktop"`), no mediator (`mediator: "none"`) — set per screen by `scripts/wallet-screenshots.mjs` (`SHOTS=` as for the portals), which merges its marks with the portals'. The mock also holds three contacts and a conversation, and `window.__MOCK_EMIT__(event, payload)` raises an event the Rust side would emit (an incoming call is a `call-signal` offer). On a page they are `<Screenshot phone />` — narrow and centred, or side by side in `<Screens>`; `from` numbers a second screen's marks on from the first's.

`task refs` regenerates what is generated from the other repositories: `src/data/openapi.json` from `../api` (`scripts/openapi.py`), then the API reference (`reference/api/`: a page per tag, every operation and schema, `scripts/api-reference.mjs`), the CLI reference (`reference/cli/`: a page per command group, from the `../almena` binary's own help, built first — `scripts/cli-reference.mjs`) and the protocols (`integrate/protocols/mediator.md` and `wallet.md`: `SPEC.md` of `../mediator` and `../wallet` as they are, `scripts/protocols.mjs`). Never edit those pages; an error code in a response links to its anchor on the errors page only when the API's `x-refusals` has it. The errors page reads the API's `x-refusals` and `x-presentation-problems` (its `refusals.py`) at build time.

## Links and headers

The build checks every internal link and its `#fragment` (`starlight-links-validator`, in `plugins`): a link to a page or a heading that does not exist fails `task build`. The errors page's anchors are made by `ErrorCodes.astro`, which the checker cannot read, so `astro.config.mjs` accepts a link to one of them when `src/data/openapi.json` has that code. On the not-found page the footer's languages lead to each language's home page (`LanguageMenu.astro`).

`nginx.conf` serves `dist/` with security headers on every answer: a Content-Security-Policy for a static Starlight site (everything from this origin; inline scripts and styles, which Starlight writes, and WebAssembly for Pagefind; `frame-ancestors 'none'`), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy` — repeated in `/_astro/`, since a location's own `add_header` drops the server's. `/.well-known/security.txt` is written at build time with `Expires` 180 days ahead: CI rebuilds on every merge, and half a year leaves time to notice should merges stop.
