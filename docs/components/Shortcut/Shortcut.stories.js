import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Miscellaneous/Shortcut',
  argTypes: {
    keys: {
      control: 'text',
      description: 'Teclas separadas por vírgula (ex.: "Ctrl,K")',
    },
  },
};

const Template = ({ keys }) => `
  <div style="padding: 24px;">
    <lui-shortcut keys="${keys}"></lui-shortcut>
  </div>
`;

export const Shortcut = Template.bind({});
Shortcut.args = {
  keys: 'Ctrl,K',
};

export const SingleKey = () => `
  <div style="padding: 24px; display: flex; gap: 16px; align-items: center;">
    <lui-shortcut keys="Esc"></lui-shortcut>
    <lui-shortcut keys="Enter"></lui-shortcut>
    <lui-shortcut keys="Tab"></lui-shortcut>
  </div>
`;

export const MultipleKeys = () => `
  <div style="padding: 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
    <lui-shortcut keys="Ctrl,K"></lui-shortcut>
    <lui-shortcut keys="Ctrl,Shift,P"></lui-shortcut>
    <lui-shortcut keys="Cmd,Z"></lui-shortcut>
    <lui-shortcut keys="Cmd,Shift,Z"></lui-shortcut>
  </div>
`;

export const InContext = () => `
  <div style="padding: 24px; max-width: 320px;">
    <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px;">
      <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 6px; background: #f5f5f5;">
        <span style="font-size: 14px;">Abrir busca</span>
        <lui-shortcut keys="Ctrl,K"></lui-shortcut>
      </li>
      <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 6px; background: #f5f5f5;">
        <span style="font-size: 14px;">Desfazer</span>
        <lui-shortcut keys="Ctrl,Z"></lui-shortcut>
      </li>
      <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 6px; background: #f5f5f5;">
        <span style="font-size: 14px;">Paleta de comandos</span>
        <lui-shortcut keys="Ctrl,Shift,P"></lui-shortcut>
      </li>
    </ul>
  </div>
`;
