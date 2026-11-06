import { LOCALES } from './i18n.js';

/** Dates as shown on the site, per locale. UTC, so a date never shifts by a day. */
const formatters = new Map();

function formatter(locale, month) {
  const key = `${locale}:${month}`;
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.DateTimeFormat(LOCALES[locale].dateLocale, {
        day: 'numeric',
        month,
        year: 'numeric',
        timeZone: 'UTC',
      })
    );
  }
  return formatters.get(key);
}

const asDate = (iso) => new Date(`${iso}T00:00:00Z`);

export const shortDate = (iso, locale = 'en') =>
  formatter(locale, 'short').format(asDate(iso));
export const longDate = (iso, locale = 'en') =>
  formatter(locale, 'long').format(asDate(iso));

/** `release-v1-13-0`: an id for the card's heading. */
export const headingId = (release) =>
  `release-${release.slug.replace(/\./g, '-')}`;
