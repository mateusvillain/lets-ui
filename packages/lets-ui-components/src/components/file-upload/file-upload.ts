import { LitElement, html, nothing, svg, unsafeCSS, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import styles from './file-upload.scss?inline';
import { nameProperty } from '../../utils/form.js';

export type FileUploadRejectReason = 'type' | 'size' | 'count';

export interface FileUploadErrorDetail {
  file: File;
  reason: FileUploadRejectReason;
  message: string;
}

export interface FileUploadChangeDetail {
  files: FileList;
  added: File[];
  removed: File[];
}

/**
 * Every string the component builds at runtime. Override any of them through
 * the `messages` property to translate or reword the field — the static text
 * (label, description, hint, error text) goes through attributes instead.
 */
export interface FileUploadMessages {
  /** Visible constraints line when `hint` is empty. */
  constraints(c: {
    formats: string;
    maxSize: string;
    maxFiles: number;
  }): string;
  /** A file whose type is not in `accept`. */
  type(file: File, formats: string): string;
  /** A file larger than `max-size`. */
  size(file: File, size: string, maxSize: string): string;
  /** A file over the `max-files` limit (or a second file in single mode). */
  count(file: File, maxFiles: number): string;
  /** Live-region summary after a selection. */
  added(added: File[], rejected: File[], duplicates: File[]): string;
  /** Live-region summary after a removal. */
  removed(file: File): string;
  /** Accessible name of the file list. */
  listLabel: string;
  /** Visually hidden note read with the drop zone when `required`. */
  required: string;
}

const quote = (file: File) => `“${file.name}”`;
const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export const defaultFileUploadMessages: FileUploadMessages = {
  constraints: ({ formats, maxSize, maxFiles }) =>
    [
      formats,
      maxFiles ? `Max. ${plural(maxFiles, 'file', 'files')}` : '',
      maxSize ? `Up to ${maxSize}` : '',
    ]
      .filter(Boolean)
      .join(' · '),
  type: (file, formats) =>
    `${quote(file)} is not an accepted file type. Choose a ${formats} file.`,
  size: (file, size, maxSize) =>
    `${quote(file)} is ${size}, over the ${maxSize} limit. Choose a smaller file.`,
  count: (file, maxFiles) =>
    maxFiles === 1
      ? `${quote(file)} was not added: only one file is allowed. Remove the current file to choose another.`
      : `${quote(file)} was not added: the limit is ${maxFiles} files. Remove a file to add another.`,
  added: (added, rejected, duplicates) =>
    [
      added.length ? `${plural(added.length, 'file', 'files')} added.` : '',
      rejected.length
        ? `${plural(rejected.length, 'file', 'files')} not added.`
        : '',
      duplicates.length
        ? `${duplicates.map(quote).join(', ')} already in the list.`
        : '',
    ]
      .filter(Boolean)
      .join(' '),
  removed: (file) => `${quote(file)} removed.`,
  listLabel: 'Selected files',
  required: 'Required.',
};

interface Entry {
  id: number;
  file: File;
  error?: FileUploadErrorDetail;
}

let nextId = 0;

const sameFile = (a: File, b: File) =>
  a.name === b.name &&
  a.size === b.size &&
  a.type === b.type &&
  a.lastModified === b.lastModified;

/** Splits the `accept` attribute into lower-cased tokens. */
function acceptTokens(accept: string): string[] {
  return accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/** Whether `file` matches one of the `accept` tokens (`.ext`, `type/*`, `type/sub`). */
export function matchesAccept(file: File, accept: string): boolean {
  const tokens = acceptTokens(accept);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/** `.pdf, image/png, image/*` → `PDF, PNG, image/*`. */
function formatAccept(accept: string): string {
  return acceptTokens(accept)
    .map((t) => {
      if (t.startsWith('.')) return t.slice(1).toUpperCase();
      if (t.endsWith('/*')) return t;
      return (t.split('/')[1] ?? t).toUpperCase();
    })
    .join(', ');
}

const fileIcon = svg`<path d="M14.25,1.5C14.44921875,1.5,14.6396484375,1.5791015625,14.7802734375,1.7197265625L19.2802734375,6.2197265625C19.4208984375,6.3603515625,19.5,6.551025390625,19.5,6.75L19.5,21C19.5,21.3978271484375,19.341796875,21.7791748046875,19.060546875,22.060546875C18.779296875,22.3419189453125,18.3974609375,22.5,18,22.5L6,22.5C5.6025390625,22.5,5.220703125,22.3419189453125,4.939453125,22.060546875C4.658203125,21.7791748046875,4.5,21.3978271484375,4.5,21L4.5,3C4.5,2.6021728515625,4.658203125,2.2208251953125,4.939453125,1.939453125C5.220703125,1.6580810546875,5.6025390625,1.5,6,1.5L14.25,1.5ZM6,21L18,21L18,7.5L15,7.5C14.6025390625,7.5,14.220703125,7.3419189453125,13.939453125,7.060546875C13.658203125,6.7791748046875,13.5,6.3978271484375,13.5,6L13.5,3L6,3L6,21ZM15,6L16.939453125,6L15,4.060546875L15,6Z" />`;

const uploadIcon = svg`<path d="M20.25,14.249893188476562C20.6640625,14.249893188476562,21,14.585800170898438,21,14.999893188476562L21,19.499908447265625C21,19.897796630859375,20.841796875,20.279205322265625,20.560546875,20.560501098632812C20.279296875,20.841796875,19.89794921875,21,19.5,21L4.5,21C4.10205078125,21,3.720703125,20.841796875,3.439453125,20.560501098632812C3.158203125,20.279205322265625,3,19.897796630859375,3,19.499908447265625L3,14.999893188476562C3,14.585800170898438,3.3359375,14.249893188476562,3.75,14.249893188476562C4.1640625,14.249893188476562,4.5,14.585800170898438,4.5,14.999893188476562L4.5,19.499908447265625L19.5,19.499908447265625L19.5,14.999893188476562C19.5,14.585800170898438,19.8359375,14.249893188476562,20.25,14.249893188476562ZM11.5263671875,3.1678924560546875C11.82080078125,2.927703857421875,12.255859375,2.945098876953125,12.5302734375,3.219696044921875L16.2802734375,6.969696044921875C16.5732421875,7.2624969482421875,16.5732421875,7.7373046875,16.2802734375,8.030197143554688C15.9873046875,8.323104858398438,15.5126953125,8.323104858398438,15.2197265625,8.030197143554688L12.75,5.5605010986328125L12.75,14.999893188476562C12.75,15.414199829101562,12.4140625,15.749893188476562,12,15.749893188476562C11.5859375,15.749893188476562,11.25,15.414199829101562,11.25,14.999893188476562L11.25,5.5605010986328125L8.7802734375,8.030197143554688C8.4873046875,8.323104858398438,8.0126953125,8.323104858398438,7.7197265625,8.030197143554688C7.4267578125,7.7373046875,7.4267578125,7.2624969482421875,7.7197265625,6.969696044921875L11.4697265625,3.219696044921875L11.5263671875,3.1678924560546875Z" />`;

const trashIcon = svg`<path d="M14.25,2.25C14.6474609375,2.25,15.029296875,2.4080810546875,15.310546875,2.689453125C15.591796875,2.9708251953125,15.75,3.3521728515625,15.75,3.75L15.75,5.25L21,5.25C21.4140625,5.25,21.75,5.5858154296875,21.75,6C21.75,6.4141845703125,21.4140625,6.75,21,6.75L19.4619140625,6.75L18.7490234375,20.2890625L18.7470703125,20.2880859375C18.7373046875,20.672119140625,18.5830078125,21.038330078125,18.310546875,21.310546875C18.029296875,21.5919189453125,17.6474609375,21.75,17.25,21.75L6.75,21.75C6.3525390625,21.75,5.970703125,21.5919189453125,5.689453125,21.310546875C5.4169921875,21.038330078125,5.26171875,20.672119140625,5.251953125,20.2880859375L5.2509765625,20.2890625L4.5380859375,6.75L3,6.75C2.5859375,6.75,2.25,6.4141845703125,2.25,6C2.25,5.5858154296875,2.5859375,5.25,3,5.25L8.25,5.25L8.25,3.75C8.25,3.3521728515625,8.408203125,2.9708251953125,8.689453125,2.689453125C8.970703125,2.4080810546875,9.3525390625,2.25,9.75,2.25L14.25,2.25ZM6.7490234375,20.2109375C6.75,20.223876953125,6.75,20.237060546875,6.75,20.25L17.25,20.25C17.25,20.237060546875,17.25,20.223876953125,17.2509765625,20.2109375L17.958984375,6.75L6.041015625,6.75L6.7490234375,20.2109375ZM9.75,9C10.1640625,9,10.5,9.3358154296875,10.5,9.75L10.5,17.25C10.5,17.6641845703125,10.1640625,18,9.75,18C9.3359375,18,9,17.6641845703125,9,17.25L9,9.75C9,9.3358154296875,9.3359375,9,9.75,9ZM14.25,9C14.6640625,9,15,9.3358154296875,15,9.75L15,17.25C15,17.6641845703125,14.6640625,18,14.25,18C13.8359375,18,13.5,17.6641845703125,13.5,17.25L13.5,9.75C13.5,9.3358154296875,13.8359375,9,14.25,9ZM9.75,5.25L14.25,5.25L14.25,3.75L9.75,3.75L9.75,5.25Z" />`;

const errorIcon = svg`<path d="M1.25,10C1.25,7.583251953125,2.1044921875,5.520751953125,3.8125,3.8125C5.5205078125,2.104248046875,7.5830078125,1.25,10,1.25C12.4169921875,1.25,14.4794921875,2.104248046875,16.1875,3.8125C17.8955078125,5.520751953125,18.75,7.583251953125,18.75,10C18.75,12.416748046875,17.8955078125,14.479248046875,16.1875,16.1875C14.4794921875,17.895751953125,12.4169921875,18.75,10,18.75C7.5830078125,18.75,5.5205078125,17.895751953125,3.8125,16.1875C2.1044921875,14.479248046875,1.25,12.416748046875,1.25,10ZM7.943359375,7.0562744140625C7.818359375,6.9354248046875,7.6708984375,6.875,7.5,6.875C7.3291015625,6.875,7.181640625,6.9354248046875,7.056640625,7.0562744140625C6.935546875,7.1812744140625,6.875,7.3291015625,6.875,7.5C6.875,7.6708984375,6.935546875,7.8187255859375,7.056640625,7.9437255859375L9.119140625,10L7.056640625,12.0562744140625C6.935546875,12.1812744140625,6.875,12.3291015625,6.875,12.5C6.875,12.6708984375,6.935546875,12.8187255859375,7.056640625,12.9437255859375C7.181640625,13.0645751953125,7.3291015625,13.125,7.5,13.125C7.6708984375,13.125,7.818359375,13.0645751953125,7.943359375,12.9437255859375L10,10.8812255859375L12.056640625,12.9437255859375C12.181640625,13.0645751953125,12.3291015625,13.125,12.5,13.125C12.6708984375,13.125,12.818359375,13.0645751953125,12.943359375,12.9437255859375C13.064453125,12.8187255859375,13.125,12.6708984375,13.125,12.5C13.125,12.3291015625,13.064453125,12.1812744140625,12.943359375,12.0562744140625L10.880859375,10L12.943359375,7.9437255859375C13.064453125,7.8187255859375,13.125,7.6708984375,13.125,7.5C13.125,7.3291015625,13.064453125,7.1812744140625,12.943359375,7.0562744140625C12.818359375,6.9354248046875,12.6708984375,6.875,12.5,6.875C12.3291015625,6.875,12.181640625,6.9354248046875,12.056640625,7.0562744140625L10,9.1187744140625L7.943359375,7.0562744140625Z" />`;

export class LuiFileUpload extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  @property() label = 'Upload files';
  @property() description = 'Drop files here or click to browse';
  /** Constraints line. When empty, it is built from `accept`, `max-size` and `max-files`. */
  @property() hint = '';
  @property() accept = '';
  @property({ type: Boolean }) multiple = false;
  /** Maximum size of each file, in bytes. `0` = no limit. */
  @property({ type: Number, attribute: 'max-size' }) maxSize = 0;
  /** Maximum number of files when `multiple`. `0` = no limit. */
  @property({ type: Number, attribute: 'max-files' }) maxFiles = 0;
  @property(nameProperty) name = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) optional = false;
  @property({ attribute: 'optional-text' }) optionalText = '(optional)';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText =
    'Select at least one file.';
  /** Prefix of each Remove button's accessible name: “Remove report.pdf”. */
  @property({ attribute: 'remove-label' }) removeLabel = 'Remove';
  /** Forces a visual state for documentation: `drag-active`. */
  @property({ attribute: 'force-state' }) forceState = '';
  @property({ attribute: false }) messages: Partial<FileUploadMessages> = {};

  @state() private _entries: Entry[] = [];
  @state() private _rejected: Entry[] = [];
  @state() private _dragActive = false;
  @state() private _announcement = '';

  @query('.file-upload__input') private _input!: HTMLInputElement;
  @query('.file-upload__zone') private _zone!: HTMLButtonElement;

  private _baseId = `lui-file-upload-${Math.random().toString(36).slice(2, 9)}`;
  private _dragDepth = 0;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('invalid', this._onInvalid);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('invalid', this._onInvalid);
  }

  protected firstUpdated() {
    this._syncFormValue();
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('required') || changed.has('name')) {
      this._syncFormValue();
    }
  }

  // ---------------------------------------------------------------- public API

  /** The accepted files, as a `FileList`. */
  get files(): FileList {
    return toFileList(this._entries.map((e) => e.file));
  }

  /** Removes every file, accepted or rejected. */
  clear() {
    const removed = this._entries.map((e) => e.file);
    this._entries = [];
    this._rejected = [];
    this._syncFormValue();
    if (removed.length) this._emitChange([], removed);
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this._entries = [];
    this._rejected = [];
    this.error = false;
    this._syncFormValue();
  }

  // ------------------------------------------------------------------ internals

  private get _messages(): FileUploadMessages {
    return { ...defaultFileUploadMessages, ...this.messages };
  }

  private get _maxFiles(): number {
    if (!this.multiple) return 1;
    return this.maxFiles > 0 ? Math.floor(this.maxFiles) : 0;
  }

  private _formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit += 1;
    }
    const number = new Intl.NumberFormat(
      this.closest('[lang]')?.getAttribute('lang') || undefined,
      {
        maximumFractionDigits: unit === 0 ? 0 : 1,
      }
    ).format(value);
    return `${number} ${units[unit]}`;
  }

  private _constraintsText(): string {
    if (this.hint) return this.hint;
    return this._messages.constraints({
      formats: formatAccept(this.accept),
      maxSize: this.maxSize > 0 ? this._formatBytes(this.maxSize) : '',
      maxFiles: this.multiple ? this._maxFiles : 0,
    });
  }

  private _onInvalid = () => {
    this.error = true;
  };

  private _syncFormValue() {
    const files = this._entries.map((e) => e.file);
    if (files.length && this.name) {
      const data = new FormData();
      files.forEach((file) => data.append(this.name, file));
      this._internals.setFormValue(data);
    } else {
      this._internals.setFormValue(null);
    }

    if (this.required && !files.length) {
      this._internals.setValidity(
        { valueMissing: true },
        this.errorText,
        this._zone ?? undefined
      );
    } else {
      this._internals.setValidity({});
    }
  }

  private _announce(text: string) {
    // Cleared first so the same sentence twice in a row is still announced.
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = text;
    });
  }

  private _emitChange(added: File[], removed: File[]) {
    this.dispatchEvent(
      new CustomEvent<FileUploadChangeDetail>('lui-change', {
        detail: { files: this.files, added, removed },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _reject(file: File, reason: FileUploadRejectReason): Entry {
    const m = this._messages;
    const message =
      reason === 'type'
        ? m.type(file, formatAccept(this.accept))
        : reason === 'size'
          ? m.size(
              file,
              this._formatBytes(file.size),
              this._formatBytes(this.maxSize)
            )
          : m.count(file, this._maxFiles);
    return { id: nextId++, file, error: { file, reason, message } };
  }

  /**
   * Adds a batch from the picker or a drop. In `multiple` mode the batch is
   * added to the files already there; a file identical to one in the list
   * (name, size, type, last modified) is skipped. In single mode a valid file
   * replaces the current one. Invalid files never replace valid ones: they are
   * listed with their error until removed or until the next selection.
   */
  private _addFiles(incoming: File[]) {
    if (this.disabled || !incoming.length) return;

    const maxFiles = this._maxFiles;
    const added: File[] = [];
    const rejected: Entry[] = [];
    const duplicates: File[] = [];
    let entries = this.multiple ? [...this._entries] : [];
    let removed: File[] = [];

    for (const file of incoming) {
      if (this.multiple && entries.some((e) => sameFile(e.file, file))) {
        duplicates.push(file);
        continue;
      }
      if (!matchesAccept(file, this.accept)) {
        rejected.push(this._reject(file, 'type'));
        continue;
      }
      if (this.maxSize > 0 && file.size > this.maxSize) {
        rejected.push(this._reject(file, 'size'));
        continue;
      }
      if (maxFiles && entries.length >= maxFiles) {
        rejected.push(this._reject(file, 'count'));
        continue;
      }
      entries.push({ id: nextId++, file });
      added.push(file);
    }

    if (!this.multiple && added.length) {
      removed = this._entries.map((e) => e.file);
    } else if (!this.multiple) {
      entries = [...this._entries];
    }

    this._entries = entries;
    this._rejected = rejected;
    if (added.length) this.error = false;
    this._syncFormValue();

    if (added.length) this._emitChange(added, removed);
    rejected.forEach((entry) =>
      this.dispatchEvent(
        new CustomEvent<FileUploadErrorDetail>('lui-error', {
          detail: entry.error,
          bubbles: true,
          composed: true,
        })
      )
    );

    this._announce(
      this._messages.added(
        added,
        rejected.map((e) => e.file),
        duplicates
      )
    );
  }

  private async _remove(entry: Entry) {
    const actions = this._actionButtons();
    const index = actions.findIndex((b) => b.dataset.id === String(entry.id));

    if (entry.error) {
      this._rejected = this._rejected.filter((e) => e !== entry);
    } else {
      this._entries = this._entries.filter((e) => e !== entry);
      this._syncFormValue();
      this._emitChange([], [entry.file]);
    }
    this._announce(this._messages.removed(entry.file));

    await this.updateComplete;
    // Focus stays in the list: the item that took this one's place, else the
    // one before it, else the drop zone.
    const remaining = this._actionButtons();
    const target =
      remaining[Math.min(index, remaining.length - 1)] ?? this._zone;
    target?.focus();
  }

  private _actionButtons(): HTMLButtonElement[] {
    return Array.from(
      this.renderRoot.querySelectorAll<HTMLButtonElement>(
        '.file-upload__action'
      )
    );
  }

  // -------------------------------------------------------------------- events

  private _openPicker = () => {
    if (this.disabled) return;
    this._input.click();
  };

  private _onInputChange = () => {
    const files = Array.from(this._input.files ?? []);
    // Reset so choosing the same file again still fires `change`. A cancelled
    // picker fires no `change` (or an empty one) and leaves the list alone.
    this._input.value = '';
    this._addFiles(files);
  };

  private _hasFiles(e: DragEvent) {
    return Array.from(e.dataTransfer?.types ?? []).includes('Files');
  }

  private _onDragEnter = (e: DragEvent) => {
    if (this.disabled || !this._hasFiles(e)) return;
    e.preventDefault();
    this._dragDepth += 1;
    this._dragActive = true;
  };

  private _onDragOver = (e: DragEvent) => {
    if (!this._hasFiles(e)) return;
    e.preventDefault();
    if (e.dataTransfer)
      e.dataTransfer.dropEffect = this.disabled ? 'none' : 'copy';
  };

  private _onDragLeave = () => {
    this._dragDepth = Math.max(0, this._dragDepth - 1);
    if (this._dragDepth === 0) this._dragActive = false;
  };

  private _onDrop = (e: DragEvent) => {
    if (!this._hasFiles(e)) return;
    e.preventDefault();
    this._dragDepth = 0;
    this._dragActive = false;
    if (this.disabled) return;
    this._addFiles(Array.from(e.dataTransfer?.files ?? []));
  };

  // -------------------------------------------------------------------- render

  private _renderItem(entry: Entry) {
    const { file, error } = entry;
    const statusId = `${this._baseId}-status-${entry.id}`;
    return html`
      <li class="file-upload__item${error ? ' file-upload__item--error' : ''}">
        <div class="file-upload__row">
          <svg
            class="file-upload__file-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            ${fileIcon}
          </svg>
          <div class="file-upload__details">
            <span class="file-upload__name">${file.name}</span>
            <span class="file-upload__size"
              >${this._formatBytes(file.size)}</span
            >
          </div>
          <div class="file-upload__actions">
            <button
              type="button"
              class="file-upload__action"
              data-id=${entry.id}
              aria-label="${this.removeLabel} ${file.name}"
              ?disabled=${this.disabled}
              @click=${() => this._remove(entry)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                ${trashIcon}
              </svg>
            </button>
          </div>
        </div>
        ${error
          ? html`<div class="file-upload__status" id=${statusId}>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                ${errorIcon}
              </svg>
              <span>${error.message}</span>
            </div>`
          : nothing}
      </li>
    `;
  }

  render() {
    const m = this._messages;
    const constraints = this._constraintsText();
    const items = [...this._entries, ...this._rejected];
    const ids = {
      title: `${this._baseId}-title`,
      description: `${this._baseId}-description`,
      constraints: `${this._baseId}-constraints`,
      required: `${this._baseId}-required`,
      message: `${this._baseId}-message`,
    };
    const describedBy = [
      ids.description,
      constraints ? ids.constraints : '',
      this.required ? ids.required : '',
      this.error ? ids.message : '',
    ]
      .filter(Boolean)
      .join(' ');
    const dragActive = this._dragActive || this.forceState === 'drag-active';

    return html`
      <div
        class="file-upload${dragActive ? ' file-upload--drag-active' : ''}${this
          .error
          ? ' file-upload--error'
          : ''}${this.disabled ? ' file-upload--disabled' : ''}"
      >
        <input
          class="file-upload__input"
          type="file"
          tabindex="-1"
          aria-hidden="true"
          hidden
          accept=${this.accept || nothing}
          ?multiple=${this.multiple}
          ?disabled=${this.disabled}
          @change=${this._onInputChange}
        />
        <button
          type="button"
          class="file-upload__zone"
          aria-labelledby=${ids.title}
          aria-describedby=${describedBy}
          ?disabled=${this.disabled}
          @click=${this._openPicker}
          @dragenter=${this._onDragEnter}
          @dragover=${this._onDragOver}
          @dragleave=${this._onDragLeave}
          @drop=${this._onDrop}
        >
          <span class="file-upload__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">${uploadIcon}</svg>
          </span>
          <span class="file-upload__instructions">
            <span class="file-upload__title" id=${ids.title}
              >${this.label}${this.optional
                ? html` <span class="file-upload__optional"
                    >${this.optionalText}</span
                  >`
                : nothing}</span
            >
            <span class="file-upload__description" id=${ids.description}
              >${this.description}</span
            >
          </span>
          ${constraints
            ? html`<span class="file-upload__constraints" id=${ids.constraints}
                >${constraints}</span
              >`
            : nothing}
          ${this.required
            ? html`<span class="file-upload__sr" id=${ids.required}
                >${m.required}</span
              >`
            : nothing}
        </button>

        ${this.error
          ? html`<p class="file-upload__message" id=${ids.message}>
              ${this.errorText}
            </p>`
          : nothing}
        ${items.length
          ? html`<ul class="file-upload__list" aria-label=${m.listLabel}>
              ${repeat(
                items,
                (e) => e.id,
                (e) => this._renderItem(e)
              )}
            </ul>`
          : nothing}

        <div class="file-upload__live" role="status" aria-live="polite">
          ${this._announcement}
        </div>
      </div>
    `;
  }
}

function toFileList(files: File[]): FileList {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  return transfer.files;
}
