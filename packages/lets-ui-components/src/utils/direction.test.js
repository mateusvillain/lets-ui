import '../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiDatePicker } from '../components/date-picker/date-picker.ts';
import { LuiDrawer } from '../components/drawer/drawer.ts';
import { LuiFloat } from '../components/float/float.ts';
import { LuiRadio } from '../components/radio/radio.ts';
import { LuiRadioGroup } from '../components/radio-group/radio-group.ts';
import { LuiScrollArea } from '../components/scroll-area/scroll-area.ts';
import { LuiSwitch } from '../components/switch/switch.ts';
import { LuiTab, LuiTabs } from '../components/tabs/tabs.ts';
import { LuiTooltip } from '../components/tooltip/tooltip.ts';
import { isRtl, ltrKey, physicalSide } from './direction.ts';

// Only the elements under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-date-picker', LuiDatePicker);
customElements.define('lui-drawer', LuiDrawer);
customElements.define('lui-float', LuiFloat);
customElements.define('lui-radio', LuiRadio);
customElements.define('lui-radio-group', LuiRadioGroup);
customElements.define('lui-scroll-area', LuiScrollArea);
customElements.define('lui-switch', LuiSwitch);
customElements.define('lui-tab', LuiTab);
customElements.define('lui-tabs', LuiTabs);
customElements.define('lui-tooltip', LuiTooltip);

const mounted = [];

async function mount(markup, selector) {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector(selector);
  await el.updateComplete;
  return el;
}

// A `dir` change reaches components through a MutationObserver, whose callback
// runs as a microtask; the re-render follows on the next update.
async function settle(el) {
  await Promise.resolve();
  await el.updateComplete;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const $ = (el, selector) => el.shadowRoot.querySelector(selector);

describe('helpers', () => {
  it('reads the direction from the closest dir', async () => {
    const ltr = await mount('<div><span></span></div>', 'div');
    const rtl = await mount('<div dir="rtl"><span></span></div>', 'div');
    expect(isRtl(ltr.querySelector('span'))).toBe(false);
    expect(isRtl(rtl.querySelector('span'))).toBe(true);
  });

  it('swaps only the horizontal arrows, and only right to left', async () => {
    const ltr = await mount('<div><span></span></div>', 'span');
    const rtl = await mount('<div dir="rtl"><span></span></div>', 'span');
    expect(ltrKey('ArrowLeft', ltr)).toBe('ArrowLeft');
    expect(ltrKey('ArrowLeft', rtl)).toBe('ArrowRight');
    expect(ltrKey('ArrowRight', rtl)).toBe('ArrowLeft');
    expect(ltrKey('ArrowUp', rtl)).toBe('ArrowUp');
    expect(ltrKey('Home', rtl)).toBe('Home');
  });

  it('resolves start and end to a physical side', async () => {
    const ltr = await mount('<div><span></span></div>', 'span');
    const rtl = await mount('<div dir="rtl"><span></span></div>', 'span');
    expect(physicalSide(ltr, 'start')).toBe('left');
    expect(physicalSide(ltr, 'end')).toBe('right');
    expect(physicalSide(rtl, 'start')).toBe('right');
    expect(physicalSide(rtl, 'end')).toBe('left');
  });
});

describe('keyboard', () => {
  const tabs = (dir) =>
    mount(
      `<div dir="${dir}"><lui-tabs>
        <lui-tab label="One"></lui-tab>
        <lui-tab label="Two"></lui-tab>
        <lui-tab label="Three"></lui-tab>
      </lui-tabs></div>`,
      'lui-tabs'
    );
  const tabButtons = (el) => [
    ...el.shadowRoot.querySelectorAll('[role="tab"]'),
  ];

  it('moves to the next tab with ArrowLeft right to left', async () => {
    const el = await tabs('rtl');
    await el.updateComplete;
    tabButtons(el)[0].focus();
    await userEvent.keyboard('{ArrowLeft}');
    await el.updateComplete;
    expect(el.shadowRoot.activeElement).toBe(tabButtons(el)[1]);
  });

  it('keeps ArrowRight as next left to right', async () => {
    const el = await tabs('ltr');
    await el.updateComplete;
    tabButtons(el)[0].focus();
    await userEvent.keyboard('{ArrowRight}');
    await el.updateComplete;
    expect(el.shadowRoot.activeElement).toBe(tabButtons(el)[1]);
  });

  it('moves to the next radio with ArrowLeft right to left', async () => {
    const group = await mount(
      `<div dir="rtl"><lui-radio-group name="g" label="G">
        <lui-radio value="a" label="A"></lui-radio>
        <lui-radio value="b" label="B"></lui-radio>
        <lui-radio value="c" label="C"></lui-radio>
      </lui-radio-group></div>`,
      'lui-radio-group'
    );
    const [a, b] = group.querySelectorAll('lui-radio');
    await a.updateComplete;
    a.checked = true;
    a.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        composed: true,
      })
    );
    await b.updateComplete;
    expect(b.checked).toBe(true);
  });

  it('moves the calendar to the next day with ArrowLeft right to left', async () => {
    const el = await mount(
      '<div dir="rtl"><lui-date-picker value="2026-01-16" open locale="en-US"></lui-date-picker></div>',
      'lui-date-picker'
    );
    const day = () =>
      el.shadowRoot.activeElement?.closest('[role="gridcell"]') ??
      el.shadowRoot.activeElement;
    $(el, '[aria-selected="true"]').focus();
    await userEvent.keyboard('{ArrowLeft}');
    await el.updateComplete;
    expect(day().textContent.trim()).toMatch(/^17/);
  });
});

