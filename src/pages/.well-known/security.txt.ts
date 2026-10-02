import type { APIRoute } from 'astro';

// Where to report a vulnerability (RFC 9116): privately, through the
// repository's GitHub.
const repository = 'https://github.com/almena-id/docu';

// security.txt must expire, in less than a year. The site is static, so it is
// written when the site is built: every build pushes it a year ahead, less a day.
const ttlDays = 364;

export const GET: APIRoute = () => {
	const expires = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
	return new Response(
		[
			`Contact: ${repository}/security/advisories/new`,
			`Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
			`Policy: ${repository}/security/policy`,
			'Preferred-Languages: en, es',
			'',
		].join('\n'),
	);
};
