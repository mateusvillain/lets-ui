/**
 * Interface do Brand Studio: monta os controles a partir do schema, mantém o
 * estado da marca e projeta cada alteração no iframe de preview.
 *
 * Os controles são componentes do próprio Let's UI. O `lui-tabs` entra só como
 * barra de navegação — ele serializa o conteúdo dos `lui-tab` em HTML, o que
 * descartaria os listeners dos campos, então o painel é renderizado por fora e
 * trocado no evento `tab-change`.
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
import { parseClamp, buildClamp } from './clamp.js';

const THEME_LABEL = { light: 'claro', dark: 'escuro' };

/** Do menor para o maior: a ordem que os breakpoints precisam respeitar. */
const BREAKPOINT_ORDER = ['1xs', 'sm', 'md', 'lg', '1xl'];

const BREAKPOINT_PREFIX = 'grid.breakpoint.';

/* ── Helpers de DOM ─────────────────────────────────────────── */

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

/** Campo do design system com o marcador de "alterado" no invólucro. */
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
 * `lui-native-select` reserva o índice 0 para o placeholder, então a posição de
 * uma opção real é sempre `índice + 1`.
 */
const selectIndex = (options, value) =>
  options.findIndex((option) => option.value === value) + 1;

export function mountStudio({ root, templates, meta }) {
  const defaults = createDefaultState(templates, meta);
  const stored = load();

  let state = stored ?? structuredClone(defaults);
  let theme = 'light';
  let activeTab = 'color';

  const dom = {
    frame: root.querySelector('[data-preview]'),
    panel: root.querySelector('[data-panel]'),
    tabs: root.querySelector('[data-tabs]'),
    status: root.querySelector('[data-status]'),
    brandName: root.querySelector('[data-brand-name]'),
    brandSlug: root.querySelector('[data-brand-slug]'),
  };

  /* ── Aplicação no preview ─────────────────────────────────── */

  function previewDocument() {
    return dom.frame.contentDocument;
  }

  function apply() {
    const document_ = previewDocument();
    if (!document_?.documentElement) return;

    // O `data-brand` permanece na marca de referência: ela é a base do
    // cascade e todos os tokens editados entram por cima, inline.
    const element = document_.documentElement;
    element.setAttribute('data-theme', theme);
    syncOverlay();

    for (const [name, value] of Object.entries(toCssVars(state, theme))) {
      element.style.setProperty(name, value);
    }

    document_.dispatchEvent(
      new document_.defaultView.Event('lui-brand-update')
    );
  }

  /** A régua de colunas acompanha a aba Grid. */
  function syncOverlay() {
    const element = previewDocument()?.documentElement;
    if (element)
      element.dataset.gridOverlay = activeTab === 'grid' ? 'on' : 'off';
  }

  /** Fonte única de verdade: grava, projeta e atualiza os indicadores. */
  function commit({ rerender = false } = {}) {
    save(state);
    apply();
    syncViewportOptions();
    updateStatus();
    if (rerender) renderPanel();
    else refreshIndicators();
  }

  function updateStatus() {
    const count = changedPaths(state, defaults).size;

    dom.status.setAttribute(
      'label',
      count
        ? `${count} token${count > 1 ? 's' : ''} alterado${count > 1 ? 's' : ''}`
        : 'Sem alterações'
    );
    dom.status.setAttribute('variant', count ? 'primary' : 'neutral');
  }

  /** Marca visualmente os campos que divergem do padrão. */
  function refreshIndicators() {
    const changed = changedPaths(state, defaults);

    for (const node of dom.panel.querySelectorAll('[data-token]')) {
      node.dataset.changed = String(changed.has(node.dataset.token));
    }

    for (const badge of dom.panel.querySelectorAll('[data-contrast]')) {
      renderContrast(badge);
    }
  }

  /* ── Cores ────────────────────────────────────────────────── */

  function colorSection() {
    return el('div', { class: 'st-section' }, [
      caption(
        `Editando o tema ${THEME_LABEL[theme]}. Use o seletor de tema na barra do preview para trocar.`
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

  /** Gera os 8 degraus da família a partir de uma cor base. */
  function rampGenerator(family) {
    const picker = el('input', {
      type: 'color',
      class: 'st-swatch',
      value: tokenValueToHex(state.colors[theme][`${family}.5`]),
      'aria-label': `Cor base de ${family}`,
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
        label: 'Gerar escala',
        onclick: () => generate([theme]),
      }),
      el('lui-button', {
        size: 'md',
        variant: 'ghost',
        label: 'Claro + escuro',
        onclick: () => generate(['light', 'dark']),
      }),
    ]);
  }

  /**
   * Pares de contraste que decidem legibilidade na prática: superfície contra
   * texto e contra a cor de ação.
   */
  const CONTRAST_PAIRS = {
    primary: [
      ['primary.5', 'secondary.1', 'Ação sobre superfície'],
      ['primary.6', 'secondary.1', 'Ação pressionada'],
    ],
    secondary: [
      ['secondary.8', 'secondary.1', 'Texto sobre superfície'],
      ['secondary.5', 'secondary.1', 'Texto de apoio'],
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

  /* ── Fundação ─────────────────────────────────────────────── */

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
      placeholder: 'Pilhas prontas…',
      'aria-label': `Pilhas prontas para ${item.label}`,
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

    // O input numérico do design system traz seus próprios steppers e ignora
    // `suffix`, então a unidade vive no rótulo.
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
        bound('min', `${item.label} · mínimo (rem)`),
        bound('max', `${item.label} · máximo (rem)`),
      ])
    );
  }

  function selectControl(item, value, write) {
    const select = el('lui-native-select', {
      size: 'md',
      label: item.label,
      placeholder: 'Selecione',
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
   * Breakpoints precisam ser estritamente crescentes: um `sm` menor ou igual ao
   * `1xs` produziria media queries que nunca casam. A checagem olha só os
   * vizinhos porque a ordem inteira já foi validada nas edições anteriores.
   */
  function breakpointError(step, next) {
    const index = BREAKPOINT_ORDER.indexOf(step);
    const read = (other) =>
      state.foundation[`${BREAKPOINT_PREFIX}${other}`].value;

    const smaller = BREAKPOINT_ORDER[index - 1];
    const larger = BREAKPOINT_ORDER[index + 1];

    if (!Number.isFinite(next)) return 'Informe um valor em pixels.';
    if (smaller && next <= read(smaller)) {
      return `Precisa ser maior que ${smaller} (${read(smaller)}px).`;
    }
    if (larger && next >= read(larger)) {
      return `Precisa ser menor que ${larger} (${read(larger)}px).`;
    }

    return null;
  }

  function dimensionControl(item, value, write) {
    const input = el('lui-input', {
      size: 'md',
      type: 'number',
      label: `${item.label} (${value.unit ?? 'px'})`,
      min: String(item.min ?? 0),
      max: String(item.max ?? 9999),
      step: String(item.step ?? 1),
      value: String(value.value),
    });

    input.addEventListener('change', (event) => {
      const next = Number(event.target.value);
      const error = item.path.startsWith(BREAKPOINT_PREFIX)
        ? breakpointError(item.path.slice(BREAKPOINT_PREFIX.length), next)
        : null;

      if (error) {
        input.setAttribute('error', '');
        input.setAttribute('error-text', error);
        return;
      }

      input.removeAttribute('error');
      write({ value: next, unit: value.unit ?? 'px' });
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

  /* ── Navegação e render ───────────────────────────────────── */

  const TABS = [
    { id: 'color', label: 'Cores' },
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

  /* ── Ações globais ────────────────────────────────────────── */

  function download(name, content) {
    const url = URL.createObjectURL(
      new Blob([content], { type: 'application/json' })
    );
    const anchor = Object.assign(document.createElement('a'), {
      href: url,
      download: name,
    });
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportTokens() {
    for (const [name, tree] of Object.entries(toFiles(state, templates))) {
      download(name, `${JSON.stringify(tree, null, 2)}\n`);
    }
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

  function syncIdentity() {
    dom.brandName.value = state.name;
    dom.brandSlug.value = state.slug;
  }

  /* ── Ligações ─────────────────────────────────────────────── */

  const fileInput = root.querySelector('[data-action="import"]');

  root
    .querySelector('[data-action="export"]')
    .addEventListener('click', exportTokens);
  root.querySelector('[data-action="reset"]').addEventListener('click', reset);
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

  root
    .querySelector('[data-theme-switch]')
    .addEventListener('change', (event) => {
      theme = event.target.checked ? 'dark' : 'light';
      if (activeTab === 'color') renderPanel();
      apply();
    });

  /**
   * O seletor de largura é uma leitura dos breakpoints da marca, não uma lista
   * fixa: editar `md` muda a largura que o preview passa a simular.
   */
  const viewport = root.querySelector('[data-viewport]');

  let viewportSteps = ['full'];
  let viewportSignature = '';

  function syncViewportOptions() {
    const entries = BREAKPOINT_ORDER.map((step) => ({
      step,
      width: state.foundation[`${BREAKPOINT_PREFIX}${step}`].value,
    })).sort((a, b) => b.width - a.width);

    const signature = entries
      .map((entry) => `${entry.step}:${entry.width}`)
      .join(',');
    if (signature === viewportSignature) return;
    viewportSignature = signature;

    // A seleção acompanha o breakpoint, não o número: quem estava vendo o
    // preview em `sm` continua em `sm` depois de mudar o valor de `sm`.
    const previous = viewportSteps[viewport.selected - 1];
    viewportSteps = ['full', ...entries.map((entry) => entry.step)];

    viewport.setAttribute(
      'options',
      [
        'Preencher',
        ...entries.map((entry) => `${entry.width} — ${entry.step}`),
      ].join(',')
    );

    const index = viewportSteps.indexOf(previous);
    viewport.setAttribute('selected', String(index > 0 ? index + 1 : 1));
    applyViewport();
  }

  function applyViewport() {
    const step = viewportSteps[viewport.selected - 1];
    const width =
      step && step !== 'full'
        ? state.foundation[`${BREAKPOINT_PREFIX}${step}`].value
        : null;

    dom.frame.style.maxWidth = width ? `${width}px` : '';
  }

  viewport.addEventListener('change', applyViewport);

  /* Painel colapsável: o preview ocupa a tela inteira quando não se está
     editando. */
  const toggle = root.querySelector('[data-action="toggle-panel"]');

  toggle.addEventListener('click', () => {
    const collapsed = root.dataset.collapsed !== 'true';
    root.dataset.collapsed = String(collapsed);
    toggle.setAttribute(
      'label',
      collapsed ? 'Mostrar painel' : 'Ocultar painel'
    );
    toggle.setAttribute('aria-expanded', String(!collapsed));
  });

  dom.brandName.addEventListener('input', (event) => {
    state.name = event.target.value;
    save(state);
  });

  dom.brandSlug.addEventListener('change', (event) => {
    state.slug = event.target.value.trim().toLowerCase().replace(/\s+/g, '-');
    event.target.value = state.slug;
    commit();
  });

  dom.frame.addEventListener('load', apply);

  syncIdentity();
  syncViewportOptions();
  renderTabs();
  renderPanel();
  if (previewDocument()?.readyState === 'complete') apply();
}
