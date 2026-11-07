/**
 * Markdown rendering for the site. Build time only: the notes are authored in
 * this repository, so their HTML is trusted as it is in `CHANGELOG.md`.
 */
import { Marked } from 'marked';

import { promoteHeadings } from './changelog.js';

const marked = new Marked({ gfm: true });

/** One line of notes (a title or a highlight), without a wrapping `<p>`. */
export const inline = (text) => marked.parseInline(text);

/** Inline Markdown with links reduced to their text, for use inside a link. */
export const inlineText = (text) =>
  marked.parseInline(text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'));

/** A release's full notes, with its `###` sections as `<h2>`. */
export const notes = (markdown) => marked.parse(promoteHeadings(markdown));
