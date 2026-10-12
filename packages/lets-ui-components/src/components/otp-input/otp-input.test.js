import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiOtpInput } from './otp-input.ts';

// Only the element under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-otp-input', LuiOtpInput);

const mounted = [];

async function mount(attrs = '', wrap = (html) => html) {
  const host = document.createElement('div');
  host.innerHTML = wrap(`<lui-otp-input ${attrs}></lui-otp-input>`);
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector('lui-otp-input');
  await el.updateComplete;
  return el;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const fields = (el) => [...el.shadowRoot.querySelectorAll('.otp-input__field')];
const values = (el) => fields(el).map((f) => f.value);
const focused = (el) => fields(el).indexOf(el.shadowRoot.activeElement);

function paste(field, text) {
  const clipboardData = new DataTransfer();
  clipboardData.setData('text/plain', text);
  field.dispatchEvent(
    new ClipboardEvent('paste', {
      clipboardData,
      bubbles: true,
      cancelable: true,
    })
  );
}

describe('rendering', () => {
  // Index of each separator among the group's children, boxes included.
  const separatorSlots = (el) => {
    const children = [
      ...el.shadowRoot.querySelector('.otp-input__group').children,
    ];
    return children
      .map((child, i) =>
        child.classList.contains('otp-input__separator') ? i : -1
      )
      .filter((i) => i >= 0);
  };

  it('renders six boxes in a single row by default', async () => {
    const el = await mount();
    expect(fields(el)).toHaveLength(6);
    expect(separatorSlots(el)).toEqual([]);
  });

  it('follows length', async () => {
    const el = await mount('length="4"');
    expect(fields(el)).toHaveLength(4);
  });

  it('draws a separator after the box separator names', async () => {
    const el = await mount('separator="3"');
    expect(separatorSlots(el)).toEqual([3]);
  });

  it('draws one separator per listed position', async () => {
    const el = await mount('length="8" separator="2, 4,6"');
    expect(separatorSlots(el)).toEqual([2, 5, 8]);
  });

  it('ignores positions outside the row', async () => {
    const el = await mount('separator="0,6,9,x"');
    expect(separatorSlots(el)).toEqual([]);
  });

  it('draws square boxes', async () => {
    const el = await mount();
    const { width, height } = fields(el)[0].getBoundingClientRect();
    expect(width).toBeGreaterThan(0);
    expect(width).toBeCloseTo(height, 0);
  });

  it('fills the boxes from value', async () => {
    const el = await mount('value="12ab"');
    expect(values(el)).toEqual(['1', '2', 'a', 'b', '', '']);
  });

  it('drops what a numeric type does not accept', async () => {
    const el = await mount('type="number" value="1a2"');
    expect(values(el)).toEqual(['1', '2', '', '', '', '']);
    expect(el.value).toBe('12');
    expect(fields(el)[0].inputMode).toBe('numeric');
  });
});

describe('accessibility', () => {
  it('wraps the boxes in a named group', async () => {
    const el = await mount('label="Código de verificação"');
    const group = el.shadowRoot.querySelector('[role="group"]');
    expect(group.getAttribute('aria-label')).toBe('Código de verificação');
  });

  it('names each box by its position', async () => {
    const el = await mount(
      'length="4" field-label="Dígito {index} de {length}"'
    );
    expect(fields(el).map((f) => f.getAttribute('aria-label'))).toEqual([
      'Dígito 1 de 4',
      'Dígito 2 de 4',
      'Dígito 3 de 4',
      'Dígito 4 de 4',
    ]);
  });

  it('offers one-time-code autofill on the first box only', async () => {
    const el = await mount();
    expect(fields(el).map((f) => f.autocomplete)).toEqual([
      'one-time-code',
      'off',
      'off',
      'off',
      'off',
      'off',
    ]);
  });

  it('marks the boxes invalid and links the message on error', async () => {
    const el = await mount('error error-text="Código inválido."');
    const message = el.shadowRoot.querySelector('.otp-input__message');
    expect(message.textContent.trim()).toBe('Código inválido.');
    for (const field of fields(el)) {
      expect(field.getAttribute('aria-invalid')).toBe('true');
      expect(field.getAttribute('aria-describedby')).toBe(message.id);
    }
  });

  it('hides the separator from assistive technology', async () => {
    const el = await mount('separator="3"');
    const separator = el.shadowRoot.querySelector('.otp-input__separator');
    expect(separator.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('typing', () => {
  it('moves focus to the next box after a character', async () => {
    const el = await mount();
    await userEvent.click(fields(el)[0]);
    await userEvent.keyboard('1');
    expect(focused(el)).toBe(1);
    await userEvent.keyboard('2');
    expect(values(el).slice(0, 2)).toEqual(['1', '2']);
    expect(focused(el)).toBe(2);
  });

  it('replaces the character of a filled box', async () => {
    const el = await mount('value="123456"');
    await userEvent.click(fields(el)[2]);
    await userEvent.keyboard('9');
    expect(el.value).toBe('129456');
  });

  it('ignores a letter in a numeric box and keeps its digit', async () => {
    const el = await mount('type="number" value="1"');
    await userEvent.click(fields(el)[0]);
    await userEvent.keyboard('a');
    expect(values(el)[0]).toBe('1');
    expect(focused(el)).toBe(0);
  });

  it('moves back and clears the previous box on Backspace in an empty box', async () => {
    const el = await mount('value="12"');
    await userEvent.click(fields(el)[2]);
    await userEvent.keyboard('{Backspace}');
    expect(values(el).slice(0, 3)).toEqual(['1', '', '']);
    expect(focused(el)).toBe(1);
  });

  it('clears a filled box on Backspace without moving', async () => {
    const el = await mount('value="12"');
    await userEvent.click(fields(el)[1]);
    await userEvent.keyboard('{Backspace}');
    expect(values(el).slice(0, 2)).toEqual(['1', '']);
    expect(focused(el)).toBe(1);
  });

  it('moves between boxes with the arrows, Home and End', async () => {
    const el = await mount();
    await userEvent.click(fields(el)[2]);
    await userEvent.keyboard('{ArrowRight}');
    expect(focused(el)).toBe(3);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(focused(el)).toBe(1);
    await userEvent.keyboard('{End}');
    expect(focused(el)).toBe(5);
    await userEvent.keyboard('{Home}');
    expect(focused(el)).toBe(0);
  });

  it('focuses the first empty box through focus()', async () => {
    const el = await mount('value="12"');
    el.focus();
    expect(focused(el)).toBe(2);
  });
});

describe('paste', () => {
  it('spreads a full code across every box, wherever it lands', async () => {
    const el = await mount();
    paste(fields(el)[3], '123456');
    await el.updateComplete;
    expect(values(el)).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('fills from the box it lands in when shorter than the code', async () => {
    const el = await mount();
    paste(fields(el)[2], '78');
    await el.updateComplete;
    expect(values(el)).toEqual(['', '', '7', '8', '', '']);
    expect(focused(el)).toBe(4);
  });

  it('keeps only accepted characters', async () => {
    const el = await mount('type="number"');
    paste(fields(el)[0], '123-456');
    await el.updateComplete;
    expect(el.value).toBe('123456');
  });
});

describe('events', () => {
  it('emits lui-complete with the value once every box is filled', async () => {
    const el = await mount('length="4"');
    const events = [];
    el.addEventListener('lui-complete', (e) => events.push(e.detail));
    await userEvent.click(fields(el)[0]);
    await userEvent.keyboard('123');
    expect(events).toHaveLength(0);
    await userEvent.keyboard('4');
    expect(events).toEqual([{ value: '1234' }]);
  });

  it('emits lui-complete after a pasted code', async () => {
    const el = await mount();
    let detail;
    el.addEventListener('lui-complete', (e) => (detail = e.detail));
    paste(fields(el)[0], '654321');
    expect(detail).toEqual({ value: '654321' });
  });

  it('clears error once the user types', async () => {
    const el = await mount('error');
    await userEvent.click(fields(el)[0]);
    await userEvent.keyboard('1');
    expect(el.error).toBe(false);
  });
});

describe('disabled', () => {
  it('disables every box', async () => {
    const el = await mount('disabled');
    expect(fields(el).every((f) => f.disabled)).toBe(true);
  });
});

describe('forms', () => {
  const inForm = (html) => `<form>${html}</form>`;

  it('submits the code under its name', async () => {
    const el = await mount('name="code" value="123456"', inForm);
    const data = new FormData(el.closest('form'));
    expect(data.get('code')).toBe('123456');
  });

  it('is invalid when required and empty, or partly filled', async () => {
    const el = await mount('name="code" required', inForm);
    const form = el.closest('form');
    expect(form.checkValidity()).toBe(false);
    el.value = '12';
    await el.updateComplete;
    expect(form.checkValidity()).toBe(false);
    el.value = '123456';
    await el.updateComplete;
    expect(form.checkValidity()).toBe(true);
  });

  it('empties on form reset', async () => {
    const el = await mount('name="code" value="123456"', inForm);
    el.closest('form').reset();
    await el.updateComplete;
    expect(values(el)).toEqual(['', '', '', '', '', '']);
  });
});
