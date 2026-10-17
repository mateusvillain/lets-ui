import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiDatePicker } from './date-picker.ts';
import {
  addMonths,
  monthWeeks,
  parseISODate,
  parseISORange,
  toISODate,
  today,
} from './date.ts';

// Only the element under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-date-picker', LuiDatePicker);

const mounted = [];

async function mount(attrs = '', wrap = (html) => html) {
  const host = document.createElement('div');
  host.innerHTML = wrap(`<lui-date-picker ${attrs}></lui-date-picker>`);
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector('lui-date-picker');
  await el.updateComplete;
  return el;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const $ = (el, selector) => el.shadowRoot.querySelector(selector);
const trigger = (el) => $(el, '.date-picker__control');
// Months shown side by side can both draw a day; the copy in its own month
// comes first when there is one.
const day = (el, iso) =>
  $(el, `.calendar__day[data-date="${iso}"]:not(.calendar__day--outside)`) ??
  $(el, `.calendar__day[data-date="${iso}"]`);
const titles = (el) =>
  [...el.shadowRoot.querySelectorAll('.calendar__title')].map((t) =>
    t.textContent.trim()
  );
const dayClasses = (el, iso) => [...day(el, iso).classList];
const activeDay = (el) => el.shadowRoot.activeElement?.dataset.date;
const title = (el) => $(el, '.calendar__title').textContent.trim();

async function openWithClick(el) {
  await userEvent.click(trigger(el));
  await el.updateComplete;
}

describe('date helpers', () => {
  it('parses ISO dates as local midnight', () => {
    const date = parseISODate('2026-01-16');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 0, 16,
    ]);
    expect(date.getHours()).toBe(0);
  });

  it('rejects malformed and impossible dates', () => {
    expect(parseISODate('')).toBeNull();
    expect(parseISODate('16/01/2026')).toBeNull();
    expect(parseISODate('2026-02-30')).toBeNull();
    expect(parseISODate('2026-13-01')).toBeNull();
  });

  it('round-trips through toISODate', () => {
    expect(toISODate(parseISODate('2026-03-09'))).toBe('2026-03-09');
  });

  it('clamps the day when a month is shorter', () => {
    expect(toISODate(addMonths(parseISODate('2026-01-31'), 1))).toBe(
      '2026-02-28'
    );
  });

  it('parses an ISO interval as a range', () => {
    const range = parseISORange('2026-01-16/2026-01-21');
    expect(toISODate(range.start)).toBe('2026-01-16');
    expect(toISODate(range.end)).toBe('2026-01-21');
    expect(parseISORange('2026-01-21/2026-01-16')).toBeNull();
    expect(parseISORange('2026-01-16')).toBeNull();
  });

  it('pads to a minimum number of weeks', () => {
    // February 2026 fits in four rows; side by side with January it needs five.
    expect(monthWeeks(parseISODate('2026-02-01'), 0)).toHaveLength(4);
    const padded = monthWeeks(parseISODate('2026-02-01'), 0, 5);
    expect(padded).toHaveLength(5);
    expect(toISODate(padded[4][0])).toBe('2026-03-01');
  });

  it('builds only the weeks the month needs', () => {
    // January 2026 starts on a Thursday: five rows from Sunday Dec 28.
    const weeks = monthWeeks(parseISODate('2026-01-16'), 0);
    expect(weeks).toHaveLength(5);
    expect(toISODate(weeks[0][0])).toBe('2025-12-28');
    expect(toISODate(weeks[4][6])).toBe('2026-01-31');
  });

  it('starts weeks on the requested day', () => {
    const weeks = monthWeeks(parseISODate('2026-01-16'), 1);
    expect(weeks[0][0].getDay()).toBe(1);
    expect(toISODate(weeks[0][0])).toBe('2025-12-29');
  });
});

