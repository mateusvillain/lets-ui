import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Columns',
  argTypes: {
    columns: { control: 'text' },
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
    collapseBelow: {
      control: { type: 'select' },
      options: ['', 'sm', 'md', 'lg'],
    },
  },
};

const col = (label, color = '#dbeafe') =>
  `<lui-column><div style="padding: 16px; background: ${color}; border-radius: 6px; font-size: 13px;">${label}</div></lui-column>`;

const Template = ({ columns, gap, align, collapseBelow }) => `
  <lui-columns
    columns="${columns}"
    gap="${gap}"
    align="${align}"
    ${collapseBelow ? `collapse-below="${collapseBelow}"` : ''}
  >
    ${col('Column 1', '#dbeafe')}
    ${col('Column 2', '#dcfce7')}
    ${col('Column 3', '#fef9c3')}
  </lui-columns>
`;

export const Default = Template.bind({});
Default.args = { columns: '3', gap: '16', align: 'stretch', collapseBelow: '' };

export const TwoColumns = Template.bind({});
TwoColumns.args = {
  columns: '2',
  gap: '16',
  align: 'stretch',
  collapseBelow: '',
};

export const CustomTemplate = () => `
  <lui-columns columns='["2fr","1fr"]' gap="16">
    ${col('Main (2fr)', '#dbeafe')}
    ${col('Sidebar (1fr)', '#dcfce7')}
  </lui-columns>
`;

export const WithSpan = () => `
  <lui-columns columns="3" gap="16">
    ${col('Span 2', '#dbeafe').replace('<lui-column>', '<lui-column span="2">')}
    ${col('Auto', '#dcfce7')}
  </lui-columns>
`;

export const CollapseOnMobile = Template.bind({});
CollapseOnMobile.args = {
  columns: '3',
  gap: '16',
  align: 'stretch',
  collapseBelow: 'sm',
};

export const CSSClass = () => `
  <div class="columns columns--3 columns--gap-16">
    <div class="column">Coluna 1</div>
    <div class="column">Coluna 2</div>
    <div class="column">Coluna 3</div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
