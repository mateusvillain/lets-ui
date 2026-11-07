import { localePath } from '@/lib/i18n.js';

export function GET({ site }) {
  const sitemap = new URL(localePath('en', '/sitemap.xml'), site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
