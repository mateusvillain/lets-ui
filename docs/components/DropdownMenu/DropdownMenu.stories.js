import 'lets-ui-icons/dist/lets-ui-icons.css';
import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Actionable/Dropdown Menu',
  parameters: {
    docs: {
      description: {
        component:
          'Menu contextual flutuante que agrupa ações relacionadas. O trigger é fornecido pelo próprio consumidor — qualquer elemento pode abrir o menu. Suporta atalhos de teclado, submenus aninhados e divisores de grupo.',
      },
    },
  },
};

const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const Default = () => `
  <div class="dropdown-menu" style="margin-bottom: 220px;">
    <button
      class="btn btn--secondary btn--md"
      type="button"
      aria-haspopup="menu"
      aria-expanded="true"
      aria-controls="story-default-panel"
    >
      Opções
    </button>
    <ul id="story-default-panel" class="dropdown-menu__panel is-open" role="menu">
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Editar</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + E">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">E</kbd>
          </span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Duplicar</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + D">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">D</kbd>
          </span>
        </button>
      </li>
      <li role="separator" class="divider"></li>
      <li role="presentation" class="menu-item--has-submenu">
        <button class="menu-item" role="menuitem" type="button" aria-haspopup="menu">
          <span class="menu-item__label">Compartilhar</span>
          <span class="menu-item__chevron" aria-hidden="true">${CHEVRON_RIGHT}</span>
        </button>
        <ul class="dropdown-menu__panel" role="menu">
          <li role="presentation">
            <button class="menu-item" role="menuitem" type="button">
              <span class="menu-item__label">Por e-mail</span>
            </button>
          </li>
          <li role="presentation">
            <button class="menu-item" role="menuitem" type="button">
              <span class="menu-item__label">Copiar link</span>
              <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + Shift + C">
                <kbd class="shortcut__key">⌘</kbd>
                <span class="shortcut__sep" aria-hidden="true">+</span>
                <kbd class="shortcut__key">Shift</kbd>
                <span class="shortcut__sep" aria-hidden="true">+</span>
                <kbd class="shortcut__key">C</kbd>
              </span>
            </button>
          </li>
        </ul>
      </li>
      <li role="separator" class="divider"></li>
      <li role="presentation">
        <button class="menu-item menu-item--danger" role="menuitem" type="button">
          <span class="menu-item__label">Excluir</span>
        </button>
      </li>
    </ul>
  </div>
`;

export const WithShortcuts = () => `
  <div class="dropdown-menu" style="margin-bottom: 180px;">
    <button
      class="btn btn--secondary btn--md"
      type="button"
      aria-haspopup="menu"
      aria-expanded="true"
    >
      Arquivo
    </button>
    <ul class="dropdown-menu__panel is-open" role="menu">
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Novo arquivo</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + N">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">N</kbd>
          </span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Abrir</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + O">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">O</kbd>
          </span>
        </button>
      </li>
      <li role="separator" class="divider"></li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Salvar</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + S">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">S</kbd>
          </span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Salvar como</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + Shift + S">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">Shift</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">S</kbd>
          </span>
        </button>
      </li>
    </ul>
  </div>
`;

export const WithSubmenu = () => `
  <div class="dropdown-menu" style="margin-bottom: 160px;">
    <button
      class="btn btn--secondary btn--md"
      type="button"
      aria-haspopup="menu"
      aria-expanded="true"
    >
      Mais opções
    </button>
    <ul class="dropdown-menu__panel is-open" role="menu">
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Renomear</span>
        </button>
      </li>
      <li role="presentation" class="menu-item--has-submenu">
        <button class="menu-item" role="menuitem" type="button" aria-haspopup="menu">
          <span class="menu-item__label">Mover para</span>
          <span class="menu-item__chevron" aria-hidden="true">${CHEVRON_RIGHT}</span>
        </button>
        <ul class="dropdown-menu__panel" role="menu">
          <li role="presentation">
            <button class="menu-item" role="menuitem" type="button">
              <span class="menu-item__label">Pasta raiz</span>
            </button>
          </li>
          <li role="presentation">
            <button class="menu-item" role="menuitem" type="button">
              <span class="menu-item__label">Arquivos</span>
            </button>
          </li>
          <li role="presentation">
            <button class="menu-item" role="menuitem" type="button">
              <span class="menu-item__label">Projetos</span>
            </button>
          </li>
        </ul>
      </li>
      <li role="presentation" class="menu-item--has-submenu">
        <button class="menu-item" role="menuitem" type="button" aria-haspopup="menu">
          <span class="menu-item__label">Exportar como</span>
          <span class="menu-item__chevron" aria-hidden="true">${CHEVRON_RIGHT}</span>
        </button>
        <ul class="dropdown-menu__panel" role="menu">
          <li role="presentation">
            <button class="menu-item" role="menuitem" type="button">
              <span class="menu-item__label">PDF</span>
            </button>
          </li>
          <li role="presentation">
            <button class="menu-item" role="menuitem" type="button">
              <span class="menu-item__label">PNG</span>
            </button>
          </li>
          <li role="presentation">
            <button class="menu-item" role="menuitem" type="button">
              <span class="menu-item__label">SVG</span>
            </button>
          </li>
        </ul>
      </li>
    </ul>
  </div>
`;

export const WithDivider = () => `
  <div class="dropdown-menu" style="margin-bottom: 200px;">
    <button
      class="btn btn--secondary btn--md"
      type="button"
      aria-haspopup="menu"
      aria-expanded="true"
    >
      Conta
    </button>
    <ul class="dropdown-menu__panel is-open" role="menu">
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Perfil</span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Configurações</span>
        </button>
      </li>
      <li role="separator" class="divider"></li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Ajuda</span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Novidades</span>
        </button>
      </li>
      <li role="separator" class="divider"></li>
      <li role="presentation">
        <button class="menu-item menu-item--danger" role="menuitem" type="button">
          <span class="menu-item__label">Sair</span>
        </button>
      </li>
    </ul>
  </div>
`;

export const WithDisabledItem = () => `
  <div class="dropdown-menu" style="margin-bottom: 140px;">
    <button
      class="btn btn--secondary btn--md"
      type="button"
      aria-haspopup="menu"
      aria-expanded="true"
    >
      Editar
    </button>
    <ul class="dropdown-menu__panel is-open" role="menu">
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Copiar</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + C">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">C</kbd>
          </span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button" disabled aria-disabled="true">
          <span class="menu-item__label">Colar</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + V">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">V</kbd>
          </span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button" disabled aria-disabled="true">
          <span class="menu-item__label">Desfazer</span>
          <span class="menu-item__shortcut shortcut" role="group" aria-label="⌘ + Z">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">Z</kbd>
          </span>
        </button>
      </li>
    </ul>
  </div>
`;

export const TriggerWithIconButton = () => `
  <div class="dropdown-menu" style="margin-bottom: 160px;">
    <button
      class="icon-button icon-button--md"
      type="button"
      aria-label="Mais opções"
      aria-haspopup="menu"
      aria-expanded="true"
    >
      <i class="lui lui-dots-three" aria-hidden="true"></i>
    </button>
    <ul class="dropdown-menu__panel is-open" role="menu">
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Renomear</span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" role="menuitem" type="button">
          <span class="menu-item__label">Mover</span>
        </button>
      </li>
      <li role="separator" class="divider"></li>
      <li role="presentation">
        <button class="menu-item menu-item--danger" role="menuitem" type="button">
          <span class="menu-item__label">Excluir</span>
        </button>
      </li>
    </ul>
  </div>
`;
