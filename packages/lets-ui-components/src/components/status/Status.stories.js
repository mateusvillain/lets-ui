import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

const row = (content) =>
  `<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 24px;">${content}</div>`;

const column = (content) =>
  `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 16px;">${content}</div>`;

export default {
  title: 'Content/Status',
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'success',
        'caution',
        'danger',
        'info',
        'online',
        'away',
        'busy',
        'offline',
      ],
    },
    label: { control: 'text' },
    description: { control: 'text' },
    size: { control: 'select', options: ['md', 'lg'] },
    dot: { control: 'boolean' },
    pulse: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
  },
};

const Template = ({
  variant,
  label,
  description,
  size,
  dot,
  pulse,
  hideLabel,
}) => `
  <lui-status
    variant="${variant}"
    size="${size}"
    ${label ? `label="${label}"` : ''}
    ${description ? `description="${description}"` : ''}
    ${dot ? 'dot' : ''}
    ${pulse ? 'pulse' : ''}
    ${hideLabel ? 'hide-label' : ''}
  ></lui-status>
`;

export const Default = Template.bind({});
Default.args = {
  variant: 'success',
  label: 'Status',
  description: 'Description',
  size: 'md',
  dot: false,
  pulse: false,
  hideLabel: false,
};

export const Feedback = () =>
  column(
    row(`
      <lui-status variant="success" label="Pagamento aprovado"></lui-status>
      <lui-status variant="caution" label="Aguardando revisão"></lui-status>
      <lui-status variant="danger" label="Falha no envio"></lui-status>
      <lui-status variant="info" label="Em processamento"></lui-status>
    `) +
      row(`
      <lui-status variant="success" dot label="Pagamento aprovado"></lui-status>
      <lui-status variant="caution" dot label="Aguardando revisão"></lui-status>
      <lui-status variant="danger" dot label="Falha no envio"></lui-status>
      <lui-status variant="info" dot label="Em processamento"></lui-status>
    `)
  );
Feedback.storyName = 'Feedback';
Feedback.parameters = { controls: { disable: true } };

export const Social = () =>
  row(`
    <lui-status variant="online" label="Online"></lui-status>
    <lui-status variant="away" label="Ausente"></lui-status>
    <lui-status variant="busy" label="Ocupado"></lui-status>
    <lui-status variant="offline" label="Offline"></lui-status>
  `);
Social.storyName = 'Social';
Social.parameters = { controls: { disable: true } };

export const Sizes = () =>
  column(
    ['md', 'lg']
      .map((size) =>
        row(`
      <lui-status size="${size}" variant="success" label="Pagamento aprovado" description="Há 2 minutos"></lui-status>
      <lui-status size="${size}" variant="danger" dot label="Falha no envio" description="Há 5 minutos"></lui-status>
      <lui-status size="${size}" variant="busy" label="Mateus Villain" description="Em reunião até 15h"></lui-status>
    `)
      )
      .join('')
  );
Sizes.storyName = 'Tamanhos';
Sizes.parameters = { controls: { disable: true } };

export const IndicatorOnly = () =>
  column(
    row(`
      <lui-status variant="success"></lui-status>
      <lui-status variant="caution"></lui-status>
      <lui-status variant="danger"></lui-status>
      <lui-status variant="info"></lui-status>
    `) +
      row(`
      <lui-status variant="success" dot></lui-status>
      <lui-status variant="caution" dot></lui-status>
      <lui-status variant="danger" dot></lui-status>
      <lui-status variant="info" dot></lui-status>
    `) +
      row(`
      <lui-status variant="online"></lui-status>
      <lui-status variant="away"></lui-status>
      <lui-status variant="busy"></lui-status>
      <lui-status variant="offline"></lui-status>
    `)
  );
IndicatorOnly.storyName = 'Só o indicador';
IndicatorOnly.parameters = { controls: { disable: true } };

export const WithDescription = () =>
  column(`
    <lui-status variant="success" label="Backup concluído" description="Há 5 minutos"></lui-status>
    <lui-status variant="danger" label="Sincronização falhou" description="Verifique a conexão e tente de novo"></lui-status>
    <lui-status variant="busy" label="Mateus Villain" description="Em reunião até 15h"></lui-status>
  `);
WithDescription.storyName = 'Com descrição';
WithDescription.parameters = { controls: { disable: true } };

export const HiddenLabel = () =>
  row(`
    <lui-status variant="online" label="Disponível" hide-label></lui-status>
    <lui-status variant="busy" label="Em reunião" hide-label></lui-status>
    <lui-status variant="danger" dot label="Serviço fora do ar" hide-label></lui-status>
  `);
HiddenLabel.storyName = 'Rótulo só para leitor de tela';
HiddenLabel.parameters = { controls: { disable: true } };

export const Pulse = () =>
  row(`
    <lui-status variant="online" pulse label="Ao vivo"></lui-status>
    <lui-status variant="danger" dot pulse label="Gravando"></lui-status>
    <lui-status variant="info" pulse label="Sincronizando"></lui-status>
  `);
Pulse.storyName = 'Pulso';
Pulse.parameters = { controls: { disable: true } };

export const WithAvatar = () =>
  row(`
    <lui-avatar name="Mateus Villain" status="online"></lui-avatar>
    <lui-avatar name="Mateus Villain" status="away"></lui-avatar>
    <lui-avatar name="Mateus Villain" status="busy"></lui-avatar>
    <lui-avatar name="Mateus Villain" status="offline"></lui-avatar>
  `);
WithAvatar.storyName = 'No Avatar';
WithAvatar.parameters = { controls: { disable: true } };

export const InTable = () => `
  <table class="table" style="max-inline-size: 480px;">
    <thead>
      <tr><th scope="col">Serviço</th><th scope="col">Status</th></tr>
    </thead>
    <tbody>
      <tr><td>API</td><td><lui-status variant="success" dot label="Operacional"></lui-status></td></tr>
      <tr><td>Fila de e-mails</td><td><lui-status variant="caution" dot label="Lenta"></lui-status></td></tr>
      <tr><td>Pagamentos</td><td><lui-status variant="danger" dot pulse label="Fora do ar"></lui-status></td></tr>
    </tbody>
  </table>
`;
InTable.storyName = 'Em tabela';
InTable.parameters = { controls: { disable: true } };

export const CSSClass = () =>
  column(`
    <span class="status status--success">
      <span class="status__indicator" aria-hidden="true"><span class="status__dot"></span></span>
      <span class="status__text">
        <span class="status__label">Pagamento aprovado</span>
        <span class="status__description">Há 2 minutos</span>
      </span>
    </span>
    <span class="status status--busy">
      <span class="status__indicator" aria-hidden="true"><span class="status__dot"></span></span>
      <span class="status__text"><span class="status__label">Ocupado</span></span>
    </span>
    <span class="status status--online status--pulse">
      <span class="status__indicator" aria-hidden="true"><span class="status__dot"></span></span>
      <span class="status__label status__label--hidden">Online</span>
    </span>
  `);
CSSClass.storyName = 'Classe CSS';
CSSClass.parameters = { controls: { disable: true } };
