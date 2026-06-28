import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Navigation/Link',
  argTypes: {
    label: {
      control: 'text',
    },
    href: {
      control: 'text',
    },
    size: {
      control: { type: 'select' },
      options: ['', 'lg', 'md', 'sm'],
      table: { defaultValue: { summary: 'lg' } },
    },
    target: {
      control: { type: 'select' },
      options: ['_self', '_blank', '_parent', '_top'],
      table: { defaultValue: { summary: '_self' } },
    },
    rel: {
      control: 'text',
      table: {
        defaultValue: {
          summary: 'auto "noopener noreferrer" se target="_blank"',
        },
      },
    },
    download: {
      control: 'text',
    },
    hreflang: {
      control: 'text',
    },
    referrerpolicy: {
      control: { type: 'select' },
      options: [
        '',
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
        'unsafe-url',
      ],
    },
    external: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    externalLabel: {
      control: 'text',
      table: { defaultValue: { summary: '(abre em nova aba)' } },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    visited: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    ariaLabel: {
      control: 'text',
    },
  },
};

const Template = ({
  label,
  href,
  size,
  target,
  rel,
  download,
  hreflang,
  referrerpolicy,
  external,
  externalLabel,
  disabled,
  visited,
  ariaLabel,
}) => {
  const attrs = [
    `href="${href}"`,
    size && `size="${size}"`,
    target && `target="${target}"`,
    rel && `rel="${rel}"`,
    download && `download="${download}"`,
    hreflang && `hreflang="${hreflang}"`,
    referrerpolicy && `referrerpolicy="${referrerpolicy}"`,
    external && 'external',
    external &&
      externalLabel &&
      externalLabel !== '(abre em nova aba)' &&
      `external-label="${externalLabel}"`,
    disabled && 'disabled',
    visited && 'visited',
    ariaLabel && `aria-label="${ariaLabel}"`,
  ]
    .filter(Boolean)
    .join('\n    ');

  return `<lui-link\n    ${attrs}\n  >\n    ${label}\n  </lui-link>`;
};

export const Default = Template.bind({});
Default.args = {
  label: 'Saiba mais',
  ariaLabel: '',
  href: '#',
  target: '',
  size: '',
  external: false,
  externalLabel: '(abre em nova aba)',
  visited: false,
  rel: '',
  download: '',
  hreflang: '',
  referrerpolicy: '',
  disabled: false,
};
Default.storyName = 'Default';

export const Sizes = () => `
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <lui-link href="#" size="lg">Large</lui-link>
    <lui-link href="#" size="md">Medium</lui-link>
    <lui-link href="#" size="sm">Small</lui-link>
  </div>
`;
Sizes.storyName = 'Tamanhos';

export const OpenInNewTab = () => `
  <lui-link href="https://example.com" target="_blank">
    Abrir em nova aba
  </lui-link>
`;
OpenInNewTab.storyName = 'Nova aba (_blank)';

export const ExternalLink = () => `
  <lui-link href="https://example.com" target="_blank" external>
    Documentação externa
  </lui-link>
`;
ExternalLink.storyName = 'Link externo';

export const ExternalLabelI18n = () => `
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <lui-link href="https://example.com" external>
      pt-BR (padrão)
    </lui-link>
    <lui-link href="https://example.com" external external-label="(opens in a new tab)">
      English
    </lui-link>
    <lui-link href="https://example.com" external external-label="(abre en una nueva pestaña)">
      Español
    </lui-link>
    <lui-link href="https://example.com" external external-label="(s'ouvre dans un nouvel onglet)">
      Français
    </lui-link>
  </div>
`;
ExternalLabelI18n.storyName = 'Link externo — i18n (external-label)';

export const ExternalInParagraph = () => `
  <lui-body variant="lg">
    Para entender mais sobre design systems, leia
    <lui-link href="https://www.casadocodigo.com.br/products/livro-design-system" target="_blank" external>
      Design System além do layout
    </lui-link>
    de Mateus Villain.
  </lui-body>
`;
ExternalInParagraph.storyName = 'Link externo em parágrafo';

export const Download = () => `
  <lui-link href="/assets/guia.pdf" download="guia-design-system.pdf">
    Baixar guia
  </lui-link>
`;
Download.storyName = 'Download';

export const Disabled = () => `
  <div style="display: flex; gap: 16px;">
    <lui-link href="/sobre" disabled>Link desabilitado</lui-link>
    <lui-link href="/sobre" disabled external>Link externo desabilitado</lui-link>
  </div>
`;
Disabled.storyName = 'Desabilitado';

export const TrackVisited = () => `
  <p style="font-family: sans-serif; font-size: 14px; margin-bottom: 8px; color: #666;">Clique no link abaixo e volte para ver o estado :visited</p>
  <lui-link href="https://example.com" target="_blank" visited>Link com rastreamento de visita</lui-link>
`;
TrackVisited.storyName = 'Com rastreamento de visita';

export const InParagraph = () => `
  <lui-body variant="lg">
    Para entender mais sobre design systems, leia <lui-link href="https://www.casadocodigo.com.br/products/livro-design-system">Design System além do layout</lui-link> de Mateus Villain.
  </lui-body>
`;
InParagraph.storyName = 'Em parágrafo';

export const WithSlot = () => `
  <lui-link href="#">
    <lui-button variant="primary" size="lg" label="Começar agora"></lui-button>
  </lui-link>
`;
WithSlot.storyName = 'Via slot';

export const WithLabel = () => `
  <lui-link label="Esqueci minha senha" href="#"></lui-link>
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
