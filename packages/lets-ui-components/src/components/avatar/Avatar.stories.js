import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

// Uma "foto" embutida, para a documentação não depender de rede.
const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6a15c"/><stop offset="1" stop-color="#5b3b8c"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="40" cy="32" r="14" fill="#fff" fill-opacity=".85"/><path d="M12 80a28 28 0 0 1 56 0z" fill="#fff" fill-opacity=".85"/></svg>`
  );

const row = (content) =>
  `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">${content}</div>`;

export default {
  title: 'Content/Avatar',
  argTypes: {
    name: { control: 'text' },
    src: { control: 'text' },
    initials: { control: 'text' },
    variant: {
      control: 'select',
      options: ['gray', 'blue', 'green', 'orange', 'red', 'violet'],
    },
    size: { control: 'select', options: ['', 'sm', 'md', 'lg'] },
    radius: { control: 'select', options: ['circle', 'rounded', 'square'] },
    status: {
      control: 'select',
      options: ['', 'online', 'away', 'busy', 'offline'],
    },
    statusLabel: { control: 'text' },
  },
};

const Template = ({
  name,
  src,
  initials,
  variant,
  size,
  radius,
  status,
  statusLabel,
}) => `
  <lui-avatar
    name="${name}"
    ${src ? `src="${src}"` : ''}
    ${initials ? `initials="${initials}"` : ''}
    variant="${variant}"
    ${size ? `size="${size}"` : ''}
    radius="${radius}"
    ${status ? `status="${status}"` : ''}
    ${statusLabel ? `status-label="${statusLabel}"` : ''}
  ></lui-avatar>
`;

export const Default = Template.bind({});
Default.args = {
  name: 'Mateus Villain',
  src: '',
  initials: '',
  variant: 'gray',
  size: 'lg',
  radius: 'circle',
  status: '',
  statusLabel: '',
};

export const Sizes = () =>
  row(`
    <lui-avatar name="Mateus Villain" size="lg"></lui-avatar>
    <lui-avatar name="Mateus Villain" size="md"></lui-avatar>
    <lui-avatar name="Mateus Villain" size="sm"></lui-avatar>
  `);
Sizes.storyName = 'Tamanhos';
Sizes.parameters = { controls: { disable: true } };

export const Radii = () =>
  row(`
    <lui-avatar name="Mateus Villain" radius="circle"></lui-avatar>
    <lui-avatar name="Mateus Villain" radius="rounded"></lui-avatar>
    <lui-avatar name="Mateus Villain" radius="square"></lui-avatar>
  `);
Radii.storyName = 'Formatos';
Radii.parameters = { controls: { disable: true } };

export const Variants = () =>
  row(`
    <lui-avatar name="Mateus Villain" variant="gray"></lui-avatar>
    <lui-avatar name="Mateus Villain" variant="blue"></lui-avatar>
    <lui-avatar name="Mateus Villain" variant="green"></lui-avatar>
    <lui-avatar name="Mateus Villain" variant="orange"></lui-avatar>
    <lui-avatar name="Mateus Villain" variant="red"></lui-avatar>
    <lui-avatar name="Mateus Villain" variant="violet"></lui-avatar>
  `);
Variants.storyName = 'Cores';
Variants.parameters = { controls: { disable: true } };

export const Photo = () =>
  row(`
    <lui-avatar name="Mateus Villain" src="${PHOTO}"></lui-avatar>
    <lui-avatar name="Mateus Villain" src="${PHOTO}" radius="rounded"></lui-avatar>
    <lui-avatar name="Mateus Villain" src="${PHOTO}" radius="square"></lui-avatar>
  `);
Photo.storyName = 'Foto';
Photo.parameters = { controls: { disable: true } };

export const PhotoFallback = () =>
  row(`
    <lui-avatar name="Mateus Villain" src="/nao-existe.png"></lui-avatar>
  `);
PhotoFallback.storyName = 'Foto que não carrega';
PhotoFallback.parameters = { controls: { disable: true } };

export const Placeholder = () =>
  row(`
    <lui-avatar></lui-avatar>
    <lui-avatar variant="blue"></lui-avatar>
    <lui-avatar variant="violet" radius="rounded"></lui-avatar>
    <lui-avatar size="sm"></lui-avatar>
  `);
Placeholder.storyName = 'Sem foto e sem iniciais';
Placeholder.parameters = { controls: { disable: true } };

export const Status = () =>
  row(`
    <lui-avatar name="Mateus Villain" status="online"></lui-avatar>
    <lui-avatar name="Mateus Villain" status="away"></lui-avatar>
    <lui-avatar name="Mateus Villain" status="busy"></lui-avatar>
    <lui-avatar name="Mateus Villain" status="offline"></lui-avatar>
  `);
