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
