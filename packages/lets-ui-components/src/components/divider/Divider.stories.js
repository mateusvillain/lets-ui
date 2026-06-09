import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Divider',
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    label: { control: 'text' },
  },
};

const Template = ({ orientation, label }) => `
  <div style="display: flex; align-items: stretch; height: 80px; gap: 16px; padding: 0 16px; background: white; border-radius: 8px;">
    <span>Acima</span>
    <lui-divider label="${label}" orientation="${orientation}"></lui-divider>
    <span>Abaixo</span>
  </div>
`;

export const Divider = Template.bind({});
Divider.args = {
  orientation: 'horizontal',
  label: 'ou',
};

export const Default = () => `
  <div style="width: 320px; padding: 16px; background: white; border-radius: 8px;">
    <p style="margin: 0 0 16px;">Seção acima</p>
    <lui-divider></lui-divider>
    <p style="margin: 16px 0 0;">Seção abaixo</p>
  </div>
`;

export const WithLabel = () => `
  <div style="width: 320px; padding: 16px; background: white; border-radius: 8px;">
    <p style="margin: 0 0 16px;">Conteúdo acima</p>
    <lui-divider label="ou"></lui-divider>
    <p style="margin: 16px 0 0;">Conteúdo abaixo</p>
  </div>
`;

export const Vertical = () => `
  <div style="display: flex; align-items: stretch; height: 48px; gap: 16px; padding: 0 16px; background: white; border-radius: 8px;">
    <span>Esquerda</span>
    <lui-divider orientation="vertical"></lui-divider>
    <span>Direita</span>
  </div>
`;

export const VerticalWithLabel = () => `
  <div style="display: flex; align-items: stretch; height: 80px; gap: 16px; padding: 0 16px; background: white; border-radius: 8px;">
    <span>Acima</span>
    <lui-divider label="ou" orientation="vertical"></lui-divider>
    <span>Abaixo</span>
  </div>
`;

export const CSSClass = () => `
  <div style="padding: 16px; background: white; border-radius: 8px; width: 320px;">
    <p style="margin: 0 0 16px;">Seção acima</p>
    <hr class="divider">
    <p style="margin: 16px 0 8px;">Com label:</p>
    <div class="divider divider--labeled">
      <span class="divider__label">ou</span>
    </div>
    <p style="margin: 8px 0 0;">Seção abaixo</p>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
