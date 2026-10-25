import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

import { glyph, icon } from './CommandPalette.icons.js';

// A stand-in photo, inline like the Avatar stories: no request leaves the page.
const photo = (from, to) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="40" cy="32" r="14" fill="#fff" fill-opacity=".85"/><path d="M12 80a28 28 0 0 1 56 0z" fill="#fff" fill-opacity=".85"/></svg>`
  );

const RECENT = `
  <lui-command-group label="Recent">
    <lui-command-item value="calendar" label="Calendar" caption="Page" shortcut="⌘1" tag="pages">${icon('calendar')}</lui-command-item>
    <lui-command-item value="settings" label="Settings" caption="Page" shortcut="⌘2" tag="pages">${icon('gear')}</lui-command-item>
  </lui-command-group>
`;

const USERS = `
  <lui-command-group label="Users">
    <lui-command-item value="alex" label="Alex Johnson" avatar="Alex Johnson" tag="users"></lui-command-item>
    <lui-command-item value="james" label="James Brown" avatar="James Brown" tag="users"></lui-command-item>
    <lui-command-item value="maria" label="Maria Smith" avatar="Maria Smith" tag="users"></lui-command-item>
    <lui-command-item value="emily" label="Emily Davis" avatar="Emily Davis" tag="users"></lui-command-item>
  </lui-command-group>
`;

const TAGS = `
  <lui-command-tag value="pages">Pages</lui-command-tag>
  <lui-command-tag value="users">Users</lui-command-tag>
`;

// Each story renders its own trigger: a page shows several palettes at once,
// and only the first takes ⌘K / Ctrl+K.
const palette = (attrs, content, label = 'Open command palette') => `
  <lui-button
    label="${label}"
    variant="secondary"
    onclick="this.nextElementSibling.show()"
  ></lui-button>
  <lui-command-palette ${attrs}>${content}</lui-command-palette>