describe('trigger', () => {
  it('shows the placeholder when empty', async () => {
    const el = await mount('placeholder="Pick one"');
    expect($(el, '.date-picker__value').textContent.trim()).toBe('Pick one');
    expect($(el, '.date-picker--placeholder')).not.toBeNull();
  });

  it('formats the value for the locale', async () => {
    const el = await mount('value="2026-01-16"');
    expect($(el, '.date-picker__value').textContent.trim()).toBe(
      'Jan 16, 2026'
    );
    const br = await mount('value="2026-01-16" locale="pt-BR"');
    expect($(br, '.date-picker__value').textContent.trim()).toMatch(/16/);
    expect($(br, '.date-picker__value').textContent.trim()).toMatch(/jan/i);
  });

  it('heads the weekdays with the narrow form of the locale', async () => {
    const headers = (el) =>
      [
        ...el.shadowRoot.querySelectorAll(
          '.calendar__weekday [aria-hidden="true"]'
        ),
      ].map((th) => th.textContent.trim());
    const en = await mount('value="2026-01-16" open');
    expect(headers(en)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    const br = await mount('value="2026-01-16" locale="pt-BR" open');
    expect(headers(br)).toEqual(['D', 'S', 'T', 'Q', 'Q', 'S', 'S']);
  });

  it('is named by its label and its value', async () => {
    const el = await mount('label="Birth date" value="2026-01-16"');
    const ids = trigger(el).getAttribute('aria-labelledby').split(' ');
    const name = ids
      .map((id) => el.shadowRoot.getElementById(id).textContent.trim())
      .join(' ');
    expect(name).toBe('Birth date Jan 16, 2026');
  });

  it('does not open while disabled', async () => {
    const el = await mount('disabled');
    expect(trigger(el).disabled).toBe(true);
    trigger(el).click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
});

describe('opening and closing', () => {
  it('opens on click and focuses the selected day', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    expect(el.open).toBe(true);
    expect(trigger(el).getAttribute('aria-expanded')).toBe('true');
    expect($(el, '[role="dialog"]')).not.toBeNull();
    expect(title(el)).toBe('January 2026');
    expect(activeDay(el)).toBe('2026-01-16');
  });

  it('focuses today when there is no value', async () => {
    const el = await mount();
    await openWithClick(el);
    expect(activeDay(el)).toBe(toISODate(today()));
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    await userEvent.keyboard('{Escape}');
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(el.shadowRoot.activeElement).toBe(trigger(el));
  });

  it('closes on a click outside', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    document.body.click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('does not steal focus when opened from markup', async () => {
    const el = await mount('value="2026-01-16" open');
    expect($(el, '[role="dialog"]')).not.toBeNull();
    expect(el.shadowRoot.activeElement).toBeNull();
  });
});

describe('selection', () => {
  it('selects a day, closes and emits change', async () => {
    const el = await mount('value="2026-01-16"');
    const events = [];
    el.addEventListener('change', (e) => events.push(e.detail.value));
    await openWithClick(el);
    await userEvent.click(day(el, '2026-01-20'));
    await el.updateComplete;
    expect(el.value).toBe('2026-01-20');
    expect(el.open).toBe(false);
    expect(events).toEqual(['2026-01-20']);
  });

  it('marks the selected day and today', async () => {
    const el = await mount(`value="${toISODate(today())}"`);
    await openWithClick(el);
    const button = day(el, toISODate(today()));
    expect(button.classList).toContain('calendar__day--selected');
    expect(button.getAttribute('aria-current')).toBe('date');
    expect(button.closest('td').getAttribute('aria-selected')).toBe('true');
  });

  it('dims days of the neighbouring months', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    expect(day(el, '2025-12-28').classList).toContain('calendar__day--outside');
    expect(day(el, '2026-01-01').classList).not.toContain(
      'calendar__day--outside'
    );
  });
});

describe('min and max', () => {
  it('disables days outside the range and ignores clicks on them', async () => {
    const el = await mount(
      'value="2026-01-16" min="2026-01-10" max="2026-01-20"'
    );
    await openWithClick(el);
    expect(day(el, '2026-01-09').getAttribute('aria-disabled')).toBe('true');
    expect(day(el, '2026-01-21').getAttribute('aria-disabled')).toBe('true');
    expect(day(el, '2026-01-10').getAttribute('aria-disabled')).toBe('false');
    day(el, '2026-01-21').click();
    await el.updateComplete;
    expect(el.value).toBe('2026-01-16');
    expect(el.open).toBe(true);
  });

  it('disables month navigation past the range', async () => {
    const el = await mount(
      'value="2026-01-16" min="2026-01-10" max="2026-02-05"'
    );
    await openWithClick(el);
    const previous = $(el, '.calendar__nav--previous');
    const next = $(el, '.calendar__nav--next');
    expect(previous.getAttribute('aria-disabled')).toBe('true');
    expect(next.getAttribute('aria-disabled')).toBe('false');
    previous.click();
    await el.updateComplete;
    expect(title(el)).toBe('January 2026');
    next.click();
    await el.updateComplete;
    expect(title(el)).toBe('February 2026');
  });

  it('keeps keyboard focus inside the range', async () => {
    const el = await mount('value="2026-01-16" max="2026-01-18"');
    await openWithClick(el);
    await userEvent.keyboard('{ArrowDown}');
    await el.updateComplete;
    expect(activeDay(el)).toBe('2026-01-18');
  });
});

describe('keyboard', () => {
  const press = async (el, key) => {
    await userEvent.keyboard(key);
    await el.updateComplete;
    return activeDay(el);
  };

  it('moves by day and week with the arrows', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    expect(await press(el, '{ArrowRight}')).toBe('2026-01-17');
    expect(await press(el, '{ArrowLeft}')).toBe('2026-01-16');
    expect(await press(el, '{ArrowDown}')).toBe('2026-01-23');
    expect(await press(el, '{ArrowUp}')).toBe('2026-01-16');
  });

  it('jumps to the week edges with Home and End', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    expect(await press(el, '{Home}')).toBe('2026-01-11');
    expect(await press(el, '{End}')).toBe('2026-01-17');
  });

  it('pages months and, with Shift, years', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    expect(await press(el, '{PageDown}')).toBe('2026-02-16');
    expect(title(el)).toBe('February 2026');
    expect(await press(el, '{Shift>}{PageUp}{/Shift}')).toBe('2025-02-16');
  });

  it('crosses into the next month with the arrows', async () => {
    const el = await mount('value="2026-01-31"');
    await openWithClick(el);
    expect(await press(el, '{ArrowRight}')).toBe('2026-02-01');
    expect(title(el)).toBe('February 2026');
  });

  it('selects the focused day with Enter', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    await press(el, '{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(el.value).toBe('2026-01-17');
    expect(el.open).toBe(false);
    expect(el.shadowRoot.activeElement).toBe(trigger(el));
  });

  it('opens from the trigger with ArrowDown', async () => {
    const el = await mount('value="2026-01-16"');
    trigger(el).focus();
    await userEvent.keyboard('{ArrowDown}');
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(activeDay(el)).toBe('2026-01-16');
  });
});

