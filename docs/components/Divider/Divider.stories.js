import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Miscellaneous/Divider',
  argTypes: {
    orientation: {
      control: {
        type: 'select',
      },
      options: ['horizontal', 'vertical'],
    },
    label: {
      control: 'text',
    },
  },
};

const Template = ({ orientation, label }) => {
  return `
    <div style="display: flex; align-items: stretch; height: 80px; gap: 16px; padding: 0 16px; background: white; border-radius: 8px;">
    <span>Acima</span>
    <div class="divider divider--labeled divider--${orientation}" role="separator" aria-label="${label}">
      <span class="divider__label">${label}</span>
    </div>
    <span>Abaixo</span>
  </div>
  `;
};

export const Divider = Template.bind({});
Divider.args = {
  orientation: 'horizontal',
  label: 'ou',
};

export const Default = () => `
  <div style="width: 320px; padding: 16px; background: white; border-radius: 8px;">
    <p style="margin: 0 0 16px;">Seção acima</p>
    <div class="divider" role="separator"></div>
    <p style="margin: 16px 0 0;">Seção abaixo</p>
  </div>
`;

export const WithLabel = () => `
  <div style="width: 320px; padding: 16px; background: white; border-radius: 8px;">
    <p style="margin: 0 0 16px;">Conteúdo acima</p>
    <div class="divider divider--labeled" role="separator" aria-label="ou">
      <span class="divider__label">ou</span>
    </div>
    <p style="margin: 16px 0 0;">Conteúdo abaixo</p>
  </div>
`;

export const Vertical = () => `
  <div style="display: flex; align-items: stretch; height: 48px; gap: 16px; padding: 0 16px; background: white; border-radius: 8px;">
    <span>Esquerda</span>
    <div class="divider divider--vertical" role="separator"></div>
    <span>Direita</span>
  </div>
`;

export const VerticalWithLabel = () => `
  <div style="display: flex; align-items: stretch; height: 80px; gap: 16px; padding: 0 16px; background: white; border-radius: 8px;">
    <span>Acima</span>
    <div class="divider divider--labeled divider--vertical" role="separator" aria-label="ou">
      <span class="divider__label">ou</span>
    </div>
    <span>Abaixo</span>
  </div>
`;
