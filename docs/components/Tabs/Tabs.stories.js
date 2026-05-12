import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

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
  <div class="tabs tabs--line" style="width: 480px;">
    <div class="tabs__list" role="tablist" aria-label="Seções">
      <button class="tab" role="tab" type="button" aria-selected="true" aria-controls="line-panel-0" id="line-tab-0" tabindex="0">Visão geral</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="line-panel-1" id="line-tab-1" tabindex="-1">Configurações</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="line-panel-2" id="line-tab-2" tabindex="-1">Histórico</button>
    </div>
    <div id="line-panel-0" class="tabs__panel" role="tabpanel" aria-labelledby="line-tab-0">
      <p>Conteúdo da aba Visão geral.</p>
    </div>
    <div id="line-panel-1" class="tabs__panel" role="tabpanel" aria-labelledby="line-tab-1" hidden>
      <p>Conteúdo da aba Configurações.</p>
    </div>
    <div id="line-panel-2" class="tabs__panel" role="tabpanel" aria-labelledby="line-tab-2" hidden>
      <p>Conteúdo da aba Histórico.</p>
    </div>
  </div>
`;

export const Card = () => `
  <div class="tabs tabs--card">
    <div class="tabs__list" role="tablist" aria-label="Seções">
      <button class="tab" role="tab" type="button" aria-selected="true" aria-controls="card-panel-0" id="card-tab-0" tabindex="0">Dia</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="card-panel-1" id="card-tab-1" tabindex="-1">Semana</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="card-panel-2" id="card-tab-2" tabindex="-1">Mês</button>
    </div>
    <div id="card-panel-0" class="tabs__panel" role="tabpanel" aria-labelledby="card-tab-0">
      <p>Conteúdo da aba Dia.</p>
    </div>
    <div id="card-panel-1" class="tabs__panel" role="tabpanel" aria-labelledby="card-tab-1" hidden>
      <p>Conteúdo da aba Semana.</p>
    </div>
    <div id="card-panel-2" class="tabs__panel" role="tabpanel" aria-labelledby="card-tab-2" hidden>
      <p>Conteúdo da aba Mês.</p>
    </div>
  </div>
`;

export const LineExpand = () => `
  <div class="tabs tabs--line" style="width: 480px;">
    <div class="tabs__list tabs__list--expand" role="tablist" aria-label="Seções">
      <button class="tab" role="tab" type="button" aria-selected="true" aria-controls="line-exp-panel-0" id="line-exp-tab-0" tabindex="0">Visão geral</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="line-exp-panel-1" id="line-exp-tab-1" tabindex="-1">Configurações</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="line-exp-panel-2" id="line-exp-tab-2" tabindex="-1">Histórico</button>
    </div>
    <div id="line-exp-panel-0" class="tabs__panel" role="tabpanel" aria-labelledby="line-exp-tab-0">
      <p>Conteúdo da aba Visão geral.</p>
    </div>
    <div id="line-exp-panel-1" class="tabs__panel" role="tabpanel" aria-labelledby="line-exp-tab-1" hidden>
      <p>Conteúdo da aba Configurações.</p>
    </div>
    <div id="line-exp-panel-2" class="tabs__panel" role="tabpanel" aria-labelledby="line-exp-tab-2" hidden>
      <p>Conteúdo da aba Histórico.</p>
    </div>
  </div>
`;
LineExpand.storyName = 'Line — expand';

export const CardExpand = () => `
  <div class="tabs tabs--card" style="width: 480px;">
    <div class="tabs__list tabs__list--expand" role="tablist" aria-label="Período">
      <button class="tab" role="tab" type="button" aria-selected="true" aria-controls="card-exp-panel-0" id="card-exp-tab-0" tabindex="0">Dia</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="card-exp-panel-1" id="card-exp-tab-1" tabindex="-1">Semana</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="card-exp-panel-2" id="card-exp-tab-2" tabindex="-1">Mês</button>
    </div>
    <div id="card-exp-panel-0" class="tabs__panel" role="tabpanel" aria-labelledby="card-exp-tab-0">
      <p>Conteúdo da aba Dia.</p>
    </div>
    <div id="card-exp-panel-1" class="tabs__panel" role="tabpanel" aria-labelledby="card-exp-tab-1" hidden>
      <p>Conteúdo da aba Semana.</p>
    </div>
    <div id="card-exp-panel-2" class="tabs__panel" role="tabpanel" aria-labelledby="card-exp-tab-2" hidden>
      <p>Conteúdo da aba Mês.</p>
    </div>
  </div>
`;
CardExpand.storyName = 'Card — expand';

export const WithDisabledTab = () => `
  <div class="tabs tabs--line" style="width: 480px;">
    <div class="tabs__list" role="tablist" aria-label="Seções">
      <button class="tab" role="tab" type="button" aria-selected="true" aria-controls="dis-panel-0" id="dis-tab-0" tabindex="0">Ativo</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="dis-panel-1" id="dis-tab-1" tabindex="-1">Normal</button>
      <button class="tab" role="tab" type="button" aria-selected="false" aria-controls="dis-panel-2" id="dis-tab-2" tabindex="-1" disabled aria-disabled="true">Desabilitado</button>
    </div>
    <div id="dis-panel-0" class="tabs__panel" role="tabpanel" aria-labelledby="dis-tab-0">
      <p>Aba ativa.</p>
    </div>
    <div id="dis-panel-1" class="tabs__panel" role="tabpanel" aria-labelledby="dis-tab-1" hidden>
      <p>Aba normal.</p>
    </div>
    <div id="dis-panel-2" class="tabs__panel" role="tabpanel" aria-labelledby="dis-tab-2" hidden>
      <p>Aba desabilitada.</p>
    </div>
  </div>
`;
WithDisabledTab.storyName = 'Com aba desabilitada';
