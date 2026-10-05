import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiCheckbox } from './checkbox.ts';

customElements.define('lui-checkbox', LuiCheckbox);

const mounted = [];

async function mount(attrs = '') {
  const host = document.createElement('div');
  host.innerHTML = `<lui-checkbox aria-label="Select all" ${attrs}></lui-checkbox>`;
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector('lui-checkbox');
  await el.updateComplete;
  return el;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const input = (el) => el.shadowRoot.querySelector('input');

describe('indeterminate', () => {
  it('is off by default', async () => {
    const el = await mount();
    expect(input(el).indeterminate).toBe(false);
  });

  it('sets the native mixed state, which assistive technology reads as partially checked', async () => {
    const el = await mount('indeterminate');
    expect(input(el).indeterminate).toBe(true);
    expect(input(el).matches(':indeterminate')).toBe(true);
  });

  it('draws a dash instead of the check', async () => {
    const el = await mount('checked indeterminate');
    const after = getComputedStyle(input(el), '::after');
    expect(after.content).not.toBe('none');
    expect(after.borderRightWidth).toBe('0px');
  });

  it('clears when the user toggles the checkbox', async () => {
    const el = await mount('indeterminate');
    input(el).click();
    await el.updateComplete;
    expect(el.indeterminate).toBe(false);
    expect(input(el).indeterminate).toBe(false);
  });

  it('clears on form reset', async () => {
    const el = await mount('indeterminate');
    el.formResetCallback();
    await el.updateComplete;
    expect(el.indeterminate).toBe(false);
  });
});
