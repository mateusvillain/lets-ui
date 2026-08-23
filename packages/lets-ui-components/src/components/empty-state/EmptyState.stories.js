import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

// Ilustração decorativa da capa: caixa vazia com folhas escapando.
// Fica inline (em vez de um arquivo estático) para herdar os tokens de cor e
// acompanhar o tema claro/escuro sem precisar de dois assets.
const cover = `
  <svg slot="cover" width="240" height="180" viewBox="0 0 240 180" fill="none" aria-hidden="true">
    <ellipse cx="120" cy="166" rx="70" ry="8" fill="var(--lui-color-neutral-background-container, #c7cad4)" opacity="0.5" />

    <g transform="rotate(-13 84 44)">
      <rect x="62" y="12" width="46" height="62" rx="7" fill="var(--lui-color-neutral-background-surface, #ffffff)" stroke="var(--lui-color-neutral-border-default, #6c7081)" stroke-width="2.5" />
      <path d="M72 30h26M72 42h26M72 54h15" stroke="var(--lui-color-neutral-background-container, #c7cad4)" stroke-width="3" stroke-linecap="round" />
    </g>

    <g transform="rotate(13 158 40)">
      <rect x="136" y="8" width="46" height="62" rx="7" fill="var(--lui-color-neutral-background-surface, #ffffff)" stroke="var(--lui-color-neutral-border-default, #6c7081)" stroke-width="2.5" />
      <path d="M146 26h26M146 38h26M146 50h15" stroke="var(--lui-color-neutral-background-container, #c7cad4)" stroke-width="3" stroke-linecap="round" />
    </g>

    <g stroke="var(--lui-color-primary-icon-default, #339bf0)" stroke-width="2.5" stroke-linecap="round">
      <path d="M40 60v12M34 66h12" />
      <path d="M204 74v10M199 79h10" />
    </g>
    <circle cx="30" cy="102" r="3" fill="var(--lui-color-neutral-background-container, #c7cad4)" />
    <circle cx="212" cy="104" r="3" fill="var(--lui-color-neutral-background-container, #c7cad4)" />

    <g fill="var(--lui-color-neutral-background-container, #c7cad4)" stroke="var(--lui-color-neutral-border-default, #6c7081)" stroke-width="2.5" stroke-linejoin="round">
      <path d="M62 114 32 102l8-16 28 14z" />
      <path d="M178 114l30-12-8-16-28 14z" />
      <path d="M60 112h120l-10 44a6 6 0 0 1-6 5H76a6 6 0 0 1-6-5z" />
    </g>
    <path d="M60 112h120" stroke="var(--lui-color-neutral-border-default, #6c7081)" stroke-width="2.5" stroke-linecap="round" />
  </svg>
`;

export default {
  title: 'Content/Empty State',
  argTypes: {
    align: {
      control: { type: 'select' },
      options: ['center', 'left'],
      table: { defaultValue: { summary: 'center' } },
    },
    title: { control: 'text' },
    titleLevel: {
      control: { type: 'select' },
      options: ['1', '2', '3', '4', '5', '6'],
      name: 'title-level',
      table: { defaultValue: { summary: '2' } },
    },
    description: { control: 'text' },
    announce: {
      control: { type: 'select' },
      options: ['off', 'polite', 'assertive'],
      table: { defaultValue: { summary: 'off' } },
    },
    actionsLabel: { control: 'text', name: 'actions-label' },
    showCover: { control: 'boolean', name: 'Cover (demo)' },
    showActions: { control: 'boolean', name: 'Actions (demo)' },
  },
};

