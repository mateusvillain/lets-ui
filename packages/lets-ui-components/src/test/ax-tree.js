import { cdp } from 'vitest/browser';

const STATES = ['hasPopup', 'expanded', 'pressed'];
// Text leaves take their content as name; they are never the element at issue.
const TEXT = ['StaticText', 'InlineTextBox'];

// Tests run inside an iframe, and the accessibility tree is per frame.
async function axNodes() {
  const session = cdp();
  const { frameTree } = await session.send('Page.getFrameTree');
  const frames = [frameTree, ...(frameTree.childFrames ?? [])];
  const frame = frames.find((f) => f.frame.url === location.href) ?? frameTree;
  const { nodes } = await session.send('Accessibility.getFullAXTree', {
    frameId: frame.frame.id,
  });
  return nodes.filter((n) => !n.ignored);
}

/**
 * The nodes Chromium exposes with the accessible name `name` or with any of
 * the popup, expanded and pressed states, written the way DevTools shows them:
 * `button "Menu" hasPopup=menu expanded=false`. A role-less host that kept its
 * ARIA shows up here as an extra `generic` entry.
 */
export async function exposed(name) {
  return (await axNodes())
    .filter((n) => !TEXT.includes(n.role?.value))
    .filter(
      (n) =>
        n.name?.value === name ||
        n.properties?.some((p) => STATES.includes(p.name))
    )
    .map((n) => {
      const states = STATES.flatMap((state) => {
        const prop = n.properties?.find((p) => p.name === state);
        return prop ? [`${state}=${prop.value.value}`] : [];
      });
      const label = n.name?.value ? `"${n.name.value}"` : '';
      return [n.role?.value, label, ...states].filter(Boolean).join(' ');
    });
}
