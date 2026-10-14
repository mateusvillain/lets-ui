import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Navigation/Stepper',
  argTypes: {
    currentStep: { control: { type: 'number', min: 1, max: 4 } },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    labelPlacement: { control: 'inline-radio', options: ['end', 'bottom'] },
    linear: { control: 'boolean' },
    label: { control: 'text' },
    stepLabel: { control: 'text' },
  },
};

const Template = ({
  currentStep,
  orientation,
  labelPlacement,
  linear,
  label,
  stepLabel,
}) => `
  <lui-stepper
    current-step="${currentStep}"
    orientation="${orientation}"
    label-placement="${labelPlacement}"
    label="${label}"
    step-label="${stepLabel}"
    ${linear ? 'linear' : ''}
  >
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
  </lui-stepper>
`;

export const Default = Template.bind({});
Default.args = {
  currentStep: 2,
  orientation: 'horizontal',
  labelPlacement: 'end',
  linear: false,
  label: 'Progress',
  stepLabel: 'Step {step} of {total}',
};

export const Vertical = () => `
  <lui-stepper current-step="2" orientation="vertical" style="height: 360px;">
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
  </lui-stepper>
`;
Vertical.storyName = 'Vertical';
Vertical.parameters = { controls: { disable: true } };

export const LabelsBottom = () => `
  <lui-stepper current-step="2" label-placement="bottom">
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
    <lui-step label="Step" description="Description"></lui-step>
  </lui-stepper>
`;
LabelsBottom.storyName = 'Rótulos abaixo do indicador';
LabelsBottom.parameters = { controls: { disable: true } };

export const NumbersOnly = () => `
  <lui-stepper current-step="3" label="Checkout progress">
    <lui-step></lui-step>
    <lui-step></lui-step>
    <lui-step></lui-step>
    <lui-step></lui-step>
    <lui-step></lui-step>
  </lui-stepper>
`;
NumbersOnly.storyName = 'Somente números';
NumbersOnly.parameters = { controls: { disable: true } };

export const Loading = () => `
  <lui-stepper current-step="2">
    <lui-step label="Account" description="Your details"></lui-step>
    <lui-step label="Payment" description="Processing" loading></lui-step>
    <lui-step label="Review" description="Confirm the order"></lui-step>
  </lui-stepper>
`;
Loading.storyName = 'Carregando';
Loading.parameters = { controls: { disable: true } };

export const Linear = () => `
  <lui-stepper current-step="2" linear>
    <lui-step label="Account" description="Your details"></lui-step>
    <lui-step label="Address" description="Shipping"></lui-step>
    <lui-step label="Payment" description="Card or PIX"></lui-step>
    <lui-step label="Review" description="Confirm the order"></lui-step>
  </lui-stepper>
`;
Linear.storyName = 'Linear';
Linear.parameters = { controls: { disable: true } };

export const StepChangeEvent = () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';
  wrapper.innerHTML = `
    <lui-stepper current-step="1">
      <lui-step label="Account" description="Your details"></lui-step>
      <lui-step label="Address" description="Shipping"></lui-step>
      <lui-step label="Payment" description="Card or PIX"></lui-step>
    </lui-stepper>
    <label><input type="checkbox" /> Bloquear avanço (preventDefault)</label>
    <p>Etapa atual: <output>1</output></p>
  `;
  const output = wrapper.querySelector('output');
  const block = wrapper.querySelector('input');
  wrapper.addEventListener('lui-step-change', (e) => {
    if (block.checked && e.detail.step > e.detail.previous) {
      e.preventDefault();
      return;
    }
    output.textContent = e.detail.step;
  });
  return wrapper;
};
StepChangeEvent.storyName = 'Evento lui-step-change';
StepChangeEvent.parameters = { controls: { disable: true } };

export const CSSClass = () => `
  <ol class="stepper stepper--horizontal" aria-label="Progress">
    <li class="stepper__item stepper__item--completed">
      <button class="stepper__trigger" type="button">
        <span class="stepper__position">Step 1 of 3</span>
        <span class="stepper__indicator" aria-hidden="true">
          <span class="stepper__circle"><span class="stepper__number">1</span></span>
        </span>
        <span class="stepper__text">
          <span class="stepper__label">Step</span>
          <span class="stepper__description">Description</span>
        </span>
        <span class="stepper__status">Completed</span>
      </button>
      <span class="stepper__connector" aria-hidden="true"></span>
    </li>
    <li class="stepper__item stepper__item--active">
      <button class="stepper__trigger" type="button" aria-current="step">
        <span class="stepper__position">Step 2 of 3</span>
        <span class="stepper__indicator" aria-hidden="true">
          <span class="stepper__circle"><span class="stepper__number">2</span></span>
        </span>
        <span class="stepper__text">
          <span class="stepper__label">Step</span>
          <span class="stepper__description">Description</span>
        </span>
      </button>
      <span class="stepper__connector" aria-hidden="true"></span>
    </li>
    <li class="stepper__item">
      <button class="stepper__trigger" type="button">
        <span class="stepper__position">Step 3 of 3</span>
        <span class="stepper__indicator" aria-hidden="true">
          <span class="stepper__circle"><span class="stepper__number">3</span></span>
        </span>
        <span class="stepper__text">
          <span class="stepper__label">Step</span>
          <span class="stepper__description">Description</span>
        </span>
      </button>
    </li>
  </ol>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = { controls: { disable: true } };
