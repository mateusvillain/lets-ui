import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Navigation/Link',
  argTypes: {
    label: { control: 'text' },
    href: { control: 'text' },
    ariaLabel: { control: 'text' },
  },
};

const Template = ({ label, href, ariaLabel }) => `
  <lui-link
    href="${href}"
    ${ariaLabel ? `aria-label="${ariaLabel}"` : ''}
  >
    ${label}
  </lui-link>
`;

export const Default = Template.bind({});
Default.args = {
  label: 'Saiba mais',
  href: '#',
  ariaLabel: 'Saiba mais informações sobre o design system',
};
Default.storyName = 'Default';

export const InParagraph = () => `
  <lui-body variant="lg">
    Para entender mais sobre design systems, leia <lui-link href="https://www.casadocodigo.com.br/products/livro-design-system">Design System além do layout</lui-link> de Mateus Villain.
  </lui-body>
`;
InParagraph.storyName = 'Em parágrafo';

export const WithSlot = () => `
  <lui-link
    href="#"
  >
    Acesse sua <strong>conta</strong>
  </lui-link>
`;

WithSlot.storyName = 'Via slot';

export const WithLabel = () => `
  <lui-link
    label="Esqueci minha senha"
    href="#"
  ></lui-link>
`;
WithLabel.storyName = 'Via label';

export const WithAriaLabel = () => `
  <lui-link label="Leia mais" href="#" aria-label="Leia mais sobre acessibilidade"></lui-link>
`;
WithAriaLabel.storyName = 'Com aria-label';

export const CSSClass = () => `
  <a class="link" href="#">Link com classe CSS</a>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
