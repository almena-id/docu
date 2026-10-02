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

The portals' header and footer, as in catalog, through Starlight component overrides (`components` in `astro.config.mjs`). The header (`src/components/Header.astro`) holds only the brand: `src/components/SiteTitle.astro`, the Almena mark (`src/components/Logo.astro`, in the identity colour) and "Almena **Docs**" in Chakra Petch, in the text colour. There is no search box (`pagefind: false`) and no social links. It is 53px tall, on the page background at 80% with a blur.

Header, sidebar, content and footer share catalog's page frame, set in `src/styles/layout.css`: up to `--page-width` (1920px) and centred, with `--gutter` (`clamp(16px, 3vw, 48px)`) on each side. Backgrounds and borders run across the whole width; what they hold starts at the gutter, so the brand, the sidebar's links and the footer line up. Starlight's header and sidebar are fixed and cannot be centred with margins, so on screens wider than the frame everything takes the same `--frame-offset` (`--frame-pad` is the offset plus the gutter): the header through `--sl-nav-pad-x`, the sidebar's position and the main frame's padding in `src/components/PageFrame.astro`, the footer's padding. Content and the table of contents keep the gutter on their outer sides (`--sl-content-pad-x`), and the sidebar is as much wider than Starlight's as the gutter adds to its 1rem. The text takes the whole width of the content column (`--sl-content-width: 100%`), between the sidebar and the table of contents, on every page, instead of Starlight's 45rem (67.5rem without a sidebar). The footer (`src/components/SiteFooter.astro`) comes after everything else, placed by `src/components/PageFrame.astro` (Starlight's own with the footer added after the main frame, which grows to keep it at the bottom of a short page, and the sidebar and the main frame placed within the page frame): across the whole width like the header, above the fixed sidebar. It holds the mark and the name, then "© year Almena ID · almena.id" and catalog's language and theme menus: `src/components/ChoiceMenu.astro` (catalog's `ChoiceMenu`: a ghost trigger with an icon and the current choice, opening above it a titled list with a dot on the current one, operable with the keyboard), used by `LanguageMenu.astro` (each language named in itself, leading to the same page in it) and `ThemeMenu.astro` (System, Light, Dark, with Lucide icons from `LucideIcon.astro`, kept in Starlight's `localStorage` key `starlight-theme` so Starlight's ThemeProvider applies it before the page paints). Starlight's own footer (edit link, last update, pagination) stays in the content column. `src/components/MobileMenuFooter.astro` is empty, so the menus appear only in the footer.

## Languages

English and Spanish, through Starlight's i18n (`locales` in `astro.config.mjs`): English is the root locale (`src/content/docs/`, paths without a prefix) and the default, Spanish lives in `src/content/docs/es/` under `/es/`. Every page is written in both, with the same file name; a page not yet translated shows the English one with Starlight's notice. Sidebar labels take a `translations: { es: … }`. Starlight translates its own UI; the footer's strings (`almena.*`) are in `src/content/i18n/en.json` and `es.json`, declared in `src/content.config.ts`.

## Tab title and icon

The browser tab reads "Page · Almena Docs", as in catalog, and just "Almena Docs" on each language's home page: `src/routeData.ts` (Starlight `routeMiddleware`) rewrites Starlight's `<title>`. The tab icon, `public/favicon.svg`, is the Almena mark in docu's yellow.
