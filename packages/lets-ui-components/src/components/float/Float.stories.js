import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Float',
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: [
        'top-start',
        'top-center',
        'top-end',
        'middle-start',
        'middle-center',
        'middle-end',
        'bottom-start',
        'bottom-center',
        'bottom-end',
      ],
    },
    offsetX: { control: 'text', name: 'offset-x' },
    offsetY: { control: 'text', name: 'offset-y' },
  },
};

const avatar = `
  <div style="
    width: 72px; height: 72px; border-radius: 50%;
    background: #dbeafe; color: #1d4ed8;
    font-size: 22px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  ">MV</div>
`;

const badge = (label = '3') => `
  <span slot="float" style="
    display: flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 50%;
    background: #ef4444; color: #fff;
    font-size: 11px; font-weight: 700;
    border: 2px solid #fff;
  ">${label}</span>
`;

const Template = ({ placement, offsetX, offsetY }) => `
  <div style="padding: 48px; display: inline-flex;">
    <lui-float
      placement="${placement}"
      ${offsetX ? `offset-x="${offsetX}"` : ''}
      ${offsetY ? `offset-y="${offsetY}"` : ''}
    >
      ${avatar}
      ${badge()}
    </lui-float>
  </div>
`;

export const Default = Template.bind({});
Default.args = { placement: 'bottom-end', offsetX: '', offsetY: '' };

export const TopEnd = Template.bind({});
TopEnd.args = { placement: 'top-end', offsetX: '', offsetY: '' };
TopEnd.storyName = 'top-end';

export const TopStart = Template.bind({});
TopStart.args = { placement: 'top-start', offsetX: '', offsetY: '' };
TopStart.storyName = 'top-start';

export const TopCenter = Template.bind({});
TopCenter.args = { placement: 'top-center', offsetX: '', offsetY: '' };
TopCenter.storyName = 'top-center';

export const MiddleCenter = Template.bind({});
MiddleCenter.args = { placement: 'middle-center', offsetX: '', offsetY: '' };
MiddleCenter.storyName = 'middle-center';

export const MiddleStart = Template.bind({});
MiddleStart.args = { placement: 'middle-start', offsetX: '', offsetY: '' };
MiddleStart.storyName = 'middle-start';

export const MiddleEnd = Template.bind({});
MiddleEnd.args = { placement: 'middle-end', offsetX: '', offsetY: '' };
MiddleEnd.storyName = 'middle-end';

export const BottomStart = Template.bind({});
BottomStart.args = { placement: 'bottom-start', offsetX: '', offsetY: '' };
BottomStart.storyName = 'bottom-start';

export const BottomCenter = Template.bind({});
BottomCenter.args = { placement: 'bottom-center', offsetX: '', offsetY: '' };
BottomCenter.storyName = 'bottom-center';

export const AllPlacements = () => {
  const placements = [
    'top-start',
    'top-center',
    'top-end',
    'middle-start',
    'middle-center',
    'middle-end',
    'bottom-start',
    'bottom-center',
    'bottom-end',
  ];

  return `
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 56px;
      padding: 48px;
    ">
      ${placements
        .map(
          (p) => `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <lui-float placement="${p}">
            <div style="
              width: 72px; height: 72px; border-radius: 8px;
              background: #e5e7eb;
            "></div>
            <span slot="float" style="
              display: flex; align-items: center; justify-content: center;
              width: 20px; height: 20px; border-radius: 50%;
              background: #ef4444; color: #fff;
              font-size: 11px; font-weight: 700;
              border: 2px solid #fff;
            ">3</span>
          </lui-float>
          <span style="font-family: monospace; font-size: 11px; color: #6b7280;">${p}</span>
        </div>
      `
        )
        .join('')}
    </div>
  `;
};
AllPlacements.storyName = 'All Placements';

export const WithOffset = () => `
  <div style="padding: 48px; display: flex; gap: 64px; align-items: center; flex-wrap: wrap;">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <lui-float placement="top-end">
        <div style="width: 72px; height: 72px; border-radius: 8px; background: #e5e7eb;"></div>
        <span slot="float" style="
          display: flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 50%;
          background: #ef4444; color: #fff; font-size: 11px; font-weight: 700;
          border: 2px solid #fff;
        ">!</span>
      </lui-float>
      <span style="font-family: monospace; font-size: 11px; color: #6b7280;">no offset</span>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <lui-float placement="top-end" offset-x="-4" offset-y="4">
        <div style="width: 72px; height: 72px; border-radius: 8px; background: #e5e7eb;"></div>
        <span slot="float" style="
          display: flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 50%;
          background: #3b82f6; color: #fff; font-size: 11px; font-weight: 700;
          border: 2px solid #fff;
        ">!</span>
      </lui-float>
      <span style="font-family: monospace; font-size: 11px; color: #6b7280;">offset-x="-4" offset-y="4"</span>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <lui-float placement="bottom-end" offset-x="4" offset-y="-4">
        <div style="width: 72px; height: 72px; border-radius: 8px; background: #e5e7eb;"></div>
        <span slot="float" style="
          display: flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 50%;
          background: #22c55e; color: #fff; font-size: 11px; font-weight: 700;
          border: 2px solid #fff;
        ">!</span>
      </lui-float>
      <span style="font-family: monospace; font-size: 11px; color: #6b7280;">offset-x="4" offset-y="-4"</span>
    </div>
  </div>
`;
WithOffset.storyName = 'With Offset';

export const AvatarWithStatus = () => `
  <div style="padding: 48px; display: flex; gap: 40px; align-items: center; flex-wrap: wrap;">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <lui-float placement="bottom-end">
        <div style="
          width: 56px; height: 56px; border-radius: 50%;
          background: #dbeafe; color: #1d4ed8;
          font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        ">MV</div>
        <span slot="float" style="
          display: block; width: 13px; height: 13px; border-radius: 50%;
          background: #22c55e; border: 2px solid #fff;
        "></span>
      </lui-float>
      <span style="font-size: 12px; color: #6b7280;">Online</span>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <lui-float placement="bottom-end">
        <div style="
          width: 56px; height: 56px; border-radius: 50%;
          background: #fce7f3; color: #9d174d;
          font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        ">JD</div>
        <span slot="float" style="
          display: block; width: 13px; height: 13px; border-radius: 50%;
          background: #ef4444; border: 2px solid #fff;
        "></span>
      </lui-float>
      <span style="font-size: 12px; color: #6b7280;">Ocupado</span>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <lui-float placement="top-end">
        <div style="
          width: 56px; height: 56px; border-radius: 50%;
          background: #dcfce7; color: #15803d;
          font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        ">AB</div>
        <span slot="float" style="
          display: flex; align-items: center; justify-content: center;
          min-width: 18px; height: 18px; padding: 0 4px;
          border-radius: 999px; background: #ef4444;
          color: #fff; font-size: 10px; font-weight: 700;
          border: 2px solid #fff;
        ">5</span>
      </lui-float>
      <span style="font-size: 12px; color: #6b7280;">Notificações</span>
    </div>
  </div>
`;
AvatarWithStatus.storyName = 'Avatar with Status / Badge';
