import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

/**
 * The browser tab's title, as in catalog: "Page · Almena Docs", and only
 * "Almena Docs" on each language's home page.
 */
export const onRequest = defineRouteMiddleware(({ locals }) => {
	const route = locals.starlightRoute;
	const title = route.head.find((item) => item.tag === 'title');
	if (!title) return;
	const isHome = route.id === (route.locale ?? '');
	title.content = isHome ? route.siteTitle : `${route.entry.data.title} · ${route.siteTitle}`;
});
