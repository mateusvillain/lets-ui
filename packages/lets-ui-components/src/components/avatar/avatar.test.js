import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LuiAvatar } from './avatar.ts';
import { LuiAvatarGroup } from './avatar-group.ts';

// Only the elements under test: the full index would pull in every component
// and the Sass each one inlines.
customElements.define('lui-avatar', LuiAvatar);
customElements.define('lui-avatar-group', LuiAvatarGroup);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const elements = [...host.querySelectorAll('lui-avatar, lui-avatar-group')];
  await Promise.all(elements.map((el) => el.updateComplete));
  return {
    avatar: host.querySelector('lui-avatar'),
    avatars: [...host.querySelectorAll('lui-avatar')],
    group: host.querySelector('lui-avatar-group'),
  };
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const box = (avatar) => avatar.shadowRoot.querySelector('.avatar');
const initials = (avatar) =>
  avatar.shadowRoot.querySelector('.avatar__initials');
const image = (avatar) => avatar.shadowRoot.querySelector('img');
const dot = (avatar) => avatar.shadowRoot.querySelector('.avatar__status');
const size = (avatar) => box(avatar).getBoundingClientRect().width;

describe('accessible name', () => {
  it('exposes the name as an image with a label', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain"></lui-avatar>'
    );

    expect(box(avatar).getAttribute('role')).toBe('img');
    expect(box(avatar).getAttribute('aria-label')).toBe('Maria Villain');
    expect(box(avatar).hasAttribute('aria-hidden')).toBe(false);
  });

  it('hides the initials, so the name is read once and not letter by letter', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain"></lui-avatar>'
    );
    expect(initials(avatar).getAttribute('aria-hidden')).toBe('true');
  });

  it('is decorative, and out of the accessibility tree, without a name', async () => {
    const { avatar } = await mount('<lui-avatar initials="MV"></lui-avatar>');

    expect(box(avatar).getAttribute('aria-hidden')).toBe('true');
    expect(box(avatar).hasAttribute('role')).toBe(false);
    expect(box(avatar).hasAttribute('aria-label')).toBe(false);
  });

  it('marks the photo decorative, since the wrapper already carries the name', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></lui-avatar>'
    );
    expect(image(avatar).getAttribute('alt')).toBe('');
  });
});

describe('initials', () => {
  const initialsOf = async (attrs) => {
    const { avatar } = await mount(`<lui-avatar ${attrs}></lui-avatar>`);
    return initials(avatar).textContent.trim();
  };

  it('takes the first letter of the first and last word of the name', async () => {
    expect(await initialsOf('name="Maria Villain"')).toBe('MV');
    expect(await initialsOf('name="maria de souza villain"')).toBe('MV');
  });

  it('uses a single letter for a single word', async () => {
    expect(await initialsOf('name="Maria"')).toBe('M');
  });

  it('lets the initials attribute win over the name', async () => {
    expect(await initialsOf('name="Maria Villain" initials="AB"')).toBe('AB');
  });
});

describe('photo', () => {
  it('shows the photo instead of the initials', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></lui-avatar>'
    );

    expect(image(avatar)).not.toBeNull();
    expect(initials(avatar)).toBeNull();
  });

  it('falls back to the initials when the photo fails to load', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain" src="/does-not-exist.png"></lui-avatar>'
    );

    await vi.waitFor(async () => {
      await avatar.updateComplete;
      expect(image(avatar)).toBeNull();
    });
    expect(initials(avatar).textContent.trim()).toBe('MV');
  });

  it('tries again when src changes after a failure', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain" src="/does-not-exist.png"></lui-avatar>'
    );
    await vi.waitFor(async () => {
      await avatar.updateComplete;
      expect(image(avatar)).toBeNull();
    });

    avatar.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    await avatar.updateComplete;
    expect(image(avatar)).not.toBeNull();
  });
});

