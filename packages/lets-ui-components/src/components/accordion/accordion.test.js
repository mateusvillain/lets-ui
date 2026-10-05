import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiAccordion } from './accordion.ts';
import { LuiAccordionItem } from './accordion-item.ts';

// Only the two elements under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-accordion', LuiAccordion);
customElements.define('lui-accordion-item', LuiAccordionItem);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const accordion = host.querySelector('lui-accordion');
  const items = [...host.querySelectorAll('lui-accordion-item')];
  await Promise.all([
    accordion.updateComplete,
    ...items.map((i) => i.updateComplete),
  ]);
  return { accordion, items };
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const trigger = (item) => item.shadowRoot.querySelector('button');
const panel = (item) => item.shadowRoot.querySelector('.accordion__panel');
const openStates = (items) => items.map((i) => i.open);
const focused = (items) =>
  items.findIndex((i) => i.shadowRoot.activeElement === trigger(i));

const THREE = `
  <lui-accordion>
    <lui-accordion-item label="One">one</lui-accordion-item>
    <lui-accordion-item label="Two">two</lui-accordion-item>
    <lui-accordion-item label="Three">three</lui-accordion-item>
  </lui-accordion>
`;

describe('lui-accordion-item markup', () => {
  it('exposes aria-expanded and aria-controls on a native button', async () => {
    const { items } = await mount(THREE);
    const button = trigger(items[0]);

    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(panel(items[0]).id);
  });

  it('does not give the panel a region role', async () => {
    const { items } = await mount(THREE);
    expect(panel(items[0]).hasAttribute('role')).toBe(false);
  });

  it('wraps the button in a heading, level 3 by default', async () => {
    const { items } = await mount(THREE);
    const heading = items[0].shadowRoot.querySelector('[role="heading"]');

    expect(heading.getAttribute('aria-level')).toBe('3');
    expect(heading.contains(trigger(items[0]))).toBe(true);
  });

  it('takes the heading level from the group, and an item can override it', async () => {
    const { items } = await mount(`
      <lui-accordion heading-level="2">
        <lui-accordion-item label="One">one</lui-accordion-item>
        <lui-accordion-item label="Two" heading-level="4">two</lui-accordion-item>
      </lui-accordion>
    `);
    const level = (i) =>
      i.shadowRoot.querySelector('[role="heading"]').getAttribute('aria-level');

    expect(level(items[0])).toBe('2');
    expect(level(items[1])).toBe('4');
  });

  it('keeps the heading level between 1 and 6', async () => {
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" heading-level="9">one</lui-accordion-item>
        <lui-accordion-item label="Two" heading-level="0">two</lui-accordion-item>
      </lui-accordion>
    `);
    const level = (i) =>
      i.shadowRoot.querySelector('[role="heading"]').getAttribute('aria-level');

    expect(level(items[0])).toBe('6');
    expect(level(items[1])).toBe('1');
  });

  it('falls back to the group level when heading-level is not a number', async () => {
    const { items } = await mount(`
      <lui-accordion heading-level="4">
        <lui-accordion-item label="One" heading-level="abc">one</lui-accordion-item>
      </lui-accordion>
    `);

    expect(
      items[0].shadowRoot
        .querySelector('[role="heading"]')
        .getAttribute('aria-level')
    ).toBe('4');
  });
});

describe('opening and closing', () => {
  it('toggles on click and mirrors the state in aria-expanded', async () => {
    const { items } = await mount(THREE);

    await userEvent.click(trigger(items[0]));
    await items[0].updateComplete;
    expect(items[0].open).toBe(true);
    expect(trigger(items[0]).getAttribute('aria-expanded')).toBe('true');

    await userEvent.click(trigger(items[0]));
    await items[0].updateComplete;
    expect(items[0].open).toBe(false);
    expect(trigger(items[0]).getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles with Enter and Space', async () => {
    const { items } = await mount(THREE);
    items[0].focus();

    await userEvent.keyboard('{Enter}');
    expect(items[0].open).toBe(true);

    await userEvent.keyboard(' ');
    expect(items[0].open).toBe(false);
  });

  it('starts open when the open attribute is set', async () => {
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open>one</lui-accordion-item>
        <lui-accordion-item label="Two">two</lui-accordion-item>
      </lui-accordion>
    `);
    expect(openStates(items)).toEqual([true, false]);
  });
});

