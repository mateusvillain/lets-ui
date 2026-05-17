import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Navigation/Tabs',
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'card'],
    },
    expand: { control: 'boolean' },
  },
};

const Template = ({ variant, expand }) => `
  <lui-tabs variant="${variant}"${expand ? ' expand' : ''} style="width: 480px;">
    <lui-tab label="Visão geral" active><p>Conteúdo da aba Visão geral.</p></lui-tab>
    <lui-tab label="Configurações"><p>Conteúdo da aba Configurações.</p></lui-tab>
    <lui-tab label="Histórico"><p>Conteúdo da aba Histórico.</p></lui-tab>
  </lui-tabs>
`;

export const Default = Template.bind({});
Default.args = {
  variant: 'line',
  expand: false,
};

export const Line = () => `
  <lui-tabs variant="line" style="width: 480px;">
    <lui-tab label="Visão geral" active><p>Conteúdo da aba Visão geral.</p></lui-tab>
    <lui-tab label="Configurações"><p>Conteúdo da aba Configurações.</p></lui-tab>
    <lui-tab label="Histórico"><p>Conteúdo da aba Histórico.</p></lui-tab>
  </lui-tabs>
`;
Line.parameters = { controls: { disable: true } };

export const Card = () => `
  <lui-tabs variant="card">
    <lui-tab label="Dia" active><p>Conteúdo da aba Dia.</p></lui-tab>
    <lui-tab label="Semana"><p>Conteúdo da aba Semana.</p></lui-tab>
    <lui-tab label="Mês"><p>Conteúdo da aba Mês.</p></lui-tab>
  </lui-tabs>
`;
Card.parameters = { controls: { disable: true } };

export const LineExpand = () => `
  <lui-tabs variant="line" expand style="width: 480px;">
    <lui-tab label="Visão geral" active><p>Conteúdo da aba Visão geral.</p></lui-tab>
    <lui-tab label="Configurações"><p>Conteúdo da aba Configurações.</p></lui-tab>
    <lui-tab label="Histórico"><p>Conteúdo da aba Histórico.</p></lui-tab>
  </lui-tabs>
`;
LineExpand.storyName = 'Line — expand';
LineExpand.parameters = { controls: { disable: true } };

export const CardExpand = () => `
  <lui-tabs variant="card" expand style="width: 480px;">
    <lui-tab label="Dia" active><p>Conteúdo da aba Dia.</p></lui-tab>
    <lui-tab label="Semana"><p>Conteúdo da aba Semana.</p></lui-tab>
    <lui-tab label="Mês"><p>Conteúdo da aba Mês.</p></lui-tab>
  </lui-tabs>
`;
CardExpand.storyName = 'Card — expand';
CardExpand.parameters = { controls: { disable: true } };

export const WithDisabledTab = () => `
  <lui-tabs variant="line" style="width: 480px;">
    <lui-tab label="Ativo" active><p>Aba ativa.</p></lui-tab>
    <lui-tab label="Normal"><p>Aba normal.</p></lui-tab>
    <lui-tab label="Desabilitado" disabled><p>Aba desabilitada.</p></lui-tab>
  </lui-tabs>
`;
WithDisabledTab.storyName = 'Com aba desabilitada';
WithDisabledTab.parameters = { controls: { disable: true } };