describe('forms', () => {
  const inForm = (html) => `<form>${html}</form>`;

  it('submits the ISO value under its name', async () => {
    const el = await mount('name="start" value="2026-01-16"', inForm);
    expect(new FormData(el.closest('form')).get('start')).toBe('2026-01-16');
  });

  it('is invalid when required and empty', async () => {
    const el = await mount('name="start" required', inForm);
    expect(el.closest('form').checkValidity()).toBe(false);
    await el.updateComplete;
    expect(el.error).toBe(true);
  });

  it('is invalid when the value falls outside the range', async () => {
    const el = await mount(
      'name="start" value="2026-01-01" min="2026-01-10"',
      inForm
    );
    expect(el.closest('form').checkValidity()).toBe(false);
  });

  it('clears on reset', async () => {
    const el = await mount('name="start" value="2026-01-16"', inForm);
    el.closest('form').reset();
    await el.updateComplete;
    expect(el.value).toBe('');
    expect(new FormData(el.closest('form')).get('start')).toBeNull();
  });
});

describe('range', () => {
  const RANGE = 'range value="2026-01-16/2026-01-21"';

  it('formats both ends in the trigger', async () => {
    const el = await mount(RANGE);
    // Intl puts thin spaces around the dash.
    const text = $(el, '.date-picker__value').textContent.trim();
    expect(text.replace(/\s/g, ' ')).toBe('Jan 16 – 21, 2026');
  });

  it('shows two months, with navigation on the outer edges', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    expect(titles(el)).toEqual(['January 2026', 'February 2026']);
    const months = el.shadowRoot.querySelectorAll('.calendar__month');
    expect(months[0].querySelector('.calendar__nav--previous')).not.toBeNull();
    expect(months[0].querySelector('.calendar__nav--next')).toBeNull();
    expect(months[1].querySelector('.calendar__nav--next')).not.toBeNull();
  });

  it('lines the two grids up on the same number of weeks', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    const rows = [...el.shadowRoot.querySelectorAll('.calendar__grid')].map(
      (grid) => grid.querySelectorAll('tbody tr').length
    );
    expect(rows).toEqual([5, 5]);
  });

  it('marks both ends and the days between', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    expect(dayClasses(el, '2026-01-16')).toContain('calendar__day--selected');
    expect(dayClasses(el, '2026-01-21')).toContain('calendar__day--selected');
    expect(dayClasses(el, '2026-01-18')).toContain('calendar__day--in-range');
    expect(dayClasses(el, '2026-01-22')).not.toContain(
      'calendar__day--in-range'
    );
    expect(
      day(el, '2026-01-18').closest('td').getAttribute('aria-selected')
    ).toBe('true');
  });

  it('squares only the corners shared with a highlighted neighbour', async () => {
    // Jan 16 (Fri) – 21 (Wed): one row ends on Saturday the 17th, the next
    // starts on Sunday the 18th.
    const el = await mount(RANGE);
    await openWithClick(el);
    const joins = (iso) =>
      dayClasses(el, iso).filter((c) => c.includes('--join-'));
    expect(joins('2026-01-16')).toEqual(['calendar__day--join-end']);
    expect(joins('2026-01-17')).toEqual(['calendar__day--join-start']);
    expect(joins('2026-01-18')).toEqual(['calendar__day--join-end']);
    expect(joins('2026-01-19')).toEqual([
      'calendar__day--join-start',
      'calendar__day--join-end',
    ]);
    expect(joins('2026-01-21')).toEqual(['calendar__day--join-start']);
    expect(joins('2026-01-22')).toEqual([]);
    const radius = (iso) => getComputedStyle(day(el, iso));
    expect(radius('2026-01-16').borderTopRightRadius).toBe('0px');
    expect(radius('2026-01-16').borderTopLeftRadius).not.toBe('0px');
  });

  it('keeps a one-day range fully rounded', async () => {
    const el = await mount('range value="2026-01-16/2026-01-16"');
    await openWithClick(el);
    expect(
      dayClasses(el, '2026-01-16').filter((c) => c.includes('--join-'))
    ).toEqual([]);
  });

  it('keeps a single tab stop across both months', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    expect(
      el.shadowRoot.querySelectorAll('.calendar__day[tabindex="0"]')
    ).toHaveLength(1);
  });

  it('picks in two clicks, in either order, then closes and emits', async () => {
    const el = await mount('range');
    const events = [];
    el.addEventListener('change', (e) => events.push(e.detail));
    await openWithClick(el);
    const month = toISODate(today()).slice(0, 7);
    await userEvent.click(day(el, `${month}-12`));
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(el.value).toBe('');
    await userEvent.click(day(el, `${month}-05`));
    await el.updateComplete;
    expect(el.value).toBe(`${month}-05/${month}-12`);
    expect(el.open).toBe(false);
    expect(events).toEqual([
      {
        value: `${month}-05/${month}-12`,
        start: `${month}-05`,
        end: `${month}-12`,
      },
    ]);
  });

  it('previews the range under the pointer', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    await userEvent.click(day(el, '2026-01-10'));
    await el.updateComplete;
    await userEvent.hover(day(el, '2026-01-14'));
    await el.updateComplete;
    expect(dayClasses(el, '2026-01-12')).toContain('calendar__day--in-range');
    expect(dayClasses(el, '2026-01-14')).toContain('calendar__day--selected');
    // The committed range is set aside while a new one is being picked.
    expect(dayClasses(el, '2026-01-18')).not.toContain(
      'calendar__day--in-range'
    );
  });

  it('picks with the keyboard, moving into the second month', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard('{ArrowDown}');
      await el.updateComplete;
    }
    expect(activeDay(el)).toBe('2026-02-06');
    expect(titles(el)).toEqual(['January 2026', 'February 2026']);
    expect(dayClasses(el, '2026-01-31')).toContain('calendar__day--in-range');
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(el.value).toBe('2026-01-16/2026-02-06');
  });

  it('scrolls the view when focus leaves the second month', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    await userEvent.keyboard('{PageDown}');
    await el.updateComplete;
    await userEvent.keyboard('{PageDown}');
    await el.updateComplete;
    expect(activeDay(el)).toBe('2026-03-16');
    expect(titles(el)).toEqual(['February 2026', 'March 2026']);
  });

  it('discards a half-picked range on Escape', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    await userEvent.click(day(el, '2026-01-05'));
    await userEvent.keyboard('{Escape}');
    await el.updateComplete;
    expect(el.value).toBe('2026-01-16/2026-01-21');
    await openWithClick(el);
    expect(dayClasses(el, '2026-01-16')).toContain('calendar__day--selected');
    expect(dayClasses(el, '2026-01-05')).not.toContain(
      'calendar__day--selected'
    );
  });

  it('submits the interval and validates both ends', async () => {
    const el = await mount(
      'name="stay" range value="2026-01-16/2026-01-21" max="2026-01-20"',
      (html) => `<form>${html}</form>`
    );
    const form = el.closest('form');
    expect(new FormData(form).get('stay')).toBe('2026-01-16/2026-01-21');
    expect(form.checkValidity()).toBe(false);
    el.max = '';
    await el.updateComplete;
    expect(form.checkValidity()).toBe(true);
  });
});
