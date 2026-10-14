import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiSkeleton } from './skeleton.ts';

customElements.define('lui-skeleton', LuiSkeleton);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const skeleton = host.querySelector('lui-skeleton');
  await skeleton.updateComplete;
  return skeleton;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const bone = (skeleton) => skeleton.shadowRoot.querySelector('.skeleton');

describe('shape', () => {
  it('renders a text line by default', async () => {
    const skeleton = await mount('<lui-skeleton></lui-skeleton>');
    expect(bone(skeleton).classList.contains('skeleton--text')).toBe(true);
  });

  it('renders a circle and a rectangle', async () => {
    const circle = await mount('<lui-skeleton shape="circle"></lui-skeleton>');
    const rectangle = await mount(
      '<lui-skeleton shape="rectangle"></lui-skeleton>'
    );

    expect(bone(circle).classList.contains('skeleton--circle')).toBe(true);
    expect(bone(rectangle).classList.contains('skeleton--rectangle')).toBe(
      true
    );
  });

  it('falls back to text for an unknown shape', async () => {
    const skeleton = await mount('<lui-skeleton shape="blob"></lui-skeleton>');
    await skeleton.updateComplete;
    expect(skeleton.shape).toBe('text');
    expect(bone(skeleton).classList.contains('skeleton--text')).toBe(true);
  });
});

describe('size', () => {
  it('writes width and height as custom properties', async () => {
    const skeleton = await mount(
      '<lui-skeleton width="60%" height="2rem"></lui-skeleton>'
    );

    expect(skeleton.style.getPropertyValue('--lui-skeleton-width')).toBe('60%');
    expect(skeleton.style.getPropertyValue('--lui-skeleton-height')).toBe(
      '2rem'
    );
  });

  it('gives a circle a square default the size of a large avatar', async () => {
    const skeleton = await mount(
      '<lui-skeleton shape="circle"></lui-skeleton>'
    );
    const box = bone(skeleton).getBoundingClientRect();

    expect(box.width).toBe(40);
    expect(box.height).toBe(40);
  });

  it('keeps a circle square when only one side is set', async () => {
    const skeleton = await mount(
      '<lui-skeleton shape="circle" width="24px"></lui-skeleton>'
    );
    const box = bone(skeleton).getBoundingClientRect();

    expect(box.width).toBe(24);
    expect(box.height).toBe(24);
  });
});

describe('accessible name', () => {
  it('hides a decorative bone from assistive technology', async () => {
    const skeleton = await mount('<lui-skeleton></lui-skeleton>');

    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.hasAttribute('role')).toBe(false);
    expect(skeleton.hasAttribute('aria-label')).toBe(false);
  });

  it('announces a labelled placeholder once', async () => {
    const skeleton = await mount(
      '<lui-skeleton label="Carregando perfil"></lui-skeleton>'
    );

    expect(skeleton.getAttribute('role')).toBe('status');
    expect(skeleton.getAttribute('aria-label')).toBe('Carregando perfil');
    expect(skeleton.hasAttribute('aria-hidden')).toBe(false);
  });
});
