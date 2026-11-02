import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiFileUpload, matchesAccept } from './file-upload.ts';

customElements.define('lui-file-upload', LuiFileUpload);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector('lui-file-upload');
  await el.updateComplete;
  return el;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const file = (name, size = 10, type = '') =>
  new File([new Uint8Array(size)], name, { type, lastModified: 1 });

const $ = (el, sel) => el.shadowRoot.querySelector(sel);
const $$ = (el, sel) => Array.from(el.shadowRoot.querySelectorAll(sel));
const zone = (el) => $(el, '.file-upload__zone');
const names = (el) =>
  $$(el, '.file-upload__name').map((n) => n.textContent.trim());

async function pick(el, files) {
  const input = $(el, 'input[type="file"]');
  const transfer = new DataTransfer();
  files.forEach((f) => transfer.items.add(f));
  input.files = transfer.files;
  input.dispatchEvent(new Event('change'));
  await el.updateComplete;
}

async function drop(el, files) {
  const transfer = new DataTransfer();
  files.forEach((f) => transfer.items.add(f));
  const target = zone(el);
  target.dispatchEvent(
    new DragEvent('dragenter', {
      dataTransfer: transfer,
      bubbles: true,
      cancelable: true,
    })
  );
  await el.updateComplete;
  const active = $(el, '.file-upload').classList.contains(
    'file-upload--drag-active'
  );
  target.dispatchEvent(
    new DragEvent('drop', {
      dataTransfer: transfer,
      bubbles: true,
      cancelable: true,
    })
  );
  await el.updateComplete;
  return active;
}

