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
			title: 'My Docs',
			customCss: ['./src/styles/fonts.css'],
			components: { Head: './src/components/Head.astro' },
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