const Template = ({
  align,
  title,
  titleLevel,
  description,
  announce,
  actionsLabel,
  showCover,
  showActions,
}) => `
  <lui-empty-state
    align="${align ?? 'center'}"
    title="${title ?? ''}"
    title-level="${titleLevel ?? '2'}"
    description="${description ?? ''}"
    announce="${announce ?? 'off'}"
    ${actionsLabel ? `actions-label="${actionsLabel}"` : ''}
  >
    ${showCover ? cover : ''}
    ${
      showActions
        ? `<button slot="actions" class="btn btn--secondary btn--lg">Learn more</button>
           <button slot="actions" class="btn btn--primary btn--lg">Create project</button>`
        : ''
    }
  </lui-empty-state>
`;

const baseArgs = {
  align: 'center',
  title: 'No projects yet',
  titleLevel: '2',
  description: 'Create your first project to start organizing your work.',
  announce: 'off',
  actionsLabel: 'Empty state actions',
  showCover: true,
  showActions: true,
};

export const EmptyState = Template.bind({});
EmptyState.args = { ...baseArgs };

export const AlignCenter = Template.bind({});
AlignCenter.storyName = 'Center alignment';
AlignCenter.args = { ...baseArgs, align: 'center' };

export const AlignLeft = Template.bind({});
AlignLeft.storyName = 'Left alignment';
AlignLeft.args = { ...baseArgs, align: 'left' };

export const WithoutCover = Template.bind({});
WithoutCover.storyName = 'Without cover';
WithoutCover.args = { ...baseArgs, showCover: false };

export const WithoutActions = Template.bind({});
WithoutActions.storyName = 'Without actions';
WithoutActions.args = { ...baseArgs, showActions: false };

export const TitleOnly = Template.bind({});
TitleOnly.storyName = 'Title only';
TitleOnly.args = {
  ...baseArgs,
  description: '',
  showCover: false,
  showActions: false,
};

export const NoSearchResults = () => `
  <lui-empty-state
    align="center"
    title="Nenhum resultado para “relatório financeiro”"
    description="Tente termos mais genéricos ou remova os filtros ativos."
    announce="polite"
  >
    <button slot="actions" class="btn btn--secondary btn--lg">Limpar filtros</button>
  </lui-empty-state>
`;
NoSearchResults.storyName = 'Sem resultados (announce="polite")';
NoSearchResults.parameters = { controls: { disable: true } };

export const SystemError = () => `
  <lui-empty-state
    align="center"
    title="Não foi possível carregar os dados"
    description="A conexão com o serviço falhou. Verifique sua rede e tente novamente."
    announce="assertive"
  >
    <button slot="actions" class="btn btn--primary btn--lg">Tentar de novo</button>
  </lui-empty-state>
`;
SystemError.storyName = 'Erro de sistema (announce="assertive")';
SystemError.parameters = { controls: { disable: true } };

export const WithSuggestions = () => `
  <lui-empty-state
    align="left"
    title="Nenhum item corresponde aos filtros"
    description="Ajuste a busca a partir de uma destas sugestões:"
  >
    <ul class="body--lg" style="margin: 0; padding-inline-start: 20px;">
      <li>Remova um ou mais filtros ativos.</li>
      <li>Use palavras-chave mais curtas.</li>
      <li>Verifique a grafia dos termos.</li>
    </ul>
    <button slot="actions" class="btn btn--secondary btn--lg">Limpar filtros</button>
  </lui-empty-state>
`;
WithSuggestions.storyName = 'Com lista de sugestões (slot padrão)';
WithSuggestions.parameters = { controls: { disable: true } };

export const CSSClass = () => `
  <div class="empty-state empty-state--align-center">
    <div class="empty-state__cover" aria-hidden="true">
      ${cover.replace('slot="cover" ', '')}
    </div>
    <div class="empty-state__text">
      <h2 class="empty-state__title">No projects yet</h2>
      <p class="empty-state__description">Create your first project to start organizing your work.</p>
    </div>
    <div class="empty-state__actions" role="group" aria-label="Empty state actions">
      <button class="btn btn--secondary btn--lg">Learn more</button>
      <button class="btn btn--primary btn--lg">Create project</button>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = { controls: { disable: true } };
