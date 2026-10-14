import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiStatus } from './status.ts';

// Only the element under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-status', LuiStatus);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const status = host.querySelector('lui-status');
  await status.updateComplete;
  return status;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const $ = (status, selector) => status.shadowRoot.querySelector(selector);
const rect = (el) => el.getBoundingClientRect();
const isHidden = (el) => el.classList.contains('status__label--hidden');

describe('indicator', () => {
  it('shows a 20px icon for a feedback status', async () => {
    const status = await mount('<lui-status variant="success"></lui-status>');

    expect($(status, '.status__icon')).not.toBeNull();
    expect($(status, '.status__dot')).toBeNull();
    expect(rect($(status, '.status__icon')).width).toBe(20);
  });

  it('swaps the icon for an 8px dot with `dot`', async () => {
    const status = await mount(
      '<lui-status variant="danger" dot></lui-status>'
    );

    expect($(status, '.status__icon')).toBeNull();
    expect(rect($(status, '.status__dot')).width).toBe(8);
  });

  it('draws a 16px dot for every social status, with or without `dot`', async () => {
    for (const variant of ['online', 'away', 'busy', 'offline']) {
      const status = await mount(
        `<lui-status variant="${variant}"></lui-status>`
      );
      expect($(status, '.status__icon'), variant).toBeNull();
      expect(rect($(status, '.status__dot')).width, variant).toBe(16);
    }
  });

  it('paints the social ring in the dot colour so it reads as one disc', async () => {
    const status = await mount('<lui-status variant="busy"></lui-status>');
    const style = getComputedStyle($(status, '.status__dot'));

    expect(parseFloat(style.borderTopWidth)).toBe(2);
    expect(style.borderTopColor).toBe(style.backgroundColor);
  });

  it('draws a shape in the social dot for every status but online', async () => {
    const after = async (variant) =>
      getComputedStyle(
        $(
          await mount(`<lui-status variant="${variant}"></lui-status>`),
          '.status__dot'
        ),
        '::after'
      ).content;

    expect(await after('online')).toBe('none');
    for (const variant of ['away', 'busy', 'offline']) {
      expect(await after(variant), variant).not.toBe('none');
    }
  });

  it('gives each variant its own colour', async () => {
    const colours = new Set();
    for (const variant of ['success', 'caution', 'danger', 'info']) {
      const status = await mount(
        `<lui-status variant="${variant}" dot></lui-status>`
      );
      colours.add(getComputedStyle($(status, '.status__dot')).backgroundColor);
    }
    for (const variant of ['online', 'away', 'busy', 'offline']) {
      const status = await mount(
        `<lui-status variant="${variant}"></lui-status>`
      );
      colours.add(getComputedStyle($(status, '.status__dot')).backgroundColor);
    }
    // online and success share green.3, busy and danger red.3, away and
    // caution orange.3: the same hue means the same thing.
    expect(colours.size).toBe(5);
  });

  it('falls back to success for an unknown variant', async () => {
    const status = await mount('<lui-status variant="nope"></lui-status>');
    expect($(status, '.status').classList.contains('status--success')).toBe(
      true
    );
  });

  it('is hidden from assistive technology', async () => {
    const status = await mount('<lui-status label="Online"></lui-status>');
    expect($(status, '.status__indicator').getAttribute('aria-hidden')).toBe(
      'true'
    );
  });
});

describe('text', () => {
  it('shows the label and the description', async () => {
    const status = await mount(
      '<lui-status label="Pago" description="Há 2 minutos"></lui-status>'
    );

    expect($(status, '.status__label').textContent).toBe('Pago');
    expect(isHidden($(status, '.status__label'))).toBe(false);
    expect($(status, '.status__description').textContent).toBe('Há 2 minutos');
  });

  it('colours the description as a caption, apart from the label', async () => {
    const status = await mount(
      '<lui-status label="Pago" description="Há 2 minutos"></lui-status>'
    );

    expect(getComputedStyle($(status, '.status__description')).color).not.toBe(
      getComputedStyle($(status, '.status__label')).color
    );
  });

  it('says the variant name to assistive technology when there is no label', async () => {
    const status = await mount('<lui-status variant="away"></lui-status>');
    const label = $(status, '.status__label');

    expect(label.textContent).toBe('Away');
    expect(isHidden(label)).toBe(true);
    // Nothing visible besides the indicator, so the host is the indicator.
    expect(rect(status).width).toBe(20);
  });

  it('keeps the label for assistive technology only with `hide-label`', async () => {
    const status = await mount(
      '<lui-status variant="busy" label="Em reunião" hide-label></lui-status>'
    );
    const label = $(status, '.status__label');

    expect(label.textContent).toBe('Em reunião');
    expect(isHidden(label)).toBe(true);
    expect(rect(label).width).toBeLessThanOrEqual(1);
  });

  it('falls back to the variant name when the label and description are removed', async () => {
    const status = await mount(
      '<lui-status variant="info" label="Novo" description="Agora"></lui-status>'
    );
    status.removeAttribute('label');
    status.removeAttribute('description');
    await status.updateComplete;
    const label = $(status, '.status__label');

    expect(label.textContent).toBe('Info');
    expect(isHidden(label)).toBe(true);
    expect($(status, '.status__description')).toBeNull();
  });

  it('lines the indicator up with the first line of the label', async () => {
    const status = await mount(
      '<lui-status label="Pago" description="Há 2 minutos"></lui-status>'
    );

    expect(rect($(status, '.status__indicator')).top).toBe(
      rect($(status, '.status__label')).top
    );
  });
});