Status.storyName = 'Status';
Status.parameters = { controls: { disable: true } };

export const StatusSizes = () =>
  row(`
    <lui-avatar name="Mateus Villain" size="lg" status="online"></lui-avatar>
    <lui-avatar name="Mateus Villain" size="md" status="online"></lui-avatar>
    <lui-avatar name="Mateus Villain" size="sm" status="online"></lui-avatar>
    <lui-avatar name="Mateus Villain" size="lg" radius="square" status="busy"></lui-avatar>
    <lui-avatar name="Mateus Villain" src="${PHOTO}" status="away"></lui-avatar>
  `);
StatusSizes.storyName = 'Status em cada tamanho';
StatusSizes.parameters = { controls: { disable: true } };

export const StatusLabel = () =>
  row(`
    <lui-avatar name="Mateus Villain" status="online" status-label="Disponível"></lui-avatar>
    <lui-avatar name="Mateus Villain" status="busy" status-label="Em reunião"></lui-avatar>
  `);
StatusLabel.storyName = 'Texto do status';
StatusLabel.parameters = { controls: { disable: true } };

export const Decorative = () => `
  <div style="display: flex; align-items: center; gap: 8px;">
    <lui-avatar initials="MV"></lui-avatar>
    <span>Mateus Villain</span>
  </div>
`;
Decorative.storyName = 'Decorativo, ao lado do nome';
Decorative.parameters = { controls: { disable: true } };

export const Group = () => `
  <lui-avatar-group label="Membros do projeto">
    <lui-avatar name="Ana Lima" variant="blue"></lui-avatar>
    <lui-avatar name="Bia Souza" variant="green"></lui-avatar>
    <lui-avatar name="Caio Reis" variant="orange"></lui-avatar>
    <lui-avatar name="Duda Alves" variant="violet"></lui-avatar>
  </lui-avatar-group>
`;
Group.storyName = 'Grupo';
Group.parameters = { controls: { disable: true } };

export const GroupWithStatus = () => `
  <lui-avatar-group label="Membros do projeto">
    <lui-avatar name="Ana Lima" variant="blue" status="online"></lui-avatar>
    <lui-avatar name="Bia Souza" variant="green" status="busy"></lui-avatar>
    <lui-avatar name="Caio Reis" variant="orange" status="away"></lui-avatar>
    <lui-avatar name="Duda Alves" variant="violet" status="offline"></lui-avatar>
  </lui-avatar-group>
`;
GroupWithStatus.storyName = 'Grupo com status';
GroupWithStatus.parameters = { controls: { disable: true } };

export const GroupSizes = () =>
  `<div style="display: flex; flex-direction: column; gap: 16px;">${[
    'lg',
    'md',
    'sm',
  ]
    .map(
      (size) => `
    <lui-avatar-group size="${size}" label="Membros do projeto, tamanho ${size}">
      <lui-avatar name="Ana Lima" variant="blue"></lui-avatar>
      <lui-avatar name="Bia Souza" variant="green"></lui-avatar>
      <lui-avatar name="Caio Reis" variant="orange"></lui-avatar>
      <lui-avatar name="Duda Alves" src="${PHOTO}"></lui-avatar>
    </lui-avatar-group>`
    )
    .join('')}</div>`;
GroupSizes.storyName = 'Grupo em cada tamanho';
GroupSizes.parameters = { controls: { disable: true } };

export const CSSClass = () => `
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">
    <span class="avatar avatar--lg avatar--circle avatar--blue" role="img" aria-label="Mateus Villain, Online">
      <span class="avatar__initials" aria-hidden="true">MV</span>
      <span class="avatar__status avatar__status--online" aria-hidden="true"></span>
    </span>
    <span class="avatar avatar--md avatar--rounded avatar--gray" role="img" aria-label="Ana Lima">
      <img class="avatar__image" src="${PHOTO}" alt="" />
    </span>
    <span class="avatar-group avatar-group--md" role="group" aria-label="Membros do projeto">
      <span class="avatar avatar--green" role="img" aria-label="Bia Souza"><span class="avatar__initials" aria-hidden="true">BS</span></span>
      <span class="avatar avatar--orange" role="img" aria-label="Caio Reis"><span class="avatar__initials" aria-hidden="true">CR</span></span>
    </span>
  </div>
`;
CSSClass.storyName = 'Classe CSS';
CSSClass.parameters = { controls: { disable: true } };
