/** Dates as shown on the site. UTC, so a date never shifts by a day. */
const short = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const long = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const asDate = (iso) => new Date(`${iso}T00:00:00Z`);

export const shortDate = (iso) => short.format(asDate(iso));
export const longDate = (iso) => long.format(asDate(iso));

/** `release-v1-13-0`: an id for the card's heading. */
export const headingId = (release) =>
  `release-${release.slug.replace(/\./g, '-')}`;