describe('size', () => {
  const fontSize = (el) => parseFloat(getComputedStyle(el).fontSize);
  const centre = (el) => {
    const r = rect(el);
    return r.top + r.height / 2;
  };
  // The middle of the capitals on the label's first line: a probe one cap high,
  // sitting on that line's baseline, has its centre exactly there. The middle
  // of the line box is not the target — the text does not sit centred in it.
  const capCentre = (label) => {
    const probe = document.createElement('span');
    probe.style.cssText =
      'display: inline-block; inline-size: 0; block-size: 1cap; vertical-align: baseline';
    label.prepend(probe);
    const y = centre(probe);
    probe.remove();
    return y;
  };

  it('makes the label larger at lg and leaves the description alone', async () => {
    const html = (size) =>
      `<lui-status size="${size}" label="Pago" description="Há 2 minutos"></lui-status>`;
    const md = await mount(html('md'));
    const lg = await mount(html('lg'));

    expect(fontSize($(lg, '.status__label'))).toBeGreaterThan(
      fontSize($(md, '.status__label'))
    );
    expect(fontSize($(lg, '.status__description'))).toBe(
      fontSize($(md, '.status__description'))
    );
  });

  it('falls back to md for an unknown size', async () => {
    const status = await mount(
      '<lui-status size="xl" label="Pago"></lui-status>'
    );
    expect($(status, '.status').classList.contains('status--md')).toBe(true);
  });

  it('keeps the icon and the dots at their size at lg', async () => {
    const icon = await mount(
      '<lui-status size="lg" label="Pago"></lui-status>'
    );
    const dot = await mount(
      '<lui-status size="lg" dot label="Pago"></lui-status>'
    );
    const social = await mount(
      '<lui-status size="lg" variant="away" label="Ausente"></lui-status>'
    );

    expect(rect($(icon, '.status__icon')).height).toBe(20);
    expect(rect($(dot, '.status__dot')).height).toBe(8);
    expect(rect($(social, '.status__dot')).height).toBe(16);
  });

  for (const size of ['md', 'lg']) {
    for (const [kind, attrs, part] of [
      ['icon', '', '.status__icon'],
      ['dot', 'dot', '.status__dot'],
      ['social dot', 'variant="busy"', '.status__dot'],
    ]) {
      it(`centres the ${kind} on the capitals of the first line of a ${size} label`, async () => {
        const status = await mount(
          `<lui-status size="${size}" ${attrs} label="Sincronização falhou ao enviar os arquivos" description="Há 5 minutos" style="inline-size: 120px"></lui-status>`
        );
        const label = $(status, '.status__label');

        // The label really wraps, so the first line is not the whole label.
        expect(rect(label).height).toBeGreaterThan(
          parseFloat(getComputedStyle(label).lineHeight) * 1.5
        );
        expect(centre($(status, part))).toBeCloseTo(capCentre(label), 1);
      });
    }
  }
});

describe('pulse', () => {
  const animation = async (html, part) =>
    getComputedStyle($(await mount(html), part)).animationName;

  it('does not animate without `pulse`', async () => {
    expect(
      await animation(
        '<lui-status variant="online"></lui-status>',
        '.status__dot'
      )
    ).toBe('none');
  });

  it('animates the dot and the icon with `pulse`', async () => {
    expect(
      await animation(
        '<lui-status variant="online" pulse></lui-status>',
        '.status__dot'
      )
    ).toBe('lui-status-pulse');
    expect(
      await animation(
        '<lui-status variant="info" pulse></lui-status>',
        '.status__icon'
      )
    ).toBe('lui-status-pulse');
  });

  it('leaves the mark where it was', async () => {
    const at = async (html) =>
      rect($(await mount(html), '.status__icon')).top -
      rect(mounted.at(-1)).top;

    expect(await at('<lui-status label="Pago" pulse></lui-status>')).toBe(
      await at('<lui-status label="Pago"></lui-status>')
    );
  });
});
