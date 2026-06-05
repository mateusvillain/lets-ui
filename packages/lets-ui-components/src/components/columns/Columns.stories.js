import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Columns',
  argTypes: {
    columns: { control: 'text' },
    gap: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
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
Default.args = { columns: '3', gap: 'md', align: 'stretch', collapseBelow: '' };

export const TwoColumns = Template.bind({});
TwoColumns.args = {
  columns: '2',
  gap: 'md',
  align: 'stretch',
  collapseBelow: '',
};

export const CustomTemplate = () => `
  <lui-columns columns='["2fr","1fr"]' gap="md">
    ${col('Main (2fr)', '#dbeafe')}
    ${col('Sidebar (1fr)', '#dcfce7')}
  </lui-columns>
`;

export const WithSpan = () => `
  <lui-columns columns="3" gap="md">
    ${col('Span 2', '#dbeafe').replace('<lui-column>', '<lui-column span="2">')}
    ${col('Auto', '#dcfce7')}
  </lui-columns>
`;

export const CollapseOnMobile = Template.bind({});
CollapseOnMobile.args = {
  columns: '3',
  gap: 'md',
  align: 'stretch',
  collapseBelow: 'sm',
};