describe('layout', () => {
  it('slides the switch thumb the other way when checked', async () => {
    const thumbX = async (dir) => {
      const el = await mount(
        `<div dir="${dir}"><lui-switch label="S" checked></lui-switch></div>`,
        'lui-switch'
      );
      const input = $(el, 'input');
      const box = input.getBoundingClientRect();
      const matrix = new DOMMatrix(
        getComputedStyle(input, '::after').transform
      );
      return { box, tx: matrix.m41 };
    };
    const ltr = await thumbX('ltr');
    const rtl = await thumbX('rtl');
    expect(ltr.tx).toBeGreaterThan(0);
    expect(rtl.tx).toBe(-ltr.tx);
  });

  it('opens the drawer from the left right to left', async () => {
    const el = await mount(
      '<div dir="rtl"><lui-drawer open hide-trigger title="D"></lui-drawer></div>',
      'lui-drawer'
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    const panel = $(el, '.drawer');
    expect(Math.round(panel.getBoundingClientRect().left)).toBe(0);
  });

  it('mirrors a float placement right to left', async () => {
    const corner = async (dir) => {
      const el = await mount(
        `<div dir="${dir}" style="padding: 40px"><lui-float placement="top-end">
          <div style="width: 100px; height: 100px"></div>
          <span slot="float" style="display: block; width: 10px; height: 10px"></span>
        </lui-float></div>`,
        'lui-float'
      );
      const host = el.getBoundingClientRect();
      const badge = el.querySelector('[slot="float"]').getBoundingClientRect();
      return badge.left + badge.width / 2 - host.left;
    };
    expect(await corner('ltr')).toBeCloseTo(100, 0);
    expect(await corner('rtl')).toBeCloseTo(0, 0);
  });

  it('places a tooltip at the start on the right, right to left', async () => {
    const el = await mount(
      '<div dir="rtl"><lui-tooltip text="T" position="start"><button>x</button></lui-tooltip></div>',
      'lui-tooltip'
    );
    expect($(el, '.tooltip').classList.contains('tooltip--right')).toBe(true);
    el.parentElement.dir = 'ltr';
    await settle(el);
    expect($(el, '.tooltip').classList.contains('tooltip--left')).toBe(true);
  });

  it('fades the edge with content past it, right to left', async () => {
    const el = await mount(
      `<div dir="rtl"><lui-scroll-area orientation="horizontal" scroll-shadow style="width: 100px">
        <div style="width: 400px; height: 20px"></div>
      </lui-scroll-area></div>`,
      'lui-scroll-area'
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const visible = (side) =>
      $(el, `.scroll-area__fade--${side}`).classList.contains('is-visible');
    // At rest, a right-to-left viewport shows its right edge: the hidden
    // content is to the left.
    expect(visible('left')).toBe(true);
    expect(visible('right')).toBe(false);
  });
});
