import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiStepper } from './stepper.ts';
import { LuiStep } from './step.ts';

// Only the two elements under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-stepper', LuiStepper);
customElements.define('lui-step', LuiStep);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const stepper = host.querySelector('lui-stepper');
  const steps = [...host.querySelectorAll('lui-step')];
  await stepper.updateComplete;
  await Promise.all(steps.map((s) => s.updateComplete));
  return { stepper, steps };
}

async function settle(stepper, steps) {
  await stepper.updateComplete;
  await Promise.all(steps.map((s) => s.updateComplete));
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const trigger = (step) => step.shadowRoot.querySelector('button');
const item = (step) => step.shadowRoot.querySelector('.stepper__item');
const connector = (step) =>
  step.shadowRoot.querySelector('.stepper__connector');
const statuses = (steps) => steps.map((s) => s.status);

const FOUR = (attrs = '') => `
  <lui-stepper ${attrs}>
    <lui-step label="Account" description="Your details"></lui-step>
    <lui-step label="Address"></lui-step>
    <lui-step label="Payment"></lui-step>
    <lui-step label="Review"></lui-step>
  </lui-stepper>
`;

describe('lui-stepper status', () => {
  it('marks steps before, at and after current-step', async () => {
    const { steps } = await mount(FOUR('current-step="2"'));
    expect(statuses(steps)).toEqual([
      'completed',
      'active',
      'upcoming',
      'upcoming',
    ]);
    expect(item(steps[0]).classList).toContain('stepper__item--completed');
  });

  it('numbers the steps in order', async () => {
    const { steps } = await mount(FOUR());
    const numbers = steps.map(
      (s) => s.shadowRoot.querySelector('.stepper__number').textContent
    );
    expect(numbers).toEqual(['1', '2', '3', '4']);
  });

  it('clamps an out-of-range current-step', async () => {
    const { stepper, steps } = await mount(FOUR('current-step="9"'));
    expect(statuses(steps).at(-1)).toBe('active');

    stepper.currentStep = 0;
    await settle(stepper, steps);
    expect(statuses(steps)[0]).toBe('active');
  });

  it('hides only the last connector', async () => {
    const { steps } = await mount(FOUR());
    expect(steps.map((s) => connector(s).hidden)).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it('fills the connector of completed steps', async () => {
    const { steps } = await mount(FOUR('current-step="3"'));
    const filled = getComputedStyle(connector(steps[0])).backgroundColor;
    const empty = getComputedStyle(connector(steps[2])).backgroundColor;
    expect(filled).not.toBe(empty);
  });
});

describe('lui-stepper semantics', () => {
  it('exposes a labelled list of list items', async () => {
    const { stepper, steps } = await mount(FOUR('label="Checkout"'));
    const list = stepper.shadowRoot.querySelector('[role="list"]');
    expect(list.getAttribute('aria-label')).toBe('Checkout');
    steps.forEach((s) => expect(s.getAttribute('role')).toBe('listitem'));
  });

  it('puts aria-current="step" on the active step only', async () => {
    const { steps } = await mount(FOUR('current-step="2"'));
    expect(steps.map((s) => trigger(s).getAttribute('aria-current'))).toEqual([
      null,
      'step',
      null,
      null,
    ]);
  });

  it('announces completed and loading steps', async () => {
    const { steps } = await mount(`
      <lui-stepper current-step="2" completed-label="Done" loading-label="Saving">
        <lui-step label="One"></lui-step>
        <lui-step label="Two" loading></lui-step>
        <lui-step label="Three"></lui-step>
      </lui-stepper>
    `);
    const status = (s) =>
      s.shadowRoot.querySelector('.stepper__status')?.textContent;
    expect(status(steps[0])).toBe('Done');
    expect(status(steps[1])).toBe('Saving');
    expect(status(steps[2])).toBeUndefined();
    expect(trigger(steps[1]).getAttribute('aria-busy')).toBe('true');
    expect(steps[1].shadowRoot.querySelector('.stepper__spinner')).not.toBe(
      null
    );
  });
});

describe('lui-stepper navigation', () => {
  it('moves to a clicked step and emits lui-step-change', async () => {
    const { stepper, steps } = await mount(FOUR());
    const events = [];
    stepper.addEventListener('lui-step-change', (e) => events.push(e.detail));

    await userEvent.click(trigger(steps[2]));
    await settle(stepper, steps);

    expect(stepper.currentStep).toBe(3);
    expect(stepper.getAttribute('current-step')).toBe('3');
    expect(events).toEqual([{ step: 3, previous: 1 }]);
  });

  it('does not emit when the current step is clicked', async () => {
    const { stepper, steps } = await mount(FOUR('current-step="2"'));
    let fired = false;
    stepper.addEventListener('lui-step-change', () => (fired = true));
    await userEvent.click(trigger(steps[1]));
    expect(fired).toBe(false);
  });

  it('stays put when lui-step-change is prevented', async () => {
    const { stepper, steps } = await mount(FOUR());
    stepper.addEventListener('lui-step-change', (e) => e.preventDefault());

    await userEvent.click(trigger(steps[3]));
    await settle(stepper, steps);

    expect(stepper.currentStep).toBe(1);
    expect(statuses(steps)[0]).toBe('active');
  });

  it('blocks steps ahead of the current one in a linear stepper', async () => {
    const { stepper, steps } = await mount(FOUR('current-step="2" linear'));
    expect(trigger(steps[2]).getAttribute('aria-disabled')).toBe('true');
    expect(trigger(steps[0]).hasAttribute('aria-disabled')).toBe(false);

    // Playwright will not click an aria-disabled control, so dispatch it.
    trigger(steps[2]).click();
    await settle(stepper, steps);
    expect(stepper.currentStep).toBe(2);

    await userEvent.click(trigger(steps[0]));
    await settle(stepper, steps);
    expect(stepper.currentStep).toBe(1);
  });

  it('does not select a disabled step', async () => {
    const { stepper, steps } = await mount(`
      <lui-stepper>
        <lui-step label="One"></lui-step>
        <lui-step label="Two" disabled></lui-step>
      </lui-stepper>
    `);
    expect(trigger(steps[1]).disabled).toBe(true);
    trigger(steps[1]).click();
    await settle(stepper, steps);
    expect(stepper.currentStep).toBe(1);
  });

  it('ignores steps of a nested stepper', async () => {
    const { stepper } = await mount(`
      <lui-stepper>
        <lui-step label="Outer one"></lui-step>
        <lui-step label="Outer two"></lui-step>
        <div>
          <lui-stepper>
            <lui-step label="Inner one"></lui-step>
            <lui-step label="Inner two"></lui-step>
          </lui-stepper>
        </div>
      </lui-stepper>
    `);
    const inner = stepper.querySelector('lui-stepper');
    const innerSteps = [...inner.querySelectorAll('lui-step')];
    await settle(inner, innerSteps);

    await userEvent.click(trigger(innerSteps[1]));
    await settle(inner, innerSteps);

    expect(inner.currentStep).toBe(2);
    expect(stepper.currentStep).toBe(1);
  });
});

describe('lui-stepper layout', () => {
  it('pushes the orientation down to the steps', async () => {
    const { stepper, steps } = await mount(FOUR('orientation="vertical"'));
    expect(steps[0].shadowRoot.querySelector('.stepper--vertical')).not.toBe(
      null
    );

    stepper.orientation = 'diagonal';
    await settle(stepper, steps);
    expect(steps[0].shadowRoot.querySelector('.stepper--horizontal')).not.toBe(
      null
    );
  });

  it('keeps labels beside the indicator in a vertical stepper', async () => {
    const { stepper, steps } = await mount(
      FOUR('orientation="vertical" label-placement="bottom"')
    );
    expect(stepper.shadowRoot.querySelector('.stepper--labels-bottom')).toBe(
      null
    );
    expect(steps[0].shadowRoot.querySelector('.stepper--labels-bottom')).toBe(
      null
    );
  });

  it('gives every indicator the same size whatever its status', async () => {
    const { steps } = await mount(FOUR('current-step="2"'));
    const sizes = steps.slice(0, 3).map((s) => {
      const box = s.shadowRoot
        .querySelector('.stepper__indicator')
        .getBoundingClientRect();
      return [box.width, box.height];
    });
    expect(sizes[1]).toEqual(sizes[0]);
    expect(sizes[2]).toEqual(sizes[0]);
  });

  it('centres the vertical connector under the indicator', async () => {
    const { steps } = await mount(FOUR('orientation="vertical"'));
    const indicator = steps[0].shadowRoot
      .querySelector('.stepper__indicator')
      .getBoundingClientRect();
    const line = connector(steps[0]).getBoundingClientRect();
    const indicatorCentre = indicator.left + indicator.width / 2;
    const lineCentre = line.left + line.width / 2;
    expect(Math.abs(indicatorCentre - lineCentre)).toBeLessThan(1);
    expect(line.height).toBeGreaterThan(0);
  });
});

const nextFrame = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
const announcement = (stepper) =>
  stepper.shadowRoot.querySelector('[role="status"]').textContent.trim();
const position = (step) =>
  step.shadowRoot.querySelector('.stepper__position').textContent;

describe('lui-stepper position', () => {
  it('names each step with its position and the total', async () => {
    const { steps } = await mount(FOUR());
    expect(steps.map(position)).toEqual([
      'Step 1 of 4',
      'Step 2 of 4',
      'Step 3 of 4',
      'Step 4 of 4',
    ]);
  });

  it('hides the visible number from assistive technology', async () => {
    const { steps } = await mount(FOUR());
    const indicator = steps[0].shadowRoot.querySelector('.stepper__indicator');
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the position while the step is loading', async () => {
    const { steps } = await mount(`
      <lui-stepper current-step="2">
        <lui-step label="One"></lui-step>
        <lui-step label="Two" loading></lui-step>
      </lui-stepper>
    `);
    expect(position(steps[1])).toBe('Step 2 of 2');
    expect(steps[1].shadowRoot.querySelector('.stepper__number')).toBe(null);
  });

  it('takes a translated template from step-label', async () => {
    const { steps } = await mount(FOUR('step-label="Etapa {step} de {total}"'));
    expect(position(steps[2])).toBe('Etapa 3 de 4');
  });

  it('recounts the total when a step is added', async () => {
    const { stepper, steps } = await mount(FOUR());
    const extra = document.createElement('lui-step');
    stepper.append(extra);
    await new Promise((r) => setTimeout(r));
    await settle(stepper, [...steps, extra]);
    expect(position(steps[0])).toBe('Step 1 of 5');
    expect(position(extra)).toBe('Step 5 of 5');
  });
});

describe('lui-stepper announcement', () => {
  it('starts empty', async () => {
    const { stepper } = await mount(FOUR('current-step="2"'));
    expect(announcement(stepper)).toBe('');
  });

  it('announces the new step after a click', async () => {
    const { stepper, steps } = await mount(FOUR());
    await userEvent.click(trigger(steps[2]));
    await settle(stepper, steps);
    expect(announcement(stepper)).toBe('Step 3 of 4, Payment');
  });

  it('announces a change made from outside the stepper', async () => {
    const { stepper, steps } = await mount(FOUR());
    stepper.currentStep = 2;
    await settle(stepper, steps);
    expect(announcement(stepper)).toBe('Step 2 of 4, Address');
  });

  it('does not announce a prevented change', async () => {
    const { stepper, steps } = await mount(FOUR());
    stepper.addEventListener('lui-step-change', (e) => e.preventDefault());
    await userEvent.click(trigger(steps[2]));
    await settle(stepper, steps);
    expect(announcement(stepper)).toBe('');
  });
});

describe('lui-stepper reflow', () => {
  const orientationOf = (step) =>
    step.shadowRoot.querySelector('.stepper--vertical')
      ? 'vertical'
      : 'horizontal';

  it('stacks when the row does not fit, and unfolds when it does', async () => {
    const { stepper, steps } = await mount(FOUR());
    const host = stepper.parentElement;

    host.style.width = '320px';
    await nextFrame();
    await settle(stepper, steps);
    expect(steps.map(orientationOf)).toEqual(Array(4).fill('vertical'));
    expect(stepper.orientation).toBe('horizontal');

    host.style.width = '1000px';
    await nextFrame();
    await settle(stepper, steps);
    expect(steps.map(orientationOf)).toEqual(Array(4).fill('horizontal'));
  });

  it('stays horizontal when the row fits', async () => {
    const { stepper, steps } = await mount(`
      <div style="width: 320px">
        <lui-stepper>
          <lui-step></lui-step><lui-step></lui-step><lui-step></lui-step>
        </lui-stepper>
      </div>
    `);
    await nextFrame();
    await settle(stepper, steps);
    expect(steps.map(orientationOf)).toEqual(Array(3).fill('horizontal'));
  });
});
