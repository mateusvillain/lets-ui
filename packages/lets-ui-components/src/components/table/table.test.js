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

describe('fit width', () => {
  const WIDE_TEXT =
    'A long description that takes the room the fitted column gives up';
  const FIT = `
    <table aria-label="Orders" style="width: 600px">
      <thead><tr>
        <th scope="col">Description</th>
        <th scope="col" class="table__cell--fit">Actions</th>
      </tr></thead>
      <tbody><tr>
        <td>${WIDE_TEXT}</td>
        <td class="table__cell--fit"><button>Edit</button></td>
      </tr></tbody>
    </table>`;
  const PLAIN = FIT.replaceAll(' class="table__cell--fit"', '');

  it('shrinks the column to its content and gives the rest to the others', async () => {
    const fit = await mount('', FIT);
    const plain = await mount('', PLAIN);
    await new Promise((r) => setTimeout(r, 50));
    const width = (el) =>
      el.querySelector('thead th:last-child').getBoundingClientRect().width;
    expect(width(fit)).toBeLessThan(width(plain));
    expect(width(fit)).toBeLessThan(150);
  });

  it('keeps the content of a fitted cell on one line', async () => {
    const el = await mount('', FIT);
    await new Promise((r) => setTimeout(r, 50));
    const cell = el.querySelector('tbody td:last-child');
    expect(getComputedStyle(cell).whiteSpace).toBe('nowrap');
  });
});

describe('inside a flex parent', () => {
  it('scrolls inside its wrapper instead of stretching the parent', async () => {
    const host = document.createElement('div');
    host.style.cssText = 'display: flex; width: 300px';
    host.innerHTML = `<lui-table>${TABLE.replace(
      '<table>',
      '<table style="width: 800px; min-width: 800px">'
    )}</lui-table>`;
    document.body.append(host);
    mounted.push(host);
    const el = host.querySelector('lui-table');
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));

    expect(el.getBoundingClientRect().width).toBeLessThanOrEqual(300);
    expect(wrapper(el).getAttribute('role')).toBe('region');
  });
});

