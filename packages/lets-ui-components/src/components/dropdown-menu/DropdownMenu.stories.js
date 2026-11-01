import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

const DOTS_THREE = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.25C12.6213 17.25 13.125 17.7537 13.125 18.375C13.125 18.9963 12.6213 19.5 12 19.5C11.3787 19.5 10.875 18.9963 10.875 18.375C10.875 17.7537 11.3787 17.25 12 17.25ZM12 10.875C12.6213 10.875 13.125 11.3787 13.125 12C13.125 12.6213 12.6213 13.125 12 13.125C11.3787 13.125 10.875 12.6213 10.875 12C10.875 11.3787 11.3787 10.875 12 10.875ZM12 4.5C12.6213 4.5 13.125 5.00368 13.125 5.625C13.125 6.24632 12.6213 6.75 12 6.75C11.3787 6.75 10.875 6.24632 10.875 5.625C10.875 5.00368 11.3787 4.5 12 4.5Z"/></svg>`;

export default {
  title: 'Actionable/Dropdown Menu',
  argTypes: {
    label: {
      control: 'text',
      description:
        'Texto do primeiro item do menu. Os demais itens do exemplo são fixos.',
      table: { defaultValue: { summary: "''" } },
    },
    shortcut: {
      control: 'text',
      description: 'Teclas do atalho do primeiro item, separadas por vírgula.',
      table: { defaultValue: { summary: "''" } },
    },
  },
};

const Template = ({ label, shortcut }) => `
  <div style="margin-bottom: 220px;">
    <lui-dropdown-menu open>
      <lui-button slot="trigger" variant="secondary" size="md" label="Abrir"></lui-button>
      <lui-menu-item slot="items" label="${label}" shortcut="${shortcut}"></lui-menu-item>
      <lui-menu-item slot="items" label="Duplicar" shortcut="⌘,D"></lui-menu-item>
      <lui-menu-divider slot="items"></lui-menu-divider>
      <lui-menu-item slot="items" label="Compartilhar">
        <lui-menu-item label="Por e-mail"></lui-menu-item>
        <lui-menu-item label="Copiar link" shortcut="⌘,Shift,C"></lui-menu-item>
      </lui-menu-item>
      <lui-menu-divider slot="items"></lui-menu-divider>
      <lui-menu-item slot="items" label="Excluir" variant="danger"></lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;

export const Default = Template.bind({});
Default.args = {
  label: 'Editar',
  shortcut: '⌘,E',
};

export const Triggers = () => `
  <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 220px;">
    <lui-dropdown-menu>
      <button slot="trigger" class="btn btn--secondary btn--md" type="button">Botão nativo</button>
      <lui-menu-item slot="items" label="Editar"></lui-menu-item>
      <lui-menu-item slot="items" label="Duplicar"></lui-menu-item>
    </lui-dropdown-menu>
    <lui-dropdown-menu>
      <lui-button slot="trigger" variant="secondary" size="md" label="lui-button"></lui-button>
      <lui-menu-item slot="items" label="Editar"></lui-menu-item>
      <lui-menu-item slot="items" label="Duplicar"></lui-menu-item>
    </lui-dropdown-menu>
    <lui-dropdown-menu>
      <lui-icon-button slot="trigger" aria-label="Mais opções">${DOTS_THREE}</lui-icon-button>
      <lui-menu-item slot="items" label="Editar"></lui-menu-item>
      <lui-menu-item slot="items" label="Duplicar"></lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;
Triggers.storyName = 'Trigger';
Triggers.parameters = { controls: { disable: true } };

