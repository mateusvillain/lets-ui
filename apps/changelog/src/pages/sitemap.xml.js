/**
 * Every page in every locale, with its language alternates, so search
 * engines index each language on its own URL.
 */
import { DEFAULT_LOCALE, LOCALES, localePath } from '@/lib/i18n.js';
import { isTranslated, loadReleases } from '@/lib/releases.js';

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function GET({ site }) {
  const locales = Object.keys(LOCALES);
  const url = (locale, path) => new URL(localePath(locale, path), site).href;
  const pages = [
    { path: '/', translated: true },
    { path: '/releases/', translated: true },
    ...loadReleases().map((release, index) => ({
      path: `/releases/${release.slug}/`,
      lastmod: release.date,
      translated: isTranslated(index),
    })),
  ];

  const entries = pages.flatMap(({ path, lastmod, translated }) =>
    (translated ? locales : [DEFAULT_LOCALE]).map((locale) => {
      const alternates = translated
        ? [
            ...locales.map(
              (l) =>
                `<xhtml:link rel="alternate" hreflang="${LOCALES[l].lang}" href="${escape(url(l, path))}"/>`
            ),
            `<xhtml:link rel="alternate" hreflang="x-default" href="${escape(url(DEFAULT_LOCALE, path))}"/>`,
          ]
        : [];
      return [
        '<url>',
        `<loc>${escape(url(locale, path))}</loc>`,
        lastmod && `<lastmod>${lastmod}</lastmod>`,
        ...alternates,
        '</url>',
      ]
        .filter(Boolean)
        .join('');
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
