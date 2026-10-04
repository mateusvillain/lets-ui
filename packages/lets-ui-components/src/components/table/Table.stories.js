import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Content/Table',
  argTypes: {
    bordered: {
      control: 'boolean',
      description: 'Borda externa com cantos arredondados.',
    },
    label: {
      control: 'text',
      description:
        'Nome da região rolável. Sem ele, usa o nome da tabela. Só tem efeito quando a tabela transborda.',
    },
    ariaLabel: {
      control: 'text',
      description:
        'aria-label do <table>. Nome acessível quando não há título visível.',
    },
    caption: {
      control: 'text',
      description:
        'Texto do <caption>. Use com título visível; quando preenchido, o aria-label não é aplicado.',
    },
  },
};

const MORE = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>`;

const ROWS = [
  { name: 'Ana Souza', status: 'Completed', variant: 'success' },
  { name: 'Bruno Lima', status: 'In Progress', variant: 'caution' },
  { name: 'Carla Dias', status: 'Canceled', variant: 'danger' },
];

const tag = ({ status, variant }) =>
  `<lui-tag label="${status}" variant="${variant}" size="sm"></lui-tag>`;

// `aria-label` e `<caption>` não andam juntos: com caption, ele nomeia a tabela.
const tableName = ({ ariaLabel, caption }) =>
  caption
    ? { attrs: '', caption: `<caption>${caption}</caption>` }
    : { attrs: ariaLabel ? `aria-label="${ariaLabel}"` : '', caption: '' };

const Template = ({ bordered, label, ariaLabel, caption }) => {
  const name = tableName({ ariaLabel, caption });
  return `
  <lui-table ${bordered ? 'bordered' : ''} ${label ? `label="${label}"` : ''}>
    <table ${name.attrs}>
      ${name.caption}
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${ROWS.map(
          (row) => `<tr>
          <th scope="row">${row.name}</th>
          <td>${tag(row)}</td>
          <td>
            <lui-icon-button size="md" aria-label="Actions for ${row.name}">${MORE}</lui-icon-button>
          </td>
        </tr>`
        ).join('')}
      </tbody>
    </table>
  </lui-table>
`;
};

export const Default = Template.bind({});
Default.args = { bordered: false, label: '', ariaLabel: 'Orders', caption: '' };

export const Bordered = Template.bind({});
Bordered.args = { bordered: true, label: '', ariaLabel: 'Orders', caption: '' };

export const WithCaption = () => `
  <lui-table bordered>
    <table>
      <caption>Orders</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">Ana Souza</th><td>Completed</td></tr>
        <tr><th scope="row">Bruno Lima</th><td>In Progress</td></tr>
      </tbody>
    </table>
  </lui-table>
`;
WithCaption.storyName = 'Com caption';
WithCaption.parameters = { controls: { disable: true } };

export const Scrollable = () => `
  <div style="max-width: 280px">
    <lui-table bordered label="Orders, scrollable">
      <table aria-label="Orders" style="min-width: 560px">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          ${ROWS.map(
            (row) => `<tr>
            <th scope="row">${row.name}</th>
            <td>${row.name.split(' ')[0].toLowerCase()}@example.com</td>
            <td>${tag(row)}</td>
          </tr>`
          ).join('')}
        </tbody>
      </table>
    </lui-table>
  </div>
`;
Scrollable.parameters = { controls: { disable: true } };

export const CSSClass = () => `
  <div class="table-wrapper table-wrapper--bordered">
    <table class="table" aria-label="Orders">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">Ana Souza</th><td>Completed</td></tr>
        <tr><th scope="row">Bruno Lima</th><td>In Progress</td></tr>
      </tbody>
    </table>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = { controls: { disable: true } };
