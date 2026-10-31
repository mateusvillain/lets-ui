import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { cdp } from 'vitest/browser';
import { contrast } from '../../test/contrast.js';
import { LuiProgressBar } from './progress-bar.ts';

customElements.define('lui-progress-bar', LuiProgressBar);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.style.width = '400px';
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const progress = host.querySelector('lui-progress-bar');
  await progress.updateComplete;
  return progress;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const part = (progress, name) =>
  progress.shadowRoot.querySelector(`.progress-bar__${name}`);
const root = (progress) => progress.shadowRoot.querySelector('.progress-bar');
const bar = (progress) =>
  progress.shadowRoot.querySelector('[role="progressbar"]');

describe('determinate', () => {
  it('exposes the value, the range and the progressbar role', async () => {
    const progress = await mount(
      '<lui-progress-bar value="40"></lui-progress-bar>'
    );

    expect(bar(progress).getAttribute('aria-valuenow')).toBe('40');
    expect(bar(progress).getAttribute('aria-valuemin')).toBe('0');
    expect(bar(progress).getAttribute('aria-valuemax')).toBe('100');
  });

  it('fills the track in proportion to value over max', async () => {
    const progress = await mount(
      '<lui-progress-bar value="3" max="4"></lui-progress-bar>'
    );
    const track = part(progress, 'track').getBoundingClientRect();
    const fill = part(progress, 'indicator').getBoundingClientRect();

    expect(bar(progress).getAttribute('aria-valuemax')).toBe('4');
    expect((fill.right - track.left) / track.width).toBeCloseTo(0.75, 2);
    expect(part(progress, 'value').textContent.trim()).toBe('75%');
  });

  it('clamps a value outside the range', async () => {
    const over = await mount(
      '<lui-progress-bar value="140"></lui-progress-bar>'
    );
    const under = await mount(
      '<lui-progress-bar value="-10"></lui-progress-bar>'
    );

    expect(bar(over).getAttribute('aria-valuenow')).toBe('100');
    expect(bar(under).getAttribute('aria-valuenow')).toBe('0');
  });

  it('rounds the percentage down, so 100% means done', async () => {
    const almost = await mount(
      '<lui-progress-bar value="99.6"></lui-progress-bar>'
    );
    const exact = await mount(
      '<lui-progress-bar value="29"></lui-progress-bar>'
    );

    expect(part(almost, 'value').textContent.trim()).toBe('99%');
    expect(part(exact, 'value').textContent.trim()).toBe('29%');
  });

  it('hides the value text on request', async () => {
    const progress = await mount(
      '<lui-progress-bar value="40" hide-value></lui-progress-bar>'
    );
    expect(part(progress, 'value')).toBeNull();
  });

  it('shows a value in its own unit and reads it as aria-valuetext', async () => {
    const progress = await mount(
      '<lui-progress-bar value="3.2" max="10" value-text="3.2 GB of 10 GB"></lui-progress-bar>'
    );

    expect(part(progress, 'value').textContent.trim()).toBe('3.2 GB of 10 GB');
    expect(bar(progress).getAttribute('aria-valuetext')).toBe(
      '3.2 GB of 10 GB'
    );
    expect(bar(progress).getAttribute('aria-valuenow')).toBe('3.2');
    expect(bar(progress).getAttribute('aria-valuemax')).toBe('10');
  });

  it('leaves aria-valuetext out for a plain percentage', async () => {
    const progress = await mount(
      '<lui-progress-bar value="40"></lui-progress-bar>'
    );
    expect(bar(progress).hasAttribute('aria-valuetext')).toBe(false);
  });
});

