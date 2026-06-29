import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Flex',
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
    },
    wrap: {
      control: { type: 'select' },
      options: ['nowrap', 'wrap', 'wrap-reverse'],
    },
    gap: {
      control: { type: 'select' },
      options: [
        '',
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
      options: ['start', 'end', 'center', 'stretch', 'baseline'],
    },
    justify: {
      control: { type: 'select' },
      options: [
        'start',
        'end',
        'center',
        'space-between',
        'space-around',
        'space-evenly',
      ],
    },
    inline: { control: 'boolean' },
  },
};

const box = (label, color = '#dbeafe') =>
  `<lui-flex-item><div style="padding: 12px 16px; background: ${color}; border-radius: 6px; font-size: 13px;">${label}</div></lui-flex-item>`;

const Template = ({ direction, wrap, gap, align, justify, inline }) => `
  <div style="outline: 1px dashed #cbd5e1; padding: 8px; border-radius: 4px;">
    <lui-flex
      direction="${direction}"
      wrap="${wrap}"
      gap="${gap}"
      align="${align}"
      justify="${justify}"
      ${inline ? 'inline' : ''}
    >
      ${box('Item 1', '#dbeafe')}
      ${box('Item 2', '#dcfce7')}
      ${box('Item 3', '#fef9c3')}
    </lui-flex>
  </div>
`;

export const Default = Template.bind({});
Default.args = {
  direction: 'row',
  wrap: 'nowrap',
  gap: '16',
  align: 'stretch',
  justify: 'start',
  inline: false,
};

export const Column = Template.bind({});
Column.args = {
  direction: 'column',
  wrap: 'nowrap',
  gap: '8',
  align: 'start',
  justify: 'start',
  inline: false,
};

export const WithGrow = () => `
  <div style="outline: 1px dashed #cbd5e1; padding: 8px; border-radius: 4px;">
    <lui-flex gap="16">
      <lui-flex-item grow="1"><div style="padding: 12px 16px; background: #dbeafe; border-radius: 6px; font-size: 13px;">Grows (flex-grow: 1)</div></lui-flex-item>
      <lui-flex-item><div style="padding: 12px 16px; background: #dcfce7; border-radius: 6px; font-size: 13px;">Fixed</div></lui-flex-item>
    </lui-flex>
  </div>
`;

export const CSSClass = () => `
  <div class="flex flex--gap-16 flex--align-center">
    <div class="flex-item--grow">Cresce</div>
    <div class="flex-item--shrink-0">Fixo</div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
