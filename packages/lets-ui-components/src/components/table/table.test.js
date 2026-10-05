import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiTable } from './table.ts';
import { LuiCheckbox } from '../checkbox/checkbox.ts';

// Only the element under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-table', LuiTable);
customElements.define('lui-checkbox', LuiCheckbox);

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

describe('accessible name', () => {
  const NAMED = TABLE.replace('<caption>Orders</caption>', '').replace(
    '<table>',
    '<table aria-label="Pedidos">'
  );

  it('works without a caption, named by aria-label on the table', async () => {
    const el = await mount('', NAMED);
    const table = el.querySelector('table');
    expect(table.caption).toBeNull();
    expect(table.getAttribute('aria-label')).toBe('Pedidos');
  });
});

describe('caption', () => {
  it('sits inside the border, above the header, in the heading font', async () => {
    const el = await mount('bordered');
    await new Promise((r) => setTimeout(r, 50));
    const caption = el.querySelector('caption');
    const box = wrapper(el).getBoundingClientRect();
    const cap = caption.getBoundingClientRect();
    const head = el.querySelector('thead').getBoundingClientRect();
    expect(cap.top).toBeGreaterThanOrEqual(box.top);
    expect(cap.bottom).toBeLessThanOrEqual(head.top);
    expect(head.top - cap.bottom).toBeGreaterThan(0);
    const style = getComputedStyle(caption);
    const th = getComputedStyle(el.querySelector('thead th'));
    expect(parseFloat(style.fontSize)).toBeGreaterThan(parseFloat(th.fontSize));
    expect(style.fontWeight).toBe('400');
    expect(parseFloat(style.paddingLeft)).toBeGreaterThan(0);
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

  it('names the region from the aria-label of a table without caption', async () => {
    const wide = WIDE.replace('<caption>Orders</caption>', '').replace(
      '<table ',
      '<table aria-label="Pedidos" '
    );
    const el = await mount('', wide, 'display: block; width: 200px');
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
    expect(wrapper(el).getAttribute('aria-label')).toBe('Pedidos');
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

describe('end alignment', () => {
  it('aligns only the cells that opt in', async () => {
    const el = await mount(
      '',
      TABLE.replace(
        '<th scope="col">Status</th>',
        '<th scope="col" class="table__cell--end">Status</th>'
      ).replace(
        '<td>Completed</td>',
        '<td class="table__cell--end">Completed</td>'
      )
    );
    await new Promise((r) => setTimeout(r, 50));
    const aligned = el.querySelector('td.table__cell--end');
    const plain = el.querySelector('tbody tr:nth-child(2) td');
    expect(getComputedStyle(aligned).textAlign).toBe('end');
    expect(
      getComputedStyle(el.querySelector('th.table__cell--end')).textAlign
    ).toBe('end');
    expect(getComputedStyle(plain).textAlign).toBe('start');
  });
});

describe('selectable', () => {
  const box = (label) => `<lui-checkbox aria-label="${label}"></lui-checkbox>`;
  const SELECTABLE = (rowAttrs = ['', '', '']) => `
    <table aria-label="Files">
      <thead><tr><th scope="col"><lui-checkbox aria-label="Select all"></lui-checkbox></th><th scope="col">Name</th></tr></thead>
      <tbody>
        ${rowAttrs
          .map(
            (attrs, i) =>
              `<tr><td><lui-checkbox aria-label="Select file ${i + 1}" ${attrs}></lui-checkbox></td><td>File ${i + 1}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>`;

  const parts = (el) => ({
    head: el.querySelector('thead lui-checkbox'),
    rows: [...el.querySelectorAll('tbody lui-checkbox')],
  });
  const click = async (checkbox) => {
    checkbox.shadowRoot.querySelector('input').click();
    await checkbox.updateComplete;
  };
  const settle = async (el) => {
    await new Promise((r) => setTimeout(r, 50));
    await Promise.all(
      [...el.querySelectorAll('lui-checkbox')].map((c) => c.updateComplete)
    );
    await el.updateComplete;
  };

  it('select all checks every row', async () => {
    const el = await mount('selectable', SELECTABLE());
    await settle(el);
    const { head, rows } = parts(el);
    await click(head);
    expect(rows.map((r) => r.checked)).toEqual([true, true, true]);
    expect(head.checked).toBe(true);
    expect(head.indeterminate).toBe(false);
  });

  it('clearing select all unchecks every row', async () => {
    const el = await mount(
      'selectable',
      SELECTABLE(['checked', 'checked', 'checked'])
    );
    await settle(el);
    const { head, rows } = parts(el);
    expect(head.checked).toBe(true);
    await click(head);
    expect(rows.map((r) => r.checked)).toEqual([false, false, false]);
    expect(head.checked).toBe(false);
  });

  it('shows the mixed state when only some rows are selected', async () => {
    const el = await mount('selectable', SELECTABLE());
    await settle(el);
    const { head, rows } = parts(el);
    await click(rows[0]);
    await settle(el);
    expect(head.checked).toBe(false);
    expect(head.indeterminate).toBe(true);
    expect(head.shadowRoot.querySelector('input').indeterminate).toBe(true);
  });

  it('goes back to checked when the last row is selected, and to empty when none is', async () => {
    const el = await mount('selectable', SELECTABLE());
    await settle(el);
    const { head, rows } = parts(el);
    for (const row of rows) await click(row);
    await settle(el);
    expect(head.checked).toBe(true);
    expect(head.indeterminate).toBe(false);
    for (const row of rows) await click(row);
    await settle(el);
    expect(head.checked).toBe(false);
    expect(head.indeterminate).toBe(false);
  });

  it('starts mixed when some rows come preselected', async () => {
    const el = await mount('selectable', SELECTABLE(['checked', '', '']));
    await settle(el);
    expect(parts(el).head.indeterminate).toBe(true);
  });

  it('leaves disabled rows out of select all', async () => {
    const el = await mount('selectable', SELECTABLE(['', 'disabled', '']));
    await settle(el);
    const { head, rows } = parts(el);
    await click(head);
    expect(rows.map((r) => r.checked)).toEqual([true, false, true]);
    expect(head.checked).toBe(true);
    expect(head.indeterminate).toBe(false);
  });

  it('emits lui-selection-change with the selected rows', async () => {
    const el = await mount('selectable', SELECTABLE());
    await settle(el);
    const { rows } = parts(el);
    let detail;
    el.addEventListener('lui-selection-change', (e) => (detail = e.detail));
    await click(rows[1]);
    expect(detail.count).toBe(1);
    expect(detail.total).toBe(3);
    expect(detail.rows).toEqual([rows[1].closest('tr')]);
  });

  it('announces the selection in a polite live region', async () => {
    const el = await mount('selectable', SELECTABLE());
    await settle(el);
    const status = el.shadowRoot.querySelector('[role="status"]');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent.trim()).toBe('');
    await click(parts(el).head);
    await el.updateComplete;
    expect(status.textContent.trim()).toBe('3 of 3 rows selected');
  });

  it('uses selection-label for the announcement', async () => {
    const el = await mount(
      'selectable selection-label="{count} de {total} linhas selecionadas"',
      SELECTABLE()
    );
    await settle(el);
    await click(parts(el).rows[0]);
    await el.updateComplete;
    expect(
      el.shadowRoot.querySelector('[role="status"]').textContent.trim()
    ).toBe('1 de 3 linhas selecionadas');
  });

  it('does nothing without the selectable attribute', async () => {
    const el = await mount('', SELECTABLE());
    await settle(el);
    const { head, rows } = parts(el);
    await click(head);
    expect(rows.map((r) => r.checked)).toEqual([false, false, false]);
  });
});