describe('indeterminate', () => {
  it('drops aria-valuenow and the value text when value is omitted', async () => {
    const progress = await mount('<lui-progress-bar></lui-progress-bar>');

    expect(bar(progress).hasAttribute('aria-valuenow')).toBe(false);
    expect(part(progress, 'value')).toBeNull();
    expect(
      root(progress).classList.contains('progress-bar--indeterminate')
    ).toBe(true);
  });

  it('treats an empty value attribute as indeterminate', async () => {
    const progress = await mount(
      '<lui-progress-bar value=""></lui-progress-bar>'
    );

    expect(bar(progress).hasAttribute('aria-valuenow')).toBe(false);
    expect(
      root(progress).classList.contains('progress-bar--indeterminate')
    ).toBe(true);
  });

  it('grows the fill from the start edge when a value arrives', async () => {
    const progress = await mount('<lui-progress-bar></lui-progress-bar>');
    const track = part(progress, 'track').getBoundingClientRect();

    expect(part(progress, 'indicator').getBoundingClientRect().right).toBe(
      track.left
    );
  });

  it('mirrors the fill and the sweep in right-to-left', async () => {
    const ltr = await mount('<lui-progress-bar></lui-progress-bar>');
    const rtl = await mount('<lui-progress-bar dir="rtl"></lui-progress-bar>');
    const filled = await mount(
      '<lui-progress-bar dir="rtl" value="25"></lui-progress-bar>'
    );
    const animation = (progress) =>
      getComputedStyle(part(progress, 'track'), '::after').animationName;
    const track = part(filled, 'track').getBoundingClientRect();
    const fill = part(filled, 'indicator').getBoundingClientRect();

    expect((track.right - fill.left) / track.width).toBeCloseTo(0.25, 2);

    expect(animation(ltr)).toBe('lui-progress-bar-indeterminate');
    expect(animation(rtl)).toBe('lui-progress-bar-indeterminate-rtl');
  });

  it('turns indeterminate again when value is removed', async () => {
    const progress = await mount(
      '<lui-progress-bar value="20"></lui-progress-bar>'
    );
    progress.removeAttribute('value');
    await progress.updateComplete;

    expect(bar(progress).hasAttribute('aria-valuenow')).toBe(false);
  });
});

describe('appearance', () => {
  it('applies the variant and size, falling back on unknown values', async () => {
    const danger = await mount(
      '<lui-progress-bar value="10" variant="danger" size="lg"></lui-progress-bar>'
    );
    const unknown = await mount(
      '<lui-progress-bar value="10" variant="brand" size="xl"></lui-progress-bar>'
    );

    expect(root(danger).classList.contains('progress-bar--danger')).toBe(true);
    expect(part(danger, 'track').getBoundingClientRect().height).toBe(12);
    expect(root(unknown).classList.contains('progress-bar--primary')).toBe(
      true
    );
    expect(part(unknown, 'track').getBoundingClientRect().height).toBe(8);
  });

  it('puts label, track and value on one line when inline', async () => {
    const progress = await mount(
      '<lui-progress-bar value="10" label="Upload" label-placement="inline"></lui-progress-bar>'
    );
    const label = part(progress, 'label').getBoundingClientRect();
    const track = part(progress, 'track').getBoundingClientRect();
    const value = part(progress, 'value').getBoundingClientRect();

    expect(track.left).toBeGreaterThan(label.right);
    expect(value.left).toBeGreaterThan(track.right);
  });

  it('keeps the track visible beside a long inline label', async () => {
    const progress = await mount(
      '<lui-progress-bar value="10" label="Uploading quarterly financial report for the board.xlsx" label-placement="inline"></lui-progress-bar>'
    );
    const track = part(progress, 'track').getBoundingClientRect();

    expect(track.width).toBeGreaterThanOrEqual(100);
    expect(track.right).toBeLessThanOrEqual(
      root(progress).getBoundingClientRect().right
    );
  });

  it('puts the track under the label on top', async () => {
    const progress = await mount(
      '<lui-progress-bar value="10" label="Upload"></lui-progress-bar>'
    );
    const label = part(progress, 'label').getBoundingClientRect();
    const track = part(progress, 'track').getBoundingClientRect();

    expect(track.top).toBeGreaterThanOrEqual(label.bottom);
  });
});

describe('accessible name', () => {
  it('is labelled by the visible label and described by the caption', async () => {
    const progress = await mount(
      '<lui-progress-bar value="10" label="Upload" caption="2 of 20 files"></lui-progress-bar>'
    );

    expect(bar(progress).getAttribute('aria-labelledby')).toBe('label');
    expect(bar(progress).hasAttribute('aria-label')).toBe(false);
    expect(bar(progress).getAttribute('aria-describedby')).toBe('caption');
    expect(part(progress, 'caption').textContent).toBe('2 of 20 files');
  });

  it('keeps an empty live caption that adds no space', async () => {
    const progress = await mount(
      '<lui-progress-bar value="10" label="Upload"></lui-progress-bar>'
    );
    const caption = part(progress, 'caption');

    expect(caption.getAttribute('aria-live')).toBe('polite');
    expect(bar(progress).hasAttribute('aria-describedby')).toBe(false);
    expect(root(progress).getBoundingClientRect().bottom).toBe(
      part(progress, 'track').getBoundingClientRect().bottom
    );

    progress.caption = 'Upload complete';
    await progress.updateComplete;

    expect(part(progress, 'caption')).toBe(caption);
    expect(caption.textContent).toBe('Upload complete');
    expect(bar(progress).getAttribute('aria-describedby')).toBe('caption');
  });

  it('keeps a hidden label as the accessible name', async () => {
    const progress = await mount(
      '<lui-progress-bar value="10" label="Upload" hide-label></lui-progress-bar>'
    );

    expect(part(progress, 'label')).toBeNull();
    expect(bar(progress).getAttribute('aria-label')).toBe('Upload');
  });

  it('falls back to a default name without a label', async () => {
    const progress = await mount(
      '<lui-progress-bar value="10"></lui-progress-bar>'
    );
    expect(bar(progress).getAttribute('aria-label')).toBe('Progress bar');
  });
});