describe('single-open mode (default)', () => {
  it('closes the open item when another one opens', async () => {
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open>one</lui-accordion-item>
        <lui-accordion-item label="Two">two</lui-accordion-item>
        <lui-accordion-item label="Three">three</lui-accordion-item>
      </lui-accordion>
    `);

    await userEvent.click(trigger(items[1]));
    expect(openStates(items)).toEqual([false, true, false]);

    await userEvent.click(trigger(items[2]));
    expect(openStates(items)).toEqual([false, false, true]);
  });

  it('keeps only the first item open when several start open', async () => {
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open>one</lui-accordion-item>
        <lui-accordion-item label="Two" open>two</lui-accordion-item>
        <lui-accordion-item label="Three" open>three</lui-accordion-item>
      </lui-accordion>
    `);
    expect(openStates(items)).toEqual([true, false, false]);
  });

  it('also closes the others when an item is opened from a script', async () => {
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open>one</lui-accordion-item>
        <lui-accordion-item label="Two">two</lui-accordion-item>
      </lui-accordion>
    `);

    items[1].open = true;
    await items[1].updateComplete;
    expect(openStates(items)).toEqual([false, true]);
  });

  it('does not close the outer item when an item of a nested accordion opens', async () => {
    // Document order: outer One, inner A, inner B, outer Two.
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open>
          <lui-accordion>
            <lui-accordion-item label="A">a</lui-accordion-item>
            <lui-accordion-item label="B">b</lui-accordion-item>
          </lui-accordion>
        </lui-accordion-item>
        <lui-accordion-item label="Two">two</lui-accordion-item>
      </lui-accordion>
    `);
    const [outerOne, innerA, innerB, outerTwo] = items;

    await userEvent.click(trigger(innerA));
    expect(openStates([outerOne, innerA, innerB, outerTwo])).toEqual([
      true,
      true,
      false,
      false,
    ]);

    await userEvent.click(trigger(innerB));
    expect(openStates([outerOne, innerA, innerB, outerTwo])).toEqual([
      true,
      false,
      true,
      false,
    ]);
  });

  it('can close the only open item, leaving all closed', async () => {
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open>one</lui-accordion-item>
        <lui-accordion-item label="Two">two</lui-accordion-item>
      </lui-accordion>
    `);

    await userEvent.click(trigger(items[0]));
    expect(openStates(items)).toEqual([false, false]);
  });
});

describe('multiple mode', () => {
  it('keeps several items open', async () => {
    const { items } = await mount(`
      <lui-accordion multiple>
        <lui-accordion-item label="One" open>one</lui-accordion-item>
        <lui-accordion-item label="Two" open>two</lui-accordion-item>
        <lui-accordion-item label="Three">three</lui-accordion-item>
      </lui-accordion>
    `);
    expect(openStates(items)).toEqual([true, true, false]);

    await userEvent.click(trigger(items[2]));
    expect(openStates(items)).toEqual([true, true, true]);
  });
});

describe('disabled item', () => {
  it('exposes disabled and aria-disabled, and ignores clicks', async () => {
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" disabled>one</lui-accordion-item>
      </lui-accordion>
    `);
    const button = trigger(items[0]);

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    button.click();
    await items[0].updateComplete;
    expect(items[0].open).toBe(false);
  });

  it('has no aria-disabled when enabled', async () => {
    const { items } = await mount(THREE);
    expect(trigger(items[0]).hasAttribute('aria-disabled')).toBe(false);
  });
});

describe('lui-toggle event', () => {
  it('carries { open } and bubbles from the item', async () => {
    const { accordion, items } = await mount(THREE);
    const events = [];
    accordion.addEventListener('lui-toggle', (e) =>
      events.push({ target: e.target, open: e.detail.open })
    );

    await userEvent.click(trigger(items[1]));
    expect(events).toEqual([{ target: items[1], open: true }]);
  });

  it('fires on each item that changes, including the one closed by single-open', async () => {
    const { accordion, items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open>one</lui-accordion-item>
        <lui-accordion-item label="Two">two</lui-accordion-item>
      </lui-accordion>
    `);
    const events = [];
    accordion.addEventListener('lui-toggle', (e) =>
      events.push([e.target.getAttribute('label'), e.detail.open])
    );

    await userEvent.click(trigger(items[1]));
    expect(events).toEqual([
      ['Two', true],
      ['One', false],
    ]);
  });

  it('does not fire for the initial open attribute', async () => {
    const events = [];
    const listener = (e) => events.push(e);
    document.addEventListener('lui-toggle', listener);

    await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open>one</lui-accordion-item>
      </lui-accordion>
    `);
    document.removeEventListener('lui-toggle', listener);
    expect(events).toEqual([]);
  });
});

