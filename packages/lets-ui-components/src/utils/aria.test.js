import '../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { exposed } from '../test/ax-tree.js';
import { LuiBreadcrumb } from '../components/breadcrumb/breadcrumb.ts';
import { LuiCard } from '../components/card/card.ts';
import { LuiCheckbox } from '../components/checkbox/checkbox.ts';
import { LuiCodeBlock } from '../components/code-block/code-block.ts';
import { LuiIconButton } from '../components/icon-button/icon-button.ts';
import { LuiInput } from '../components/input/input.ts';
import { LuiLink } from '../components/link/link.ts';
import { LuiModal } from '../components/modal/modal.ts';
import { LuiRadio } from '../components/radio/radio.ts';
import { LuiSelect } from '../components/select/select.ts';
import { LuiShortcut } from '../components/shortcut/shortcut.ts';
import { LuiSwitch } from '../components/switch/switch.ts';
import { LuiTextarea } from '../components/textarea/textarea.ts';
import { LuiTooltip } from '../components/tooltip/tooltip.ts';

// Each host with an `aria-label`, and the one node it should expose for it.
// Button and Icon Button, which take state ARIA too, have their own tests.
const components = {
  'lui-breadcrumb': [LuiBreadcrumb, '', 'navigation'],
  'lui-card': [LuiCard, '', 'article'],
  'lui-checkbox': [LuiCheckbox, '', 'checkbox'],
  'lui-code-block': [LuiCodeBlock, 'code="npm i"', 'region'],
  'lui-input': [LuiInput, '', 'textbox'],
  'lui-link': [LuiLink, 'href="/x"', 'link'],
  'lui-radio': [LuiRadio, '', 'radio'],
  'lui-select': [LuiSelect, '', 'combobox'],
  'lui-shortcut': [LuiShortcut, 'keys="Ctrl+K"', 'group'],
  'lui-switch': [LuiSwitch, '', 'switch'],
  'lui-textarea': [LuiTextarea, '', 'textbox'],
  // With no slotted trigger, the label goes on the Tooltip's own button.
  'lui-tooltip': [LuiTooltip, 'text="Dica" label="?"', 'button'],
};

for (const [tag, [element]] of Object.entries(components)) {
  customElements.define(tag, element);
}
customElements.define('lui-modal', LuiModal);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const el = host.firstElementChild;
  await el.updateComplete;
  return el;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

describe.each(Object.entries(components))('%s', (tag, [, attrs, role]) => {
  const html = `<${tag} ${attrs} aria-label="Nome"></${tag}>`;

  it('moves aria-label off the host and onto what it renders', async () => {
    const el = await mount(html);

    expect(el.hasAttribute('aria-label')).toBe(false);
    expect(el.ariaLabel).toBe('Nome');
    expect(el.shadowRoot.querySelector('[aria-label="Nome"]')).not.toBeNull();
  });

  it('exposes only the inner control in the accessibility tree', async () => {
    await mount(html);

    const nodes = await exposed('Nome');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatch(new RegExp(`^${role} "Nome"`));
  });
});

describe('HostAriaMixin', () => {
  it('takes every attribute when the element upgrades after parsing', async () => {
    // Defined after the markup is parsed, so all attributes arrive in one
    // upgrade: removing the first must not swallow the others.
    class LateIconButton extends LuiIconButton {}
    const host = document.createElement('div');
    host.innerHTML =
      '<lui-late-icon-button aria-label="Tarde" aria-haspopup="menu" aria-expanded="false"></lui-late-icon-button>';
    document.body.append(host);
    mounted.push(host);
    customElements.define('lui-late-icon-button', LateIconButton);
    const el = host.firstElementChild;
    await el.updateComplete;

    expect(el.getAttributeNames().filter((n) => n.startsWith('aria-'))).toEqual(
      []
    );
    expect(await exposed('Tarde')).toEqual([
      'button "Tarde" hasPopup=menu expanded=false',
    ]);
  });

  it('leaves aria-* attributes the component does not declare', async () => {
    const el = await mount(
      '<lui-input aria-label="Nome" aria-describedby="x"></lui-input>'
    );

    expect(el.hasAttribute('aria-label')).toBe(false);
    expect(el.getAttribute('aria-describedby')).toBe('x');
  });

  it("passes a Modal's state to a Link trigger, not to its host", async () => {
    const modal = await mount(
      '<lui-modal title="Termos"><lui-link slot="trigger" href="#">Termos</lui-link></lui-modal>'
    );
    const link = modal.querySelector('lui-link');

    await expect
      .poll(() => exposed('Termos'))
      .toContain('link "Termos" hasPopup=dialog expanded=false');
    expect(
      link.getAttributeNames().filter((n) => n.startsWith('aria-'))
    ).toEqual([]);
  });
});
