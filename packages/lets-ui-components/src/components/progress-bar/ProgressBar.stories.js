import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Content/Progress Bar',
  argTypes: {
    value: { control: { type: 'number', min: 0 } },
    max: { control: { type: 'number', min: 1 } },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'success', 'caution', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    labelPlacement: {
      name: 'label-placement',
      control: { type: 'inline-radio' },
      options: ['top', 'inline'],
    },
    label: { control: 'text' },
    valueText: { name: 'value-text', control: 'text' },
    caption: { control: 'text' },
    hideLabel: { name: 'hide-label', control: 'boolean' },
    hideValue: { name: 'hide-value', control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
};

const Template = ({
  value,
  max,
  variant,
  size,
  labelPlacement,
  label,
  valueText,
  caption,
  hideLabel,
  hideValue,
  indeterminate,
}) => `
  <div style="width: 400px; padding: 16px;">
    <lui-progress-bar
      ${indeterminate ? '' : `value="${value}"`}
      max="${max}"
      variant="${variant}"
      size="${size}"
      label-placement="${labelPlacement}"
      label="${label}"
      value-text="${valueText}"
      caption="${caption}"
      ${hideLabel ? 'hide-label' : ''}
      ${hideValue ? 'hide-value' : ''}
    ></lui-progress-bar>
  </div>
`;

export const ProgressBar = Template.bind({});
ProgressBar.args = {
  value: 40,
  max: 100,
  variant: 'primary',
  size: 'md',
  labelPlacement: 'top',
  label: 'Uploading files',
  valueText: '',
  caption: '8 of 20 files',
  hideLabel: false,
  hideValue: false,
  indeterminate: false,
};

export const LabelPlacement = () => `
  <div style="width: 400px; padding: 16px;">
    <lui-stack gap="24">
      <lui-progress-bar value="25" label="Label" caption="Caption"></lui-progress-bar>
      <lui-progress-bar value="25" label="Label" caption="Caption" label-placement="inline"></lui-progress-bar>
    </lui-stack>
  </div>
`;

export const Variants = () => `
  <div style="width: 400px; padding: 16px;">
    <lui-stack gap="16">
      <lui-progress-bar value="25" label="Primary"></lui-progress-bar>
      <lui-progress-bar value="25" label="Success" variant="success"></lui-progress-bar>
      <lui-progress-bar value="50" label="Caution" variant="caution"></lui-progress-bar>
      <lui-progress-bar value="100" label="Danger" variant="danger"></lui-progress-bar>
    </lui-stack>
  </div>
`;

export const CustomUnit = () => `
  <div style="width: 400px; padding: 16px;">
    <lui-stack gap="24">
      <lui-progress-bar value="3.2" max="10" value-text="3.2 GB of 10 GB" label="Storage" caption="6.8 GB available"></lui-progress-bar>
      <lui-progress-bar value="9.4" max="10" value-text="9.4 GB of 10 GB" label="Storage" variant="caution" caption="Almost full"></lui-progress-bar>
      <lui-progress-bar value="3" max="4" value-text="3 of 4 steps" label="Setup" label-placement="inline"></lui-progress-bar>
    </lui-stack>
  </div>
`;
CustomUnit.storyName = 'Outras unidades';

export const Sizes = () => `
  <div style="width: 400px; padding: 16px;">
    <lui-stack gap="16">
      <lui-progress-bar value="25" size="sm" label="Small"></lui-progress-bar>
      <lui-progress-bar value="25" size="md" label="Medium"></lui-progress-bar>
      <lui-progress-bar value="25" size="lg" label="Large"></lui-progress-bar>
    </lui-stack>
  </div>
`;

export const Indeterminate = () => `
  <div style="width: 400px; padding: 16px;">
    <lui-stack gap="16">
      <lui-progress-bar size="sm" label="Loading"></lui-progress-bar>
      <lui-progress-bar label="Loading"></lui-progress-bar>
      <lui-progress-bar size="lg" label="Loading"></lui-progress-bar>
    </lui-stack>
  </div>
`;

export const BarOnly = () => `
  <div style="width: 400px; padding: 16px;">
    <lui-stack gap="8">
      <p class="body--md">Your profile is 60% complete</p>
      <lui-progress-bar value="60" label="Profile completion" hide-label hide-value></lui-progress-bar>
    </lui-stack>
  </div>
`;
BarOnly.storyName = 'Só a barra';

export const CSSClass = () => `
  <div style="width: 400px; padding: 16px;">
    <div class="stack stack--gap-24">
      <div class="progress-bar progress-bar--md progress-bar--primary">
        <span class="progress-bar__label" id="css-progress-label">Label</span>
        <span class="progress-bar__value" aria-hidden="true">40%</span>
        <div
          class="progress-bar__track"
          role="progressbar"
          aria-labelledby="css-progress-label"
          aria-describedby="css-progress-caption"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="40"
        >
          <span class="progress-bar__indicator" style="--lui-progress-bar-value: 40%"></span>
        </div>
        <span class="progress-bar__caption" id="css-progress-caption" aria-live="polite">Caption</span>
      </div>
      <div class="progress-bar progress-bar--md progress-bar--success progress-bar--indeterminate progress-bar--inline">
        <span class="progress-bar__label" id="css-progress-busy">Loading</span>
        <div
          class="progress-bar__track"
          role="progressbar"
          aria-labelledby="css-progress-busy"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span class="progress-bar__indicator"></span>
        </div>
        <span class="progress-bar__caption" aria-live="polite"></span>
      </div>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
