/**
 * The Brand Studio interface: builds the controls from the schema, holds the
 * brand state and projects every change into the preview iframe.
 *
 * The controls are Let's UI components themselves, rendered as one scrolling
 * column of categories (Colors, then the foundation sections).
 */

import {
  FAMILIES,
  STEPS,
  SECTIONS,
  GOOGLE_FONTS,
  googleFontOf,
  brandVar,
} from './schema.js';
import {
  createDefaultState,
  toCssVars,
  changedPaths,
  toFiles,
  save,
  load,
  fromFiles,
} from './state.js';
import {
  tokenValueToHex,
  hexToTokenValue,
  isValidHex,
  normalizeHex,
  generateRamp,
  contrastRatio,
} from './color.js';
import {
  BREAKPOINT_ORDER,
  BREAKPOINT_PREFIX,
  breakpointError,
  breakpointBounds,
} from './breakpoints.js';
import { parseClamp, buildClamp } from './clamp.js';
import { zip } from './zip.js';
import { randomBrand } from './random.js';

/* ── DOM helpers ────────────────────────────────────────────── */

const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }

  node.append(...[children].flat().filter(Boolean));
  return node;
};

/**
 * A compact property row: a muted label on the left, the control on the
 * right — the inspector layout of Figma/Framer/Penpot, rather than the
 * design system's own stacked form field. The control is named through
 * `aria-label` rather than its own `label`, so the row's label is the only
 * visible one, and the wrapper still carries the "changed" marker.
 *
 * `wide` is for controls that need the row's full width to stay usable — a
 * pair of bounds, or a text input next to a presets select — rather than the
 * ~55% a single stepper or select is comfortable with.
 */
const field = (token, label, control, { wide = false } = {}) =>
  el(
    'div',
    {
      class: `st-field${wide ? ' st-field--wide' : ''}`,
      'data-token': token,
    },
    [
      el('span', { class: 'st-field__label', text: label }),
      el('div', { class: 'st-field__control' }, control),
    ]
  );

const caption = (text) =>
  el('lui-body', {
    variant: 'sm',
    color: 'caption',
    label: text,
    class: 'st-caption',
  });

/**
 * `lui-native-select` reserves index 0 for the placeholder, so a real option's
 * position is always `index + 1`.
 */
const selectIndex = (options, value) =>
  options.findIndex((option) => option.value === value) + 1;

/**
 * Readable name -> folder name. Accents fall back to their base letter and
 * anything non-alphanumeric is dropped or becomes a hyphen — "Ação & Cor" and
 * "Material Design" both have to yield valid paths under `tokens/brand/`.
 *
 * Apostrophes are deleted rather than turned into hyphens: "Let's UI" is
 * `lets-ui`, not `let-s-ui`, which is how the reference brand is versioned.
 */
export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2019]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Every font-family token the schema exposes. */
const FONT_PATHS = SECTIONS.flatMap((section) => section.groups)
  .flatMap((entry) => entry.fields)
  .filter((item) => item.control === 'font-family')
  .map((item) => item.path);