describe('status', () => {
  it('adds the status to the accessible name, as text', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain" status="online"></lui-avatar>'
    );
    expect(box(avatar).getAttribute('aria-label')).toBe(
      'Maria Villain, Online'
    );
  });

  it('takes the status text from status-label', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain" status="busy" status-label="Ocupada"></lui-avatar>'
    );
    expect(box(avatar).getAttribute('aria-label')).toBe(
      'Maria Villain, Ocupada'
    );
  });

  it('keeps the status in the tree even without a name', async () => {
    const { avatar } = await mount('<lui-avatar status="away"></lui-avatar>');

    expect(box(avatar).getAttribute('role')).toBe('img');
    expect(box(avatar).getAttribute('aria-label')).toBe('Away');
  });

  it('hides the dot itself from assistive technology', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria" status="online"></lui-avatar>'
    );
    expect(dot(avatar).getAttribute('aria-hidden')).toBe('true');
  });

  it('draws no dot for an unknown status', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria" status="invisible"></lui-avatar>'
    );

    expect(dot(avatar)).toBeNull();
    expect(box(avatar).getAttribute('aria-label')).toBe('Maria');
  });

  it('gives each status its own colour', async () => {
    const colours = {};
    for (const status of ['online', 'away', 'busy', 'offline']) {
      const { avatar } = await mount(
        `<lui-avatar name="Maria" status="${status}"></lui-avatar>`
      );
      colours[status] = getComputedStyle(dot(avatar)).backgroundColor;
    }
    expect(new Set(Object.values(colours)).size).toBe(4);
  });

  it('overhangs the bottom-right corner by the width of its ring', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria" status="online"></lui-avatar>'
    );
    const outer = box(avatar).getBoundingClientRect();
    const inner = dot(avatar).getBoundingClientRect();

    expect(inner.right - outer.right).toBeCloseTo(2, 0);
    expect(inner.bottom - outer.bottom).toBeCloseTo(2, 0);
  });

  it('is 10, 12 and 16px at sm, md and lg', async () => {
    const widths = {};
    for (const s of ['sm', 'md', 'lg']) {
      const { avatar } = await mount(
        `<lui-avatar name="Maria" size="${s}" status="online"></lui-avatar>`
      );
      widths[s] = dot(avatar).getBoundingClientRect().width;
    }
    expect(widths).toEqual({ sm: 10, md: 12, lg: 16 });
  });
});

describe('status shape', () => {
  const after = async (status, size = 'lg') => {
    const { avatar } = await mount(
      `<lui-avatar name="Maria" size="${size}" status="${status}"></lui-avatar>`
    );
    return {
      dot: dot(avatar),
      style: getComputedStyle(dot(avatar), '::after'),
    };
  };

  it('draws a shape in the dot for every status but online', async () => {
    expect((await after('online')).style.content).toBe('none');
    for (const status of ['away', 'busy', 'offline']) {
      expect((await after(status)).style.content, status).not.toBe('none');
    }
  });

  it('keeps the ring inside the dot', async () => {
    const { style, dot: el } = await after('busy', 'md');
    const dotStyle = getComputedStyle(el);

    expect(parseFloat(dotStyle.borderTopWidth)).toBe(2);
    expect(dotStyle.boxShadow).toBe('none');
    expect(style.position).toBe('absolute');
  });

  it('centres the busy bar: 1px high, half the area inside the ring', async () => {
    const { style } = await after('busy');

    expect(parseFloat(style.height)).toBe(1);
    // The area inside the ring is the dot minus 2px of ring on each side.
    const { dot: el } = await after('busy');
    const inside = el.getBoundingClientRect().width - 4;
    expect(parseFloat(style.width)).toBeCloseTo(inside / 2, 0);
  });

  it('makes the offline centre a circle of half the inside area', async () => {
    const { style, dot: el } = await after('offline');
    const inside = el.getBoundingClientRect().width - 4;

    expect(parseFloat(style.width)).toBeCloseTo(inside / 2, 0);
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0);
  });

  it('scales the shape with the dot', async () => {
    const lg = parseFloat((await after('offline', 'lg')).style.width);
    const sm = parseFloat((await after('offline', 'sm')).style.width);
    expect(sm).toBeLessThan(lg);
  });

  it('does not change the accessible name', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain" status="busy"></lui-avatar>'
    );
    expect(box(avatar).getAttribute('aria-label')).toBe('Maria Villain, Busy');
  });
});

