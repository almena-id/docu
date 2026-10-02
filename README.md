# almena-docu

The documentation site of the Almena Network, in English and Spanish: guides and reference for the people and entities that use the platform. Built with [Astro](https://astro.build) 7 and [Starlight](https://starlight.astro.build), as a static site.

## Quick start

Needs Node.js 24 or later, [pnpm](https://pnpm.io), [Task](https://taskfile.dev) and Docker.

```bash
task init     # .env from .env.example
task dev      # the site with hot reload on http://localhost:4322
task build    # the static site in dist/
task preview  # serves dist/ locally
```

To run the production build in Docker instead (the static site served by nginx):

```bash
task up      # builds the image and starts it
task health  # ok
```

## Configuration

Read from the environment or `.env`; [.env.example](.env.example) explains it.

| Variable | Default | |
|---|---|---|
| `DOCU_PORT` | `4322` | Port of `task dev`, `task preview` and the Docker container on the host |

## Endpoints

| | |
|---|---|
| `GET /` | The documentation |
| `GET /health` | Liveness, used by the Docker health check |
| `GET /.well-known/security.txt` | Where to report a vulnerability ([RFC 9116](https://www.rfc-editor.org/rfc/rfc9116)): this repository's private advisories; written at build time, `Expires` a year ahead less a day |

## Layout

| | |
|---|---|
| `src/content/docs/` | The pages, in Markdown or MDX; each file is a route named after its path. English at the root, Spanish in `es/` (served under `/es/`) |
| `src/content/i18n/` | The footer's UI strings per language (`en.json`, `es.json`) |
| `src/assets/` | Images embedded in the pages through relative links |
| `src/styles/` | Starlight `customCss`: the identity colour (`theme.css`), the typefaces (`fonts.css`) and the page frame shared by header, sidebar, content and footer (`layout.css`) |
| `src/components/` | Overrides of Starlight components: the typefaces (`Head.astro`), the portals' header and footer (`Header.astro`, `SiteTitle.astro`, `SiteFooter.astro` placed by `PageFrame.astro`, and the footer's language and theme menus) |
| `src/pages/` | Routes outside the docs: `.well-known/security.txt.ts`, generated when building |
| `src/routeData.ts` | The browser tab's title ("Page · Almena Docs") |
| `public/` | Static files served as they are (the favicon, the Almena mark in yellow) |
| `astro.config.mjs` | Site title, sidebar and the typefaces, through Astro's Fonts API |

The typefaces (Chakra Petch, Inter, JetBrains Mono) are downloaded when building and served from `dist/`, never from Google by the visitor. Docu's identity colour is yellow `#f2b705`; [CLAUDE.md](CLAUDE.md) explains how it reads on each theme.

## Development

`task --list` shows every task. Before sending a change, `task check` (a production build) must pass; see [CONTRIBUTING.md](CONTRIBUTING.md). This Astro version differs from older ones: [AGENTS.md](AGENTS.md) points to the guides to read first.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

Licensed under the [Apache License 2.0](LICENSE).
