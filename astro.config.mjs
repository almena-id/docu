// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';

// https://astro.build/config
export default defineConfig({
	// `task dev` behind the proxy (../develop): let the portal's public host
	// reach the dev server.
	server: {
		allowedHosts: ['docs.almena.id'],
	},
	// The portals' typefaces, downloaded when building and served from dist/
	// (never from Google by the visitor): Chakra Petch for the brand and the
	// headings, Inter for the text, JetBrains Mono for code. Starlight takes
	// them through src/components/Head.astro and src/styles/fonts.css.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Chakra Petch',
			cssVariable: '--font-brand',
			weights: [500, 600, 700],
			subsets: ['latin'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--font-sans',
			weights: [400, 500, 600],
			subsets: ['latin'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			weights: [400, 500],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],
	integrations: [
		starlight({
			title: 'Almena Docs',
			// English at the root (/guides/…), Spanish under /es/ (src/content/docs/es/).
			// A page not yet translated shows the English one with a notice.
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				es: { label: 'Español', lang: 'es' },
			},
			// The tab's title, as in catalog (src/routeData.ts).
			titleDelimiter: '·',
			routeMiddleware: './src/routeData.ts',
			customCss: ['./src/styles/theme.css', './src/styles/fonts.css', './src/styles/layout.css'],
			components: {
				Head: './src/components/Head.astro',
				Header: './src/components/Header.astro',
				Hero: './src/components/Hero.astro',
				MobileMenuFooter: './src/components/MobileMenuFooter.astro',
				SiteTitle: './src/components/SiteTitle.astro',
				PageFrame: './src/components/PageFrame.astro',
			},
			// Five topics, each with its own sidebar (starlight-sidebar-topics): the
			// shared concepts, a door per audience — using Almena, integrating
			// with it, building it — and the generated reference.
			plugins: [
				starlightSidebarTopics(
					[
						{
							label: { en: 'Concepts', es: 'Conceptos' },
							link: '/concepts/',
							icon: 'information',
							items: ['concepts', 'concepts/credential-life', 'concepts/glossary'],
						},
						{
							label: { en: 'Use Almena', es: 'Usar Almena' },
							link: '/use/',
							icon: 'open-book',
							items: [
								'use',
								{
									label: 'Your wallet',
									translations: { es: 'Tu wallet' },
									items: ['use/wallet', 'use/wallet/apply', 'use/wallet/credentials', 'use/wallet/show'],
								},
								{
									label: 'Your organisation',
									translations: { es: 'Tu organización' },
									items: [
										'use/organisation',
										'use/organisation/sign-in',
										'use/organisation/issuers',
										'use/organisation/applications',
									],
								},
							],
						},
						{
							label: { en: 'Integrate', es: 'Integrar' },
							link: '/integrate/',
							icon: 'puzzle',
							items: [
								'integrate',
								'integrate/quick-start',
								{
									label: 'Protocols',
									translations: { es: 'Protocolos' },
									items: [{ autogenerate: { directory: 'integrate/protocols' } }],
								},
							],
						},
						{
							label: { en: 'Build', es: 'Construir' },
							link: '/build/',
							icon: 'setting',
							items: ['build', 'build/architecture'],
						},
						{
							label: { en: 'Reference', es: 'Referencia' },
							link: '/reference/',
							icon: 'document',
							items: [
								'reference',
								'reference/errors',
								// Generated (`task refs`): the API from its OpenAPI document,
								// the CLI from its own help.
								{
									label: 'API',
									collapsed: true,
									items: [{ autogenerate: { directory: 'reference/api' } }],
								},
								{
									label: 'CLI',
									collapsed: true,
									items: [{ autogenerate: { directory: 'reference/cli' } }],
								},
							],
						},
					],
					// The home page belongs to no topic.
					{ exclude: ['/', '/es/'] },
				),
			],
		}),
	],
});
