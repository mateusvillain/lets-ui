import type { PropertyDeclaration, ReactiveElement } from 'lit';
import { property } from 'lit/decorators.js';
import { en } from '../locales/en.js';

/**
 * Localization of the text components write themselves — accessible names,
 * validation messages, "(optional)". Not a tool for the application's own
 * content: that belongs to whatever i18n library the app already uses.
 *
 * A text resolves through three layers, the first that has a value winning:
 *
 * 1. the attribute or property set on the element;
 * 2. the translation registered for the element's language — the `lang` of
 *    the closest ancestor that has one, `<html>` included;
 * 3. the built-in English text.
 */

export type TermKey = Exclude<keyof typeof en, '$code' | '$name'>;

/** A complete dictionary: every term, in one language. */
export type Translation = {
  /** A BCP 47 language tag, matched against `lang`: `pt-BR`, `es`, `de-CH`. */
  $code: string;
  /** The language's name, in that language. */
  $name: string;
} & Record<TermKey, string>;

/**
 * What `registerTranslation()` takes: a code and any subset of the terms. A
 * missing term falls through to English, so a partial dictionary overrides
 * only the text it names.
 */
export type PartialTranslation = { $code: string; $name?: string } & Partial<
  Record<TermKey, string>
>;

// Keyed by the lowercased code: `lang` is case-insensitive.
const translations = new Map<string, PartialTranslation>([['en', en]]);

// Elements on the page that read a localized term, so a new translation or a
// new `lang` re-renders the ones already there.
const hosts = new Set<ReactiveElement>();

// Never equal to a real value, so Lit treats every localized property as
// changed and runs the `updated()` hooks that depend on them — validity
// messages included.
const STALE = Symbol('stale');

let observer: MutationObserver | undefined;

function notify() {
  for (const host of hosts) {
    const names =
      (host.constructor as LocalizedClass)[LOCALIZED_PROPERTIES] ?? [];
    for (const name of names) host.requestUpdate(name, STALE);
  }
}

function observeLang() {
  if (observer || typeof MutationObserver === 'undefined') return;
  // A `lang` can change on any ancestor, not only on `<html>`. The filter
  // keeps the callback to that one attribute, so the cost stays negligible.
  observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
    subtree: true,
  });
}

/**
 * Registers one or more translations. Components already on the page update
 * at once. Registering a code a second time merges into the first, so a later
 * call can override a single term:
 *
 * ```js
 * registerTranslation(ptBR);
 * registerTranslation({ $code: 'pt-BR', 'form.optionalText': '(não obrigatório)' });
 * ```
 */
export function registerTranslation(...entries: PartialTranslation[]) {
  for (const entry of entries) {
    const code = entry.$code.toLowerCase();
    translations.set(code, { ...translations.get(code), ...entry });
  }
  notify();
}

/** The language an element is in: the `lang` of its closest ancestor. */
export function resolveLang(element: Element): string {
  let node: Element | null = element;
  while (node) {
    // `lang=""` declares the language unknown, so it does not count.
    const match: Element | null = node.closest('[lang]:not([lang=""])');
    if (match) return match.getAttribute('lang')!;
    // `closest()` stops at a shadow root; carry on from its host.
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return '';
}

// Regions that write Chinese in Traditional characters.
const TRADITIONAL_CHINESE_REGIONS = new Set(['tw', 'hk', 'mo']);

/**
 * The script a lowercased tag is written in: its script subtag (`hant` in
 * `zh-hant-tw`), or for Chinese without one, the script its region uses —
 * Traditional in Taiwan, Hong Kong and Macau, Simplified everywhere else.
 * Empty for any other language, which has one script as far as these
 * dictionaries go.
 */
function scriptOf(code: string): string {
  const [base, ...subtags] = code.split('-');
  const script = subtags.find((subtag) => subtag.length === 4);
  if (script) return script;
  if (base !== 'zh') return '';
  return subtags.some((subtag) => TRADITIONAL_CHINESE_REGIONS.has(subtag))
    ? 'hant'
    : 'hans';
}

function lookup(lang: string, term: TermKey): string {
  const code = lang.toLowerCase();
  const base = code.split('-')[0];
  const script = scriptOf(code);
  // The exact tag first. Then the other dictionaries of the same language —
  // those in the same script ahead of the rest, so `zh-HK` reaches `zh-TW`
  // and not `zh-CN` — and within each group the bare language (`pt`) before
  // its regional variants (`pt-BR`), which keep the order they were
  // registered in. A page in `pt` still finds a dictionary registered as
  // `pt-BR`.
  const related = [...translations].filter(
    ([key]) => key !== code && key.split('-')[0] === base
  );
  const rank = ([key]: [string, PartialTranslation]) =>
    (scriptOf(key) === script ? 0 : 2) + (key === base ? 0 : 1);
  related.sort((a, b) => rank(a) - rank(b));
  const candidates = [
    translations.get(code),
    ...related.map(([, translation]) => translation),
  ];
  for (const translation of candidates) {
    const text = translation?.[term];
    if (text != null) return text;
  }
  return translations.get('en')?.[term] ?? en[term];
}

/** A term in the element's language, before any attribute is considered. */
export function translate(element: Element, term: TermKey): string {
  return lookup(resolveLang(element), term);
}

const LOCALIZED_PROPERTIES = Symbol('localized properties');

type LocalizedClass = typeof ReactiveElement & {
  [LOCALIZED_PROPERTIES]?: string[];
};

interface LocalizedDeclaration extends PropertyDeclaration {
  /**
   * Treat an empty string as unset. For the properties that already read
   * `this.x || DEFAULT` before localization existed: there, `x=""` has always
   * meant "the default text", and it still does.
   */
  emptyIsUnset?: boolean;
}

/**
 * `@property()` for a text the component ships a default for. Reading the
 * property returns the text in effect — the one set on the element, else the
 * one for its language — so templates and `updated()` hooks use it as before.
 *
 * ```ts
 * @localized('form.errorText', { attribute: 'error-text' })
 * errorText!: string;
 * ```
 */
export function localized(
  term: TermKey,
  { emptyIsUnset = false, ...declaration }: LocalizedDeclaration = {}
) {
  return (proto: ReactiveElement, name: string) => {
    const own = Symbol(name);
    type Host = ReactiveElement & { [own]?: string | null };

    Object.defineProperty(proto, name, {
      get(this: Host) {
        const value = this[own];
        const isSet = emptyIsUnset ? Boolean(value) : value != null;
        return isSet ? value : translate(this, term);
      },
      set(this: Host, value: string | null) {
        this[own] = value;
      },
      configurable: true,
      enumerable: true,
    });

    const ctor = proto.constructor as LocalizedClass;
    if (!Object.prototype.hasOwnProperty.call(ctor, LOCALIZED_PROPERTIES)) {
      // A subclass starts from its parent's list rather than sharing it.
      ctor[LOCALIZED_PROPERTIES] = [...(ctor[LOCALIZED_PROPERTIES] ?? [])];
      ctor.addInitializer(watch);
    }
    ctor[LOCALIZED_PROPERTIES]!.push(name);

    // Lit sees the accessor above and wraps it, so setting the property still
    // requests an update.
    property(declaration)(proto, name);
  };
}

const watched = new WeakSet<ReactiveElement>();

function watch(host: ReactiveElement) {
  // A subclass inherits its parent's initializer and adds its own.
  if (watched.has(host)) return;
  watched.add(host);
  host.addController({
    hostConnected() {
      hosts.add(host);
      observeLang();
    },
    hostDisconnected() {
      hosts.delete(host);
    },
  });
}
