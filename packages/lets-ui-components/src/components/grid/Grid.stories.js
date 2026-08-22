import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Grid',
  argTypes: {
    align: {
      control: { type: 'select' },
      options: ['stretch', 'start', 'center', 'end'],
    },
    flush: { control: 'boolean' },
  },
};

const cell = (label, color = '#dbeafe', attrs = '') =>
  `<lui-grid-item ${attrs}><div style="padding: 16px; background: ${color}; border-radius: 6px; font-size: 13px;">${label}</div></lui-grid-item>`;

const Template = ({ align, flush }) => `
  <lui-grid align="${align}" ${flush ? 'flush' : ''}>
    ${cell('1', '#dbeafe')}
    ${cell('2', '#dcfce7')}
    ${cell('3', '#fef9c3')}
    ${cell('4', '#fce7f3')}
    ${cell('5', '#ede9fe')}
    ${cell('6', '#fed7aa')}
    ${cell('7', '#bae6fd')}
    ${cell('8', '#bbf7d0')}
    ${cell('9', '#fde68a')}
    ${cell('10', '#fbcfe8')}
    ${cell('11', '#ddd6fe')}
    ${cell('12', '#fdba74')}
  </lui-grid>
`;

export const Default = Template.bind({});
Default.args = { align: 'stretch', flush: false };
Default.storyName = 'Colunas do breakpoint';

export const Spans = () => `
  <lui-grid>
    ${cell('span 4 / sm 8 / lg 12 — full', '#dbeafe', 'span="full"')}
    ${cell('span 2 / sm 4 / lg 6', '#dcfce7', 'span="2" span-sm="4" span-lg="6"')}
    ${cell('span 2 / sm 4 / lg 6', '#fef9c3', 'span="2" span-sm="4" span-lg="6"')}
    ${cell('span 4 / sm 2 / lg 3', '#fce7f3', 'span="4" span-sm="2" span-lg="3"')}
    ${cell('span 4 / sm 2 / lg 3', '#ede9fe', 'span="4" span-sm="2" span-lg="3"')}
    ${cell('span 4 / sm 4 / lg 6', '#fed7aa', 'span="4" span-sm="4" span-lg="6"')}
  </lui-grid>
`;
Spans.storyName = 'Spans responsivos';

export const Nested = () => `
  <lui-grid>
    <lui-grid-item span="full" span-sm="4" span-lg="6">
      <lui-grid>
        ${cell('aninhado 1', '#dbeafe', 'span="2" span-sm="2" span-lg="3"')}
        ${cell('aninhado 2', '#dcfce7', 'span="2" span-sm="2" span-lg="3"')}
      </lui-grid>
    </lui-grid-item>
    ${cell('irmão', '#fef9c3', 'span="full" span-sm="4" span-lg="6"')}
  </lui-grid>
`;
Nested.storyName = 'Grid aninhado';

export const CSSClass = () => `
  <div class="grid">
    <div class="grid-item grid-item--1xs-full">
      <div style="padding:16px;background:#dbeafe;border-radius:6px;font-size:13px;">full</div>
    </div>
    <div class="grid-item grid-item--1xs-2 grid-item--sm-4 grid-item--lg-6">
      <div style="padding:16px;background:#dcfce7;border-radius:6px;font-size:13px;">2 / 4 / 6</div>
    </div>
    <div class="grid-item grid-item--1xs-2 grid-item--sm-4 grid-item--lg-6">
      <div style="padding:16px;background:#fef9c3;border-radius:6px;font-size:13px;">2 / 4 / 6</div>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