describe('size, radius and variant', () => {
  it('is 40px by default', async () => {
    const { avatar } = await mount('<lui-avatar name="Maria"></lui-avatar>');
    expect(size(avatar)).toBe(40);
  });

  it('takes sm, md and lg', async () => {
    const sizes = {};
    for (const s of ['sm', 'md', 'lg']) {
      const { avatar } = await mount(
        `<lui-avatar name="Maria" size="${s}"></lui-avatar>`
      );
      sizes[s] = size(avatar);
    }
    expect(sizes).toEqual({ sm: 24, md: 32, lg: 40 });
  });

  it('scales the initials with the avatar', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria Villain" size="lg"></lui-avatar>'
    );
    expect(parseFloat(getComputedStyle(box(avatar)).fontSize)).toBeCloseTo(
      12,
      1
    );

    const { avatar: small } = await mount(
      '<lui-avatar name="Maria Villain" size="sm"></lui-avatar>'
    );
    expect(parseFloat(getComputedStyle(box(small)).fontSize)).toBeCloseTo(
      7.2,
      1
    );
  });

  it('falls back to the default for an unknown size', async () => {
    const { avatar } = await mount(
      '<lui-avatar name="Maria" size="huge"></lui-avatar>'
    );
    expect(size(avatar)).toBe(40);
  });

  it('draws a circle, rounded corners or a square', async () => {
    const radius = async (value) => {
      const { avatar } = await mount(
        `<lui-avatar name="Maria" radius="${value}"></lui-avatar>`
      );
      return parseFloat(getComputedStyle(box(avatar)).borderTopLeftRadius);
    };

    expect(await radius('square')).toBe(0);
    expect(await radius('rounded')).toBeGreaterThan(0);
    expect(await radius('circle')).toBeGreaterThan(await radius('rounded'));
  });

  it('paints each variant in its own colour', async () => {
    const backgrounds = new Set();
    for (const variant of [
      'gray',
      'blue',
      'green',
      'orange',
      'red',
      'violet',
    ]) {
      const { avatar } = await mount(
        `<lui-avatar name="Maria" variant="${variant}"></lui-avatar>`
      );
      backgrounds.add(getComputedStyle(box(avatar)).backgroundColor);
    }
    expect(backgrounds.size).toBe(6);
  });

  it('keeps the initials readable on every variant', async () => {
    const channels = (colour) =>
      colour
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
    const luminance = (colour) => {
      const [r, g, b] = channels(colour).map((c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    for (const variant of [
      'gray',
      'blue',
      'green',
      'orange',
      'red',
      'violet',
    ]) {
      const { avatar } = await mount(
        `<lui-avatar name="Maria" variant="${variant}"></lui-avatar>`
      );
      const style = getComputedStyle(box(avatar));
      const [a, b] = [
        luminance(style.color),
        luminance(style.backgroundColor),
      ].sort((x, y) => y - x);
      expect((a + 0.05) / (b + 0.05), variant).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('lui-avatar-group', () => {
  const GROUP = (attrs = '') => `
    <lui-avatar-group ${attrs}>
      <lui-avatar name="Ana Lima"></lui-avatar>
      <lui-avatar name="Bia Souza"></lui-avatar>
      <lui-avatar name="Caio Reis"></lui-avatar>
    </lui-avatar-group>
  `;

  it('is a labelled group', async () => {
    const { group } = await mount(GROUP('label="Project members"'));
    const wrapper = group.shadowRoot.querySelector('[role="group"]');

    expect(wrapper.getAttribute('aria-label')).toBe('Project members');
  });

  it('has no label attribute when none is given', async () => {
    const { group } = await mount(GROUP());
    expect(
      group.shadowRoot
        .querySelector('[role="group"]')
        .hasAttribute('aria-label')
    ).toBe(false);
  });

  it('overlaps each avatar over the previous one', async () => {
    const { avatars } = await mount(GROUP());
    const [first, second] = avatars.map((a) => box(a).getBoundingClientRect());

    expect(second.left).toBeLessThan(first.right);
    expect(first.right - second.left).toBeCloseTo(12, 0);
  });

  it('does not overlap the first avatar', async () => {
    const { group, avatars } = await mount(GROUP());
    const start = group.getBoundingClientRect().left;
    expect(box(avatars[0]).getBoundingClientRect().left).toBeCloseTo(start, 0);
  });

  it('hands its size to the avatars, and the overlap follows', async () => {
    const { avatars } = await mount(GROUP('size="sm"'));

    expect(avatars.map(size)).toEqual([24, 24, 24]);
    const [first, second] = avatars.map((a) => box(a).getBoundingClientRect());
    expect(first.right - second.left).toBeCloseTo(7.2, 0);
  });

  it('lets an avatar keep a size of its own', async () => {
    const { avatars } = await mount(`
      <lui-avatar-group size="sm">
        <lui-avatar name="Ana Lima"></lui-avatar>
        <lui-avatar name="Bia Souza" size="lg"></lui-avatar>
      </lui-avatar-group>
    `);
    expect(avatars.map(size)).toEqual([24, 40]);
  });

  it('rings each avatar so the edges stay apart', async () => {
    const { avatars } = await mount(GROUP());
    expect(getComputedStyle(box(avatars[1])).boxShadow).not.toBe('none');
  });
});

describe('an avatar on its own', () => {
  it('has no ring', async () => {
    const { avatar } = await mount('<lui-avatar name="Maria"></lui-avatar>');
    expect(getComputedStyle(box(avatar)).boxShadow).toBe('none');
  });
});
