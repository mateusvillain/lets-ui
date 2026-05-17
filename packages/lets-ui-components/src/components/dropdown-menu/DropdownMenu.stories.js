import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Actionable/Dropdown Menu',
  argTypes: {
    label: { control: 'text' },
    shortcut: { control: 'text' },
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
Default.parameters = { controls: { disable: true } };
Default.args = {
  label: 'Editar',
  shortcut: '⌘,E',
};

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

export const WithDivider = () => `
  <div style="margin-bottom: 200px;">
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

export const TriggerWithIconButton = () => `
  <div style="margin-bottom: 160px;">
    <lui-dropdown-menu open>
      <lui-icon-button slot="trigger" icon="dots-three" size="md" aria-label="Mais opções"></lui-icon-button>
      <lui-menu-item slot="items" label="Renomear"></lui-menu-item>
      <lui-menu-item slot="items" label="Mover"></lui-menu-item>
      <lui-menu-divider slot="items"></lui-menu-divider>
      <lui-menu-item slot="items" label="Excluir" variant="danger"></lui-menu-item>
    </lui-dropdown-menu>
  </div>
`;
