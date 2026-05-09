import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

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
    label="${label}"
    href="${href}"
    ${ariaLabel ? `aria-label="${ariaLabel}"` : ''}
  ></lui-link>
`;

export const Default = Template.bind({});
Default.args = {
  label: 'Saiba mais',
  href: '#',
  ariaLabel: '',
};
Default.storyName = 'Default';

export const InParagraph = () => `
  <p class="body--lg">
    Ao continuar você concorda com os
    <a class="link" href="#">termos de uso</a>
    e com a
    <a class="link" href="#">política de privacidade</a>.
  </p>
`;
InParagraph.storyName = 'Em parágrafo';

export const WithAriaLabel = () => `
  <lui-link label="Leia mais" href="#" aria-label="Leia mais sobre acessibilidade"></lui-link>
`;
WithAriaLabel.storyName = 'Com aria-label';

export const CSSClass = () => `
  <a class="link" href="#">Link com classe CSS</a>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
