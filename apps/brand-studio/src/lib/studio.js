/**
 * The Brand Studio interface: builds the controls from the schema, holds the
 * brand state and projects every change into the preview iframe.
 *
 * The controls are Let's UI components themselves. `lui-tabs` is used purely as
 * a navigation bar — it serializes the content of its `lui-tab`s to HTML, which
 * would discard the fields' listeners, so the panel is rendered outside it and
 * swapped on the `tab-change` event.
 */

import { FAMILIES, STEPS, SECTIONS, FONT_STACKS, brandVar } from './schema.js';
import {
  createDefaultState,
  toCssVars,
  changedPaths,
  toFiles,
  resolverSnippet,
  save,
  load,
  clear,
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
  viewportModel,
  viewportSelection,
  viewportWidth,
} from './breakpoints.js';
import { parseClamp, buildClamp } from './clamp.js';
import { zip } from './zip.js';
import { randomBrand } from './random.js';

const THEME_LABEL = { light: 'light', dark: 'dark' };

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

/** A design system field with the "changed" marker on its wrapper. */
const field = (token, control) =>
  el('div', { class: 'st-field', 'data-token': token }, control);

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

export function mountStudio({ root, templates, meta }) {
  const defaults = createDefaultState(templates, meta);
  const stored = load();

  let state = stored ?? structuredClone(defaults);
  let theme = 'light';
  let scene = 'landing';
  let activeTab = 'color';

  /* As long as the identifier is exactly what the name would generate, it is
     derived and follows the name field. The moment it diverges, it has been
     edited by hand and stops being overwritten. Comparing instead of storing a
     flag avoids one more field in the persisted state — and it self-corrects
     when the user clears their customization. */
  let slugIsDerived = state.slug === slugify(state.name);

  const dom = {
    frame: root.querySelector('[data-preview]'),
    panel: root.querySelector('[data-panel]'),
    tabs: root.querySelector('[data-tabs]'),
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

    document_.dispatchEvent(
      new document_.defaultView.Event('lui-brand-update')
    );
  }

  /** The column ruler follows the Grid tab. */
  function syncOverlay() {
    const element = previewDocument()?.documentElement;
    if (element)
      element.dataset.gridOverlay = activeTab === 'grid' ? 'on' : 'off';
  }

  /** Single source of truth: persists, projects and refreshes the indicators. */
  function commit({ rerender = false } = {}) {
    save(state);
    apply();
    syncViewportOptions();
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

  /* ── Colors ──────────────────────────────────────────────── */

  function colorSection() {
    return el('div', { class: 'st-section' }, [
      caption(
        `Editing the ${THEME_LABEL[theme]} theme. Use the theme button in the preview bar to switch.`
      ),
      ...FAMILIES.map((family) =>
        el('div', { class: 'st-group' }, [
          el('lui-divider', { label: family }),
          rampGenerator(family),
          el(
            'div',
            { class: 'st-ramp' },
            STEPS.map((step) => colorRow(family, step))
          ),
          contrastBadges(family),
        ])
      ),
    ]);
  }

  function colorRow(family, step) {
    const path = `${family}.${step}`;
    const hex = tokenValueToHex(state.colors[theme][path]);

    const picker = el('input', {
      type: 'color',
      class: 'st-swatch',
      value: hex,
      'aria-label': `${family} ${step}`,
    });

    const input = el('lui-input', {
      size: 'md',
      value: hex,
      'aria-label': `${family} ${step} em hexadecimal`,
      class: 'st-hex',
    });

    const write = (value) => {
      if (!isValidHex(value)) return;
      state.colors[theme][path] = hexToTokenValue(value);
      picker.value = normalizeHex(value);
      input.value = normalizeHex(value);
      commit();
    };

    picker.addEventListener('input', (event) => write(event.target.value));
    input.addEventListener('change', (event) => write(event.target.value));

    return el(
      'div',
      { class: 'st-color', 'data-token': `${theme}:color.${path}` },
      [
        el('span', { class: 'st-color__step', text: String(step) }),
        picker,
        input,
      ]
    );
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
      section.groups.map((group) =>
        el('div', { class: 'st-group' }, [
          el('lui-divider', { label: group.label }),
          group.hint ? caption(group.hint) : null,
          el(
            'div',
            { class: 'st-fields' },
            group.fields.map((item) => control(item))
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

  function fontFamilyControl(item, value, write) {
    const input = el('lui-input', {
      size: 'md',
      label: item.label,
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

    const presets = el('lui-native-select', {
      size: 'md',
      placeholder: 'Ready-made stacks…',
      'aria-label': `Ready-made stacks for ${item.label}`,
      options: FONT_STACKS.map((stack) => stack.label).join(','),
    });

    presets.addEventListener('change', (event) => {
      const stack = FONT_STACKS[event.target.selected - 1];
      if (!stack) return;
      input.value = stack.value.join(', ');
      write([...stack.value]);
    });

    return field(item.path, el('div', { class: 'st-stack' }, [input, presets]));
  }

  function clampControl(item, value, write) {
    const parsed = parseClamp(value) ?? { min: 1, max: 1 };

    // The design system's number input brings its own steppers and ignores
    // `suffix`, so the unit lives in the label.
    const bound = (key, label) => {
      const input = el('lui-input', {
        size: 'md',
        type: 'number',
        step: '0.001',
        min: '0.1',
        label,
        value: String(parsed[key]),
      });

      input.addEventListener('change', (event) => {
        parsed[key] = Number(event.target.value);
        write(buildClamp(parsed.min, parsed.max));
      });

      return input;
    };

    return field(
      item.path,
      el('div', { class: 'st-pair' }, [
        bound('min', `${item.label} · minimum (rem)`),
        bound('max', `${item.label} · maximum (rem)`),
      ])
    );
  }

  function selectControl(item, value, write) {
    const select = el('lui-native-select', {
      size: 'md',
      label: item.label,
      placeholder: 'Select',
      options: item.options.map((option) => option.label).join(','),
      selected: String(selectIndex(item.options, value)),
    });

    select.addEventListener('change', (event) => {
      const option = item.options[event.target.selected - 1];
      if (option) write(option.value);
    });

    return field(item.path, select);
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

  function dimensionControl(item, value, write) {
    const isBreakpoint = item.path.startsWith(BREAKPOINT_PREFIX);
    const bounds = isBreakpoint
      ? breakpointBounds(
          state.foundation,
          item.path.slice(BREAKPOINT_PREFIX.length)
        )
      : { min: item.min ?? 0, max: item.max ?? 9999 };

    const input = el('lui-input', {
      size: 'md',
      type: 'number',
      label: `${item.label} (${value.unit ?? 'px'})`,
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
      write({ value: Number(raw), unit: value.unit ?? 'px' });
    });

    return field(item.path, input);
  }

  function numberControl(item, value, write) {
    const input = el('lui-input', {
      size: 'md',
      type: 'number',
      label: item.label,
      min: String(item.min ?? 0),
      max: String(item.max ?? 100),
      step: String(item.step ?? 1),
      value: String(value),
    });

    input.addEventListener('change', (event) => {
      const next = Number(event.target.value);
      write(item.integer ? Math.round(next) : next);
    });

    return field(item.path, input);
  }

  /* ── Navigation and rendering ─────────────────────────────── */

  const TABS = [
    { id: 'color', label: 'Colors' },
    ...SECTIONS.map((section) => ({ id: section.id, label: section.label })),
  ];

  function renderTabs() {
    dom.tabs.replaceChildren(
      ...TABS.map((tab) =>
        el('lui-tab', { label: tab.label, active: tab.id === activeTab })
      )
    );

    dom.tabs.addEventListener('tab-change', (event) => {
      activeTab = TABS[event.detail.index].id;
      renderPanel();
    });
  }

  function renderPanel() {
    const section = SECTIONS.find((item) => item.id === activeTab);
    dom.panel.replaceChildren(
      section ? foundationSection(section) : colorSection()
    );
    dom.panel.scrollTop = 0;
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

  function reset() {
    state = structuredClone(defaults);
    clear();
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
  root.querySelector('[data-action="reset"]').addEventListener('click', reset);
  root
    .querySelector('[data-action="randomize"]')
    .addEventListener('click', randomize);
  root
    .querySelector('[data-action="import-trigger"]')
    .addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) =>
    importTokens([...event.target.files])
  );

  root.querySelector('[data-guide]').addEventListener('click', () => {
    root.querySelector('[data-resolver]').textContent = resolverSnippet(
      state.slug || 'lets-ui'
    );
  });

  /* The theme belongs to the preview, not to the chrome: `data-preview-theme`
     exists only so the icon knows which of its two faces to show. */
  const themeToggle = root.querySelector('[data-theme-toggle]');

  themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.dataset.previewTheme = theme;
    // The label carries the state: `aria-pressed` on the host never reaches the `button`.
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
    if (activeTab === 'color') renderPanel();
    syncPreviewLink();
    apply();
  });

  /* Preview scene: the landing shows the brand in a real composition, and the
     token sheet gives the raw value of every step. */
  const SCENES = ['landing', 'tokens'];
  const sceneSelect = root.querySelector('[data-scene]');
  const previewLink = root.querySelector('[data-preview-link]');

  /**
   * The standalone preview opens in a tab of its own, with no studio around it
   * to write the brand onto its `:root`. It reads the saved state instead, so
   * the link has to carry what the state does not: the scene and the theme,
   * which belong to the studio's chrome rather than to the brand.
   */
  function syncPreviewLink() {
    previewLink.setAttribute('href', `/preview?scene=${scene}&theme=${theme}`);
  }

  sceneSelect.addEventListener('change', () => {
    scene = SCENES[sceneSelect.selected - 1] ?? 'landing';
    syncPreviewLink();
    apply();
  });

  syncPreviewLink();

  /**
   * The width selector is a reading of the brand's breakpoints, not a fixed
   * list: editing `md` changes the width the preview then simulates.
   */
  const viewport = root.querySelector('[data-viewport]');

  let viewportSteps = ['full'];
  let viewportSignature = '';

  function syncViewportOptions() {
    const model = viewportModel(state.foundation);
    if (model.signature === viewportSignature) return;
    viewportSignature = model.signature;

    const previous = viewportSteps[viewport.selected - 1];
    viewportSteps = model.steps;

    viewport.setAttribute('options', model.labels.join(','));
    viewport.setAttribute(
      'selected',
      String(viewportSelection(viewportSteps, previous))
    );
    applyViewport();
  }

  function applyViewport() {
    const width = viewportWidth(
      state.foundation,
      viewportSteps[viewport.selected - 1]
    );

    dom.frame.style.maxWidth = width ? `${width}px` : '';
  }

  viewport.addEventListener('change', applyViewport);

  /* Collapsible panel: the preview takes the whole screen when you are not
     editing. Collapsing starts from the panel itself; expanding comes from the
     stage bar, because it is the only foothold left on screen. */
  const collapseButton = root.querySelector('[data-action="collapse-panel"]');
  const expandButton = root.querySelector('[data-action="expand-panel"]');

  function setCollapsed(collapsed) {
    root.dataset.collapsed = String(collapsed);
    // Focus must not land on a button that just left the screen. The target is
    // the shadow DOM `button`: the component host is not focusable.
    const next = collapsed ? expandButton : collapseButton;
    next.shadowRoot?.querySelector('button')?.focus();
  }

  collapseButton.addEventListener('click', () => setCollapsed(true));
  expandButton.addEventListener('click', () => setCollapsed(false));

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
  syncViewportOptions();
  renderTabs();
  renderPanel();
  if (previewDocument()?.readyState === 'complete') apply();
}
