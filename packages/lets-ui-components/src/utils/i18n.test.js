import '../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiCheckbox } from '../components/checkbox/checkbox.ts';
import { LuiDatePicker } from '../components/date-picker/date-picker.ts';
import { LuiInput } from '../components/input/input.ts';
import { LuiLink } from '../components/link/link.ts';
import { en } from '../locales/en.ts';
import { de } from '../locales/de.ts';
import { es } from '../locales/es.ts';
import { fr } from '../locales/fr.ts';
import { ja } from '../locales/ja.ts';
import { ptBR } from '../locales/pt-BR.ts';
import { ptPT } from '../locales/pt-PT.ts';
import { registerTranslation, resolveLang } from './i18n.ts';

// Only the elements under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-checkbox', LuiCheckbox);
customElements.define('lui-date-picker', LuiDatePicker);
customElements.define('lui-input', LuiInput);
customElements.define('lui-link', LuiLink);

// The registry is module state shared by every test in this file. Brazilian
// Portuguese is registered once, up front; tests that need a dictionary of
// their own use a code nothing else touches — `qaa`–`qtz`, which ISO 639
// reserves for local use, each with a base of its own so the sibling-region
// match never links them.
registerTranslation(ptBR);

const mounted = [];

async function mount(markup) {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector(
    'lui-checkbox, lui-date-picker, lui-input, lui-link'
  );
  await el.updateComplete;
  return el;
}

// A `lang` change reaches components through a MutationObserver, whose
// callback runs as a microtask; the re-render follows on the next update.
async function settle(el) {
  await Promise.resolve();
  await el.updateComplete;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const $ = (el, selector) => el.shadowRoot.querySelector(selector);
const text = (el, selector) => $(el, selector).textContent.trim();

describe('resolution order', () => {
  it('falls back to the built-in English text', async () => {
    const el = await mount('<lui-checkbox></lui-checkbox>');
    expect(el.errorText).toBe('This field is required.');
  });

  it('uses the registered translation for the element’s language', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-input optional label="Nome"></lui-input></div>'
    );
    expect(el.optionalText).toBe('(opcional)');
    expect(text(el, '.input-field__optional')).toBe('(opcional)');
  });

  it('lets an attribute win over the translation', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-input optional optional-text="(se quiser)"></lui-input></div>'
    );
    expect(el.optionalText).toBe('(se quiser)');
    expect(text(el, '.input-field__optional')).toBe('(se quiser)');
  });

  it('lets a property win over the translation', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-date-picker></lui-date-picker></div>'
    );
    el.dialogLabel = 'Calendário';
    await el.updateComplete;
    expect(el.dialogLabel).toBe('Calendário');
  });

  it('returns to the translation once the attribute is removed', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-checkbox error-text="Marque"></lui-checkbox></div>'
    );
    el.removeAttribute('error-text');
    await el.updateComplete;
    expect(el.errorText).toBe('Este campo é obrigatório.');
  });
});

describe('empty strings', () => {
  it('keeps an explicit empty text where it already meant “no text”', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-checkbox error error-text=""></lui-checkbox></div>'
    );
    expect(el.errorText).toBe('');
    expect($(el, '.checkbox-field__message')).toBeNull();
  });

  it('treats an empty text as unset where it already meant “the default”', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-date-picker start-label=""></lui-date-picker></div>'
    );
    expect(el.startLabel).toBe('Data inicial');
  });
});

describe('language matching', () => {
  it('matches the language case-insensitively', async () => {
    const el = await mount(
      '<div lang="PT-br"><lui-checkbox></lui-checkbox></div>'
    );
    expect(el.errorText).toBe('Este campo é obrigatório.');
  });

  it('finds a regional dictionary from the bare language', async () => {
    const el = await mount(
      '<div lang="pt"><lui-checkbox></lui-checkbox></div>'
    );
    expect(el.errorText).toBe('Este campo é obrigatório.');
  });

  it('finds a sibling region when its own is not registered', async () => {
    const el = await mount(
      '<div lang="pt-PT"><lui-checkbox></lui-checkbox></div>'
    );
    expect(el.errorText).toBe('Este campo é obrigatório.');
  });

  it('falls back to English for a language nothing registered', async () => {
    const el = await mount(
      '<div lang="fr"><lui-checkbox></lui-checkbox></div>'
    );
    expect(el.errorText).toBe('This field is required.');
  });

  it('ignores an empty lang and keeps looking further up', async () => {
    const el = await mount(
      '<div lang="pt-BR"><div lang=""><lui-checkbox></lui-checkbox></div></div>'
    );
    expect(el.errorText).toBe('Este campo é obrigatório.');
  });

  it('reads the language across a shadow root', async () => {
    const host = document.createElement('div');
    host.lang = 'pt-BR';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<span></span>';
    document.body.append(host);
    mounted.push(host);
    expect(resolveLang(root.querySelector('span'))).toBe('pt-BR');
  });
});