export const WithShortcuts = () => `
  <div style="margin-bottom: 180px;">
    <lui-dropdown-menu open>
      <lui-button slot="trigger" variant="secondary" size="md" label="Arquivo"></lui-button>
      <lui-menu-item slot="items" label="Novo arquivo" shortcut="⌘,N"></lui-menu-item>
      <lui-menu-item slot="items" label="Abrir" shortcut="⌘,O"></lui-menu-item>
      <lui-menu-divider slot="items"></lui-menu-divider>
      <lui-menu-item slot="items" label="Salvar" shortcut="⌘,S"></lui-menu-item>
      <lui-menu-item slot="items" label="Salvar como" shortcut="⌘,Shift,S"></lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;
WithShortcuts.storyName = 'Shortcut';
WithShortcuts.parameters = { controls: { disable: true } };

export const WithSubmenu = () => `
  <div style="margin-bottom: 160px;">
    <lui-dropdown-menu open>
      <lui-button slot="trigger" variant="secondary" size="md" label="Mais opções"></lui-button>
      <lui-menu-item slot="items" label="Renomear"></lui-menu-item>
      <lui-menu-item slot="items" label="Mover para">
        <lui-menu-item label="Pasta raiz"></lui-menu-item>
        <lui-menu-item label="Arquivos"></lui-menu-item>
        <lui-menu-item label="Projetos"></lui-menu-item>
      </lui-menu-item>
      <lui-menu-item slot="items" label="Exportar como">
        <lui-menu-item label="PDF"></lui-menu-item>
        <lui-menu-item label="PNG"></lui-menu-item>
        <lui-menu-item label="SVG"></lui-menu-item>
      </lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;
WithSubmenu.storyName = 'Submenu';
WithSubmenu.parameters = { controls: { disable: true } };

export const WithDivider = () => `
  <div style="margin-bottom: 320px;">
    <lui-dropdown-menu open>
      <lui-button slot="trigger" variant="secondary" size="md" label="Conta"></lui-button>
      <lui-menu-item slot="items" label="Perfil"></lui-menu-item>
      <lui-menu-item slot="items" label="Configurações"></lui-menu-item>
      <lui-menu-divider slot="items"></lui-menu-divider>
      <lui-menu-item slot="items" label="Ajuda"></lui-menu-item>
      <lui-menu-item slot="items" label="Novidades"></lui-menu-item>
      <lui-menu-divider slot="items"></lui-menu-divider>
      <lui-menu-item slot="items" label="Sair" variant="danger"></lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;
WithDivider.storyName = 'Divisor';
WithDivider.parameters = { controls: { disable: true } };

export const DangerItem = () => `
  <div style="margin-bottom: 160px;">
    <lui-dropdown-menu open>
      <lui-button slot="trigger" variant="secondary" size="md" label="Projeto"></lui-button>
      <lui-menu-item slot="items" label="Renomear"></lui-menu-item>
      <lui-menu-item slot="items" label="Duplicar"></lui-menu-item>
      <lui-menu-divider slot="items"></lui-menu-divider>
      <lui-menu-item slot="items" label="Excluir projeto" variant="danger"></lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;
DangerItem.storyName = 'Ação destrutiva';
DangerItem.parameters = { controls: { disable: true } };

export const WithDisabledItem = () => `
  <div style="margin-bottom: 140px;">
    <lui-dropdown-menu open>
      <lui-button slot="trigger" variant="secondary" size="md" label="Editar"></lui-button>
      <lui-menu-item slot="items" label="Copiar" shortcut="⌘,C"></lui-menu-item>
      <lui-menu-item slot="items" label="Colar" shortcut="⌘,V" disabled></lui-menu-item>
      <lui-menu-item slot="items" label="Desfazer" shortcut="⌘,Z" disabled></lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;
WithDisabledItem.storyName = 'Item desabilitado';
WithDisabledItem.parameters = { controls: { disable: true } };

export const Interactive = () => `
  <div style="margin-bottom: 220px;">
    <lui-dropdown-menu>
      <lui-button slot="trigger" variant="secondary" size="md" label="Abrir menu"></lui-button>
      <lui-menu-item slot="items" label="Editar" shortcut="⌘,E"></lui-menu-item>
      <lui-menu-item slot="items" label="Duplicar" shortcut="⌘,D"></lui-menu-item>
      <lui-menu-divider slot="items"></lui-menu-divider>
      <lui-menu-item slot="items" label="Excluir" variant="danger"></lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;
Interactive.storyName = 'Fechado (interativo)';
Interactive.parameters = { controls: { disable: true } };

