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
    cellEnd: {
      control: 'boolean',
      description:
        'Aplica `.table__cell--end` no cabeçalho e em cada célula da coluna Actions deste exemplo, alinhando-a ao fim. Não é uma prop do `lui-table`.',
    },
    cellFit: {
      control: 'boolean',
      description:
        'Aplica `.table__cell--fit` no cabeçalho e em cada célula da coluna Actions deste exemplo, para que ocupe só a largura do conteúdo. Não é uma prop do `lui-table`.',
    },
    ariaLabel: {
      control: 'text',
      description:
        '`aria-label` do `<table>`. Nome acessível quando não há título visível; só é aplicado com o caption vazio.',
    },
    caption: {
      control: 'text',
      description:
        'Texto do `<caption>`, o título visível da tabela, como no design. Quando preenchido, o `aria-label` não é aplicado.',
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

const Template = ({
  bordered,
  label,
  ariaLabel,
  caption,
  cellEnd,
  cellFit,
}) => {
  const actionsClass = [
    cellEnd && 'table__cell--end',
    cellFit && 'table__cell--fit',
  ].filter(Boolean);
  const end = actionsClass.length ? ` class="${actionsClass.join(' ')}"` : '';
  const name = tableName({ ariaLabel, caption });
  return `
  <lui-table ${bordered ? 'bordered' : ''} ${label ? `label="${label}"` : ''}>
    <table ${name.attrs}>
      ${name.caption}
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Status</th>
          <th scope="col"${end}>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${ROWS.map(
          (row) => `<tr>
          <th scope="row">${row.name}</th>
          <td>${tag(row)}</td>
          <td${end}>
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
Default.args = {
  cellEnd: false,
  cellFit: true,
  bordered: false,
  label: '',
  ariaLabel: '',
  caption: 'Orders',
};

export const Bordered = Template.bind({});
Bordered.args = {
  cellEnd: true,
  cellFit: true,
  bordered: true,
  label: '',
  ariaLabel: '',
  caption: 'Orders',
};

// Monta uma tabela a partir de dados. A primeira coluna vira `<th scope="row">`
// quando `rowHeader` é verdadeiro; as demais células são `<td>`.
const build = ({
  caption,
  ariaLabel,
  columns,
  rows,
  rowHeader = true,
  bordered = true,
  attrs = '',
  tableStyle = '',
  endColumns = [],
  fitColumns = [],
}) => {
  const cellClass = (i) => {
    const names = [
      endColumns.includes(i) && 'table__cell--end',
      fitColumns.includes(i) && 'table__cell--fit',
    ].filter(Boolean);
    return names.length ? ` class="${names.join(' ')}"` : '';
  };
  return `
  <lui-table ${bordered ? 'bordered' : ''} ${attrs}>
    <table ${caption ? '' : `aria-label="${ariaLabel}"`} ${tableStyle ? `style="${tableStyle}"` : ''}>
      ${caption ? `<caption>${caption}</caption>` : ''}
      <thead>
        <tr>${columns
          .map((c, i) => `<th scope="col"${cellClass(i)}>${c}</th>`)
          .join('')}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (cells) =>
              `<tr>${cells
                .map((cell, i) => {
                  const cls = cellClass(i);
                  return i === 0 && rowHeader
                    ? `<th scope="row"${cls}>${cell}</th>`
                    : `<td${cls}>${cell}</td>`;
                })
                .join('')}</tr>`
          )
          .join('')}
      </tbody>
    </table>
  </lui-table>
`;
};

const avatar = (name, variant) =>
  `<lui-avatar name="${name}" variant="${variant}" size="sm"></lui-avatar>`;

const USERS = [
  ['Maria Villain', 'maria@example.com', 'Admin', 'violet', 'online'],
  ['João Pereira', 'joao@example.com', 'Editor', 'blue', 'away'],
  ['Larissa Costa', 'larissa@example.com', 'Viewer', 'green', 'offline'],
  ['Pedro Alves', 'pedro@example.com', 'Editor', 'orange', 'busy'],
];

export const WithAvatarAndLink = () =>
  build({
    caption: 'Team members',
    fitColumns: [2],
    columns: ['Member', 'Email', 'Role'],
    rowHeader: false,
    rows: USERS.map(([name, email, role, variant, status]) => [
      `<span style="display:inline-flex;align-items:center;gap:8px"><lui-avatar name="${name}" variant="${variant}" status="${status}" size="sm"></lui-avatar>${name}</span>`,
      `<lui-link href="mailto:${email}" label="${email}"></lui-link>`,
      `<lui-tag label="${role}" variant="neutral" size="sm"></lui-tag>`,
    ]),
  });
WithAvatarAndLink.storyName = 'Com avatar e link';
WithAvatarAndLink.parameters = { controls: { disable: true } };

const FILES = [
  ['Relatório trimestral.pdf', 'PDF', '2,4 MB', '12 mar 2026'],
  ['Identidade visual.fig', 'Figma', '18,7 MB', '03 mar 2026'],
  ['Contrato de serviço.docx', 'Documento', '86 KB', '27 fev 2026'],
  ['Base de clientes.csv', 'Planilha', '1,1 MB', '19 fev 2026'],
];

export const Selectable = () =>
  build({
    caption: 'Arquivos',
    columns: ['Selecionar', 'Nome', 'Tipo', 'Tamanho', 'Modificado em'],
    endColumns: [3],
    fitColumns: [0],
    rowHeader: false,
    rows: FILES.map(([name, type, size, date], i) => [
      `<lui-checkbox aria-label="Selecionar ${name}" ${i === 1 ? 'checked' : ''}></lui-checkbox>`,
      name,
      type,
      size,
      date,
    ]),
  });
Selectable.storyName = 'Com seleção';
Selectable.parameters = { controls: { disable: true } };

export const Invoices = () =>
  build({
    caption: 'Faturas',
    endColumns: [3],
    fitColumns: [0, 4],
    columns: ['Fatura', 'Cliente', 'Vencimento', 'Valor', 'Situação'],
    rows: [
      [
        '#1042',
        'Ateliê Horizonte',
        '10 abr 2026',
        'R$ 1.280,00',
        'success',
        'Paga',
      ],
      [
        '#1043',
        'Café Meridiano',
        '15 abr 2026',
        'R$ 460,50',
        'caution',
        'Pendente',
      ],
      [
        '#1044',
        'Studio Ponto Final',
        '02 abr 2026',
        'R$ 3.915,00',
        'danger',
        'Atrasada',
      ],
      [
        '#1045',
        'Livraria Sétimo Andar',
        '28 abr 2026',
        'R$ 720,00',
        'neutral',
        'Rascunho',
      ],
    ].map(([id, client, due, amount, variant, status]) => [
      id,
      client,
      due,
      amount,
      `<lui-tag label="${status}" variant="${variant}" size="sm"></lui-tag>`,
    ]),
  });
Invoices.storyName = 'Valores e situação';
Invoices.parameters = { controls: { disable: true } };

export const Schedule = () =>
  build({
    caption: 'Programação do evento',
    fitColumns: [0],
    columns: ['Horário', 'Atividade', 'Sala', 'Responsável'],
    bordered: false,
    rows: [
      [
        '09:00',
        'Credenciamento e café',
        'Hall de entrada',
        'Equipe de recepção',
      ],
      [
        '10:00',
        'Abertura: o futuro dos design systems',
        'Auditório A',
        'Beatriz Nogueira',
      ],
      ['11:30', 'Acessibilidade na prática', 'Auditório B', 'Rafael Moreira'],
      ['13:00', 'Almoço', 'Terraço', 'Sem responsável'],
    ],
  });
Schedule.storyName = 'Só texto, sem borda';
Schedule.parameters = { controls: { disable: true } };

export const WithoutCaption = () =>
  build({
    ariaLabel: 'Inventário',
    columns: ['Produto', 'Estoque', 'Disponibilidade'],
    rows: [
      [
        'Caderno pautado',
        '120',
        '<lui-tag label="Em estoque" variant="success" size="sm"></lui-tag>',
      ],
      [
        'Caneta gel azul',
        '8',
        '<lui-tag label="Estoque baixo" variant="caution" size="sm"></lui-tag>',
      ],
      [
        'Marca-texto amarelo',
        '0',
        '<lui-tag label="Esgotado" variant="danger" size="sm"></lui-tag>',
      ],
    ],
  });
WithoutCaption.storyName = 'Sem caption';
WithoutCaption.parameters = { controls: { disable: true } };

export const StickyHeader = () => `
  ${build({
    caption: 'Pedidos do mês',
    attrs: 'sticky-header max-height="280"',
    columns: ['Pedido', 'Cliente', 'Valor', 'Situação'],
    endColumns: [2],
    fitColumns: [0],
    rows: Array.from({ length: 14 }, (_, i) => [
      `#${2001 + i}`,
      ['Ateliê Horizonte', 'Café Meridiano', 'Studio Ponto Final'][i % 3],
      `R$ ${(120 + i * 87.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `<lui-tag label="${['Paga', 'Pendente', 'Atrasada'][i % 3]}" variant="${['success', 'caution', 'danger'][i % 3]}" size="sm"></lui-tag>`,
    ]),
  })}
`;
StickyHeader.storyName = 'Header fixo';
StickyHeader.parameters = { controls: { disable: true } };

export const Scrollable = () => `
  <div style="max-width: 320px">
    ${build({
      caption: 'Projetos',
      attrs: 'label="Projetos, rolável"',
      tableStyle: 'min-width: 640px',
      columns: ['Projeto', 'Responsável', 'Prazo', 'Orçamento', 'Etapa'],
      rows: [
        [
          'Redesenho do app',
          'Ana Souza',
          '30 jun 2026',
          'R$ 48.000',
          'Prototipação',
        ],
        [
          'Migração de dados',
          'Bruno Lima',
          '15 ago 2026',
          'R$ 72.500',
          'Planejamento',
        ],
        [
          'Portal do cliente',
          'Carla Dias',
          '01 out 2026',
          'R$ 95.000',
          'Desenvolvimento',
        ],
      ],
    })}
  </div>
`;
Scrollable.parameters = { controls: { disable: true } };

export const CSSClass = () => `
  <div class="table-wrapper table-wrapper--bordered">
    <table class="table">
      <caption>Linhas de transporte</caption>
      <thead>
        <tr>
          <th scope="col">Linha</th>
          <th scope="col">Trajeto</th>
          <th scope="col">Intervalo</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">101</th><td>Centro / Aeroporto</td><td>15 min</td></tr>
        <tr><th scope="row">204</th><td>Terminal Norte / Praça da Sé</td><td>8 min</td></tr>
        <tr><th scope="row">310</th><td>Circular Universitária</td><td>20 min</td></tr>
      </tbody>
    </table>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = { controls: { disable: true } };
