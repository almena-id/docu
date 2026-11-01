import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
	// A home page may carry the trust triangle's words in its language
	// (`trust`): src/components/Hero.astro draws it beside the hero's text.
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				trust: z
					.object({
						label: z.string(),
						issuer: z.object({ title: z.string(), text: z.string() }),
						holder: z.object({ title: z.string(), text: z.string() }),
						verifier: z.object({ title: z.string(), text: z.string() }),
						gives: z.string(),
						shows: z.string(),
						checks: z.string(),
					})
					.optional(),
			}),
		}),
	}),
	// Starlight's UI strings per language (src/content/i18n/<lang>.json), plus
	// the footer's own, as catalog names them.
	i18n: defineCollection({
		loader: i18nLoader(),
		schema: i18nSchema({
			extend: z.object({
				'almena.rights': z.string().optional(),
				'almena.language': z.string().optional(),
				'almena.theme': z.string().optional(),
				'almena.theme.auto': z.string().optional(),
				'almena.theme.light': z.string().optional(),
				'almena.theme.dark': z.string().optional(),
			}),
		}),
	}),
};