describe('description alignment', () => {
  const ICON = '<svg slot="icon" viewBox="0 0 24 24" aria-hidden="true"></svg>';

  // Where the title text starts and where the description content starts,
  // both measured from the item's left edge.
  const offsets = async (html) => {
    const { items } = await mount(html);
    const root = items[0].shadowRoot;
    const left = items[0].getBoundingClientRect().left;
    const description = root.querySelector('.accordion__description');
    return {
      title:
        root.querySelector('.accordion__title').getBoundingClientRect().left -
        left,
      description:
        description.getBoundingClientRect().left -
        left +
        parseFloat(getComputedStyle(description).paddingLeft),
    };
  };

  it('lines the description up with the title when there is an icon', async () => {
    const { title, description } = await offsets(`
      <lui-accordion><lui-accordion-item label="One" open>${ICON}one</lui-accordion-item></lui-accordion>
    `);
    expect(title).toBeGreaterThan(16);
    expect(description).toBeCloseTo(title, 1);
  });

  it('lines the description up with the title when there is no icon', async () => {
    const { title, description } = await offsets(`
      <lui-accordion><lui-accordion-item label="One" open>one</lui-accordion-item></lui-accordion>
    `);
    expect(description).toBeCloseTo(title, 1);
  });
});

describe('variants', () => {
  const GROUP = (variant) => `
    <lui-accordion variant="${variant}">
      <lui-accordion-item label="One" open>one</lui-accordion-item>
      <lui-accordion-item label="Two">two</lui-accordion-item>
      <lui-accordion-item label="Three">three</lui-accordion-item>
    </lui-accordion>
  `;
  const border = (el, side) => {
    const style = getComputedStyle(el);
    return {
      width: parseFloat(style[`border${side}Width`]),
      color: style[`border${side}Color`],
    };
  };
  const TRANSPARENT = 'rgba(0, 0, 0, 0)';

  it('separates the items with dividers in the default variant', async () => {
    const { items } = await mount(GROUP('default'));

    expect(border(items[0], 'Top').width).toBe(0);
    expect(border(items[1], 'Top').width).toBe(1);
    expect(border(items[1], 'Top').color).not.toBe(TRANSPARENT);
    expect(border(items[2], 'Top').color).not.toBe(TRANSPARENT);
  });

  it('has no dividers in the highlighted variant', async () => {
    const { items } = await mount(GROUP('highlighted'));

    // Closed items keep the border's width but not its colour.
    expect(border(items[1], 'Top').color).toBe(TRANSPARENT);
    expect(border(items[2], 'Top').color).toBe(TRANSPARENT);
    expect(border(items[2], 'Bottom').color).toBe(TRANSPARENT);
  });

  it('outlines only the open item in the highlighted variant', async () => {
    const { items } = await mount(GROUP('highlighted'));

    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      expect(border(items[0], side).width).toBe(1);
      expect(border(items[0], side).color).not.toBe(TRANSPARENT);
    }
  });

  it('keeps the outline outside the trigger so it is not painted over', async () => {
    const { items } = await mount(GROUP('highlighted'));
    const box = items[0].getBoundingClientRect();
    const button = trigger(items[0]).getBoundingClientRect();

    expect(button.top - box.top).toBeGreaterThanOrEqual(1);
    expect(button.left - box.left).toBeGreaterThanOrEqual(1);
    expect(box.right - button.right).toBeGreaterThanOrEqual(1);
  });

  it('moves the outline to the item that opens, without shifting the others', async () => {
    const { items } = await mount(GROUP('highlighted'));
    const heights = () => items.map((i) => i.getBoundingClientRect().height);
    const before = heights();

    await userEvent.click(trigger(items[1]));
    await Promise.all(items.map((i) => i.updateComplete));

    expect(border(items[0], 'Top').color).toBe(TRANSPARENT);
    expect(border(items[1], 'Top').color).not.toBe(TRANSPARENT);
    // Same chrome on every item: only the description's height differs.
    expect(heights()[2]).toBe(before[2]);
  });

  it('wraps the whole list in a border in the bordered variant', async () => {
    const { accordion } = await mount(GROUP('bordered'));
    const wrapper = accordion.shadowRoot.querySelector('.accordion');

    expect(border(wrapper, 'Top').width).toBe(1);
  });
});

