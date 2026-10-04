import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

const CLOUD = `<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 8.6 4.7 4.7 0 0 1 16.5 18H7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

export default {
  title: 'Content/Accordion',
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'highlighted'],
    },
    multiple: { control: 'boolean' },
    headingLevel: { control: { type: 'number', min: 1, max: 6 } },
  },
};

const items = ({ withIcon = true } = {}) => `
  <lui-accordion-item label="Accordion title" subtitle="A short subtitle" open>
    ${withIcon ? CLOUD : ''}
    Description
  </lui-accordion-item>
  <lui-accordion-item label="Accordion title" subtitle="A short subtitle">
    ${withIcon ? CLOUD : ''}
    Description
  </lui-accordion-item>
  <lui-accordion-item label="Accordion title" subtitle="A short subtitle">
    ${withIcon ? CLOUD : ''}
    Description
  </lui-accordion-item>
`;

const Template = ({ variant, multiple, headingLevel }) => `
  <lui-accordion
    variant="${variant}"
    ${multiple ? 'multiple' : ''}
    heading-level="${headingLevel}"
    style="max-width: 560px;"
  >
    ${items()}
  </lui-accordion>
`;

export const Default = Template.bind({});
Default.args = {
  variant: 'default',
  multiple: false,
  headingLevel: 3,
};

export const SingleOpen = () => `
  <lui-accordion style="max-width: 560px;">
    <lui-accordion-item label="Shipping" open>
      Abrir outro item fecha este.
    </lui-accordion-item>
    <lui-accordion-item label="Returns">
      Só um item fica aberto por vez.
    </lui-accordion-item>
    <lui-accordion-item label="Warranty">
      É o comportamento padrão.
    </lui-accordion-item>
  </lui-accordion>
`;
SingleOpen.storyName = 'Um aberto por vez';
SingleOpen.parameters = { controls: { disable: true } };

export const Multiple = () => `
  <lui-accordion multiple style="max-width: 560px;">
    <lui-accordion-item label="Shipping" open>
      Vários itens podem ficar abertos ao mesmo tempo.
    </lui-accordion-item>
    <lui-accordion-item label="Returns" open>
      Use o atributo <code>multiple</code>.
    </lui-accordion-item>
    <lui-accordion-item label="Warranty">
      Este começa fechado.
    </lui-accordion-item>
  </lui-accordion>
`;
Multiple.storyName = 'Múltiplos abertos';
Multiple.parameters = { controls: { disable: true } };

export const Bordered = () => `
  <lui-accordion variant="bordered" style="max-width: 560px;">
    ${items()}
  </lui-accordion>
`;
Bordered.storyName = 'Variante bordered';
Bordered.parameters = { controls: { disable: true } };

export const Highlighted = () => `
  <lui-accordion variant="highlighted" style="max-width: 560px;">
    ${items()}
  </lui-accordion>
`;
Highlighted.storyName = 'Variante highlighted';
Highlighted.parameters = { controls: { disable: true } };

export const DefaultOpen = () => `
  <lui-accordion multiple style="max-width: 560px;">
    <lui-accordion-item label="Aberto por padrão" subtitle="Atributo open" open>
      O atributo <code>open</code> define o estado inicial.
    </lui-accordion-item>
    <lui-accordion-item label="Fechado por padrão">
      Sem o atributo, o item começa fechado.
    </lui-accordion-item>
  </lui-accordion>
`;
DefaultOpen.storyName = 'Item aberto por padrão';
DefaultOpen.parameters = { controls: { disable: true } };

export const Disabled = () => `
  <lui-accordion style="max-width: 560px;">
    <lui-accordion-item label="Disponível">
      Este item alterna normalmente.
    </lui-accordion-item>
    <lui-accordion-item label="Desabilitado" subtitle="Não responde ao clique" disabled>
      Não pode ser aberto.
    </lui-accordion-item>
  </lui-accordion>
`;
Disabled.storyName = 'Item desabilitado';
Disabled.parameters = { controls: { disable: true } };

export const WithoutIcon = () => `
  <lui-accordion style="max-width: 560px;">
    ${items({ withIcon: false })}
  </lui-accordion>
`;
WithoutIcon.storyName = 'Sem ícone';
WithoutIcon.parameters = { controls: { disable: true } };

export const WithoutSubtitle = () => `
  <lui-accordion style="max-width: 560px;">
    <lui-accordion-item label="Só título" open>${CLOUD}Description</lui-accordion-item>
    <lui-accordion-item label="Só título">${CLOUD}Description</lui-accordion-item>
  </lui-accordion>
`;
WithoutSubtitle.storyName = 'Sem subtítulo';
WithoutSubtitle.parameters = { controls: { disable: true } };

export const RichDescription = () => `
  <lui-accordion style="max-width: 560px;">
    <lui-accordion-item label="Conteúdo livre" open>
      <p style="margin: 0 0 8px;">A área de descrição é um slot: aceita qualquer conteúdo.</p>
      <a href="#">Um link focável</a>
    </lui-accordion-item>
    <lui-accordion-item label="Outro item">
      <button type="button">Botão no painel</button>
    </lui-accordion-item>
  </lui-accordion>
`;
RichDescription.storyName = 'Slot de descrição';
RichDescription.parameters = { controls: { disable: true } };

export const ToggleEvent = () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'display: flex; flex-direction: column; gap: 16px; max-width: 560px;';
  wrapper.innerHTML = `
    <lui-accordion multiple>
      <lui-accordion-item label="Primeiro">Conteúdo do primeiro item.</lui-accordion-item>
      <lui-accordion-item label="Segundo">Conteúdo do segundo item.</lui-accordion-item>
    </lui-accordion>
    <p>Último evento: <output>nenhum</output></p>
  `;
  const output = wrapper.querySelector('output');
  wrapper.addEventListener('lui-toggle', (e) => {
    output.textContent = `${e.target.getAttribute('label')} → open: ${e.detail.open}`;
  });
  return wrapper;
};
ToggleEvent.storyName = 'Evento lui-toggle';
ToggleEvent.parameters = { controls: { disable: true } };

const CHEVRON = `<svg class="accordion__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const cssItem = (id, open) => `
  <div class="accordion__item${open ? ' accordion__item--open' : ''}">
    <div class="accordion__heading" role="heading" aria-level="3">
      <button
        id="${id}-trigger"
        class="accordion__trigger"
        type="button"
        aria-expanded="${open}"
        aria-controls="${id}-panel"
      >
        <span class="accordion__text">
          <span class="accordion__title">Accordion title</span>
          <span class="accordion__subtitle">A short subtitle</span>
        </span>
        ${CHEVRON}
      </button>
    </div>
    <div id="${id}-panel" class="accordion__panel" role="region" aria-labelledby="${id}-trigger">
      <div class="accordion__panel-inner">
        <div class="accordion__description">Description</div>
      </div>
    </div>
  </div>
`;

export const CSSClass = () => `
  <div class="accordion accordion--bordered" style="max-width: 560px;">
    ${cssItem('css-accordion-1', true)}
    ${cssItem('css-accordion-2', false)}
  </div>
`;
CSSClass.storyName = 'Classe CSS';
CSSClass.parameters = { controls: { disable: true } };
