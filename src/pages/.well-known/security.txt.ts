import type { APIRoute } from 'astro';

// Where to report a vulnerability (RFC 9116): privately, through the
// repository's GitHub.
const repository = 'https://github.com/almena-id/docu';

// security.txt must expire, in less than a year (RFC 9116 §2.5.5). The site is
// static, so it is written when the site is built: every build pushes it 180
// days ahead — as the other Almena services keep theirs. CI rebuilds and
// publishes the site on every merge into main; half a year, rather than the
// most the RFC allows, leaves months to notice and rebuild should merges stop,
// before a reader finds it expired.
const ttlDays = 180;

export const GET: APIRoute = () => {
	const expires = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
	return new Response(
		[
			`Contact: ${repository}/security/advisories/new`,
			`Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
			'Canonical: https://docs.almena.id/.well-known/security.txt',
			`Policy: ${repository}/security/policy`,
			'Preferred-Languages: en, es',
			'',
		].join('\n'),
	);
};
