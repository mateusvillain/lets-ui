import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiTable } from './table.ts';

// Only the element under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-table', LuiTable);

const mounted = [];

const TABLE = `
  <table>
    <caption>Orders</caption>
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr><th scope="row">Ana</th><td>Completed</td></tr>
      <tr><th scope="row">Bruno</th><td>In Progress</td></tr>
    </tbody>
  </table>
`;

async function mount(attrs = '', inner = TABLE, style = '') {
  const host = document.createElement('div');
  host.innerHTML = `<lui-table ${attrs} style="${style}">${inner}</lui-table>`;
  document.body.append(host);
  mounted.push(host);
  const table = host.querySelector('lui-table');
  await table.updateComplete;
  return table;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const wrapper = (el) => el.shadowRoot.querySelector('.table-wrapper');

describe('semantics', () => {
  it('keeps the native table, caption and header cells untouched', async () => {
    const el = await mount();
    const table = el.querySelector('table');
    expect(table.caption.textContent).toBe('Orders');
    expect(table.querySelectorAll('th[scope="col"]')).toHaveLength(2);
    expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(2);
    expect(table.getAttribute('role')).toBeNull();
  });

  it('adds the .table class to the slotted table', async () => {
    const el = await mount();
    await el.updateComplete;
    expect(el.querySelector('table').classList.contains('table')).toBe(true);
  });

  it('does not wrap the table in a landmark when nothing overflows', async () => {
    const el = await mount();
    expect(wrapper(el).getAttribute('role')).toBeNull();
    expect(wrapper(el).hasAttribute('tabindex')).toBe(false);
  });
});

describe('bordered', () => {
  it('is off by default', async () => {
    const el = await mount();
    expect(wrapper(el).classList.contains('table-wrapper--bordered')).toBe(
      false
    );
  });

  it('adds the border modifier to the wrapper', async () => {
    const el = await mount('bordered');
    expect(wrapper(el).classList.contains('table-wrapper--bordered')).toBe(
      true
    );
  });
});

describe('scrollable region', () => {
  const WIDE = TABLE.replace(
    '<table>',
    '<table style="width: 800px; min-width: 800px">'
  );

  it('becomes a labelled, focusable region when the table overflows', async () => {
    const el = await mount('', WIDE, 'display: block; width: 200px');
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
    expect(wrapper(el).getAttribute('role')).toBe('region');
    expect(wrapper(el).getAttribute('tabindex')).toBe('0');
  });

  it('names the region from the caption', async () => {
    const el = await mount('', WIDE, 'display: block; width: 200px');
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
    expect(wrapper(el).getAttribute('aria-label')).toBe('Orders');
  });

  it('prefers the label attribute over the caption', async () => {
    const el = await mount(
      'label="Order list"',
      WIDE,
      'display: block; width: 200px'
    );
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
    expect(wrapper(el).getAttribute('aria-label')).toBe('Order list');
  });
});

describe('styling', () => {
  it('pads the cells and divides the rows', async () => {
    const el = await mount();
    await new Promise((r) => setTimeout(r, 50));
    const cell = el.querySelector('tbody td');
    const style = getComputedStyle(cell);
    expect(parseFloat(style.paddingTop)).toBeGreaterThan(0);
    expect(style.borderBottomStyle).toBe('solid');
  });

  it('drops the divider under the last row', async () => {
    const el = await mount();
    await new Promise((r) => setTimeout(r, 50));
    const last = el.querySelector('tbody tr:last-child td');
    expect(getComputedStyle(last).borderBottomWidth).toBe('0px');
  });

  it('renders header cells bolder than body cells', async () => {
    const el = await mount();
    await new Promise((r) => setTimeout(r, 50));
    const th = getComputedStyle(el.querySelector('thead th')).fontWeight;
    const td = getComputedStyle(el.querySelector('tbody td')).fontWeight;
    expect(Number(th)).toBeGreaterThan(Number(td));
  });
});