describe('accept matching', () => {
  it('matches extensions, wildcards and exact types', () => {
    expect(matchesAccept(file('a.PDF'), '.pdf')).toBe(true);
    expect(matchesAccept(file('a.png', 1, 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(file('a.png', 1, 'image/png'), 'image/png')).toBe(
      true
    );
    expect(matchesAccept(file('a.txt', 1, 'text/plain'), '.pdf, image/*')).toBe(
      false
    );
    expect(matchesAccept(file('a.txt'), '')).toBe(true);
  });
});

describe('selection', () => {
  it('lists the name and size of a picked file and emits lui-change', async () => {
    const el = await mount('<lui-file-upload></lui-file-upload>');
    let detail;
    el.addEventListener('lui-change', (e) => (detail = e.detail));

    await pick(el, [file('report.pdf', 2048)]);

    expect(names(el)).toEqual(['report.pdf']);
    expect($(el, '.file-upload__size').textContent.trim()).toBe('2 KB');
    expect(detail.files).toBeInstanceOf(FileList);
    expect(detail.files.length).toBe(1);
    expect(el.files[0].name).toBe('report.pdf');
  });

  it('accepts a drop and shows the drag-active state while dragging', async () => {
    const el = await mount('<lui-file-upload multiple></lui-file-upload>');

    const active = await drop(el, [file('a.txt'), file('b.txt')]);

    expect(active).toBe(true);
    expect(
      $(el, '.file-upload').classList.contains('file-upload--drag-active')
    ).toBe(false);
    expect(names(el)).toEqual(['a.txt', 'b.txt']);
  });

  it('accumulates in multiple mode and skips duplicates', async () => {
    const el = await mount('<lui-file-upload multiple></lui-file-upload>');

    await pick(el, [file('a.txt')]);
    await pick(el, [file('a.txt'), file('b.txt')]);

    expect(names(el)).toEqual(['a.txt', 'b.txt']);
  });

  it('replaces the file in single mode', async () => {
    const el = await mount('<lui-file-upload></lui-file-upload>');

    await pick(el, [file('a.txt')]);
    await pick(el, [file('b.txt')]);

    expect(names(el)).toEqual(['b.txt']);
  });

  it('keeps the files when the picker is cancelled', async () => {
    const el = await mount('<lui-file-upload multiple></lui-file-upload>');
    await pick(el, [file('a.txt')]);

    await pick(el, []);
    $(el, 'input[type="file"]').dispatchEvent(new Event('cancel'));
    await el.updateComplete;

    expect(names(el)).toEqual(['a.txt']);
  });
});

describe('validation', () => {
  it('rejects a wrong type, keeps the valid files and emits lui-error', async () => {
    const el = await mount(
      '<lui-file-upload multiple accept=".pdf"></lui-file-upload>'
    );
    const errors = [];
    el.addEventListener('lui-error', (e) => errors.push(e.detail));

    await pick(el, [file('ok.pdf'), file('photo.png', 10, 'image/png')]);

    expect(el.files.length).toBe(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].reason).toBe('type');
    const status = $(el, '.file-upload__item--error .file-upload__status');
    // Names the file, the problem and the fix.
    expect(status.textContent).toContain('photo.png');
    expect(status.textContent).toContain('not an accepted file type');
    expect(status.textContent).toContain('PDF');
  });

  it('rejects a file over max-size', async () => {
    const el = await mount(
      '<lui-file-upload max-size="100"></lui-file-upload>'
    );
    const errors = [];
    el.addEventListener('lui-error', (e) => errors.push(e.detail));

    await pick(el, [file('big.bin', 200)]);

    expect(el.files.length).toBe(0);
    expect(errors[0].reason).toBe('size');
  });

  it('rejects files over max-files', async () => {
    const el = await mount(
      '<lui-file-upload multiple max-files="2"></lui-file-upload>'
    );
    const errors = [];
    el.addEventListener('lui-error', (e) => errors.push(e.detail));

    await pick(el, [file('a'), file('b'), file('c')]);

    expect(el.files.length).toBe(2);
    expect(errors.map((e) => e.reason)).toEqual(['count']);
  });

  it('shows the constraints before opening the picker', async () => {
    const el = await mount(
      '<lui-file-upload multiple accept=".pdf,.png" max-files="10" max-size="104857600"></lui-file-upload>'
    );

    const constraints = $(el, '.file-upload__constraints');
    expect(constraints.textContent.trim()).toBe(
      'PDF, PNG · Max. 10 files · Up to 100 MB'
    );
    expect(zone(el).getAttribute('aria-describedby')).toContain(constraints.id);
  });
});

describe('removal and focus', () => {
  it('names each Remove button after its file', async () => {
    const el = await mount('<lui-file-upload multiple></lui-file-upload>');
    await pick(el, [file('comprovante.pdf')]);

    expect($(el, '.file-upload__action').getAttribute('aria-label')).toBe(
      'Remove comprovante.pdf'
    );
  });

  it('moves focus to the next control after removing, then to the zone', async () => {
    const el = await mount('<lui-file-upload multiple></lui-file-upload>');
    await pick(el, [file('a'), file('b')]);

    await userEvent.click($$(el, '.file-upload__action')[0]);
    await el.updateComplete;
    expect(names(el)).toEqual(['b']);
    expect(el.shadowRoot.activeElement).toBe($(el, '.file-upload__action'));

    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(names(el)).toEqual([]);
    expect(el.shadowRoot.activeElement).toBe(zone(el));
  });
});

describe('disabled', () => {
  it('disables the zone and ignores drops', async () => {
    const el = await mount('<lui-file-upload disabled></lui-file-upload>');

    expect(zone(el).disabled).toBe(true);
    await drop(el, [file('a')]);
    expect(names(el)).toEqual([]);
  });
});

describe('form', () => {
  it('submits the files under its name and reports valueMissing when required', async () => {
    const host = document.createElement('div');
    host.innerHTML =
      '<form><lui-file-upload name="docs" multiple required></lui-file-upload></form>';
    document.body.append(host);
    mounted.push(host);
    const form = host.querySelector('form');
    const el = host.querySelector('lui-file-upload');
    await el.updateComplete;

    expect(form.checkValidity()).toBe(false);
    await el.updateComplete;
    expect(el.error).toBe(true);

    await pick(el, [file('a.txt'), file('b.txt')]);
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll('docs').map((f) => f.name)).toEqual([
      'a.txt',
      'b.txt',
    ]);

    form.reset();
    await el.updateComplete;
    expect(el.files.length).toBe(0);
  });
});