describe('collapsed content', () => {
  const WITH_LINKS = `
    <lui-accordion multiple>
      <lui-accordion-item label="One" open><a href="#one" id="open-link">open</a></lui-accordion-item>
      <lui-accordion-item label="Two"><a href="#two" id="closed-link">closed</a></lui-accordion-item>
    </lui-accordion>
  `;

  it('hides a closed panel from focus and the accessibility tree', async () => {
    const { items } = await mount(WITH_LINKS);

    expect(getComputedStyle(panel(items[0])).visibility).toBe('visible');
    expect(getComputedStyle(panel(items[1])).visibility).toBe('hidden');
  });

  it('does not let a link in a closed panel take focus', async () => {
    await mount(WITH_LINKS);
    const closed = document.getElementById('closed-link');
    closed.focus();
    expect(document.activeElement).not.toBe(closed);

    const open = document.getElementById('open-link');
    open.focus();
    expect(document.activeElement).toBe(open);
  });

  it('skips collapsed content when tabbing', async () => {
    const { items } = await mount(WITH_LINKS);
    items[0].focus();

    await userEvent.tab();
    expect(document.activeElement.id).toBe('open-link');

    await userEvent.tab();
    expect(focused(items)).toBe(1);

    await userEvent.tab();
    expect(document.activeElement.id).not.toBe('closed-link');
  });
});

describe('keyboard navigation between headers', () => {
  const FOUR = `
    <lui-accordion>
      <lui-accordion-item label="One">one</lui-accordion-item>
      <lui-accordion-item label="Two" disabled>two</lui-accordion-item>
      <lui-accordion-item label="Three">three</lui-accordion-item>
      <lui-accordion-item label="Four">four</lui-accordion-item>
    </lui-accordion>
  `;

  it('moves down and up, skipping disabled items', async () => {
    const { items } = await mount(FOUR);
    items[0].focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(focused(items)).toBe(2);

    await userEvent.keyboard('{ArrowDown}');
    expect(focused(items)).toBe(3);

    await userEvent.keyboard('{ArrowUp}');
    expect(focused(items)).toBe(2);

    await userEvent.keyboard('{ArrowUp}');
    expect(focused(items)).toBe(0);
  });

  it('wraps around at both ends', async () => {
    const { items } = await mount(FOUR);
    items[3].focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(focused(items)).toBe(0);

    await userEvent.keyboard('{ArrowUp}');
    expect(focused(items)).toBe(3);
  });

  it('leaves modified arrow keys and Home/End to the browser', async () => {
    const { items } = await mount(FOUR);
    items[0].focus();

    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await userEvent.keyboard('{Control>}{End}{/Control}');
    expect(focused(items)).toBe(0);
  });

  it('jumps to the first and last enabled header with Home and End', async () => {
    const { items } = await mount(FOUR);
    items[2].focus();

    await userEvent.keyboard('{End}');
    expect(focused(items)).toBe(3);

    await userEvent.keyboard('{Home}');
    expect(focused(items)).toBe(0);
  });

  it('does not open or close anything while moving', async () => {
    const { items } = await mount(FOUR);
    items[0].focus();

    await userEvent.keyboard('{ArrowDown}{End}{Home}');
    expect(openStates(items)).toEqual([false, false, false, false]);
  });

  it('leaves the arrow keys to the content of an open panel', async () => {
    const { items } = await mount(`
      <lui-accordion>
        <lui-accordion-item label="One" open><input id="field" value="abc"></lui-accordion-item>
        <lui-accordion-item label="Two">two</lui-accordion-item>
      </lui-accordion>
    `);
    const field = document.getElementById('field');
    field.focus();

    await userEvent.keyboard('{ArrowDown}{Home}{End}');
    expect(document.activeElement).toBe(field);
    expect(focused(items)).toBe(-1);
  });
});

describe('nested accordions', () => {
  it('does not inherit the corners of the item that holds them', async () => {
    const { accordion } = await mount(`
      <lui-accordion variant="bordered">
        <lui-accordion-item label="Outer" open>
          <lui-accordion>
            <lui-accordion-item label="Inner one">one</lui-accordion-item>
            <lui-accordion-item label="Inner two">two</lui-accordion-item>
          </lui-accordion>
        </lui-accordion-item>
        <lui-accordion-item label="Last">last</lui-accordion-item>
      </lui-accordion>
    `);
    const outer = accordion.querySelector(':scope > lui-accordion-item');
    const inner = outer.querySelector('lui-accordion-item');
    await Promise.all([outer.updateComplete, inner.updateComplete]);

    const radius = (item) =>
      getComputedStyle(trigger(item)).borderTopLeftRadius;

    expect(radius(outer)).not.toBe('0px');
    expect(radius(inner)).toBe('0px');
  });
});
