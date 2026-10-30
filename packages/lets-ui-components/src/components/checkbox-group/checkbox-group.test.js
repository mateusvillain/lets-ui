import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiCheckbox } from '../checkbox/checkbox.ts';
import { LuiCheckboxGroup } from './checkbox-group.ts';

// Only the elements under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-checkbox', LuiCheckbox);
customElements.define('lui-checkbox-group', LuiCheckboxGroup);

const OPTIONS = `
  <lui-checkbox label="Email" value="email"></lui-checkbox>
  <lui-checkbox label="SMS" value="sms"></lui-checkbox>
  <lui-checkbox label="Push" value="push"></lui-checkbox>
`;

const mounted = [];

async function mount(attrs = '', options = OPTIONS, wrap = (html) => html) {
  const host = document.createElement('div');
  host.innerHTML = wrap(
    `<lui-checkbox-group ${attrs}>${options}</lui-checkbox-group>`
  );
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector('lui-checkbox-group');
  await el.updateComplete;
  await Promise.all(boxes(el).map((c) => c.updateComplete));
  return el;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const boxes = (el) => [...el.querySelectorAll('lui-checkbox')];
const input = (checkbox) => checkbox.shadowRoot.querySelector('input');
const fieldset = (el) => el.shadowRoot.querySelector('fieldset');

async function settle(el) {
  await el.updateComplete;
  await Promise.all(boxes(el).map((c) => c.updateComplete));
}

describe('rendering', () => {
  it('renders a fieldset named by its legend', async () => {
    const el = await mount('label="Notifications"');
    expect(fieldset(el)).not.toBeNull();
    expect(fieldset(el).getAttribute('role')).toBeNull();
    expect(el.shadowRoot.querySelector('legend').textContent).toBe(
      'Notifications'
    );
  });

  it('places the hint between the legend and the options', async () => {
    const el = await mount('label="Notifications" hint="Pick any."');
    const children = [...fieldset(el).children].map((n) => n.className);
    expect(children).toEqual([
      'checkbox-group__legend',
      'checkbox-group__hint',
      'checkbox-group__options',
    ]);
  });

  it('renders the error below the options and flags the group', async () => {
    const el = await mount(
      'label="Notifications" error error-text="Pick one."'
    );
    const last = fieldset(el).lastElementChild;
    expect(last.className).toBe('checkbox-group__message');
    expect(last.textContent.trim()).toBe('Pick one.');
    expect(fieldset(el).getAttribute('aria-invalid')).toBe('true');
    expect(fieldset(el).className).toContain('checkbox-group--error');
  });

  it('describes the fieldset with both the hint and the error', async () => {
    const el = await mount('hint="Pick any." error error-text="Pick one."');
    const ids = fieldset(el).getAttribute('aria-describedby').split(' ');
    const texts = ids.map((id) =>
      el.shadowRoot.getElementById(id).textContent.trim()
    );
    expect(texts).toEqual(['Pick any.', 'Pick one.']);
  });

  it('shows one message for the group, not one per option', async () => {
    const el = await mount('error error-text="Pick one."');
    boxes(el).forEach((c) => {
      expect(c.shadowRoot.querySelector('.checkbox-field__message')).toBeNull();
      expect(input(c).hasAttribute('aria-describedby')).toBe(false);
    });
  });
});

describe('propagation', () => {
  it('passes name, size and error to every option', async () => {
    const el = await mount('name="channels" size="md" error');
    boxes(el).forEach((c) => {
      expect(c.name).toBe('channels');
      expect(c.size).toBe('md');
      expect(c.error).toBe(true);
    });
  });

  it('disables every option and restores only the ones it disabled', async () => {
    const el = await mount(
      'disabled',
      `<lui-checkbox label="Email" value="email"></lui-checkbox>
       <lui-checkbox label="SMS" value="sms" disabled></lui-checkbox>`
    );
    expect(boxes(el).map((c) => c.disabled)).toEqual([true, true]);

    el.disabled = false;
    await settle(el);
    expect(boxes(el).map((c) => c.disabled)).toEqual([false, true]);
  });

  it('applies the group settings to options added later', async () => {
    const el = await mount('name="channels" size="md"', '');
    const late = document.createElement('lui-checkbox');
    late.value = 'email';
    el.append(late);
    await settle(el);
    await new Promise((r) => setTimeout(r));
    expect(late.name).toBe('channels');
    expect(late.size).toBe('md');
  });
});

describe('form participation', () => {
  const inForm = (html) => `<form>${html}</form>`;

  it('submits every checked value under the group name', async () => {
    const el = await mount(
      'name="channels"',
      `<lui-checkbox label="Email" value="email" checked></lui-checkbox>
       <lui-checkbox label="SMS" value="sms"></lui-checkbox>
       <lui-checkbox label="Push" value="push" checked></lui-checkbox>`,
      inForm
    );
    const data = new FormData(el.closest('form'));
    expect(data.getAll('channels')).toEqual(['email', 'push']);
    expect(el.value).toEqual(['email', 'push']);
  });

  it('updates the submitted values as options toggle', async () => {
    const el = await mount('name="channels"', OPTIONS, inForm);
    await userEvent.click(input(boxes(el)[1]));
    await settle(el);
    expect(new FormData(el.closest('form')).getAll('channels')).toEqual([
      'sms',
    ]);
  });

  it('clears every option and the error on form reset', async () => {
    const el = await mount(
      'name="channels" error',
      `<lui-checkbox label="Email" value="email" checked></lui-checkbox>
       <lui-checkbox label="SMS" value="sms" checked></lui-checkbox>`,
      inForm
    );
    el.closest('form').reset();
    await settle(el);
    expect(boxes(el).map((c) => c.checked)).toEqual([false, false]);
    expect(el.error).toBe(false);
    expect(new FormData(el.closest('form')).getAll('channels')).toEqual([]);
  });

  it('disables every option when a parent fieldset is disabled', async () => {
    const el = await mount('name="channels"', OPTIONS, (html) =>
      inForm(`<fieldset disabled>${html}</fieldset>`)
    );
    await settle(el);
    expect(el.disabled).toBe(true);
    boxes(el).forEach((c) => expect(c.disabled).toBe(true));
  });
});

describe('validation', () => {
  it('reports valueMissing while required and nothing is checked', async () => {
    const el = await mount('required error-text="Pick one."');
    expect(el.matches(':invalid')).toBe(true);
    expect(el._internals.validity.valueMissing).toBe(true);
    expect(el._internals.validationMessage).toBe('Pick one.');
  });

  it('turns on the error when the form is validated', async () => {
    const el = await mount(
      'required',
      OPTIONS,
      (html) => `<form>${html}</form>`
    );
    el.closest('form').reportValidity();
    await settle(el);
    expect(el.error).toBe(true);
  });

  it('becomes valid and drops the error once one option is checked', async () => {
    const el = await mount('required error');
    await userEvent.click(input(boxes(el)[0]));
    await settle(el);
    expect(el.matches(':valid')).toBe(true);
    expect(el.error).toBe(false);
    expect(boxes(el).every((c) => !c.error)).toBe(true);
  });

  it('follows options checked from script, without a change event', async () => {
    const el = await mount('required error');
    boxes(el)[0].checked = true;
    await settle(el);
    expect(el.matches(':valid')).toBe(true);
    expect(el.error).toBe(false);
  });

  it('does not block the form while disabled', async () => {
    const el = await mount(
      'required',
      OPTIONS,
      (html) => `<form>${html}</form>`
    );
    el.disabled = true;
    await settle(el);
    expect(el.closest('form').checkValidity()).toBe(true);

    el.disabled = false;
    await settle(el);
    expect(el.closest('form').checkValidity()).toBe(false);
  });

  it('moves focus to the first enabled option when the form is validated', async () => {
    const el = await mount(
      'required',
      `<lui-checkbox label="Email" value="email" disabled></lui-checkbox>
       <lui-checkbox label="SMS" value="sms"></lui-checkbox>`,
      (html) => `<form>${html}</form>`
    );
    el.closest('form').reportValidity();
    const sms = boxes(el)[1];
    expect(sms.shadowRoot.activeElement).toBe(input(sms));
  });

  it('is valid when not required, even with nothing checked', async () => {
    const el = await mount();
    expect(el.matches(':valid')).toBe(true);
  });
});

describe('keyboard', () => {
  it('keeps every enabled option in the Tab order and skips disabled ones', async () => {
    const el = await mount(
      '',
      `<lui-checkbox label="Email" value="email"></lui-checkbox>
       <lui-checkbox label="SMS" value="sms" disabled></lui-checkbox>
       <lui-checkbox label="Push" value="push"></lui-checkbox>`
    );
    const [email, , push] = boxes(el);
    input(email).focus();
    await userEvent.keyboard('{Tab}');
    expect(push.shadowRoot.activeElement).toBe(input(push));
  });

  it('toggles the focused option with Space', async () => {
    const el = await mount();
    const [email] = boxes(el);
    input(email).focus();
    await userEvent.keyboard(' ');
    await settle(el);
    expect(email.checked).toBe(true);
    await userEvent.keyboard(' ');
    await settle(el);
    expect(email.checked).toBe(false);
  });

  it('leaves arrow keys alone', async () => {
    const el = await mount();
    const [email, sms] = boxes(el);
    input(email).focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle(el);
    expect(email.shadowRoot.activeElement).toBe(input(email));
    expect(sms.checked).toBe(false);
  });
});
