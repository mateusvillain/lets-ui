import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/ScrollArea',
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal', 'both'],
    },
    scrollbarVisibility: {
      control: { type: 'select' },
      options: ['auto', 'always', 'hover', 'hidden'],
      name: 'scrollbar-visibility',
    },
    fade: {
      control: { type: 'select' },
      options: ['off', 'all', 'top', 'bottom', 'top bottom', 'left', 'right'],
      description:
        '"off" removes the attribute. "all" adds the boolean form (fade). Any other value maps to fade="value".',
    },
    scrollShadow: {
      control: 'boolean',
      name: 'scroll-shadow',
    },
    snap: {
      control: 'boolean',
    },
    snapAlign: {
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
      name: 'snap-align',
    },
    height: { control: 'text' },
    maxHeight: { control: 'text', name: 'max-height' },
    maxWidth: { control: 'text', name: 'max-width' },
    overscroll: {
      control: { type: 'select' },
      options: ['auto', 'contain', 'none'],
    },
    disabled: { control: 'boolean' },
  },
};

const items = (count = 14) =>
  Array.from(
    { length: count },
    (_, i) =>
      `<div style="padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; color: #374151;">Item ${i + 1} — conteúdo de exemplo</div>`
  ).join('');

const cards = (count = 10) =>
  Array.from(
    { length: count },
    (_, i) =>
      `<div style="flex-shrink:0; width:120px; height:80px; border-radius:8px; background:#e5e7eb; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#6b7280;">Card ${i + 1}</div>`
  ).join('');

const gridContent = `
  <div style="display:flex; flex-direction:column; gap:2px; min-width:600px;">
    ${Array.from(
      { length: 8 },
      (_, row) => `
      <div style="display:flex; gap:2px;">
        ${Array.from(
          { length: 10 },
          (_, col) =>
            `<div style="flex-shrink:0; width:56px; height:36px; background:#f3f4f6; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:11px; color:#6b7280;">${row + 1}×${col + 1}</div>`
        ).join('')}
      </div>
    `
    ).join('')}
  </div>
`;

const Template = ({
  orientation,
  scrollbarVisibility,
  fade,
  scrollShadow,
  snap,
  snapAlign,
  height,
  maxHeight,
  maxWidth,
  overscroll,
  disabled,
}) => `
  <div style="padding: 16px; max-width: 480px;">
    <lui-scroll-area
      orientation="${orientation}"
      scrollbar-visibility="${scrollbarVisibility}"
      ${fade === 'all' ? 'fade' : fade && fade !== 'off' ? `fade="${fade}"` : ''}
      ${scrollShadow ? 'scroll-shadow' : ''}
      ${snap ? 'snap' : ''}
      ${snap ? `snap-align="${snapAlign}"` : ''}
      ${height ? `height="${height}"` : ''}
      ${maxHeight ? `max-height="${maxHeight}"` : ''}
      ${maxWidth ? `max-width="${maxWidth}"` : ''}
      ${overscroll !== 'auto' ? `overscroll="${overscroll}"` : ''}
      ${disabled ? 'disabled' : ''}
    >
      ${
        orientation === 'horizontal'
          ? `<div style="display:flex; gap:12px; padding:4px 0;">${cards()}</div>`
          : orientation === 'both'
            ? gridContent
            : `<div>${items()}</div>`
      }
    </lui-scroll-area>
  </div>
`;

export const Default = Template.bind({});
Default.args = {
  orientation: 'vertical',
  scrollbarVisibility: 'auto',
  fade: 'off',
  scrollShadow: false,
  snap: false,
  snapAlign: 'start',
  height: '240',
  maxHeight: '',
  maxWidth: '',
  overscroll: 'auto',
  disabled: false,
};

export const Horizontal = () => `
  <div style="padding: 16px; max-width: 480px;">
    <lui-scroll-area orientation="horizontal">
      <div style="display:flex; gap:12px; padding:4px 0;">
        ${cards(12)}
      </div>
    </lui-scroll-area>
  </div>
`;
Horizontal.storyName = 'orientation="horizontal"';

export const Both = () => `
  <div style="padding: 16px; max-width: 480px;">
    <lui-scroll-area orientation="both" height="200">
      ${gridContent}
    </lui-scroll-area>
  </div>
`;
Both.storyName = 'orientation="both"';

export const ScrollbarVisibilityVariants = () => `
  <div style="padding: 16px; display:flex; flex-wrap:wrap; gap:24px;">
    ${['auto', 'always', 'hover', 'hidden']
      .map(
        (v) => `
      <div style="display:flex; flex-direction:column; gap:8px; min-width:180px;">
        <span style="font-family:monospace; font-size:11px; color:#6b7280;">${v}</span>
        <lui-scroll-area height="120" scrollbar-visibility="${v}">
          <div>${items(10)}</div>
        </lui-scroll-area>
      </div>
    `
      )
      .join('')}
  </div>
`;
ScrollbarVisibilityVariants.storyName = 'scrollbar-visibility';

export const Fade = () => `
  <div style="padding: 16px; max-width: 400px; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb;">
    <lui-scroll-area height="200" fade>
      <div>${items(18)}</div>
    </lui-scroll-area>
  </div>
`;
Fade.storyName = 'fade (boolean)';

export const FadeDirections = () => `
  <div style="padding: 16px; display:flex; flex-wrap:wrap; gap:24px;">
    ${[
      { label: 'fade (all)', attr: 'fade' },
      { label: 'fade="bottom"', attr: 'fade="bottom"' },
      { label: 'fade="top bottom"', attr: 'fade="top bottom"' },
    ]
      .map(
        ({ label, attr }) => `
      <div style="display:flex; flex-direction:column; gap:8px; min-width:180px;">
        <span style="font-family:monospace; font-size:11px; color:#6b7280;">${label}</span>
        <div style="background:#fff; border-radius:8px; border:1px solid #e5e7eb; padding:8px;">
          <lui-scroll-area height="160" ${attr}>
            <div>${items(14)}</div>
          </lui-scroll-area>
        </div>
      </div>
    `
      )
      .join('')}
  </div>
`;
FadeDirections.storyName = 'fade — directions';