export const Programmatic = () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'display: flex; flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 220px;';
  wrapper.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <lui-button data-open size="md" label="Abrir"></lui-button>
      <lui-button data-close size="md" variant="secondary" label="Fechar"></lui-button>
      <lui-button data-toggle size="md" variant="neutral" label="Alternar"></lui-button>
      <output>open: false</output>
    </div>
    <lui-dropdown-menu>
      <lui-button slot="trigger" variant="secondary" size="md" label="Opções"></lui-button>
      <lui-menu-item slot="items" label="Editar"></lui-menu-item>
      <lui-menu-item slot="items" label="Duplicar"></lui-menu-item>
    </lui-dropdown-menu>
  `;

  const menu = wrapper.querySelector('lui-dropdown-menu');
  const output = wrapper.querySelector('output');
  const update = () => {
    output.textContent = `open: ${menu.open}`;
  };

  // The menu closes on any click outside it, and these buttons are outside.
  // Without stopping propagation, the document listener would close the menu
  // in the same click that opened it.
  wrapper.querySelector('[data-open]').addEventListener('click', (event) => {
    event.stopPropagation();
    menu.openMenu();
  });
  wrapper.querySelector('[data-close]').addEventListener('click', (event) => {
    event.stopPropagation();
    menu.closeMenu();
  });
  wrapper.querySelector('[data-toggle]').addEventListener('click', (event) => {
    event.stopPropagation();
    menu.toggleMenu();
  });

  // The `open` attribute is reflected, so any change — by method, by the
  // trigger or by Escape — updates the output.
  new MutationObserver(update).observe(menu, {
    attributes: true,
    attributeFilter: ['open'],
  });
  update();

  return wrapper;
};
Programmatic.storyName = 'Controle por código';
Programmatic.parameters = { controls: { disable: true } };

export const MenuSelect = () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'display: flex; flex-direction: column; gap: 16px; margin-bottom: 200px;';
  wrapper.innerHTML = `
    <lui-dropdown-menu>
      <lui-button slot="trigger" variant="secondary" size="md" label="Opções"></lui-button>
      <lui-menu-item slot="items" label="Editar"></lui-menu-item>
      <lui-menu-item slot="items" label="Duplicar"></lui-menu-item>
      <lui-menu-item slot="items" label="Compartilhar">
        <lui-menu-item label="Por e-mail"></lui-menu-item>
        <lui-menu-item label="Copiar link"></lui-menu-item>
      </lui-menu-item>
    </lui-dropdown-menu>
    <p>Última ação escolhida: <output>—</output></p>
  `;

  const output = wrapper.querySelector('output');
  wrapper
    .querySelector('lui-dropdown-menu')
    .addEventListener('menu-select', (event) => {
      output.textContent = event.detail.label;
    });

  return wrapper;
};
MenuSelect.storyName = 'Evento menu-select';
MenuSelect.parameters = { controls: { disable: true } };

export const CSSClass = () => `
  <div class="dropdown-menu" style="margin-bottom: 220px;">
    <button class="btn btn--secondary btn--md" type="button" aria-haspopup="menu" aria-expanded="false">Opções</button>
    <ul class="dropdown-menu__panel is-open" role="menu">
      <li role="presentation">
        <button class="menu-item" type="button" role="menuitem">
          <span class="menu-item__label">Editar</span>
          <span class="shortcut" role="group" aria-label="⌘ + E">
            <kbd class="shortcut__key">⌘</kbd>
            <span class="shortcut__sep" aria-hidden="true">+</span>
            <kbd class="shortcut__key">E</kbd>
          </span>
        </button>
      </li>
      <li role="presentation">
        <button class="menu-item" type="button" role="menuitem">
          <span class="menu-item__label">Duplicar</span>
        </button>
      </li>
      <li role="separator"><hr class="divider" /></li>
      <li role="presentation">
        <button class="menu-item menu-item--danger" type="button" role="menuitem">
          <span class="menu-item__label">Excluir</span>
        </button>
      </li>
    </ul>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = { controls: { disable: true } };
