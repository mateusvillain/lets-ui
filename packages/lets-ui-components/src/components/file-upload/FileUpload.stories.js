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
// Sending: the app sends, the field shows it. `setFileStatus()` drives each
// item; `lui-retry` asks the app to send a failed file again.
// ---------------------------------------------------------------------------

const sampleFile = (name, size) =>
  new File([new Uint8Array(size)], name, { lastModified: 1 });

/** Puts files in the field as if picked, and returns the File objects. */
function seed(field, files) {
  const transfer = new DataTransfer();
  files.forEach((f) => transfer.items.add(f));
  const input = field.shadowRoot.querySelector('input[type="file"]');
  input.files = transfer.files;
  input.dispatchEvent(new Event('change'));
  return Array.from(field.files);
}

export const UploadStates = () => {
  const root = document.createElement('div');
  root.style.cssText = 'width: 400px; max-width: 100%;';
  root.innerHTML = `<lui-file-upload multiple max-files="10" max-size="104857600"></lui-file-upload>`;
  const field = root.querySelector('lui-file-upload');

  customElements.whenDefined('lui-file-upload').then(async () => {
    await field.updateComplete;
    const name = 'Screenshot 2026-11-01 at 15.00.37 Official.png';
    const [uploading, , failed] = seed(field, [
      sampleFile(name, 2411724),
      sampleFile(`${name.slice(0, -4)} (1).png`, 2411724),
      sampleFile(`${name.slice(0, -4)} (2).png`, 2411724),
    ]);
    field.setFileStatus(uploading, 'uploading', { progress: 30 });
    field.setFileStatus(failed, 'error', {
      message: 'Failed. Check your connection and retry.',
    });
  });

  return root;
};

function fakeUpload(file, onProgress, signal) {
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
    signal.addEventListener('abort', () => {
      clearInterval(timer);
      reject(new globalThis.Error('Aborted'));
    });
  });
}

export const SendRecipe = () => {
  const root = document.createElement('div');
  root.style.cssText =
    'width: 400px; max-width: 100%; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;';
  root.innerHTML = `
    <lui-file-upload
      multiple
      max-files="10"
      max-size="104857600"
      description="Drop files here or click to browse. Files are sent when you press Send."
    ></lui-file-upload>
    <lui-button variant="primary" disabled>Send</lui-button>
  `;

  const field = root.querySelector('lui-file-upload');
  const send = root.querySelector('lui-button');
  const inFlight = new Map();

  async function upload(file) {
    const controller = new AbortController();
    inFlight.set(file, controller);
    field.setFileStatus(file, 'uploading', { progress: 0 });
    try {
      // Progress ticks only move the bar: the field does not announce them.
      await fakeUpload(
        file,
        (progress) => field.setFileStatus(file, 'uploading', { progress }),
        controller.signal
      );
      field.setFileStatus(file, 'complete');
    } catch {
      if (!controller.signal.aborted) {
        field.setFileStatus(file, 'error', {
          message: 'Failed. Check your connection and retry.',
        });
      }
    } finally {
      inFlight.delete(file);
    }
  }

  const pending = () =>
    Array.from(field.files).filter(
      (f) => (field.getFileStatus(f) ?? 'selected') === 'selected'
    );

  field.addEventListener('lui-change', (e) => {
    // Removing a file while it is sending cancels the request.
    e.detail.removed.forEach((f) => inFlight.get(f)?.abort());
    send.disabled = pending().length === 0;
  });
  field.addEventListener('lui-retry', (e) => upload(e.detail.file));

  send.addEventListener('click', () => {
    pending().forEach(upload);
    send.disabled = true;
  });

  return root;
};
