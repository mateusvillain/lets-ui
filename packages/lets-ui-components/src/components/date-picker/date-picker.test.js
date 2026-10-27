import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { LuiDatePicker } from './date-picker.ts';
import {
  addMonths,
  monthWeeks,
  parseISODate,
  parseISORange,
  toISODate,
  today,
} from './date.ts';
import {
  applyMask,
  caretAfterDigits,
  dateMask,
  maskPattern,
  rangeMask,
  readMask,
} from './mask.ts';

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
const day = (el, iso) =>
  $(el, `.date-picker-calendar__day[data-date="${iso}"]`);
const titles = (el) =>
  [...el.shadowRoot.querySelectorAll('.date-picker-calendar__title')].map((t) =>
    t.textContent.trim()
  );
const dayClasses = (el, iso) => [...day(el, iso).classList];
const activeDay = (el) => el.shadowRoot.activeElement?.dataset.date;
const title = (el) => $(el, '.date-picker-calendar__title').textContent.trim();

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
          '.date-picker-calendar__weekday [aria-hidden="true"]'
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

  it('warns once when it has neither label nor aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const el = await mount('value="2026-01-16"');
      el.value = '2026-01-17';
      await el.updateComplete;
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toMatch(/label.*aria-label/);
      warn.mockClear();
      await mount('label="Check-in"');
      await mount('aria-label="Check-in"');
      await mount('editable aria-label="Check-in"');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('describes a required button field as required, before the message', async () => {
    const el = await mount('label="Check-in" required hint="Pick a weekday"');
    const ids = trigger(el).getAttribute('aria-describedby').split(' ');
    const texts = ids.map((id) =>
      el.shadowRoot.getElementById(id).textContent.trim()
    );
    expect(texts).toEqual(['Required', 'Pick a weekday']);
    el.requiredText = 'Obrigatório';
    await el.updateComplete;
    expect(el.shadowRoot.getElementById(ids[0]).textContent.trim()).toBe(
      'Obrigatório'
    );
    el.removeAttribute('required-text');
    el.requiredText = null;
    await el.updateComplete;
    expect(el.shadowRoot.getElementById(ids[0]).textContent.trim()).toBe(
      'Required'
    );
  });

  it('adds no required text when not required, nor with editable', async () => {
    const el = await mount('label="Check-in"');
    expect(trigger(el).hasAttribute('aria-describedby')).toBe(false);
    const typed = await mount('label="Check-in" editable required');
    expect(typed.shadowRoot.textContent).not.toMatch(/Required/);
    expect($(typed, '.date-picker__input').getAttribute('aria-required')).toBe(
      'true'
    );
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

  it('closes when disabled while open', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    el.disabled = true;
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect($(el, '[role="dialog"]')).toBeNull();
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
    expect(button.classList).toContain('date-picker-calendar__day--selected');
    expect(button.getAttribute('aria-current')).toBe('date');
    // The focused button is the gridcell, so it carries the selection itself.
    expect(button.getAttribute('role')).toBe('gridcell');
    expect(button.getAttribute('aria-selected')).toBe('true');
    expect(button.closest('td').getAttribute('role')).toBe('presentation');
  });

  it('leaves the cells of the neighbouring months empty', async () => {
    const el = await mount('value="2026-01-16"');
    await openWithClick(el);
    // January 2026 starts on a Thursday: four December cells come first.
    const cells = [
      ...el.shadowRoot.querySelectorAll('.date-picker-calendar__cell'),
    ];
    expect(
      cells.slice(0, 4).every((cell) => cell.textContent.trim() === '')
    ).toBe(true);
    expect(
      cells.slice(0, 4).some((cell) => cell.hasAttribute('aria-selected'))
    ).toBe(false);
    expect(day(el, '2025-12-28')).toBeNull();
    expect(day(el, '2026-01-01')).not.toBeNull();
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
    expect(day(el, '2026-01-10').hasAttribute('aria-disabled')).toBe(false);
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
    const previous = $(el, '.date-picker-calendar__nav--previous');
    const next = $(el, '.date-picker-calendar__nav--next');
    expect(previous.getAttribute('aria-disabled')).toBe('true');
    expect(next.hasAttribute('aria-disabled')).toBe(false);
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

  it('updates validity when required changes after render', async () => {
    const el = await mount('name="start"', inForm);
    expect(el.closest('form').checkValidity()).toBe(true);
    el.required = true;
    await el.updateComplete;
    expect(el.closest('form').checkValidity()).toBe(false);
  });

  it('is invalid when the value falls outside the range', async () => {
    const el = await mount(
      'name="start" value="2026-01-01" min="2026-01-10"',
      inForm
    );
    expect(el.closest('form').checkValidity()).toBe(false);
  });

  it('gives each validity state its own message', async () => {
    const empty = await mount('name="start" required', inForm);
    expect(empty.closest('form').checkValidity()).toBe(false);
    await empty.updateComplete;
    expect($(empty, '.date-picker__message').textContent.trim()).toBe(
      'This field is required.'
    );

    const early = await mount(
      'name="start" value="2026-01-01" min="2026-01-10"',
      inForm
    );
    expect(early.closest('form').checkValidity()).toBe(false);
    await early.updateComplete;
    expect($(early, '.date-picker__message').textContent.trim()).toBe(
      'Enter a date within the allowed period.'
    );

    const late = await mount(
      'name="start" value="2026-01-20" max="2026-01-10" range-error-text="Fora do período."',
      inForm
    );
    expect(late.closest('form').checkValidity()).toBe(false);
    await late.updateComplete;
    expect($(late, '.date-picker__message').textContent.trim()).toBe(
      'Fora do período.'
    );
  });

  it('does not mark the button control as required', async () => {
    const el = await mount('required label="Check-in"');
    expect(trigger(el).hasAttribute('aria-required')).toBe(false);
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
    const months = el.shadowRoot.querySelectorAll(
      '.date-picker-calendar__month'
    );
    expect(
      months[0].querySelector('.date-picker-calendar__nav--previous')
    ).not.toBeNull();
    expect(
      months[0].querySelector('.date-picker-calendar__nav--next')
    ).toBeNull();
    expect(
      months[1].querySelector('.date-picker-calendar__nav--next')
    ).not.toBeNull();
  });

  it('announces both months from a single live region', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    const region = $(el, '.date-picker-calendar__months-status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.textContent.trim().replace(/\s+/g, ' ')).toBe(
      'January – February 2026'
    );
    await userEvent.click($(el, '.date-picker-calendar__nav--next'));
    await el.updateComplete;
    expect(region.textContent.trim().replace(/\s+/g, ' ')).toBe(
      'February – March 2026'
    );
  });

  it('announces the start of a range until the end is picked', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    const region = $(el, '.date-picker-calendar__range-status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.textContent.trim()).toBe('');
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(region.textContent.trim()).toBe(
      'Start date selected. Choose the end date.'
    );
    await userEvent.keyboard('{ArrowRight}');
    await el.updateComplete;
    expect(region.textContent.trim()).toBe(
      'Start date selected. Choose the end date.'
    );
  });

  it('names the field with the period in order after a backwards pick', async () => {
    const el = await mount('range label="Stay" value="2026-01-16/2026-01-21"');
    await openWithClick(el);
    await userEvent.click(day(el, '2026-01-20'));
    await el.updateComplete;
    await userEvent.click(day(el, '2026-01-12'));
    await el.updateComplete;
    expect(el.value).toBe('2026-01-12/2026-01-20');
    expect(el.shadowRoot.activeElement).toBe(trigger(el));
    const name = trigger(el)
      .getAttribute('aria-labelledby')
      .split(' ')
      .map((id) => el.shadowRoot.getElementById(id).textContent.trim())
      .join(' ')
      .replace(/\s/g, ' ');
    expect(name).toBe('Stay Jan 12 – 20, 2026');
  });

  it('lines the two grids up on the same number of weeks', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    const rows = [
      ...el.shadowRoot.querySelectorAll('.date-picker-calendar__grid'),
    ].map((grid) => grid.querySelectorAll('tbody tr').length);
    expect(rows).toEqual([5, 5]);
  });

  it('marks both ends and the days between', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    expect(dayClasses(el, '2026-01-16')).toContain(
      'date-picker-calendar__day--selected'
    );
    expect(dayClasses(el, '2026-01-21')).toContain(
      'date-picker-calendar__day--selected'
    );
    expect(dayClasses(el, '2026-01-18')).toContain(
      'date-picker-calendar__day--in-range'
    );
    expect(dayClasses(el, '2026-01-22')).not.toContain(
      'date-picker-calendar__day--in-range'
    );
    expect(day(el, '2026-01-18').getAttribute('aria-selected')).toBe('true');
  });

  it('squares only the corners shared with a highlighted neighbour', async () => {
    // Jan 16 (Fri) – 21 (Wed): one row ends on Saturday the 17th, the next
    // starts on Sunday the 18th.
    const el = await mount(RANGE);
    await openWithClick(el);
    const joins = (iso) =>
      dayClasses(el, iso).filter((c) => c.includes('--join-'));
    expect(joins('2026-01-16')).toEqual([
      'date-picker-calendar__day--join-end',
    ]);
    expect(joins('2026-01-17')).toEqual([
      'date-picker-calendar__day--join-start',
    ]);
    expect(joins('2026-01-18')).toEqual([
      'date-picker-calendar__day--join-end',
    ]);
    expect(joins('2026-01-19')).toEqual([
      'date-picker-calendar__day--join-start',
      'date-picker-calendar__day--join-end',
    ]);
    expect(joins('2026-01-21')).toEqual([
      'date-picker-calendar__day--join-start',
    ]);
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

  it('stacks the two months on a phone-sized viewport', async () => {
    const direction = (el) =>
      getComputedStyle($(el, '.date-picker-calendar')).flexDirection;
    const el = await mount(RANGE);
    await openWithClick(el);
    try {
      await page.viewport(1024, 768);
      expect(direction(el)).toBe('row');
      await page.viewport(375, 812);
      expect(direction(el)).toBe('column');
    } finally {
      await page.viewport(1024, 768);
    }
  });

  it('keeps a single tab stop across both months', async () => {
    const el = await mount(RANGE);
    await openWithClick(el);
    expect(
      el.shadowRoot.querySelectorAll('.date-picker-calendar__day[tabindex="0"]')
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
    expect(dayClasses(el, '2026-01-12')).toContain(
      'date-picker-calendar__day--in-range'
    );
    expect(dayClasses(el, '2026-01-14')).toContain(
      'date-picker-calendar__day--selected'
    );
    // The committed range is set aside while a new one is being picked.
    expect(dayClasses(el, '2026-01-18')).not.toContain(
      'date-picker-calendar__day--in-range'
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
    expect(dayClasses(el, '2026-01-31')).toContain(
      'date-picker-calendar__day--in-range'
    );
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
    expect(dayClasses(el, '2026-01-16')).toContain(
      'date-picker-calendar__day--selected'
    );
    expect(dayClasses(el, '2026-01-05')).not.toContain(
      'date-picker-calendar__day--selected'
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

describe('mask helpers', () => {
  const maskFor = (locale) =>
    dateMask(
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        numberingSystem: 'latn',
      })
    );

  it('follows the order and marks of the locale', () => {
    expect(maskPattern(maskFor('pt-BR'))).toBe('dd / mm / yyyy');
    expect(maskPattern(maskFor('en-US'))).toBe('mm / dd / yyyy');
    expect(maskPattern(maskFor('de-DE'))).toBe('dd.mm.yyyy');
    expect(maskPattern(maskFor('ja-JP'))).toBe('yyyy / mm / dd');
  });

  it('drops a trailing mark', () => {
    expect(maskPattern(maskFor('ko-KR'))).toBe('yyyy. mm. dd');
  });

  it('writes a mark only once a digit follows it', () => {
    const mask = maskFor('pt-BR');
    expect(applyMask('16', mask)).toBe('16');
    expect(applyMask('160', mask)).toBe('16 / 0');
    expect(applyMask('16012026', mask)).toBe('16 / 01 / 2026');
  });

  it('reads whole dates and rejects impossible ones', () => {
    const mask = maskFor('pt-BR');
    expect(readMask('16012026', mask).map(toISODate)).toEqual(['2026-01-16']);
    expect(readMask('30022026', mask)).toBeNull();
    expect(
      readMask('1601202621012026', rangeMask(mask)).map(toISODate)
    ).toEqual(['2026-01-16', '2026-01-21']);
  });

  it('places the caret after a count of digits', () => {
    expect(caretAfterDigits('16 / 01 / 2026', 0)).toBe(0);
    expect(caretAfterDigits('16 / 01 / 2026', 2)).toBe(2);
    expect(caretAfterDigits('16 / 01 / 2026', 3)).toBe(6);
  });
});

describe('editable', () => {
  const input = (el) => $(el, '.date-picker__input');
  const toggle = (el) => $(el, '.date-picker__toggle');

  async function type(el, text) {
    await userEvent.click(input(el));
    await userEvent.keyboard(text);
    await el.updateComplete;
  }

  it('shows the locale pattern as the placeholder', async () => {
    const el = await mount('editable locale="pt-BR"');
    expect(input(el).placeholder).toBe('dd / mm / yyyy');
    const custom = await mount('editable placeholder="dd / mm / aaaa"');
    expect(input(custom).placeholder).toBe('dd / mm / aaaa');
  });

  it('shows the value in the mask', async () => {
    const el = await mount('editable locale="pt-BR" value="2026-01-16"');
    expect(input(el).value).toBe('16 / 01 / 2026');
    el.value = '2026-03-09';
    await el.updateComplete;
    expect(input(el).value).toBe('09 / 03 / 2026');
  });

  it('masks typed digits and sets the value once the date is whole', async () => {
    const el = await mount('editable locale="pt-BR"');
    const events = [];
    el.addEventListener('change', (e) => events.push(e.detail.value));
    await type(el, '1601');
    expect(input(el).value).toBe('16 / 01');
    expect(el.value).toBe('');
    await userEvent.keyboard('2026');
    await el.updateComplete;
    expect(input(el).value).toBe('16 / 01 / 2026');
    expect(el.value).toBe('2026-01-16');
    expect(events).toEqual(['2026-01-16']);
  });

  it('ignores anything but digits', async () => {
    const el = await mount('editable locale="pt-BR"');
    await type(el, '1a6/-0');
    expect(input(el).value).toBe('16 / 0');
  });

  it('follows the locale order', async () => {
    const el = await mount('editable locale="en-US"');
    await type(el, '01162026');
    expect(input(el).value).toBe('01 / 16 / 2026');
    expect(el.value).toBe('2026-01-16');
  });

  it('clears the value when a digit is deleted', async () => {
    const el = await mount('editable locale="pt-BR" value="2026-01-16"');
    const events = [];
    el.addEventListener('change', (e) => events.push(e.detail.value));
    await type(el, '{End}{Backspace}');
    expect(input(el).value).toBe('16 / 01 / 202');
    expect(el.value).toBe('');
    expect(events).toEqual(['']);
  });

  it('reads a pasted ISO date', async () => {
    const el = await mount('editable locale="pt-BR"');
    input(el).value = '2026-01-16';
    input(el).dispatchEvent(new InputEvent('input', { bubbles: true }));
    await el.updateComplete;
    expect(input(el).value).toBe('16 / 01 / 2026');
    expect(el.value).toBe('2026-01-16');
  });

  it('is invalid with a partial or impossible date', async () => {
    const el = await mount(
      'editable locale="pt-BR" name="start"',
      (html) => `<form>${html}</form>`
    );
    const form = el.closest('form');
    expect(form.checkValidity()).toBe(true);
    await type(el, '3002');
    expect(form.checkValidity()).toBe(false);
    await userEvent.keyboard('2026');
    await el.updateComplete;
    expect(el.value).toBe('');
    expect(form.checkValidity()).toBe(false);
    await el.updateComplete;
    expect($(el, '.date-picker__message').textContent.trim()).toBe(
      'Enter a valid date.'
    );
  });

  it('types both ends of a range', async () => {
    const el = await mount('editable range locale="pt-BR"');
    await type(el, '1601202621012026');
    expect(input(el).value).toBe('16 / 01 / 2026 – 21 / 01 / 2026');
    expect(el.value).toBe('2026-01-16/2026-01-21');
  });

  it('rejects a range that ends before it starts', async () => {
    const el = await mount(
      'editable range locale="pt-BR" name="stay"',
      (html) => `<form>${html}</form>`
    );
    await type(el, '2101202616012026');
    expect(el.value).toBe('');
    expect(el.closest('form').checkValidity()).toBe(false);
    await el.updateComplete;
    expect(input(el).value).toBe('21 / 01 / 2026 – 16 / 01 / 2026');
    expect($(el, '.date-picker__message').textContent.trim()).toBe(
      "The end date can't be before the start date."
    );
  });

  it('keeps the impossible-date message for a reversed but impossible range', async () => {
    const el = await mount(
      'editable range locale="pt-BR" name="stay"',
      (html) => `<form>${html}</form>`
    );
    await type(el, '3002202616012026');
    expect(el.closest('form').checkValidity()).toBe(false);
    await el.updateComplete;
    expect($(el, '.date-picker__message').textContent.trim()).toBe(
      'Enter a valid date.'
    );
  });

  it('shows the format below the field when there is no hint', async () => {
    const el = await mount('editable locale="pt-BR"');
    const message = $(el, '.date-picker__message');
    expect(message.textContent.trim()).toBe('dd / mm / yyyy');
    // Read once, from the message, not again from the hidden format.
    expect(input(el).getAttribute('aria-describedby')).toBe(message.id);
    await type(el, '16');
    expect(message.textContent.trim()).toBe('dd / mm / yyyy');
  });

  it('translates the format everywhere with format-text', async () => {
    const el = await mount(
      'editable locale="pt-BR" format-text="dd / mm / aaaa"'
    );
    expect(input(el).placeholder).toBe('dd / mm / aaaa');
    expect($(el, '.date-picker__message').textContent.trim()).toBe(
      'dd / mm / aaaa'
    );
    el.hint = 'Hint';
    await el.updateComplete;
    const texts = input(el)
      .getAttribute('aria-describedby')
      .split(' ')
      .map((id) => el.shadowRoot.getElementById(id).textContent.trim());
    expect(texts).toEqual(['dd / mm / aaaa', 'Hint']);
  });

  it('opens the calendar from the button and returns focus to it', async () => {
    const el = await mount('editable locale="pt-BR" value="2026-01-16"');
    await userEvent.click(toggle(el));
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(toggle(el).getAttribute('aria-expanded')).toBe('true');
    expect(activeDay(el)).toBe('2026-01-16');
    await userEvent.click(day(el, '2026-01-20'));
    await el.updateComplete;
    expect(el.value).toBe('2026-01-20');
    expect(input(el).value).toBe('20 / 01 / 2026');
    expect(el.shadowRoot.activeElement).toBe(toggle(el));
  });

  it('opens the calendar from the text box with Alt+ArrowDown', async () => {
    const el = await mount('editable');
    await type(el, '{ArrowDown}');
    expect(el.open).toBe(false);
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('describes the text box with the format, even with a placeholder', async () => {
    const el = await mount(
      'editable locale="pt-BR" placeholder="Birth date" hint="Hint"'
    );
    const ids = input(el).getAttribute('aria-describedby').split(' ');
    const texts = ids.map((id) =>
      el.shadowRoot.getElementById(id).textContent.trim()
    );
    expect(texts).toEqual(['dd / mm / yyyy', 'Hint']);
  });

  it('names the calendar button with the chosen date', async () => {
    const el = await mount('editable');
    expect(toggle(el).getAttribute('aria-label')).toBe('Choose date');
    el.value = '2026-01-16';
    await el.updateComplete;
    expect(toggle(el).getAttribute('aria-label')).toBe(
      'Choose date, Jan 16, 2026'
    );
  });

  it('labels the text box', async () => {
    const el = await mount('editable label="Start"');
    expect(input(el).labels?.[0]?.textContent.trim()).toBe('Start');
  });

  it('clears the text on reset', async () => {
    const el = await mount(
      'editable locale="pt-BR" name="start"',
      (html) => `<form>${html}</form>`
    );
    await type(el, '1601');
    el.closest('form').reset();
    await el.updateComplete;
    expect(input(el).value).toBe('');
  });
});

describe('range in two fields', () => {
  const SPLIT = 'editable range range-fields="two" locale="pt-BR" label="Stay"';
  const start = (el) => $(el, '.date-picker__input--start');
  const end = (el) => $(el, '.date-picker__input--end');

  async function typeIn(el, field, text) {
    await userEvent.click(field);
    await userEvent.keyboard(text);
    await el.updateComplete;
  }

  it('names the group by the label and each box by its end', async () => {
    const el = await mount(SPLIT);
    const group = $(el, '[role="group"]');
    expect(
      el.shadowRoot
        .getElementById(group.getAttribute('aria-labelledby'))
        .textContent.trim()
    ).toBe('Stay');
    expect(start(el).getAttribute('aria-label')).toBe('Start date');
    expect(end(el).getAttribute('aria-label')).toBe('End date');
    expect($(el, '.date-picker__separator').getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(start(el).placeholder).toBe('dd / mm / yyyy');
    el.startLabel = 'Entrada';
    el.endLabel = null;
    await el.updateComplete;
    expect(start(el).getAttribute('aria-label')).toBe('Entrada');
    expect(end(el).getAttribute('aria-label')).toBe('End date');
  });

  it('keeps one box without editable or range, and by default', async () => {
    const button = await mount('range range-fields="two" label="Stay"');
    expect($(button, '.date-picker__input')).toBeNull();
    const single = await mount('editable range-fields="two" label="Day"');
    expect(single.shadowRoot.querySelectorAll('input')).toHaveLength(1);
    const one = await mount('editable range label="Stay"');
    expect(one.shadowRoot.querySelectorAll('input')).toHaveLength(1);
  });

  it('sets the value once both ends are whole and in order', async () => {
    const el = await mount(SPLIT);
    const events = [];
    el.addEventListener('change', (e) => events.push(e.detail));
    await typeIn(el, start(el), '16012026');
    expect(start(el).value).toBe('16 / 01 / 2026');
    expect(el.value).toBe('');
    await typeIn(el, end(el), '21012026');
    expect(end(el).value).toBe('21 / 01 / 2026');
    expect(el.value).toBe('2026-01-16/2026-01-21');
    expect(events).toEqual([
      {
        value: '2026-01-16/2026-01-21',
        start: '2026-01-16',
        end: '2026-01-21',
      },
    ]);
  });

  it('shows the value in both boxes', async () => {
    const el = await mount(`${SPLIT} value="2026-01-16/2026-01-21"`);
    expect(start(el).value).toBe('16 / 01 / 2026');
    expect(end(el).value).toBe('21 / 01 / 2026');
    el.value = '';
    await el.updateComplete;
    expect(start(el).value).toBe('');
    expect(end(el).value).toBe('');
  });

  it('fills both boxes from a pasted ISO range', async () => {
    const el = await mount(SPLIT);
    start(el).value = '2026-01-16/2026-01-21';
    start(el).dispatchEvent(new InputEvent('input', { bubbles: true }));
    await el.updateComplete;
    expect(start(el).value).toBe('16 / 01 / 2026');
    expect(end(el).value).toBe('21 / 01 / 2026');
    expect(el.value).toBe('2026-01-16/2026-01-21');
  });

  it('marks only the end when it comes before the start', async () => {
    const el = await mount(SPLIT, (html) => `<form>${html}</form>`);
    await typeIn(el, start(el), '21012026');
    await typeIn(el, end(el), '16012026');
    expect(el.value).toBe('');
    expect(el.closest('form').checkValidity()).toBe(false);
    await el.updateComplete;
    expect($(el, '.date-picker__message').textContent.trim()).toBe(
      "The end date can't be before the start date."
    );
    expect(start(el).getAttribute('aria-invalid')).toBe('false');
    expect(end(el).getAttribute('aria-invalid')).toBe('true');
  });

  it('reports a missing end as valueMissing on that box only', async () => {
    const el = await mount(
      `${SPLIT} required`,
      (html) => `<form>${html}</form>`
    );
    await typeIn(el, start(el), '16012026');
    expect(el.closest('form').checkValidity()).toBe(false);
    await el.updateComplete;
    const validity = el._internals.validity;
    expect(validity.valueMissing).toBe(true);
    expect(validity.badInput).toBe(false);
    const message = $(el, '.date-picker__message');
    expect(message.textContent.trim()).toBe('This field is required.');
    expect(start(el).getAttribute('aria-invalid')).toBe('false');
    expect(end(el).getAttribute('aria-invalid')).toBe('true');
    expect(start(el).getAttribute('aria-describedby')).not.toContain(
      message.id
    );
    expect(end(el).getAttribute('aria-describedby')).toContain(message.id);
  });

  it('marks both boxes when both are missing', async () => {
    const el = await mount(
      `${SPLIT} required`,
      (html) => `<form>${html}</form>`
    );
    expect(el.closest('form').checkValidity()).toBe(false);
    await el.updateComplete;
    expect(el._internals.validity.valueMissing).toBe(true);
    expect(start(el).getAttribute('aria-invalid')).toBe('true');
    expect(end(el).getAttribute('aria-invalid')).toBe('true');
  });

  it('accepts a missing end when not required', async () => {
    const el = await mount(SPLIT, (html) => `<form>${html}</form>`);
    await typeIn(el, start(el), '16012026');
    expect(el.value).toBe('');
    expect(el.closest('form').checkValidity()).toBe(true);
  });

  it('marks the box that spells no date', async () => {
    const el = await mount(SPLIT, (html) => `<form>${html}</form>`);
    await typeIn(el, start(el), '16012026');
    await typeIn(el, end(el), '2101');
    expect(el.closest('form').checkValidity()).toBe(false);
    await el.updateComplete;
    expect(start(el).getAttribute('aria-invalid')).toBe('false');
    expect(end(el).getAttribute('aria-invalid')).toBe('true');
  });

  it('fills both boxes from the calendar', async () => {
    const el = await mount(`${SPLIT} value="2026-01-16/2026-01-21"`);
    await userEvent.click($(el, '.date-picker__toggle'));
    await el.updateComplete;
    day(el, '2026-02-03').click();
    await el.updateComplete;
    day(el, '2026-02-10').click();
    await el.updateComplete;
    expect(el.value).toBe('2026-02-03/2026-02-10');
    expect(start(el).value).toBe('03 / 02 / 2026');
    expect(end(el).value).toBe('10 / 02 / 2026');
  });

  it('opens the calendar with Alt+ArrowDown from either box', async () => {
    const el = await mount(`${SPLIT} value="2026-01-16/2026-01-21"`);
    end(el).focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('requires both boxes and clears them on reset', async () => {
    const el = await mount(
      `${SPLIT} name="stay" required value="2026-01-16/2026-01-21"`,
      (html) => `<form>${html}</form>`
    );
    expect(start(el).getAttribute('aria-required')).toBe('true');
    expect(end(el).getAttribute('aria-required')).toBe('true');
    expect(new FormData(el.closest('form')).get('stay')).toBe(
      '2026-01-16/2026-01-21'
    );
    el.closest('form').reset();
    await el.updateComplete;
    expect(start(el).value).toBe('');
    expect(end(el).value).toBe('');
    expect(el.closest('form').checkValidity()).toBe(false);
  });
});
