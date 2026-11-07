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

describe('label', () => {
  it('shows the field label above the zone and names the zone with it and the zone title', async () => {
    const el = await mount(
      '<lui-file-upload label="Resume" optional></lui-file-upload>'
    );

    const label = $(el, '.file-upload__label');
    expect(label.textContent.trim()).toBe('Resume');
    expect(label.getAttribute('for')).toBe(zone(el).id);
    expect(
      $(el, '.file-upload__label-wrap .file-upload__optional').textContent
    ).toBe('(optional)');
    // Optional sits beside the label, not inside the zone.
    expect($(el, '.file-upload__zone .file-upload__optional')).toBeNull();

    const name = zone(el)
      .getAttribute('aria-labelledby')
      .split(' ')
      .map((id) => el.shadowRoot.getElementById(id).textContent.trim());
    expect(name).toEqual(['Resume', 'Upload files']);
  });

  it('keeps optional inside the zone title when there is no label', async () => {
    const el = await mount('<lui-file-upload optional></lui-file-upload>');

    expect($(el, '.file-upload__label')).toBeNull();
    expect($(el, '.file-upload__zone .file-upload__optional')).not.toBeNull();
  });

  it('takes the zone title from zone-title', async () => {
    const el = await mount(
      '<lui-file-upload zone-title="Send file"></lui-file-upload>'
    );
    expect($(el, '.file-upload__title').textContent.trim()).toBe('Send file');
  });
});

