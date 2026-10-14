import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Content/Skeleton',
  argTypes: {
    shape: {
      control: { type: 'select' },
      options: ['text', 'circle', 'rectangle'],
    },
    width: { control: 'text' },
    height: { control: 'text' },
    label: { control: 'text' },
  },
};

const Template = ({ shape, width, height, label }) => `
  <div style="width: 320px; padding: 16px;">
    <lui-skeleton
      shape="${shape}"
      width="${width}"
      height="${height}"
      label="${label}"
    ></lui-skeleton>
  </div>
`;

export const Skeleton = Template.bind({});
Skeleton.args = {
  shape: 'text',
  width: '100%',
  height: '',
  label: '',
};

export const Text = () => `
  <div style="width: 320px; padding: 16px;">
    <lui-stack gap="8">
      <lui-skeleton></lui-skeleton>
      <lui-skeleton width="92%"></lui-skeleton>
      <lui-skeleton width="64%"></lui-skeleton>
    </lui-stack>
  </div>
`;

export const Circle = () => `
  <div style="padding: 16px;">
    <lui-inline gap="16" align="center">
      <lui-skeleton shape="circle"></lui-skeleton>
      <lui-skeleton shape="circle" width="32px"></lui-skeleton>
      <lui-skeleton shape="circle" width="24px"></lui-skeleton>
    </lui-inline>
  </div>
`;

export const Rectangle = () => `
  <div style="width: 320px; padding: 16px;">
    <lui-skeleton shape="rectangle"></lui-skeleton>
  </div>
`;

export const Card = () => `
  <div class="card card--border" style="width: 320px;" role="status" aria-busy="true" aria-label="Carregando cartão">
    <div class="card__body">
      <lui-skeleton shape="rectangle" height="10rem"></lui-skeleton>
      <lui-skeleton width="70%"></lui-skeleton>
      <lui-skeleton></lui-skeleton>
      <lui-skeleton width="40%"></lui-skeleton>
    </div>
  </div>
`;

export const ListItem = () => `
  <div style="width: 360px; padding: 16px;" role="status" aria-busy="true" aria-label="Carregando lista">
    <lui-stack gap="16">
      <lui-inline gap="12" align="center">
        <lui-skeleton shape="circle" width="32px"></lui-skeleton>
        <lui-stack gap="8" style="flex: 1;">
          <lui-skeleton width="40%"></lui-skeleton>
          <lui-skeleton width="72%"></lui-skeleton>
        </lui-stack>
      </lui-inline>
      <lui-inline gap="12" align="center">
        <lui-skeleton shape="circle" width="32px"></lui-skeleton>
        <lui-stack gap="8" style="flex: 1;">
          <lui-skeleton width="52%"></lui-skeleton>
          <lui-skeleton width="80%"></lui-skeleton>
        </lui-stack>
      </lui-inline>
      <lui-inline gap="12" align="center">
        <lui-skeleton shape="circle" width="32px"></lui-skeleton>
        <lui-stack gap="8" style="flex: 1;">
          <lui-skeleton width="36%"></lui-skeleton>
          <lui-skeleton width="64%"></lui-skeleton>
        </lui-stack>
      </lui-inline>
    </lui-stack>
  </div>
`;

export const Profile = () => `
  <div style="width: 360px; padding: 16px;" role="status" aria-busy="true" aria-label="Carregando perfil">
    <lui-inline gap="16" align="center">
      <lui-skeleton shape="circle"></lui-skeleton>
      <lui-stack gap="8" style="flex: 1;">
        <lui-skeleton width="48%"></lui-skeleton>
        <lui-skeleton width="32%"></lui-skeleton>
      </lui-stack>
    </lui-inline>
  </div>
`;

export const CSSClass = () => `
  <div style="width: 320px; padding: 16px;">
    <div class="stack stack--gap-8">
      <span class="skeleton"></span>
      <span class="skeleton" style="--lui-skeleton-width: 70%"></span>
      <span class="skeleton skeleton--circle"></span>
      <span class="skeleton skeleton--rectangle"></span>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