export const ScrollShadow = () => `
  <div style="padding: 16px; max-width: 400px;">
    <lui-scroll-area height="200" scroll-shadow>
      <div>${items(18)}</div>
    </lui-scroll-area>
  </div>
`;
ScrollShadow.storyName = 'scroll-shadow';

export const Snap = () => `
  <div style="padding: 16px; max-width: 480px;">
    <lui-scroll-area orientation="horizontal" snap snap-align="start" scrollbar-visibility="hidden">
      <div style="display:flex; gap:0;">
        ${Array.from(
          { length: 6 },
          (_, i) => `
          <div style="
            flex-shrink:0; width:100%; min-width:280px; height:140px;
            border-radius:8px; margin-right:12px;
            background:hsl(${i * 50}, 60%, 82%);
            display:flex; align-items:center; justify-content:center;
            font-size:20px; font-weight:700; color:rgba(0,0,0,0.45);
          ">Slide ${i + 1}</div>
        `
        ).join('')}
      </div>
    </lui-scroll-area>
  </div>
`;
Snap.storyName = 'snap';

export const SnapCenter = () => `
  <div style="padding: 16px; max-width: 480px;">
    <lui-scroll-area orientation="horizontal" snap snap-align="center" scrollbar-visibility="hidden">
      <div style="display:flex; gap:0;">
        ${Array.from(
          { length: 6 },
          (_, i) => `
          <div style="
            flex-shrink:0; width:80%; min-width:220px; height:120px;
            border-radius:8px; margin-right:16px;
            background:hsl(${i * 60}, 55%, 80%);
            display:flex; align-items:center; justify-content:center;
            font-size:16px; font-weight:600; color:rgba(0,0,0,0.4);
          ">Slide ${i + 1}</div>
        `
        ).join('')}
      </div>
    </lui-scroll-area>
  </div>
`;
SnapCenter.storyName = 'snap snap-align="center"';

export const Overscroll = () => `
  <div style="padding: 16px; display:flex; gap:24px; flex-wrap:wrap;">
    ${['auto', 'contain', 'none']
      .map(
        (v) => `
      <div style="display:flex; flex-direction:column; gap:8px; min-width:180px;">
        <span style="font-family:monospace; font-size:11px; color:#6b7280;">overscroll="${v}"</span>
        <lui-scroll-area height="120" overscroll="${v}">
          <div>${items(10)}</div>
        </lui-scroll-area>
      </div>
    `
      )
      .join('')}
  </div>
`;
Overscroll.storyName = 'overscroll';

export const MaxHeight = () => `
  <div style="padding: 16px; max-width: 400px; display:flex; flex-direction:column; gap:24px;">
    <div style="display:flex; flex-direction:column; gap:8px;">
      <span style="font-family:monospace; font-size:11px; color:#6b7280;">max-height="180" — 5 itens (sem scroll)</span>
      <lui-scroll-area max-height="180" fade>
        <div>${items(5)}</div>
      </lui-scroll-area>
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      <span style="font-family:monospace; font-size:11px; color:#6b7280;">max-height="180" — 14 itens (com scroll)</span>
      <lui-scroll-area max-height="180" fade>
        <div>${items(14)}</div>
      </lui-scroll-area>
    </div>
  </div>
`;
MaxHeight.storyName = 'max-height';

export const Disabled = () => `
  <div style="padding: 16px; max-width: 400px;">
    <lui-scroll-area height="180" disabled>
      <div>${items(14)}</div>
    </lui-scroll-area>
  </div>
`;
Disabled.storyName = 'disabled';

export const WithEvents = () => {
  const id = 'sa-events-demo';
  const logId = 'sa-events-log';

  const html = `
    <div style="padding:16px; display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:640px;">
      <lui-scroll-area id="${id}" height="200" fade>
        <div>${items(18)}</div>
      </lui-scroll-area>
      <div id="${logId}" style="
        background:#0f172a; border-radius:8px; padding:12px;
        font-family:monospace; font-size:11px; color:#94a3b8;
        overflow:hidden; display:flex; flex-direction:column; gap:3px;
        min-height:200px;
      ">
        <span style="color:#475569; font-style:italic;">Role para ver eventos…</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const area = document.getElementById(id);
    const log = document.getElementById(logId);
    if (!area || !log) return;

    const add = (name, detail) => {
      const empty = log.querySelector('[data-empty]');
      if (empty) empty.remove();
      const el = document.createElement('div');
      el.style.color = '#e2e8f0';
      el.innerHTML = `<span style="color:#38bdf8">${name}</span>${detail ? ` <span style="color:#64748b">${JSON.stringify(detail).slice(0, 48)}</span>` : ''}`;
      log.insertBefore(el, log.firstChild);
      const all = log.children;
      if (all.length > 7) log.removeChild(all[all.length - 1]);
    };

    area.addEventListener('scroll-start', () => add('scroll-start'));
    area.addEventListener('scroll-end', () => add('scroll-end'));
    area.addEventListener('reach-top', () => add('reach-top'));
    area.addEventListener('reach-bottom', () => add('reach-bottom'));
    area.addEventListener('scroll', (e) =>
      add('scroll', { top: Math.round(e.detail.scrollTop) })
    );
  }, 100);

  return html;
};
WithEvents.storyName = 'Events';