`;

// Opens the palette and types `query` into it, for the states that need one.
const openWith =
  (query = '') =>
  async ({ canvasElement }) => {
    const el = canvasElement.querySelector('lui-command-palette');
    el.show();
    await el.updateComplete;
    if (!query) return;
    const input = el.shadowRoot.querySelector('input');
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

// Item attributes take an `item` prefix so they cannot clash with the
// palette's own; `name` shows them in the table as the attribute itself.
const ITEM_ATTRIBUTES = {
  itemLabel: ['label', 'Título do item.'],
  itemCaption: ['caption', 'Texto curto ao lado do título.'],
  itemDescription: ['description', 'Linha abaixo do título.'],
  itemShortcut: [
    'shortcut',
    'Teclas do atalho exibido à direita, separadas por vírgula, como em `lui-shortcut`.',
  ],
  itemAvatar: [
    'avatar',
    'Nome da pessoa. Troca o ícone por um Avatar com as iniciais.',
  ],
  itemAvatarSrc: ['avatar-src', 'Foto do Avatar.'],
  itemValue: ['value', 'Valor enviado no `detail` de `lui-select`.', 'label'],
  itemTag: ['tag', 'Valor da `lui-command-tag` que filtra este item.'],
  itemKeywords: [
    'keywords',
    'Termos extras considerados pela busca, sem aparecer na tela.',
  ],
};

const itemArgTypes = Object.fromEntries(
  Object.entries(ITEM_ATTRIBUTES).map(
    ([key, [name, description, defaultValue = '—']]) => [
      key,
      {
        name,
        control: 'text',
        description,
        table: {
          category: 'Command Item',
          subcategory: 'Attributes',
          type: { summary: 'string' },
          defaultValue: { summary: defaultValue },
        },
      },
    ]
  )
);

const paletteArg = (control, description, defaultValue) => ({
  control,
  description,
  table: {
    category: 'Command Palette',
    type: { summary: control === 'boolean' ? 'boolean' : 'string' },
    defaultValue: { summary: defaultValue },
  },
});

export default {
  title: 'Navigation/Command Palette',
  argTypes: {
    placeholder: paletteArg(
      'text',
      'Texto do campo de busca e seu nome acessível.',
      'Search actions or files'
    ),
    'empty-text': paletteArg(
      'text',
      'Mensagem exibida quando nada corresponde à busca.',
      'No results found'
    ),
    'no-filter': paletteArg(
      'boolean',
      'Desliga o filtro embutido, para resultados filtrados pela aplicação.',
      'false'
    ),
    'no-hotkey': paletteArg(
      'boolean',
      'Desliga o atalho ⌘K / Ctrl+K.',
      'false'
    ),
    ...itemArgTypes,
    itemIcon: {
      name: 'icon',
      control: false,
      description:
        'Ícone à esquerda: qualquer elemento filho com `slot="icon"`. Ignorado quando há `avatar` ou `avatar-src`.',
      table: { category: 'Command Item', subcategory: 'Slots' },
    },
  },
  parameters: {
    docs: {
      story: { height: '640px' },
    },
  },
};

const attr = (name, value) =>
  value === true ? name : value ? `${name}="${value}"` : '';

// The first result follows the Command Item controls; the rest stay fixed.
export const Default = (args) => {
  const paletteAttrs = ['placeholder', 'empty-text', 'no-filter', 'no-hotkey']
    .map((name) => attr(name, args[name]))
    .join(' ');
  const itemAttrs = Object.entries(ITEM_ATTRIBUTES)
    .map(([key, [name]]) => attr(name, args[key]))
    .join(' ');

  return palette(
    paletteAttrs,
    `${TAGS}
    <lui-command-group label="Recent">
      <lui-command-item ${itemAttrs}>${icon('calendar')}</lui-command-item>
      <lui-command-item value="settings" label="Settings" caption="Page" shortcut="⌘2" tag="pages">${icon('gear')}</lui-command-item>
    </lui-command-group>
    ${USERS}`
  );
};
Default.args = {
  placeholder: 'Search actions or files',
  'empty-text': 'No results found',
  'no-filter': false,
  'no-hotkey': false,
  itemLabel: 'Calendar',
  itemCaption: 'Page',
  itemDescription: '',
  itemShortcut: '⌘1',
  itemAvatar: '',
  itemAvatarSrc: '',
  itemValue: 'calendar',
  itemTag: 'pages',
  itemKeywords: '',
};

// Shows what `lui-select` sends, under the trigger.
const withSelection = (html) => {
  const root = document.createElement('div');
  root.innerHTML = `${html}<p data-selection style="margin-top: 16px">Nothing selected yet.</p>`;
  root.addEventListener('lui-select', (event) => {
    const { value, label } = event.detail;
    root.querySelector('[data-selection]').textContent =
      `Selected: ${label} (value="${value}")`;
  });
  return root;
};

export const GroupedResults = () => palette('', `${RECENT}${USERS}`);
GroupedResults.storyName = 'Grouped results';

export const Navigation = () =>
  withSelection(
    palette(
      'placeholder="Go to…"',
      `
    <lui-command-group label="Pages">
      <lui-command-item value="/" label="Home" shortcut="⌘1" keywords="dashboard start">${icon('house')}</lui-command-item>
      <lui-command-item value="/inbox" label="Inbox" caption="12 unread" shortcut="⌘2" keywords="messages mail">${icon('inbox')}</lui-command-item>
      <lui-command-item value="/calendar" label="Calendar" shortcut="⌘3" keywords="events schedule agenda">${icon('calendar')}</lui-command-item>
      <lui-command-item value="/notifications" label="Notifications" shortcut="⌘4" keywords="alerts">${icon('bell')}</lui-command-item>
      <lui-command-item value="/settings" label="Settings" shortcut="⌘5" keywords="preferences account">${icon('gear')}</lui-command-item>
    </lui-command-group>
    <lui-command-group label="Projects">
      <lui-command-item value="/projects/website" label="Website redesign" caption="Marketing">${icon('folder')}</lui-command-item>
      <lui-command-item value="/projects/mobile" label="Mobile app" caption="Product">${icon('folder')}</lui-command-item>
      <lui-command-item value="/projects/brand" label="Brand guidelines" caption="Design">${icon('folder')}</lui-command-item>
    </lui-command-group>
  `,
      'Go to page'
    )
  );

export const QuickActions = () =>
  withSelection(
    palette(
      'placeholder="Type a command…"',
      `
    <lui-command-group label="Create">
      <lui-command-item value="new-file" label="New file" shortcut="⌘N">${icon('file-plus')}</lui-command-item>
      <lui-command-item value="new-folder" label="New folder" shortcut="⇧⌘N">${icon('folder-plus')}</lui-command-item>
      <lui-command-item value="invite" label="Invite member" description="Send an invitation by email" keywords="add user team">${icon('user-plus')}</lui-command-item>
    </lui-command-group>
    <lui-command-group label="File">
      <lui-command-item value="copy-link" label="Copy link" shortcut="⌘L" keywords="share url">${icon('link')}</lui-command-item>
      <lui-command-item value="download" label="Download" shortcut="⌘S">${icon('download')}</lui-command-item>
      <lui-command-item value="favorite" label="Add to favorites" shortcut="⌘D" keywords="star bookmark">${icon('star')}</lui-command-item>
      <lui-command-item value="delete" label="Move to trash" shortcut="⌘⌫" keywords="delete remove">${icon('trash')}</lui-command-item>
    </lui-command-group>
    <lui-command-group label="Preferences">
      <lui-command-item value="theme" label="Toggle dark mode" shortcut="⇧⌘L" keywords="theme light">${icon('moon')}</lui-command-item>
      <lui-command-item value="sign-out" label="Sign out" keywords="logout exit">${icon('sign-out')}</lui-command-item>
    </lui-command-group>
  `,
      'Run a command'
    )
  );
QuickActions.storyName = 'Quick actions';

export const FileSearch = () =>
  palette(
    'placeholder="Search files"',
    `
    <lui-command-tag value="docs">Documents</lui-command-tag>
    <lui-command-tag value="sheets">Spreadsheets</lui-command-tag>
    <lui-command-tag value="folders">Folders</lui-command-tag>
    <lui-command-group label="Recent files">
      <lui-command-item value="q3-report" label="Q3 report" caption="Finance" description="Edited 2 hours ago by Maria Smith" tag="docs">${icon('file-text')}</lui-command-item>
      <lui-command-item value="roadmap" label="Product roadmap" caption="Product" description="Edited yesterday by you" tag="docs">${icon('file-text')}</lui-command-item>
      <lui-command-item value="budget" label="2026 budget" caption="Finance" description="Edited 3 days ago by Alex Johnson" tag="sheets">${icon('file-text')}</lui-command-item>
    </lui-command-group>
    <lui-command-group label="Folders">
      <lui-command-item value="contracts" label="Contracts" caption="Legal" description="24 files" tag="folders">${icon('folder')}</lui-command-item>
      <lui-command-item value="assets" label="Brand assets" caption="Design" description="118 files" tag="folders">${icon('folder')}</lui-command-item>
    </lui-command-group>
  `,
    'Search files'
  );
FileSearch.storyName = 'File search';

export const UserResults = () =>
  palette(
    'placeholder="Search people"',
    `
    <lui-command-group label="Team">
      <lui-command-item value="alex" label="Alex Johnson" caption="Product designer" description="alex@example.com" avatar="Alex Johnson" avatar-src="${photo('#f6a15c', '#5b3b8c')}"></lui-command-item>
      <lui-command-item value="james" label="James Brown" caption="Engineer" description="james@example.com" avatar="James Brown" avatar-src="${photo('#5cc8f6', '#2b4c8c')}"></lui-command-item>
      <lui-command-item value="maria" label="Maria Smith" caption="Finance" description="maria@example.com" avatar="Maria Smith"></lui-command-item>
      <lui-command-item value="emily" label="Emily Davis" caption="Marketing" description="emily@example.com" avatar="Emily Davis" avatar-src="/does-not-exist.png"></lui-command-item>
    </lui-command-group>
    <lui-command-group label="Actions">
      <lui-command-item value="invite" label="Invite someone new">${icon('user-plus')}</lui-command-item>
    </lui-command-group>
  `,
    'Find a person'
  );
UserResults.storyName = 'User results';

export const Tags = () =>
  palette(
    '',
    `
    <lui-command-tag value="pages">Pages</lui-command-tag>
    <lui-command-tag value="files">Files</lui-command-tag>
    <lui-command-tag value="people">People</lui-command-tag>
    <lui-command-tag value="actions">Actions</lui-command-tag>
    <lui-command-group label="Pages">
      <lui-command-item value="calendar" label="Calendar" tag="pages">${icon('calendar')}</lui-command-item>
      <lui-command-item value="inbox" label="Inbox" tag="pages">${icon('inbox')}</lui-command-item>
    </lui-command-group>
    <lui-command-group label="Files">
      <lui-command-item value="q3-report" label="Q3 report" caption="Finance" tag="files">${icon('file-text')}</lui-command-item>
      <lui-command-item value="contracts" label="Contracts" caption="Legal" tag="files">${icon('folder')}</lui-command-item>
    </lui-command-group>
    <lui-command-group label="People">
      <lui-command-item value="alex" label="Alex Johnson" avatar="Alex Johnson" tag="people"></lui-command-item>
      <lui-command-item value="maria" label="Maria Smith" avatar="Maria Smith" tag="people"></lui-command-item>
    </lui-command-group>
    <lui-command-group label="Actions">
      <lui-command-item value="new-file" label="New file" shortcut="⌘N" tag="actions">${icon('file-plus')}</lui-command-item>
      <lui-command-item value="sign-out" label="Sign out" tag="actions">${icon('sign-out')}</lui-command-item>
    </lui-command-group>
  `
  );

// A stand-in for a search API: answers after a short delay.
const ARTICLES = [
  [
    'Getting started',
    'Guides',
    'Install the packages and render your first component',
  ],
  [
    'Design tokens',
    'Foundations',
    'Colors, spacing and radii as CSS custom properties',
  ],
  ['Theming', 'Foundations', 'Light and dark themes with data-theme'],
  ['Multi-brand', 'Foundations', 'Swap the brand with data-brand'],
  ['Accessibility', 'Guides', 'Keyboard support and ARIA in every component'],
  [
    'Command Palette',
    'Components',
    'Keyboard-driven search over pages and actions',
  ],
  ['Modal', 'Components', 'A dialog that sits over the page content'],
];

const searchArticles = (query) =>
  new Promise((resolve) => {
    const q = query.trim().toLowerCase();
    setTimeout(
      () =>
        resolve(
          ARTICLES.filter((article) =>
            article.join(' ').toLowerCase().includes(q)
          )
        ),
      300
    );
  });

export const AsyncResults = () => {
  const root = document.createElement('div');
  root.innerHTML = palette(
    'no-filter placeholder="Search the documentation" empty-text="Type to search the documentation"',
    '',
    'Search docs'
  );
  const el = root.querySelector('lui-command-palette');
  let latest = '';

  el.addEventListener('lui-search', async (event) => {
    const query = event.detail.query;
    latest = query;
    if (!query.trim()) {
      el.replaceChildren();
      el.emptyText = 'Type to search the documentation';
      return;
    }
    el.emptyText = 'Searching…';
    const results = await searchArticles(query);
    // A slower answer to an older query must not overwrite a newer one.
    if (query !== latest) return;
    el.emptyText = `No articles for "${query}"`;
    const group = document.createElement('lui-command-group');
    group.setAttribute('label', 'Articles');
    for (const [label, caption, description] of results) {
      const item = document.createElement('lui-command-item');
      item.setAttribute('label', label);
      item.setAttribute('caption', caption);
      item.setAttribute('description', description);
      item.innerHTML = icon('file-text');
      group.append(item);
    }
    el.replaceChildren(group);
  });
  return root;
};
AsyncResults.storyName = 'Async results';

export const Localized = () =>
  palette(
    `
    label="Paleta de comandos"
    placeholder="Buscar ações ou arquivos"
    empty-text="Nenhum resultado encontrado"
    results-label="{count} resultados"
    clear-label="Limpar busca"
    tags-label="Filtrar resultados"
    navigate-label="Navegar"
    select-label="Selecionar"
    close-label="Fechar"
    `,
    `
    <lui-command-tag value="paginas">Páginas</lui-command-tag>
    <lui-command-tag value="pessoas">Pessoas</lui-command-tag>
    <lui-command-group label="Recentes">
      <lui-command-item value="agenda" label="Agenda" caption="Página" shortcut="⌘1" tag="paginas">${icon('calendar')}</lui-command-item>
      <lui-command-item value="configuracoes" label="Configurações" caption="Página" shortcut="⌘2" tag="paginas">${icon('gear')}</lui-command-item>
      <lui-command-item value="mensagens" label="Mensagens" caption="Página" tag="paginas">${icon('chat-text')}</lui-command-item>
    </lui-command-group>
    <lui-command-group label="Pessoas">
      <lui-command-item value="joao" label="João Pereira" avatar="João Pereira" tag="pessoas"></lui-command-item>
      <lui-command-item value="ana" label="Ana Souza" avatar="Ana Souza" tag="pessoas"></lui-command-item>
    </lui-command-group>
  `,
    'Abrir paleta de comandos'
  );
Localized.storyName = 'Localized (pt-BR)';

export const ItemAnatomy = () =>
  palette(
    '',
    `
    <lui-command-item value="title" label="Title" caption="Caption" description="Description" shortcut="⌘K">${icon('folder')}</lui-command-item>
    <lui-command-item value="user" label="Title" caption="Caption" description="Description" avatar="Mateus Villain"></lui-command-item>
    <lui-command-item value="plain" label="Title only"></lui-command-item>
  `
  );
ItemAnatomy.storyName = 'Item anatomy';

export const FieldWithClear = () => palette('', `${RECENT}${USERS}`);
FieldWithClear.storyName = 'Field with clear';
FieldWithClear.play = openWith('Cal');

export const EmptyState = () =>
  palette('empty-text="Nothing matches your search"', `${RECENT}${USERS}`);
EmptyState.storyName = 'Empty state';
EmptyState.play = openWith('xyz');

// The same markup the Web Component renders, written by hand with the global
// classes. Shown without `.command-palette__backdrop`, which covers the page.
const SEARCH_ICON = `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.75"></circle><path d="M15.3 15.3L20.25 20.25"></path></svg>`;