// --- Contrast, forced colors and reduced motion ---

const VARIANTS = ['primary', 'success', 'caution', 'danger'];
const background = (el) => getComputedStyle(el).backgroundColor;

// The page colour, resolved the way a token is in the page.
function surface() {
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'var(--lui-color-neutral-background-surface)';
  document.body.append(probe);
  mounted.push(probe);
  return background(probe);
}

const emulate = (features) =>
  cdp().send('Emulation.setEmulatedMedia', { features });

describe('contrast (WCAG 1.4.11)', () => {
  // The default brand, as Storybook and the docs render it: without
  // `data-brand`, the brand colours do not follow the dark theme.
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-brand');
  });

  describe.each(['light', 'dark'])('%s theme', (theme) => {
    it.each(VARIANTS.flatMap((v) => ['sm', 'md', 'lg'].map((s) => [v, s])))(
      'keeps the %s fill at 3:1 against the track and the page (%s)',
      async (variant, size) => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-brand', 'lets-ui');
        const progress = await mount(
          `<lui-progress-bar value="50" variant="${variant}" size="${size}"></lui-progress-bar>`
        );
        const fill = background(part(progress, 'indicator'));
        const track = background(part(progress, 'track'));

        expect(contrast(fill, track)).toBeGreaterThanOrEqual(3);
        expect(contrast(fill, surface())).toBeGreaterThanOrEqual(3);
      }
    );
  });
});

describe('forced colors', () => {
  afterEach(() => emulate([]));

  it('paints the fill and the sweep in Highlight and outlines the track', async () => {
    const determinate = await mount(
      '<lui-progress-bar value="50" size="sm"></lui-progress-bar>'
    );
    const indeterminate = await mount(
      '<lui-progress-bar size="sm"></lui-progress-bar>'
    );
    const height = part(determinate, 'track').getBoundingClientRect().height;
    await emulate([{ name: 'forced-colors', value: 'active' }]);
    const probe = document.createElement('div');
    probe.style.cssText = 'forced-color-adjust: none; background: Highlight';
    document.body.append(probe);
    mounted.push(probe);
    const track = getComputedStyle(part(determinate, 'track'));

    expect(background(part(determinate, 'indicator'))).toBe(background(probe));
    expect(
      getComputedStyle(part(indeterminate, 'track'), '::after').backgroundColor
    ).toBe(background(probe));
    expect(track.outlineStyle).toBe('solid');
    expect(track.outlineWidth).toBe('1px');
    // An outline adds no size, so the 4px track keeps its height.
    expect(part(determinate, 'track').getBoundingClientRect().height).toBe(
      height
    );
  });
});

describe('reduced motion', () => {
  afterEach(() => emulate([]));

  it('pulses the whole track instead of sweeping', async () => {
    const progress = await mount('<lui-progress-bar></lui-progress-bar>');
    await emulate([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const segment = getComputedStyle(part(progress, 'track'), '::after');

    expect(segment.animationName).toBe('lui-progress-bar-pulse');
    expect(segment.animationDuration).toBe('2.4s');
    expect(segment.width).toBe(getComputedStyle(part(progress, 'track')).width);
    expect(
      getComputedStyle(part(progress, 'indicator')).transitionDuration
    ).toBe('0s');
  });

  it('fades the pulse from full opacity down to 0.4', async () => {
    const progress = await mount('<lui-progress-bar></lui-progress-bar>');
    await emulate([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const [animation] = part(progress, 'track').getAnimations({
      subtree: true,
    });
    const opacities = animation.effect
      .getKeyframes()
      .map((frame) => Number(frame.opacity));

    expect(Math.max(...opacities)).toBe(1);
    expect(Math.min(...opacities)).toBeCloseTo(0.4);
  });
});
