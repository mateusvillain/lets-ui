import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Sidebar',
  argTypes: {
    side: {
      control: { type: 'select' },
      options: ['start', 'end'],
    },
    sideWidth: { control: 'text' },
    contentMinWidth: { control: 'text' },
    gap: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'stretch'],
    },
  },
};

const Template = ({ side, sideWidth, contentMinWidth, gap, align }) => `
  <lui-sidebar
    side="${side}"
    side-width="${sideWidth}"
    content-min-width="${contentMinWidth}"
    gap="${gap}"
    align="${align}"
  >
    <div slot="sidebar" style="background: #dbeafe; padding: 16px; border-radius: 6px; font-size: 13px; min-height: 120px;">
      <strong>Sidebar</strong><br>Navigation or metadata
    </div>
    <div slot="content" style="background: #f1f5f9; padding: 16px; border-radius: 6px; font-size: 13px; min-height: 120px;">
      <strong>Main Content</strong><br>Primary page content area
    </div>
  </lui-sidebar>
`;

export const Default = Template.bind({});
Default.args = {
  side: 'start',
  sideWidth: '240px',
  contentMinWidth: '50%',
  gap: 'lg',
  align: 'stretch',
};

export const End = Template.bind({});
End.args = {
  side: 'end',
  sideWidth: '200px',
  contentMinWidth: '50%',
  gap: 'lg',
  align: 'stretch',
};

export const NarrowSidebar = Template.bind({});
NarrowSidebar.args = {
  side: 'start',
  sideWidth: '160px',
  contentMinWidth: '60%',
  gap: 'md',
  align: 'stretch',
};
