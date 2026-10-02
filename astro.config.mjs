// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
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
			// No search box: the header is the portals' one, as in catalog.
			pagefind: false,
			components: {
				Head: './src/components/Head.astro',
				Header: './src/components/Header.astro',
				MobileMenuFooter: './src/components/MobileMenuFooter.astro',
				SiteTitle: './src/components/SiteTitle.astro',
				PageFrame: './src/components/PageFrame.astro',
			},
			sidebar: [
				{
					label: 'Guides',
					translations: { es: 'Guías' },
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', translations: { es: 'Guía de ejemplo' }, slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					translations: { es: 'Referencia' },
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