describe('partial translations', () => {
  it('overrides only the terms it names', async () => {
    registerTranslation({ $code: 'qaa', 'form.optionalText': '(opt)' });
    const el = await mount(
      '<div lang="qaa"><lui-input optional></lui-input></div>'
    );
    expect(el.optionalText).toBe('(opt)');
    expect(el.errorText).toBe('This field is required.');
  });

  it('merges a second registration of the same code into the first', async () => {
    registerTranslation({ $code: 'qab', 'form.optionalText': '(a)' });
    registerTranslation({ $code: 'qab', 'form.errorText': 'B' });
    const el = await mount('<div lang="qab"><lui-input></lui-input></div>');
    expect(el.optionalText).toBe('(a)');
    expect(el.errorText).toBe('B');
  });
});

describe('updates', () => {
  it('re-renders when an ancestor’s lang changes', async () => {
    const el = await mount(
      '<div lang="en"><lui-input optional></lui-input></div>'
    );
    expect(text(el, '.input-field__optional')).toBe('(optional)');
    el.parentElement.lang = 'pt-BR';
    await settle(el);
    expect(text(el, '.input-field__optional')).toBe('(opcional)');
  });

  it('re-renders when a translation is registered after the first render', async () => {
    const el = await mount(
      '<div lang="qac"><lui-input optional></lui-input></div>'
    );
    expect(text(el, '.input-field__optional')).toBe('(optional)');
    registerTranslation({ $code: 'qac', 'form.optionalText': '(late)' });
    await el.updateComplete;
    expect(text(el, '.input-field__optional')).toBe('(late)');
  });

  it('refreshes the validation message, not only the visible text', async () => {
    const el = await mount(
      '<div lang="en"><lui-checkbox required></lui-checkbox></div>'
    );
    expect(el._internals.validationMessage).toBe('This field is required.');
    el.parentElement.lang = 'pt-BR';
    await settle(el);
    expect(el._internals.validationMessage).toBe('Este campo é obrigatório.');
  });

  it('keeps an explicit attribute when the language changes', async () => {
    const el = await mount(
      '<div lang="en"><lui-link external external-label="(nova janela)"></lui-link></div>'
    );
    el.parentElement.lang = 'pt-BR';
    await settle(el);
    expect(el.externalLabel).toBe('(nova janela)');
  });
});

describe('date picker locale', () => {
  const value = (el) => text(el, '.date-picker__value');
  const input = (el) => $(el, 'input');

  it('formats dates in the element’s language without a locale', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-date-picker value="2026-01-16"></lui-date-picker></div>'
    );
    expect(value(el)).toMatch(/de jan/);
  });

  it('keeps en-US without a lang anywhere', async () => {
    const el = await mount(
      '<lui-date-picker value="2026-01-16"></lui-date-picker>'
    );
    expect(value(el)).toBe('Jan 16, 2026');
  });

  it('lets the locale attribute win over the lang', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-date-picker value="2026-01-16" locale="en-US"></lui-date-picker></div>'
    );
    expect(value(el)).toBe('Jan 16, 2026');
  });

  it('reorders the typed text when the lang changes', async () => {
    const el = await mount(
      '<div lang="en-US"><lui-date-picker editable value="2026-01-16"></lui-date-picker></div>'
    );
    expect(input(el).value).toBe('01 / 16 / 2026');
    el.parentElement.lang = 'pt-BR';
    await settle(el);
    expect(input(el).value).toBe('16 / 01 / 2026');
    expect(input(el).placeholder).toBe('dd / mm / aaaa');
  });

  it('writes the format letters in the element’s language', async () => {
    const el = await mount(
      '<div lang="pt-BR"><lui-date-picker editable locale="en-US"></lui-date-picker></div>'
    );
    expect(input(el).placeholder).toBe('mm / dd / aaaa');
    const custom = await mount(
      '<div lang="pt-BR"><lui-date-picker editable format-text="DD/MM/AAAA"></lui-date-picker></div>'
    );
    expect(input(custom).placeholder).toBe('DD/MM/AAAA');
  });
});

describe('dictionaries', () => {
  const terms = (dictionary) =>
    Object.keys(dictionary)
      .filter((key) => !key.startsWith('$'))
      .sort();

  const shipped = { ptBR, ptPT, es, fr, de, ja };

  it.each(Object.entries(shipped))(
    'ships %s with exactly the English terms',
    (_, dictionary) => {
      expect(terms(dictionary)).toEqual(terms(en));
    }
  );

  it.each(Object.entries(shipped))(
    'keeps every placeholder of the English text in %s',
    (_, dictionary) => {
      const placeholders = (value) => (value.match(/\{\w+\}/g) ?? []).sort();
      for (const key of terms(en)) {
        expect(placeholders(dictionary[key]), key).toEqual(
          placeholders(en[key])
        );
      }
    }
  );

  it.each(Object.entries(shipped))(
    'leaves no term empty and keeps the format letters single in %s',
    (_, dictionary) => {
      for (const key of terms(en)) {
        expect(dictionary[key].trim(), key).not.toBe('');
      }
      for (const field of ['day', 'month', 'year']) {
        expect(dictionary[`datePicker.${field}Letter`]).toHaveLength(1);
      }
    }
  );

  it('defaults the link’s external label to English', async () => {
    const el = await mount('<lui-link external></lui-link>');
    expect(el.externalLabel).toBe('(opens in a new tab)');
  });
});
