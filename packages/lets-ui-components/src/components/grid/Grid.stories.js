import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Grid',
  argTypes: {
    columns: { control: 'text' },
    rows: { control: 'text' },
    gap: {
      control: { type: 'select' },
      options: [
        '0',
        '2',
        '4',
        '8',
        '12',
        '16',
        '20',
        '24',
        '32',
        '40',
        '48',
        '56',
        '64',
        '72',
        '80',
      ],
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'stretch'],
    },
  },
};

const cell = (label, color = '#dbeafe', span = '') =>
  `<lui-grid-item ${span}><div style="padding: 16px; background: ${color}; border-radius: 6px; font-size: 13px;">${label}</div></lui-grid-item>`;

const Template = ({ columns, rows, gap, align }) => `
  <lui-grid
    ${columns ? `columns="${columns}"` : ''}
    ${rows ? `rows="${rows}"` : ''}
    gap="${gap}"
    align="${align}"
  >
    ${cell('Item 1', '#dbeafe')}
    ${cell('Item 2', '#dcfce7')}
    ${cell('Item 3', '#fef9c3')}
    ${cell('Item 4', '#fce7f3')}
    ${cell('Item 5', '#ede9fe')}
    ${cell('Item 6', '#fed7aa')}
  </lui-grid>
`;

export const Default = Template.bind({});
Default.args = {
  columns: 'repeat(3, 1fr)',
  rows: '',
  gap: '16',
  align: 'stretch',
};

export const TwoColumns = Template.bind({});
TwoColumns.args = {
  columns: 'repeat(2, 1fr)',
  rows: '',
  gap: '24',
  align: 'stretch',
};

export const WithSpans = () => `
  <lui-grid columns="repeat(4, 1fr)" gap="16">
    ${cell('Span 2 cols', '#dbeafe', 'col-span="2"')}
    ${cell('1 col', '#dcfce7')}
    ${cell('1 col', '#fef9c3')}
    ${cell('Span 3 cols', '#fce7f3', 'col-span="3"')}
    ${cell('1 col', '#ede9fe')}
  </lui-grid>
`;

export const CSSClass = () => `
  <div class="grid grid--gap-16" style="grid-template-columns: repeat(3, 1fr);">
    <div class="grid-item">Item 1</div>
    <div class="grid-item">Item 2</div>
    <div class="grid-item">Item 3</div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
