import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// Inlined as a data URI rather than pointing at a photo service: the preview
// artifact is served from the documentation instance and should not depend on
// an external request to render.
const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
  <defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#339bf0"/><stop offset="1" stop-color="#1b4b73"/>
  </linearGradient></defs>
  <rect width="320" height="180" fill="url(#s)"/>
  <circle cx="252" cy="46" r="22" fill="#ffd66b"/>
  <path d="M0 148l72-56 58 44 46-32 74 60 70-42v58H0z" fill="#0f2f4a" opacity=".85"/>
</svg>`;

const SAMPLE_SRC = `data:image/svg+xml,${encodeURIComponent(SAMPLE_SVG)}`;

export function Preview(props: Record<string, unknown>) {
  return <lui-image {...elementProps({ src: SAMPLE_SRC, ...props })} />;
}

export default {
  component: 'Image',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: {
        alt: 'Illustration of a landscape at dusk',
        width: '320px',
        'aspect-ratio': '16 / 9',
        radius: 'md',
        fit: 'cover',
        loading: 'eager',
      },
    },
    {
      id: 'circle',
      label: 'Circle',
      props: {
        alt: 'Illustration of a landscape at dusk',
        width: '160px',
        'aspect-ratio': '1 / 1',
        radius: 'circle',
        fit: 'cover',
        loading: 'eager',
      },
    },
    {
      id: 'caption',
      label: 'With caption',
      props: {
        alt: 'Illustration of a landscape at dusk',
        width: '320px',
        'aspect-ratio': '16 / 9',
        radius: 'md',
        fit: 'cover',
        loading: 'eager',
        caption: 'Rendered from an inline SVG.',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'alt', label: 'Alt text' },
    { kind: 'text', propName: 'caption', label: 'Caption' },
    { kind: 'text', propName: 'width', label: 'Width' },
    { kind: 'text', propName: 'aspect-ratio', label: 'Aspect ratio' },
    {
      kind: 'select',
      propName: 'radius',
      label: 'Radius',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'circle'],
      defaultValue: 'md',
    },
    {
      kind: 'select',
      propName: 'fit',
      label: 'Fit',
      options: ['cover', 'contain', 'none'],
      defaultValue: 'cover',
    },
  ],
} satisfies PreviewConfig;
