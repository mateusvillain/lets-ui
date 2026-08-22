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

export const Columns = () => `
  <lui-grid>
    ${cell('full', '#dbeafe', 'col="full"')}
    ${cell('2 / 4 / 6', '#dcfce7', 'col="2" col-sm="4" col-lg="6"')}
    ${cell('2 / 4 / 6', '#fef9c3', 'col="2" col-sm="4" col-lg="6"')}
    ${cell('4 / 2 / 3', '#fce7f3', 'col="4" col-sm="2" col-lg="3"')}
    ${cell('4 / 2 / 3', '#ede9fe', 'col="4" col-sm="2" col-lg="3"')}
    ${cell('4 / 4 / 6', '#fed7aa', 'col="4" col-sm="4" col-lg="6"')}
  </lui-grid>
`;
Columns.storyName = 'Colunas responsivas';

export const Nested = () => `
  <lui-grid>
    <lui-grid-item col="full" col-sm="4" col-lg="6">
      <lui-grid>
        ${cell('aninhado 1', '#dbeafe', 'col="2" col-sm="2" col-lg="3"')}
        ${cell('aninhado 2', '#dcfce7', 'col="2" col-sm="2" col-lg="3"')}
      </lui-grid>
    </lui-grid-item>
    ${cell('irmão', '#fef9c3', 'col="full" col-sm="4" col-lg="6"')}
  </lui-grid>
`;
Nested.storyName = 'Grid aninhado';

export const CSSClass = () => `
  <div class="grid">
    <div class="col-full">
      <div style="padding:16px;background:#dbeafe;border-radius:6px;font-size:13px;">col-full</div>
    </div>
    <div class="col-2 col-sm-4 col-lg-6">
      <div style="padding:16px;background:#dcfce7;border-radius:6px;font-size:13px;">2 / 4 / 6</div>
    </div>
    <div class="col-2 col-sm-4 col-lg-6">
      <div style="padding:16px;background:#fef9c3;border-radius:6px;font-size:13px;">2 / 4 / 6</div>
    </div>
    <div>
      <div style="padding:16px;background:#ede9fe;border-radius:6px;font-size:13px;">sem classe = 1 col</div>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