export function mountStudio({ root, templates, meta }) {
  const defaults = createDefaultState(templates, meta);
  const stored = load();

  let state = stored ?? structuredClone(defaults);
  let theme = 'light';
  /* Whether the Families fields pick from Google Fonts or take a typed stack.
     Chrome, not brand: the token is a font stack either way. It starts on
     when every family in the brand is already a Google Font, so reopening the
     studio on such a brand shows the selects it was built with. */
  let googleFontsMode = FONT_PATHS.every((path) =>
    googleFontOf(state.foundation[path])
  );

  // The standalone preview's "Tokens" specimen sheet is reachable by URL but
  // no longer has a studio control; the brand is only ever composed as the
  // landing page here.
  const scene = 'landing';
  // Whether the Grid category is on screen in the panel: the column ruler in
  // the preview follows it, so it shows up while grid tokens are in reach.
  let gridInView = false;

  /* As long as the identifier is exactly what the name would generate, it is
     derived and follows the name field. The moment it diverges, it has been
     edited by hand and stops being overwritten. Comparing instead of storing a
     flag avoids one more field in the persisted state — and it self-corrects
     when the user clears their customization. */
  let slugIsDerived = state.slug === slugify(state.name);

  const dom = {
    frame: root.querySelector('[data-preview]'),
    panel: root.querySelector('[data-panel]'),
    status: root.querySelector('[data-status]'),
    brandName: root.querySelector('[data-brand-name]'),
    brandSlug: root.querySelector('[data-brand-slug]'),
  };

  /* ── Applying to the preview ──────────────────────────────── */

  function previewDocument() {
    return dom.frame.contentDocument;
  }

  function apply() {
    const document_ = previewDocument();
    if (!document_?.documentElement) return;

    // `data-brand` stays on the reference brand: it is the base of the
    // cascade, and every edited token lands on top of it, inline.
    const element = document_.documentElement;
    element.setAttribute('data-theme', theme);
    element.dataset.scene = scene;
    // The composition signs itself with the name of the brand being edited:
    // that is what separates a preview of the user's own product from a
    // generic example.
    element.dataset.brandName = state.name;
    syncOverlay();

    for (const [name, value] of Object.entries(toCssVars(state, theme))) {
      element.style.setProperty(name, value);
    }

    syncGoogleFonts(document_);

    document_.dispatchEvent(
      new document_.defaultView.Event('lui-brand-update')
    );
  }

  /**
   * A Google Font only renders once its stylesheet is in the document, so
   * the preview gets one `<link>` per family in use. One per family rather
   * than a combined request: the css2 API rejects the whole URL when any
   * family in it lacks a requested weight, and a single bad entry should not
   * blank out the other two.
   */
  function syncGoogleFonts(document_) {
    const wanted = new Set(
      FONT_PATHS.map(
        (path) => googleFontOf(state.foundation[path])?.label
      ).filter(Boolean)
    );

    for (const link of document_.head.querySelectorAll('[data-google-font]')) {
      if (wanted.has(link.dataset.googleFont))
        wanted.delete(link.dataset.googleFont);
      else link.remove();
    }

    for (const family of wanted) {
      const link = document_.createElement('link');
      link.rel = 'stylesheet';
      link.dataset.googleFont = family;
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        family
      ).replace(/%20/g, '+')}:wght@300;400;500;600;700&display=swap`;
      document_.head.append(link);
    }
  }

  /** The column ruler follows the Grid tab. */
  function syncOverlay() {
    const element = previewDocument()?.documentElement;
    if (element) element.dataset.gridOverlay = gridInView ? 'on' : 'off';
  }

  /** Single source of truth: persists, projects and refreshes the indicators. */
  function commit({ rerender = false } = {}) {
    save(state);
    apply();
    updateStatus();
    if (rerender) renderPanel();
    else refreshIndicators();
    refreshBreakpointBounds();
  }

  function updateStatus() {
    const count = changedPaths(state, defaults).size;

    dom.status.setAttribute(
      'label',
      count ? `${count} token${count > 1 ? 's' : ''} changed` : 'No changes'
    );
    dom.status.setAttribute('variant', count ? 'primary' : 'neutral');
  }

  /** Visually flags the fields that diverge from the defaults. */
  function refreshIndicators() {
    const changed = changedPaths(state, defaults);

    for (const node of dom.panel.querySelectorAll('[data-token]')) {
      node.dataset.changed = String(changed.has(node.dataset.token));
    }

    for (const badge of dom.panel.querySelectorAll('[data-contrast]')) {
      renderContrast(badge);
    }
  }

  /* ── Groups ───────────────────────────────────────────────
   *
   * Every section is a flat list of groups, each always open and headed by
   * its label over a rule.
   */
  function group(label, content) {
    return el('section', { class: 'st-group' }, [
      el('div', { class: 'st-group__head' }, [
        el('span', { class: 'st-group__label', text: label }),
        el('span', { class: 'st-group__rule' }),
      ]),
      ...[content].flat().filter(Boolean),
    ]);
  }

  /* ── Colors ──────────────────────────────────────────────── */

  function colorSection() {
    return el('div', { class: 'st-section' }, [
      themeSwitch(),
      ...FAMILIES.map((family) =>
        group(family, [
          el('div', { class: 'st-group' }, [
            ramp(family),
            rampGenerator(family),
            contrastBadges(family),
          ]),
        ])
      ),
    ]);
  }

  /* The theme belongs to the preview, not to the chrome, and only the colors
     differ between the two — so the switch lives with the ramps it swaps. */
  function themeSwitch() {
    return el('div', { class: 'st-field' }, [
      el('span', { class: 'st-field__label', text: 'Dark mode' }),
      el('lui-switch', {
        size: 'md',
        'aria-label': 'Dark mode',
        checked: theme === 'dark',
        onchange: (event) => {
          theme = event.target.checked ? 'dark' : 'light';
          renderPanel();
          apply();
        },
      }),
    ]);
  }

  /**
   * Black or white, whichever reads better on the swatch — the step number
   * and the changed marker sit on top of the color itself.
   */
  const inkOn = (hex) =>
    contrastRatio(hex, '#ffffff') >= contrastRatio(hex, '#000000')
      ? '#ffffff'
      : '#000000';

  /** Which step each family's editor shows; chrome, not brand state. */
  const selectedSteps = new Map();

  /**
   * A ramp is read as a whole — eight rows of hex codes hide the very
   * progression the user is tuning. The steps sit side by side as one strip,
   * and a single editor below works on whichever step is selected.
   */
  function ramp(family) {
    const selected = selectedSteps.get(family) ?? 5;
    const hexOf = (step) =>
      tokenValueToHex(state.colors[theme][`${family}.${step}`]);

    const paint = (swatch, hex) => {
      swatch.style.setProperty('--st-step-color', hex);
      swatch.style.setProperty('--st-step-ink', inkOn(hex));
      swatch.setAttribute(
        'aria-label',
        `${family} ${swatch.dataset.step}, ${hex}`
      );
      swatch.title = hex;
    };

    const swatches = STEPS.map((step) => {
      const swatch = el('button', {
        type: 'button',
        class: 'st-step',
        'data-step': String(step),
        'data-token': `${theme}:color.${family}.${step}`,
        'aria-pressed': String(step === selected),
        text: String(step),
        onclick: () => select(step),
      });
      paint(swatch, hexOf(step));
      return swatch;
    });

    const label = el('span', { class: 'st-field__label' });

    const picker = el('input', {
      type: 'color',
      class: 'st-swatch',
    });

    const input = el('lui-input', {
      size: 'md',
      class: 'st-hex',
    });

    let current = selected;

    function select(step) {
      current = step;
      selectedSteps.set(family, step);
      const hex = hexOf(step);

      for (const swatch of swatches) {
        swatch.setAttribute(
          'aria-pressed',
          String(swatch.dataset.step === String(step))
        );
      }

      label.textContent = `Step ${step}`;
      picker.value = hex;
      picker.setAttribute('aria-label', `${family} ${step}`);
      input.value = hex;
      input.setAttribute('aria-label', `${family} ${step} in hexadecimal`);
    }

    const write = (value) => {
      if (!isValidHex(value)) return;
      const hex = normalizeHex(value);
      state.colors[theme][`${family}.${current}`] = hexToTokenValue(hex);
      picker.value = hex;
      input.value = hex;
      paint(swatches[current - 1], hex);
      commit();
    };

    picker.addEventListener('input', (event) => write(event.target.value));
    input.addEventListener('change', (event) => write(event.target.value));

    select(selected);

    return el('div', { class: 'st-ramp' }, [
      el(
        'div',
        {
          class: 'st-ramp__strip',
          role: 'group',
          'aria-label': `${family} ramp`,
        },
        swatches
      ),
      el('div', { class: 'st-field st-field--wide' }, [
        label,
        el('div', { class: 'st-field__control st-color' }, [picker, input]),
      ]),
    ]);
  }

  /** Generates the family's 8 steps from a base color. */
  function rampGenerator(family) {
    const picker = el('input', {
      type: 'color',
      class: 'st-swatch',
      value: tokenValueToHex(state.colors[theme][`${family}.5`]),
      'aria-label': `Base color for ${family}`,
    });

    const generate = (themes) => {
      for (const target of themes) {
        generateRamp(picker.value, family, target).forEach((hex, index) => {
          state.colors[target][`${family}.${index + 1}`] = hexToTokenValue(hex);
        });
      }
      commit({ rerender: true });
    };

    return el('div', { class: 'st-generator' }, [
      picker,
      el('lui-button', {
        size: 'md',
        variant: 'secondary',
        label: 'Generate ramp',
        onclick: () => generate([theme]),
      }),
      el('lui-button', {
        size: 'md',
        variant: 'ghost',
        label: 'Light + dark',
        onclick: () => generate(['light', 'dark']),
      }),
    ]);
  }

  /**
   * The contrast pairs that decide legibility in practice: surface against
   * text, and against the action color.
   */
  const CONTRAST_PAIRS = {
    primary: [
      ['primary.5', 'secondary.1', 'Action on surface'],
      ['primary.6', 'secondary.1', 'Action pressed'],
    ],
    secondary: [
      ['secondary.8', 'secondary.1', 'Text on surface'],
      ['secondary.5', 'secondary.1', 'Supporting text'],
    ],
  };

  function contrastBadges(family) {
    return el(
      'div',
      { class: 'st-contrast' },
      CONTRAST_PAIRS[family].map(([foreground, background, label]) =>
        el('lui-tag', {
          size: 'sm',
          'data-contrast': `${foreground}|${background}|${label}`,
        })
      )
    );
  }

  function renderContrast(node) {
    const [foreground, background, label] = node.dataset.contrast.split('|');
    const ratio = contrastRatio(
      tokenValueToHex(state.colors[theme][foreground]),
      tokenValueToHex(state.colors[theme][background])
    );

    node.setAttribute('label', `${label} · ${ratio.toFixed(2)}:1`);
    node.setAttribute(
      'variant',
      ratio >= 4.5 ? 'success' : ratio >= 3 ? 'caution' : 'danger'
    );
  }

  /* ── Foundation ───────────────────────────────────────────── */

  function foundationSection(section) {
    return el(
      'div',
      { class: 'st-section' },
      section.groups.map((entry) =>
        group(entry.label, [
          entry.googleFonts ? googleFontsSwitch() : null,
          entry.hint ? caption(entry.hint) : null,
          el(
            'div',
            { class: 'st-fields' },
            entry.fields.map((item) => control(item))
          ),
        ])
      )
    );
  }

  function control(item) {
    const value = state.foundation[item.path];

    const write = (next) => {
      state.foundation[item.path] = next;
      commit();
    };

    switch (item.control) {
      case 'font-family':
        return fontFamilyControl(item, value, write);
      case 'clamp':
        return clampControl(item, value, write);
      case 'select':
        return selectControl(item, value, write);
      case 'dimension':
        return dimensionControl(item, value, write);
      default:
        return numberControl(item, value, write);
    }
  }

  function googleFontsSwitch() {
    return el('div', { class: 'st-field' }, [
      el('span', { class: 'st-field__label', text: 'Google Fonts' }),
      el('lui-switch', {
        size: 'md',
        'aria-label': 'Google Fonts',
        checked: googleFontsMode,
        onchange: (event) => {
          googleFontsMode = event.target.checked;
          renderPanel();
        },
      }),
    ]);
  }

  /** Picking a family writes its two-item stack; a typed stack is untouched
   *  until a family is picked, so toggling the switch alone changes nothing. */
  function googleFontControl(item, value, write) {
    const select = el('lui-native-select', {
      size: 'md',
      'aria-label': item.label,
      placeholder: 'Select a font',
      options: GOOGLE_FONTS.map((font) => font.label).join(','),
      selected: String(selectIndex(GOOGLE_FONTS, googleFontOf(value)?.value)),
    });

    select.addEventListener('change', (event) => {
      const font = GOOGLE_FONTS[event.target.selected - 1];
      if (font) write([...font.value]);
    });

    return field(item.path, item.label, select, { wide: true });
  }

  function fontFamilyControl(item, value, write) {
    if (googleFontsMode) return googleFontControl(item, value, write);

    const input = el('lui-input', {
      size: 'md',
      'aria-label': item.label,
      value: value.join(', '),
    });

    input.addEventListener('change', (event) =>
      write(
        event.target.value
          .split(',')
          .map((font) => font.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean)
      )
    );

    return field(item.path, item.label, input, { wide: true });
  }

  /** Precision of the fluid scale's bounds, in rem. */
  const CLAMP_STEP = 0.001;

  /**
   * `lui-input`'s steppers add in binary floating point: clicking `+` on 1
   * with a step of 0.1 lands on 1.0999999999999999. Rounding to the step's own
   * precision keeps the token a decimal the user could have typed — and the
   * rounded value goes back into the field, since the number on screen is the
   * one the next click adds to.
   */
  function snap(input, raw, step) {
    const decimals = String(step).split('.')[1]?.length ?? 0;
    const next = Number(Number(raw).toFixed(decimals));

    if (input.value !== String(next)) input.value = String(next);
    return next;
  }

  function clampControl(item, value, write) {
    const parsed = parseClamp(value) ?? { min: 1, max: 1 };

    // The number variant of `lui-input` ignores `suffix`, so the unit lives
    // only in the field's accessible name — the min/max pair reads from
    // position, the way a design tool's W/H fields do.
    const bound = (key, ariaLabel) => {
      const input = el('lui-input', {
        size: 'md',
        type: 'number',
        'aria-label': ariaLabel,
        'increment-label': 'Aumentar valor',
        'decrement-label': 'Diminuir valor',
        step: String(CLAMP_STEP),
        min: '0.1',
        value: String(parsed[key]),
      });

      input.addEventListener('change', (event) => {
        parsed[key] = snap(input, event.target.value, CLAMP_STEP);
        write(buildClamp(parsed.min, parsed.max));
      });

      return input;
    };

    return field(
      item.path,
      item.label,
      el('div', { class: 'st-pair' }, [
        bound('min', `${item.label} · min (rem)`),
        bound('max', `${item.label} · max (rem)`),
      ]),
      { wide: true }
    );
  }

  function selectControl(item, value, write) {
    const select = el('lui-native-select', {
      size: 'md',
      'aria-label': item.label,
      placeholder: 'Select',
      options: item.options.map((option) => option.label).join(','),
      selected: String(selectIndex(item.options, value)),
    });

    select.addEventListener('change', (event) => {
      const option = item.options[event.target.selected - 1];
      if (option) write(option.value);
    });

    return field(item.path, item.label, select);
  }

  /**
   * Breakpoints bound each other, so editing one moves the window the fields
   * beside it may occupy. Re-reading those windows after every commit is also
   * what releases an error a later edit made obsolete: raising `sm` above the
   * `1xs` that was rejected against it has to clear the message on `1xs`,
   * because the error belonged to the pair and not to the field showing it.
   *
   * The field is resynced with the state at the same time — a value that was
   * rejected never reached it, and leaving it on screen next to a cleared
   * error would show an edit that did not happen.
   */
  function refreshBreakpointBounds() {
    for (const step of BREAKPOINT_ORDER) {
      const input = dom.panel.querySelector(
        `[data-token="${BREAKPOINT_PREFIX}${step}"] lui-input`
      );
      if (!input) continue;

      const { min, max } = breakpointBounds(state.foundation, step);
      input.setAttribute('min', String(min));
      input.setAttribute('max', String(max));

      const current = state.foundation[`${BREAKPOINT_PREFIX}${step}`].value;
      if (Number(input.value) !== current) input.value = String(current);

      input.removeAttribute('error');
      input.removeAttribute('error-text');
    }
  }

  /**
   * A session saved before a token stopped being a `clamp()` still holds the
   * string, and reading `.value` off it renders an empty field the next edit
   * would write back as `NaN`. The largest end of the old clamp is the size
   * that token now keeps, so it is what the field opens on.
   */
  function asDimension(value, item) {
    if (value && typeof value === 'object') return value;

    const parsed = parseClamp(value);
    const number = Number(value);
    return {
      value:
        parsed?.max ?? (Number.isFinite(number) ? number : (item.min ?? 0)),
      unit: item.unit ?? 'px',
    };
  }

  function dimensionControl(item, rawValue, write) {
    const value = asDimension(rawValue, item);
    const isBreakpoint = item.path.startsWith(BREAKPOINT_PREFIX);
    const bounds = isBreakpoint
      ? breakpointBounds(
          state.foundation,
          item.path.slice(BREAKPOINT_PREFIX.length)
        )
      : { min: item.min ?? 0, max: item.max ?? 9999 };

    const unit = value.unit ?? item.unit ?? 'px';

    const input = el('lui-input', {
      size: 'md',
      type: 'number',
      'aria-label': `${item.label} (${unit})`,
      'increment-label': 'Aumentar valor',
      'decrement-label': 'Diminuir valor',
      min: String(bounds.min),
      max: String(bounds.max),
      step: String(item.step ?? 1),
      value: String(value.value),
    });

    input.addEventListener('change', (event) => {
      const raw = event.target.value;
      const error = isBreakpoint
        ? breakpointError(
            state.foundation,
            item.path.slice(BREAKPOINT_PREFIX.length),
            raw
          )
        : null;

      if (error) {
        input.setAttribute('error', '');
        input.setAttribute('error-text', error);
        return;
      }

      input.removeAttribute('error');
      write({ value: snap(input, raw, item.step ?? 1), unit });
    });

    return field(item.path, `${item.label} (${unit})`, input);
  }

  function numberControl(item, value, write) {
    const input = el('lui-input', {
      size: 'md',
      type: 'number',
      'aria-label': item.label,
      'increment-label': 'Aumentar valor',
      'decrement-label': 'Diminuir valor',
      min: String(item.min ?? 0),
      max: String(item.max ?? 100),
      step: String(item.step ?? 1),
      value: String(value),
    });

    input.addEventListener('change', (event) => {
      const next = Number(event.target.value);
      write(item.integer ? Math.round(next) : next);
    });

    return field(item.path, item.label, input);
  }

  /* ── Rendering ────────────────────────────────────────────── */

  /**
   * Every category sits in one scrolling column instead of behind tabs, so a
   * change in one never hides the others. Each opens with a heading that
   * sticks to the top of the panel while its groups scroll past — the
   * category stays named however deep the scroll — and a full-width rule
   * marks where the next one starts.
   */
  const CATEGORIES = [
    { id: 'color', label: 'Colors', render: colorSection },
    ...SECTIONS.map((section) => ({
      id: section.id,
      label: section.label,
      render: () => foundationSection(section),
    })),
  ];

  function category({ id, label, render }) {
    return el(
      'section',
      { class: 'st-category', 'data-category': id, 'aria-label': label },
      [
        el('lui-heading', {
          class: 'st-category__title',
          variant: 'block-title',
          as: 'h2',
          label,
        }),
        render(),
      ]
    );
  }

  const gridObserver = new IntersectionObserver(
    ([entry]) => {
      gridInView = entry.isIntersecting;
      syncOverlay();
    },
    { root: dom.panel }
  );

  function renderPanel() {
    // Re-rendering (import, randomize, a regenerated ramp) keeps the user
    // where they were rather than throwing them back to the top.
    const { scrollTop } = dom.panel;
    dom.panel.replaceChildren(...CATEGORIES.map(category));
    dom.panel.scrollTop = scrollTop;

    gridObserver.disconnect();
    const grid = dom.panel.querySelector('[data-category="grid"]');
    if (grid) gridObserver.observe(grid);

    syncOverlay();
    refreshIndicators();
    updateStatus();
  }

  /* ── Global actions ───────────────────────────────────────── */

  function download(name, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = Object.assign(document.createElement('a'), {
      href: url,
      download: name,
    });
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    // Revoking synchronously can cancel a download the browser has not
    // started reading yet.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * The three files travel as one archive: browsers drop downloads fired
   * back-to-back, and the files only make sense together — they land in the
   * same `tokens/brand/<slug>/` folder.
   */
  function exportTokens() {
    const slug = state.slug || 'lets-ui';
    const files = Object.fromEntries(
      Object.entries(toFiles(state, templates)).map(([name, tree]) => [
        name,
        `${JSON.stringify(tree, null, 2)}\n`,
      ])
    );

    download(`${slug}.zip`, zip(files));
  }

  async function importTokens(files) {
    const incoming = {};

    for (const file of files) {
      const parsed = JSON.parse(await file.text());
      if (/dark/i.test(file.name)) incoming.dark = parsed;
      else if (/light/i.test(file.name)) incoming.light = parsed;
      else incoming.foundation = parsed;
    }

    state = fromFiles(incoming, defaults);
    syncIdentity();
    commit({ rerender: true });
  }

  /**
   * Rolls a whole brand. Only identity survives: the name and identifier belong
   * to the user, everything else is derived from the parameters `random.js`
   * draws.
   */
  function randomize() {
    state = randomBrand(defaults, { name: state.name, slug: state.slug });
    commit({ rerender: true });
  }

  function syncIdentity() {
    dom.brandName.value = state.name;
    dom.brandSlug.value = state.slug;
    slugIsDerived = state.slug === slugify(state.name);
  }

  /* ── Wiring ───────────────────────────────────────────────── */

  const fileInput = root.querySelector('[data-action="import"]');

  root
    .querySelector('[data-action="export"]')
    .addEventListener('click', exportTokens);
  root
    .querySelector('[data-action="randomize"]')
    .addEventListener('click', randomize);
  root
    .querySelector('[data-action="import-trigger"]')
    .addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) =>
    importTokens([...event.target.files])
  );

  /**
   * The preview behaves like a canvas: the frame's width is a free-form drag
   * on its own handles, not a reading of the brand's breakpoints — those are
   * edited on their own terms in the Grid tab. Zoom is a separate, purely
   * visual scale, so a canvas wider than the stage can still be dragged
   * narrower to see all of it at once, or scrolled to at 100%.
   */
  const MIN_FRAME_WIDTH = 320;
  const MAX_FRAME_WIDTH = 2560;
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 2;

  const canvas = root.querySelector('[data-canvas]');
  const artboard = root.querySelector('[data-artboard]');
  const viewportSize = root.querySelector('[data-viewport-size]');
  const zoomValue = root.querySelector('[data-zoom-value]');

  let frameWidth = 1280;
  let zoom = 1;

  function applyFrameWidth() {
    artboard.style.setProperty('--st-viewport-width', `${frameWidth}px`);
    viewportSize.textContent = `${Math.round(frameWidth)}px`;
  }

  function applyZoom() {
    artboard.style.setProperty('--st-zoom', String(zoom));
    zoomValue.textContent = `${Math.round(zoom * 100)}%`;
  }

  function setFrameWidth(next) {
    frameWidth = Math.min(MAX_FRAME_WIDTH, Math.max(MIN_FRAME_WIDTH, next));
    applyFrameWidth();
  }

  function setZoom(next) {
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    applyZoom();
  }

  // The frame is centred (`margin-inline: auto`), so dragging one handle
  // moves both edges away from the centre — the width changes by twice the
  // pointer's own delta, unscaled back to canvas pixels so the edge stays
  // under the pointer at any zoom.
  for (const handle of root.querySelectorAll('[data-resize-handle]')) {
    const direction = handle.dataset.resizeHandle === 'left' ? -1 : 1;

    handle.addEventListener('pointerdown', (event) => {
      handle.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startWidth = frameWidth;

      const onMove = (moveEvent) => {
        const delta = (moveEvent.clientX - startX) * direction;
        setFrameWidth(startWidth + (delta * 2) / zoom);
      };

      const onUp = () => handle.removeEventListener('pointermove', onMove);

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp, { once: true });
      handle.addEventListener('pointercancel', onUp, { once: true });
    });

    // The handle is a real button, so arrow keys resize without a mouse —
    // 10px steps, 50px with Shift, each growing the frame toward the side
    // the key points at.
    handle.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();

      const step = event.shiftKey ? 50 : 10;
      const delta = (event.key === 'ArrowLeft' ? -step : step) * direction;
      setFrameWidth(frameWidth + delta * 2);
    });
  }

  root
    .querySelector('[data-action="zoom-out"]')
    .addEventListener('click', () => setZoom(zoom - ZOOM_STEP));
  root
    .querySelector('[data-action="zoom-in"]')
    .addEventListener('click', () => setZoom(zoom + ZOOM_STEP));
  zoomValue.addEventListener('click', () => setZoom(1));

  // Pinch-to-zoom on a trackpad reads as a `wheel` event with `ctrlKey` set
  // in Chromium and Firefox — the same event as Ctrl/Cmd+wheel. Safari sends
  // its own `gesture*` events instead, with the pinch as a running `scale`.
  // Both are scaled multiplicatively so a pinch feels the same at 25% as at
  // 200%, and both are cancelled so the browser doesn't zoom the whole page.
  function onWheel(event) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    // A trackpad pinch sends deltas of a few pixels, a mouse wheel notch
    // around a hundred: capping each event keeps a notch to a ~10% step.
    const delta = Math.max(-10, Math.min(10, event.deltaY));
    setZoom(zoom * Math.exp(-delta * 0.01));
  }

  let gestureStartZoom = zoom;

  function onGestureStart(event) {
    event.preventDefault();
    gestureStartZoom = zoom;
  }

  function onGestureChange(event) {
    event.preventDefault();
    setZoom(gestureStartZoom * event.scale);
  }

  function listenForZoomGestures(target) {
    target.addEventListener('wheel', onWheel, { passive: false });
    target.addEventListener('gesturestart', onGestureStart);
    target.addEventListener('gesturechange', onGestureChange);
  }

  listenForZoomGestures(canvas);

  // Over the preview, the pointer is in the iframe's document: its events
  // never bubble up to the canvas, so the gestures are caught there too. The
  // preview is same-origin, and each load is a fresh window to listen on.
  const previewFrame = root.querySelector('[data-preview]');
  const listenInPreview = () => {
    if (previewFrame.contentWindow) {
      listenForZoomGestures(previewFrame.contentWindow);
    }
  };
  previewFrame.addEventListener('load', listenInPreview);
  if (previewFrame.contentDocument?.readyState === 'complete')
    listenInPreview();

  // The default zoom fits the frame's width into the stage, so the first view
  // is the whole page rather than its middle — never above 100%, since a
  // canvas narrower than the stage is already whole.
  function fitZoom() {
    const style = getComputedStyle(canvas);
    const available =
      canvas.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    return Math.min(1, available / (frameWidth + 2));
  }

  zoom = Math.max(MIN_ZOOM, fitZoom());

  applyFrameWidth();
  applyZoom();

  /* Collapsible panel: the preview takes the whole screen when you are not
     editing. A single toggle floats on the stage, so it stays in the same spot
     whether the panel is open or not — and keeps focus across the switch. */
  const panelToggle = root.querySelector('[data-action="toggle-panel"]');
  const panelTooltip = root.querySelector('[data-panel-tooltip]');

  // The name carries the state instead of `aria-expanded`: the tooltip shows
  // the same words, and a name that matched it while the state lived apart
  // would be read as "Editing panel, expanded, Hide panel".
  panelToggle.addEventListener('click', () => {
    const collapsed = root.dataset.collapsed !== 'true';
    const label = collapsed ? 'Show panel' : 'Hide panel';
    root.dataset.collapsed = String(collapsed);
    panelToggle.setAttribute('aria-label', label);
    panelTooltip.text = label;
  });

  dom.brandName.addEventListener('input', (event) => {
    state.name = event.target.value;

    if (slugIsDerived) {
      state.slug = slugify(state.name);
      dom.brandSlug.value = state.slug;
    }

    save(state);

    // Only the scene's label depends on the name; reapplying every token on
    // each keystroke would be needlessly expensive.
    const element = previewDocument()?.documentElement;
    if (!element) return;
    element.dataset.brandName = state.name;
    element.ownerDocument.dispatchEvent(
      new element.ownerDocument.defaultView.Event('lui-brand-update')
    );
  });

  dom.brandSlug.addEventListener('change', (event) => {
    // An emptied field is a request to follow the name again.
    state.slug = slugify(event.target.value) || slugify(state.name);
    event.target.value = state.slug;
    slugIsDerived = state.slug === slugify(state.name);
    commit();
  });

  dom.frame.addEventListener('load', apply);

  syncIdentity();
  renderPanel();
  if (previewDocument()?.readyState === 'complete') apply();
}
