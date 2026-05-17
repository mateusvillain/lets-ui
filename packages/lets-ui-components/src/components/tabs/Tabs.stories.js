import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Navigation/Tabs',
  parameters: {
    docs: {
      description: {
        component:
          'Componente de navegação por abas. Suporta dois estilos visuais — Line (indicador de linha) e Card (segmento fechado) — e a prop expand para ocupar a largura total do contêiner. Acessível com navegação por teclado (← → Home End).',
      },
    },
  },
};

export const Line = () => `
  <lui-tabs variant="line" style="width: 480px;">
    <lui-tab label="Visão geral" active><p>Conteúdo da aba Visão geral.</p></lui-tab>
    <lui-tab label="Configurações"><p>Conteúdo da aba Configurações.</p></lui-tab>
    <lui-tab label="Histórico"><p>Conteúdo da aba Histórico.</p></lui-tab>
  </lui-tabs>
`;

export const Card = () => `
  <lui-tabs variant="card">
    <lui-tab label="Dia" active><p>Conteúdo da aba Dia.</p></lui-tab>
    <lui-tab label="Semana"><p>Conteúdo da aba Semana.</p></lui-tab>
    <lui-tab label="Mês"><p>Conteúdo da aba Mês.</p></lui-tab>
  </lui-tabs>
`;

export const LineExpand = () => `
  <lui-tabs variant="line" expand style="width: 480px;">
    <lui-tab label="Visão geral" active><p>Conteúdo da aba Visão geral.</p></lui-tab>
    <lui-tab label="Configurações"><p>Conteúdo da aba Configurações.</p></lui-tab>
    <lui-tab label="Histórico"><p>Conteúdo da aba Histórico.</p></lui-tab>
  </lui-tabs>
`;
LineExpand.storyName = 'Line — expand';

export const CardExpand = () => `
  <lui-tabs variant="card" expand style="width: 480px;">
    <lui-tab label="Dia" active><p>Conteúdo da aba Dia.</p></lui-tab>
    <lui-tab label="Semana"><p>Conteúdo da aba Semana.</p></lui-tab>
    <lui-tab label="Mês"><p>Conteúdo da aba Mês.</p></lui-tab>
  </lui-tabs>
`;
CardExpand.storyName = 'Card — expand';

export const WithDisabledTab = () => `
  <lui-tabs variant="line" style="width: 480px;">
    <lui-tab label="Ativo" active><p>Aba ativa.</p></lui-tab>
    <lui-tab label="Normal"><p>Aba normal.</p></lui-tab>
    <lui-tab label="Desabilitado" disabled><p>Aba desabilitada.</p></lui-tab>
  </lui-tabs>
`;
WithDisabledTab.storyName = 'Com aba desabilitada';
