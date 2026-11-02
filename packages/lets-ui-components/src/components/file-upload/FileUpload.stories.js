import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/File Upload',
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    hint: { control: 'text' },
    accept: { control: 'text' },
    multiple: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    maxSize: { control: 'number', name: 'max-size (bytes)' },
    maxFiles: { control: 'number' },
    name: { control: 'text' },
    required: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    optional: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    errorText: { control: 'text' },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

const Template = ({
  label,
  description,
  hint,
  accept,
  multiple,
  maxSize,
  maxFiles,
  name,
  required,
  optional,
  error,
  errorText,
  disabled,
}) => {
  const attrs = [
    label ? `label="${label}"` : '',
    description ? `description="${description}"` : '',
    hint ? `hint="${hint}"` : '',
    accept ? `accept="${accept}"` : '',
    multiple ? 'multiple' : '',
    maxSize ? `max-size="${Number(maxSize)}"` : '',
    maxFiles ? `max-files="${Number(maxFiles)}"` : '',
    name ? `name="${name}"` : '',
    required ? 'required' : '',
    optional ? 'optional' : '',
    error ? 'error' : '',
    errorText ? `error-text="${errorText}"` : '',
    disabled ? 'disabled' : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  return `<div style="width: 400px; max-width: 100%;">\n  <lui-file-upload\n    ${attrs}\n  ></lui-file-upload>\n</div>`;
};

export const FileUpload = Template.bind({});
FileUpload.args = {
  label: 'Upload files',
  description: 'Drop files here or click to browse',
  hint: '',
  accept: '',
  multiple: false,
  maxSize: 104857600,
  maxFiles: 0,
  name: 'attachment',
  required: false,
  optional: false,
  error: false,
  errorText: 'Select at least one file.',
  disabled: false,
};

export const MultipleFiles = () => `
  <div style="width: 400px; max-width: 100%;">
    <lui-file-upload
      name="attachments"
      multiple
      max-files="10"
      max-size="104857600"
    ></lui-file-upload>
  </div>
`;

export const RestrictedAccept = () => `
  <div style="width: 400px; max-width: 100%;">
    <lui-file-upload
      name="receipts"
      multiple
      accept=".pdf,.png,.jpg"
      max-size="5242880"
      max-files="3"
    ></lui-file-upload>
  </div>
`;

export const Error = () => `
  <div style="width: 400px; max-width: 100%;">
    <lui-file-upload
      name="document"
      required
      error
      error-text="Required field."
      max-size="104857600"
    ></lui-file-upload>
  </div>
`;

export const DragActive = () => `
  <div style="width: 400px; max-width: 100%;">
    <lui-file-upload force-state="drag-active" multiple max-files="10" max-size="104857600"></lui-file-upload>
  </div>
`;

export const Disabled = () => `
  <div style="width: 400px; max-width: 100%;">
    <lui-file-upload disabled multiple max-files="10" max-size="104857600"></lui-file-upload>
  </div>
`;

// ---------------------------------------------------------------------------
// Composition recipe: explicit Send, per-file progress, failure and retry.
// The upload itself is simulated; swap `fakeUpload` for a real request.
// ---------------------------------------------------------------------------

const fileIcon = `<svg class="file-upload__file-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.25 1.5c.2 0 .39.08.53.22l4.5 4.5c.14.14.22.33.22.53V21a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 21V3A1.5 1.5 0 0 1 6 1.5h8.25ZM6 21h12V7.5h-3A1.5 1.5 0 0 1 13.5 6V3H6v18Zm9-15h1.94L15 4.06V6Z"/></svg>`;

function fakeUpload(file, onProgress) {
  return new Promise((resolve, reject) => {
    let value = 0;
    const timer = setInterval(() => {
      value = Math.min(100, value + 10 + Math.random() * 15);
      onProgress(Math.round(value));
      // Files with "fail" in the name fail halfway, to show the retry path.
      if (value >= 50 && /fail/i.test(file.name)) {
        clearInterval(timer);
        reject(new globalThis.Error('Network error'));
      } else if (value >= 100) {
        clearInterval(timer);
        resolve();
      }
    }, 300);
  });
}

export const SendRecipe = () => {
  const root = document.createElement('div');
  root.style.cssText =
    'width: 400px; max-width: 100%; display: flex; flex-direction: column; gap: 16px;';
  root.innerHTML = `
    <lui-file-upload multiple max-files="10" max-size="104857600"></lui-file-upload>
    <lui-button variant="primary" disabled>Send</lui-button>
    <ul class="file-upload__list" aria-label="Sending" hidden></ul>
    <div role="status" aria-live="polite" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap;"></div>
  `;

  const field = root.querySelector('lui-file-upload');
  const send = root.querySelector('lui-button');
  const list = root.querySelector('ul');
  const live = root.querySelector('[role="status"]');

  const announce = (text) => {
    live.textContent = '';
    requestAnimationFrame(() => (live.textContent = text));
  };

  field.addEventListener('lui-change', (e) => {
    send.disabled = e.detail.files.length === 0;
  });

  function renderItem(file) {
    const li = document.createElement('li');
    li.className = 'file-upload__item';
    li.innerHTML = `
      <div class="file-upload__row">
        ${fileIcon}
        <div class="file-upload__details">
          <span class="file-upload__name"></span>
        </div>
        <div class="file-upload__actions"></div>
      </div>
      <lui-progress-bar size="md" value="0" hide-label></lui-progress-bar>
    `;
    li.querySelector('.file-upload__name').textContent = file.name;
    // The bar carries the file name, so each progress is tied to its file.
    li.querySelector('lui-progress-bar').setAttribute(
      'label',
      `Sending ${file.name}`
    );
    return li;
  }

  async function upload(file, li) {
    const bar = li.querySelector('lui-progress-bar');
    const actions = li.querySelector('.file-upload__actions');
    li.classList.remove('file-upload__item--error');
    li.querySelector('.file-upload__status')?.remove();
    actions.innerHTML = '';
    bar.hidden = false;
    bar.value = 0;
    try {
      // Progress ticks update the bar only: no announcement, no focus move.
      await fakeUpload(file, (v) => (bar.value = v));
      bar.hidden = true;
      const done = document.createElement('div');
      done.className = 'file-upload__status';
      done.textContent = 'Sent';
      li.append(done);
      announce(`${file.name} sent.`);
    } catch {
      bar.hidden = true;
      li.classList.add('file-upload__item--error');
      const status = document.createElement('div');
      status.className = 'file-upload__status';
      status.textContent = `${file.name} failed to send. Check your connection and retry.`;
      li.append(status);
      const retry = document.createElement('lui-button');
      retry.setAttribute('variant', 'secondary');
      retry.setAttribute('size', 'md');
      retry.textContent = 'Retry';
      retry.setAttribute('aria-label', `Retry ${file.name}`);
      retry.addEventListener('click', () => upload(file, li));
      actions.append(retry);
      announce(`${file.name} failed to send.`);
    }
  }

  send.addEventListener('click', () => {
    const files = Array.from(field.files);
    list.hidden = false;
    list.innerHTML = '';
    announce(`Sending ${files.length} file${files.length === 1 ? '' : 's'}.`);
    files.forEach((file) => {
      const li = renderItem(file);
      list.append(li);
      upload(file, li);
    });
  });

  return root;
};