export const CSSClass = () => `
  <div class="command-palette__dialog" role="dialog" aria-modal="true" aria-label="Command palette">
    <div class="command-palette__field">
      <span class="command-palette__search-icon">${SEARCH_ICON}</span>
      <input
        class="command-palette__input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="true"
        aria-controls="cp-css-results"
        aria-activedescendant="cp-css-calendar"
        aria-label="Search actions or files"
        placeholder="Search actions or files"
      />
    </div>

    <div class="command-palette__panel">
      <div class="command-palette__tags" role="group" aria-label="Filter results">
        <button type="button" class="command-palette__tag" aria-pressed="true">
          <span class="tag--sm tag--container-primary">Pages</span>
        </button>
        <button type="button" class="command-palette__tag" aria-pressed="false">
          <span class="tag--sm tag--surface-neutral">Users</span>
        </button>
      </div>

      <div id="cp-css-results" class="command-palette__results" role="listbox" aria-label="Command palette">
        <div role="group" aria-labelledby="cp-css-recent">
          <div id="cp-css-recent" class="command-palette__group-label">Recent</div>
          <div id="cp-css-calendar" class="command-palette__item is-active" role="option" aria-selected="true">
            <span class="command-palette__leading" aria-hidden="true">${icon('calendar')}</span>
            <span class="command-palette__text">
              <span class="command-palette__title-row">
                <span class="command-palette__title">Calendar</span>
                <span class="command-palette__caption">Page</span>
              </span>
            </span>
            <span class="shortcut command-palette__shortcut" aria-hidden="true"><kbd class="shortcut__key">⌘1</kbd></span>
          </div>
          <div id="cp-css-settings" class="command-palette__item" role="option" aria-selected="false">
            <span class="command-palette__leading" aria-hidden="true">${icon('gear')}</span>
            <span class="command-palette__text">
              <span class="command-palette__title-row">
                <span class="command-palette__title">Settings</span>
                <span class="command-palette__caption">Page</span>
              </span>
            </span>
            <span class="shortcut command-palette__shortcut" aria-hidden="true"><kbd class="shortcut__key">⌘2</kbd></span>
          </div>
        </div>

        <div class="command-palette__separator" aria-hidden="true"><div class="divider"></div></div>

        <div role="group" aria-labelledby="cp-css-users">
          <div id="cp-css-users" class="command-palette__group-label">Users</div>
          <div id="cp-css-alex" class="command-palette__item" role="option" aria-selected="false">
            <span class="command-palette__leading" aria-hidden="true">
              <span class="avatar avatar--sm avatar--circle avatar--gray"><span class="avatar__initials">AJ</span></span>
            </span>
            <span class="command-palette__text">
              <span class="command-palette__title-row">
                <span class="command-palette__title">Alex Johnson</span>
              </span>
              <span class="command-palette__description">alex@example.com</span>
            </span>
          </div>
        </div>
      </div>

      <div class="divider"></div>
      <div class="command-palette__footer" aria-hidden="true">
        <span class="command-palette__legend">
          <span class="command-palette__keys">
            <kbd class="shortcut__key command-palette__key">${glyph('arrow-up')}</kbd>
            <kbd class="shortcut__key command-palette__key">${glyph('arrow-down')}</kbd>
          </span>
          Navigate
        </span>
        <span class="command-palette__legend">
          <kbd class="shortcut__key command-palette__key">${glyph('arrow-elbow-down-left')}</kbd>
          Select
        </span>
        <span class="command-palette__legend">
          <kbd class="shortcut__key">Esc</kbd>
          Close
        </span>
      </div>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = { controls: { disable: true } };