describe('sticky header', () => {
  const ROWS = Array.from(
    { length: 14 },
    (_, i) =>
      `<tr><th scope="row">Row ${i + 1}</th><td>Value ${i + 1}</td></tr>`
  ).join('');
  const LONG = `
    <table aria-label="Long">
      <thead><tr><th scope="col">Name</th><th scope="col">Value</th></tr></thead>
      <tbody>${ROWS}</tbody>
    </table>`;
  const headCell = (el) => el.querySelector('thead th');

  it('is not sticky by default', async () => {
    const el = await mount('max-height="150"', LONG);
    await new Promise((r) => setTimeout(r, 50));
    expect(getComputedStyle(headCell(el)).position).toBe('static');
  });

  it('keeps the header at the top of the area while the rows scroll', async () => {
    const el = await mount('sticky-header max-height="150"', LONG);
    await new Promise((r) => setTimeout(r, 50));
    expect(getComputedStyle(headCell(el)).position).toBe('sticky');
    const area = wrapper(el);
    area.scrollTop = 120;
    await new Promise((r) => setTimeout(r, 50));
    expect(
      Math.abs(
        headCell(el).getBoundingClientRect().top -
          area.getBoundingClientRect().top
      )
    ).toBeLessThan(1);
  });

  it('gives the header an opaque background', async () => {
    const el = await mount('sticky-header max-height="150"', LONG);
    await new Promise((r) => setTimeout(r, 50));
    const bg = getComputedStyle(headCell(el)).backgroundColor;
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  it('limits the height, reading a bare number as pixels', async () => {
    const el = await mount('max-height="150"', LONG);
    await new Promise((r) => setTimeout(r, 50));
    expect(wrapper(el).getBoundingClientRect().height).toBeLessThanOrEqual(150);
    expect(wrapper(el).style.maxHeight).toBe('150px');
  });

  it('accepts any CSS length', async () => {
    const el = await mount('max-height="10rem"', LONG);
    expect(wrapper(el).style.maxHeight).toBe('10rem');
  });

  it('becomes a focusable, labelled region when it scrolls vertically', async () => {
    const el = await mount('sticky-header max-height="150"', LONG);
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
    expect(wrapper(el).getAttribute('role')).toBe('region');
    expect(wrapper(el).getAttribute('tabindex')).toBe('0');
    expect(wrapper(el).getAttribute('aria-label')).toBe('Long');
  });

  it('keeps a focused row from sliding under the header', async () => {
    const el = await mount('sticky-header max-height="150"', LONG);
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
    const height = headCell(el).closest('thead').offsetHeight;
    expect(wrapper(el).style.scrollPaddingTop).toBe(`${height}px`);
  });
});

describe('accessible name of the scrolling region', () => {
  const WIDE = (tableAttrs, caption = '') => `
    <table ${tableAttrs} style="width: 800px; min-width: 800px">
      ${caption}
      <thead><tr><th scope="col">Name</th><th scope="col">Status</th></tr></thead>
      <tbody><tr><th scope="row">Ana</th><td>Completed</td></tr></tbody>
    </table>`;
  const settle = async (el) => {
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
  };
  const NARROW = 'display: block; width: 200px';

  it('reads aria-labelledby from the page', async () => {
    const heading = document.createElement('h2');
    heading.id = 'orders-heading';
    heading.textContent = 'Orders this month';
    document.body.append(heading);
    mounted.push(heading);
    const el = await mount(
      '',
      WIDE('aria-labelledby="orders-heading"'),
      NARROW
    );
    await settle(el);
    expect(wrapper(el).getAttribute('role')).toBe('region');
    expect(wrapper(el).getAttribute('aria-label')).toBe('Orders this month');
  });

  it('falls back to the caption when aria-label is empty', async () => {
    const el = await mount(
      '',
      WIDE('aria-label=""', '<caption>Orders</caption>'),
      NARROW
    );
    await settle(el);
    expect(wrapper(el).getAttribute('aria-label')).toBe('Orders');
  });

  it('follows the name when it changes after the first render', async () => {
    const el = await mount('', WIDE('aria-label="Orders"'), NARROW);
    await settle(el);
    el.querySelector('table').setAttribute('aria-label', 'Pedidos');
    await settle(el);
    expect(wrapper(el).getAttribute('aria-label')).toBe('Pedidos');
  });

  it('follows the caption text when it changes', async () => {
    const el = await mount('', WIDE('', '<caption>Orders</caption>'), NARROW);
    await settle(el);
    el.querySelector('caption').textContent = 'Pedidos';
    await settle(el);
    expect(wrapper(el).getAttribute('aria-label')).toBe('Pedidos');
  });
});

describe('moving the element', () => {
  it('keeps watching the table after it is detached and attached again', async () => {
    const el = await mount('', TABLE, 'display: block; width: 200px');
    await new Promise((r) => setTimeout(r, 50));
    const parent = el.parentElement;
    el.remove();
    parent.append(el);
    await new Promise((r) => setTimeout(r, 50));
    el.querySelector('table').style.cssText = 'width: 800px; min-width: 800px';
    await new Promise((r) => setTimeout(r, 100));
    await el.updateComplete;
    expect(wrapper(el).getAttribute('role')).toBe('region');
  });
});

describe('scoping', () => {
  const NESTED = `
    <table aria-label="Outer">
      <thead><tr><th scope="col">Name</th><th scope="col">Details</th></tr></thead>
      <tbody><tr><th scope="row">Ana</th><td>
        <table id="inner"><thead><tr><th>Inner head</th></tr></thead>
        <tbody><tr><td>Inner cell</td></tr></tbody></table>
      </td></tr></tbody>
    </table>`;

  it('does not reach a table nested inside a cell', async () => {
    const el = await mount('sticky-header max-height="200"', NESTED);
    await new Promise((r) => setTimeout(r, 50));
    const inner = el.querySelector('#inner');
    expect(getComputedStyle(inner.querySelector('th')).position).toBe('static');
    // Outer cells get the design padding; the nested ones keep the browser's.
    const padding = (cell) => parseFloat(getComputedStyle(cell).paddingLeft);
    expect(padding(inner.querySelector('td'))).toBeLessThan(
      padding(el.querySelector('tbody > tr > th'))
    );
    expect(getComputedStyle(inner.querySelector('td')).borderBottomWidth).toBe(
      '0px'
    );
  });

  const FOOTED = `
    <table aria-label="Totals">
      <thead><tr><th scope="col">Item</th><th scope="col">Price</th></tr></thead>
      <tbody><tr><th scope="row">A</th><td>1</td></tr><tr><th scope="row">B</th><td>2</td></tr></tbody>
      <tfoot><tr><th scope="row">Total</th><td>3</td></tr></tfoot>
    </table>`;

  it('keeps the divider under the body when a footer follows, and closes on the footer', async () => {
    const el = await mount('', FOOTED);
    await new Promise((r) => setTimeout(r, 50));
    const width = (selector) =>
      getComputedStyle(el.querySelector(selector)).borderBottomWidth;
    expect(width('tbody tr:last-child td')).not.toBe('0px');
    expect(width('tfoot td')).toBe('0px');
  });

  it('keeps the divider under a body followed by another body', async () => {
    const two = TABLE.replace(
      '</tbody>',
      '</tbody><tbody><tr><th scope="row">Carla</th><td>Canceled</td></tr></tbody>'
    );
    const el = await mount('', two);
    await new Promise((r) => setTimeout(r, 50));
    const bodies = el.querySelectorAll('tbody');
    expect(
      getComputedStyle(bodies[0].querySelector('tr:last-child td'))
        .borderBottomWidth
    ).not.toBe('0px');
    expect(
      getComputedStyle(bodies[1].querySelector('td')).borderBottomWidth
    ).toBe('0px');
  });
});

describe('sortable columns', () => {
  const SORTABLE = `
    <table aria-label="People">
      <thead>
        <tr>
          <th scope="col" data-column="name"><button type="button" class="table__sort">Name</button></th>
          <th scope="col"><button type="button" class="table__sort">Age</button></th>
          <th scope="col">Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">Bruno</th><td>31</td><td>-</td></tr>
        <tr><th scope="row">Ana</th><td>28</td><td>-</td></tr>
      </tbody>
    </table>`;

  const headers = (el) => [...el.querySelectorAll('thead th')];
  const sortOf = (el) => headers(el).map((th) => th.getAttribute('aria-sort'));
  const press = (el, index) =>
    el.querySelectorAll('.table__sort')[index].click();

  it('gives every sortable header an aria-sort of none and leaves the others alone', async () => {
    const el = await mount('', SORTABLE);
    await el.updateComplete;
    expect(sortOf(el)).toEqual(['none', 'none', null]);
  });

  it('prepares headers that are rendered after the table is slotted', async () => {
    const el = await mount(
      '',
      '<table aria-label="People"><tbody></tbody></table>'
    );
    el.querySelector('table').insertAdjacentHTML(
      'afterbegin',
      '<thead><tr><th scope="col"><button type="button" class="table__sort">Name</button></th></tr></thead>'
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(sortOf(el)).toEqual(['none']);
  });

  it('keeps an aria-sort the author already set', async () => {
    const el = await mount(
      '',
      SORTABLE.replace(
        'data-column="name"',
        'data-column="name" aria-sort="descending"'
      )
    );
    await el.updateComplete;
    expect(sortOf(el)).toEqual(['descending', 'none', null]);
  });

  it('goes ascending, descending, then back to none', async () => {
    const el = await mount('', SORTABLE);
    await el.updateComplete;
    press(el, 0);
    expect(sortOf(el)[0]).toBe('ascending');
    press(el, 0);
    expect(sortOf(el)[0]).toBe('descending');
    press(el, 0);
    expect(sortOf(el)[0]).toBe('none');
  });

  it('sorts one column at a time', async () => {
    const el = await mount('', SORTABLE);
    await el.updateComplete;
    press(el, 0);
    press(el, 1);
    expect(sortOf(el)).toEqual(['none', 'ascending', null]);
  });

  it('emits lui-sort with the column and the direction', async () => {
    const el = await mount('', SORTABLE);
    await el.updateComplete;
    const events = [];
    el.addEventListener('lui-sort', (e) => events.push(e.detail));
    press(el, 0);
    press(el, 0);
    press(el, 1);
    expect(events).toEqual([
      { column: 'name', direction: 'ascending' },
      { column: 'name', direction: 'descending' },
      { column: 'Age', direction: 'ascending' },
    ]);
  });

  it('does not reorder the rows itself', async () => {
    const el = await mount('', SORTABLE);
    await el.updateComplete;
    press(el, 0);
    const names = [...el.querySelectorAll('tbody th')].map(
      (th) => th.textContent
    );
    expect(names).toEqual(['Bruno', 'Ana']);
  });

  it('ignores the sort buttons of a table nested in a cell', async () => {
    const nested = SORTABLE.replace(
      '<td>31</td>',
      `<td><table id="inner"><thead><tr><th><button type="button" class="table__sort">Inner</button></th></tr></thead></table></td>`
    );
    const el = await mount('', nested);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('lui-sort', () => (fired = true));
    el.querySelector('#inner .table__sort').click();
    expect(fired).toBe(false);
    expect(el.querySelector('#inner th').hasAttribute('aria-sort')).toBe(false);
  });

  it('can be reached and used from the keyboard, because it is a button', async () => {
    const el = await mount('', SORTABLE);
    await el.updateComplete;
    const button = el.querySelector('.table__sort');
    expect(button.tagName).toBe('BUTTON');
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('draws an arrow that follows aria-sort', async () => {
    const el = await mount('', SORTABLE);
    await new Promise((r) => setTimeout(r, 50));
    const mask = (i) =>
      getComputedStyle(el.querySelectorAll('.table__sort')[i], '::after')
        .maskImage;
    const idle = mask(0);
    expect(idle).not.toBe('none');
    press(el, 0);
    const up = mask(0);
    press(el, 0);
    const down = mask(0);
    expect(new Set([idle, up, down]).size).toBe(3);
  });

  it('shows the sorted column in the heading color and the others muted', async () => {
    const el = await mount('', SORTABLE);
    await new Promise((r) => setTimeout(r, 50));
    const color = (i) =>
      getComputedStyle(el.querySelectorAll('.table__sort')[i], '::after').color;
    const idle = color(0);
    press(el, 0);
    expect(color(0)).not.toBe(idle);
    expect(color(1)).toBe(idle);
  });
});
