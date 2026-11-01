import { describe, expect, it } from 'vitest';

import rehypeLangSlug from './rehypeLangSlug.js';

const text = (value) => ({ type: 'text', value });
const heading = (tagName, ...children) => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});
const lang = (value, ...children) => ({
  type: 'mdxJsxFlowElement',
  name: 'Lang',
  attributes: [{ type: 'mdxJsxAttribute', name: 'lang', value }],
  children,
});

/** Runs the plugin on a page and returns the heading ids in source order. */
function ids(...children) {
  const tree = { type: 'root', children };
  rehypeLangSlug()(tree);
  const found = [];
  const walk = (node) => {
    if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
      found.push(node.properties.id);
    }
    node.children?.forEach(walk);
  };
  walk(tree);
  return found;
}

describe('rehypeLangSlug', () => {
  it('gives the same heading the same id in each language', () => {
    expect(
      ids(
        lang('pt-BR', heading('h2', text('Trigger'))),
        lang('en-US', heading('h2', text('Trigger')))
      )
    ).toEqual(['trigger', 'trigger']);
  });

  it('still numbers repeated headings within one language', () => {
    expect(
      ids(
        lang(
          'pt-BR',
          heading('h2', text('Slots')),
          heading('h3', text('Slots'))
        )
      )
    ).toEqual(['slots', 'slots-1']);
  });

  it('keeps a shared heading id out of reach of both languages', () => {
    expect(
      ids(
        heading('h1', text('Button')),
        lang('pt-BR', heading('h2', text('Button'))),
        lang('en-US', heading('h2', text('Button')))
      )
    ).toEqual(['button', 'button-1', 'button-1']);
  });

  it('slugs the text of nested elements, like rehype-slug', () => {
    expect(
      ids(
        lang(
          'en-US',
          heading(
            'h2',
            {
              type: 'element',
              tagName: 'code',
              children: [text('menu-select')],
            },
            text(' event')
          )
        )
      )
    ).toEqual(['menu-select-event']);
  });

  it('leaves headings that already have an id alone', () => {
    const custom = heading('h2', text('Trigger'));
    custom.properties.id = 'custom';
    expect(ids(lang('en-US', custom))).toEqual(['custom']);
  });
});