describe('limit reached', () => {
  const frame = (el) =>
    new Promise((r) => requestAnimationFrame(() => r(el.updateComplete)));
  const live = (el) => $(el, '[role="status"]').textContent.trim();

  it('stops the zone, says why on screen and in its description, and announces it', async () => {
    const el = await mount(
      '<lui-file-upload multiple max-files="2"></lui-file-upload>'
    );
    const opened = [];
    $(el, 'input[type="file"]').addEventListener('click', () => opened.push(1));

    await pick(el, [file('a'), file('b')]);
    await frame(el);

    expect(zone(el).getAttribute('aria-disabled')).toBe('true');
    expect(zone(el).disabled).toBe(false);
    const constraints = $(el, '.file-upload__constraints');
    expect(constraints.textContent.trim()).toBe(
      'Limit of 2 files reached. Remove a file to add another.'
    );
    expect(zone(el).getAttribute('aria-describedby')).toContain(constraints.id);
    expect(live(el)).toBe(
      '2 files added. Limit of 2 files reached. Remove a file to add another.'
    );

    zone(el).click();
    await drop(el, [file('c')]);
    expect(opened).toEqual([]);
    expect(names(el)).toEqual(['a', 'b']);
  });

  it('stays focusable so the message can be read', async () => {
    const el = await mount(
      '<lui-file-upload multiple max-files="1"></lui-file-upload>'
    );
    await pick(el, [file('a')]);
    zone(el).focus();
    expect(el.shadowRoot.activeElement).toBe(zone(el));
  });

  it('accepts files again after one is removed', async () => {
    const el = await mount(
      '<lui-file-upload multiple max-files="2" accept=".pdf"></lui-file-upload>'
    );
    await pick(el, [file('a.pdf'), file('b.pdf')]);

    $(el, '.file-upload__action--remove').click();
    await el.updateComplete;

    expect(zone(el).hasAttribute('aria-disabled')).toBe(false);
    expect($(el, '.file-upload__constraints').textContent.trim()).toBe(
      'PDF · Max. 2 files'
    );
    await drop(el, [file('c.pdf')]);
    expect(names(el)).toEqual(['b.pdf', 'c.pdf']);
  });

  it('does not count rejected files and never applies to single mode', async () => {
    const el = await mount(
      '<lui-file-upload multiple max-files="2" accept=".pdf"></lui-file-upload>'
    );
    await pick(el, [file('a.pdf'), file('b.png')]);
    expect(zone(el).hasAttribute('aria-disabled')).toBe(false);

    const single = await mount('<lui-file-upload></lui-file-upload>');
    await pick(single, [file('a')]);
    expect(zone(single).hasAttribute('aria-disabled')).toBe(false);
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

describe('sending status', () => {
  it('shows a progress bar named after the file while uploading', async () => {
    const el = await mount('<lui-file-upload multiple></lui-file-upload>');
    await pick(el, [file('a.pdf')]);
    const [a] = el.files;

    el.setFileStatus(el.files[0], 'uploading', { progress: 42.7 });
    await el.updateComplete;

    const bar = $(el, '[role="progressbar"]');
    expect(bar.getAttribute('aria-label')).toBe('Uploading a.pdf');
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
    expect($(el, '.progress-bar__value').textContent.trim()).toBe('42%');
    // `files` hands out the same File objects the status is keyed on.
    expect(el.getFileStatus(a)).toBe('uploading');
  });

  it('matches the File objects handed out by lui-change', async () => {
    const el = await mount('<lui-file-upload></lui-file-upload>');
    let added;
    el.addEventListener('lui-change', (e) => (added = e.detail.added));
    await pick(el, [file('a.pdf')]);

    el.setFileStatus(added[0], 'uploading');
    await el.updateComplete;

    expect(el.getFileStatus(added[0])).toBe('uploading');
    // No progress yet: indeterminate bar, no value.
    expect($(el, '[role="progressbar"]').hasAttribute('aria-valuenow')).toBe(
      false
    );
  });

  it('shows a failure with Retry and emits lui-retry', async () => {
    const el = await mount('<lui-file-upload></lui-file-upload>');
    let added;
    el.addEventListener('lui-change', (e) => (added = e.detail.added));
    await pick(el, [file('a.pdf')]);
    const retries = [];
    el.addEventListener('lui-retry', (e) => retries.push(e.detail.file));

    el.setFileStatus(added[0], 'error', {
      message: 'Connection lost. Try again.',
    });
    await el.updateComplete;

    expect($(el, '.file-upload__item--error')).not.toBe(null);
    expect($(el, '.file-upload__status').textContent).toContain(
      'Connection lost. Try again.'
    );
    const retry = $(el, '.file-upload__action--retry');
    expect(retry.getAttribute('aria-label')).toBe('Retry a.pdf');

    await userEvent.click(retry);
    expect(retries).toEqual([added[0]]);

    // The app restarts the upload: Retry goes, focus lands on Remove.
    el.setFileStatus(added[0], 'uploading', { progress: 0 });
    await el.updateComplete;
    expect($(el, '.file-upload__action--retry')).toBe(null);
    expect(el.shadowRoot.activeElement).toBe(
      $(el, '.file-upload__action--remove')
    );
  });

  it('offers no Retry on a file rejected by local validation', async () => {
    const el = await mount('<lui-file-upload accept=".pdf"></lui-file-upload>');
    await pick(el, [file('a.txt')]);

    expect($(el, '.file-upload__item--error')).not.toBe(null);
    expect($(el, '.file-upload__action--retry')).toBe(null);
  });

  it('gives a sent file a state for screen readers', async () => {
    const el = await mount('<lui-file-upload></lui-file-upload>');
    let added;
    el.addEventListener('lui-change', (e) => (added = e.detail.added));
    await pick(el, [file('a.pdf')]);

    el.setFileStatus(added[0], 'complete');
    await el.updateComplete;

    expect($(el, '.file-upload__sr').textContent).toBe('“a.pdf” uploaded.');
    expect($(el, '[role="progressbar"]')).toBe(null);
  });

  it('announces state changes but not progress ticks', async () => {
    const el = await mount('<lui-file-upload></lui-file-upload>');
    let added;
    el.addEventListener('lui-change', (e) => (added = e.detail.added));
    await pick(el, [file('a.pdf')]);
    const live = () => $(el, '[role="status"]').textContent.trim();
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => r(el.updateComplete)));
    await frame();

    el.setFileStatus(added[0], 'uploading', { progress: 10 });
    await frame();
    expect(live()).toBe('Uploading “a.pdf”.');

    el.setFileStatus(added[0], 'uploading', { progress: 60 });
    await frame();
    expect(live()).toBe('Uploading “a.pdf”.');

    el.setFileStatus(added[0], 'complete');
    await frame();
    expect(live()).toBe('“a.pdf” uploaded.');
  });

  it('ignores a file that is not in the list', async () => {
    const el = await mount('<lui-file-upload></lui-file-upload>');

    el.setFileStatus(file('ghost.pdf'), 'uploading');
    await el.updateComplete;

    expect($(el, '[role="progressbar"]')).toBe(null);
  });
});
