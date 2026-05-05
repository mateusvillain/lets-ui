import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

const SAMPLE_SRC =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
const PORTRAIT_SRC =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80';

export default {
  title: 'Components/Image',
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    width: { control: 'text' },
    height: { control: 'text' },
    'aspect-ratio': { control: 'text' },
    radius: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'circle'],
    },
    fit: {
      control: { type: 'select' },
      options: ['cover', 'contain', 'none'],
    },
    loading: {
      control: { type: 'select' },
      options: ['lazy', 'eager'],
    },
    caption: { control: 'text' },
    'fallback-color': { control: 'color' },
    'fallback-src': { control: 'text' },
  },
};

const Template = (args) => {
  const attrs = Object.entries(args)
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  return `<lui-image ${attrs}></lui-image>`;
};

export const Image = Template.bind({});
Image.args = {
  src: SAMPLE_SRC,
  alt: 'Mountain landscape at sunset',
  width: '400px',
  'aspect-ratio': '16 / 9',
  radius: 'md',
  fit: 'cover',
  loading: 'eager',
  caption: '',
  'fallback-color': '',
  'fallback-src': '',
};

export const Square = () => `
  <lui-image
    src="${PORTRAIT_SRC}"
    alt="Portrait photo"
    width="200px"
    aspect-ratio="1 / 1"
    radius="circle"
    fit="cover"
    loading="eager"
  ></lui-image>
`;

export const WithCaption = () => `
  <div style="width: 400px;">
    <lui-image
      src="${SAMPLE_SRC}"
      alt="Mountain landscape at sunset"
      width="400px"
      aspect-ratio="16 / 9"
      radius="md"
      fit="cover"
      loading="eager"
      caption="Sunset over the mountains — Unsplash"
    ></lui-image>
  </div>
`;

export const AspectRatios = () => `
  <div style="display:flex;flex-direction:column;gap:24px;max-width:500px;">
    <div>
      <p style="font-size:12px;opacity:.6;margin-bottom:8px">1 / 1</p>
      <lui-image src="${SAMPLE_SRC}" alt="Square" width="200px" aspect-ratio="1 / 1" fit="cover" loading="eager"></lui-image>
    </div>
    <div>
      <p style="font-size:12px;opacity:.6;margin-bottom:8px">16 / 9</p>
      <lui-image src="${SAMPLE_SRC}" alt="16/9" width="100%" aspect-ratio="16 / 9" fit="cover" loading="eager"></lui-image>
    </div>
    <div>
      <p style="font-size:12px;opacity:.6;margin-bottom:8px">4 / 3</p>
      <lui-image src="${SAMPLE_SRC}" alt="4/3" width="100%" aspect-ratio="4 / 3" fit="cover" loading="eager"></lui-image>
    </div>
    <div>
      <p style="font-size:12px;opacity:.6;margin-bottom:8px">3 / 4</p>
      <lui-image src="${PORTRAIT_SRC}" alt="3/4" width="200px" aspect-ratio="3 / 4" fit="cover" loading="eager"></lui-image>
    </div>
    <div>
      <p style="font-size:12px;opacity:.6;margin-bottom:8px">21 / 9</p>
      <lui-image src="${SAMPLE_SRC}" alt="21/9" width="100%" aspect-ratio="21 / 9" fit="cover" loading="eager"></lui-image>
    </div>
  </div>
`;

export const BorderRadii = () => `
  <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;">
    ${['none', 'xs', 'sm', 'md', 'lg', 'circle']
      .map(
        (r) => `
      <div>
        <p style="font-size:12px;opacity:.6;margin-bottom:8px">${r}</p>
        <lui-image src="${PORTRAIT_SRC}" alt="Radius ${r}" width="120px" aspect-ratio="1 / 1" radius="${r}" fit="cover" loading="eager"></lui-image>
      </div>
    `
      )
      .join('')}
  </div>
`;

export const ObjectFit = () => `
  <div style="display:flex;gap:24px;align-items:flex-start;">
    ${['cover', 'contain', 'none']
      .map(
        (f) => `
      <div>
        <p style="font-size:12px;opacity:.6;margin-bottom:8px">${f}</p>
        <lui-image src="${SAMPLE_SRC}" alt="Fit ${f}" width="200px" height="150px" fit="${f}" radius="sm" loading="eager"></lui-image>
      </div>
    `
      )
      .join('')}
  </div>
`;

export const FallbackColor = () => `
  <lui-image
    src="https://invalid.example.com/broken.jpg"
    alt="Broken image with fallback color"
    width="300px"
    aspect-ratio="16 / 9"
    radius="md"
    fallback-color="#e8f4fd"
    loading="eager"
  ></lui-image>
`;

export const FallbackSrc = () => `
  <lui-image
    src="https://invalid.example.com/broken.jpg"
    alt="Image with fallback source"
    width="300px"
    aspect-ratio="16 / 9"
    radius="md"
    fallback-src="${SAMPLE_SRC}"
    loading="eager"
  ></lui-image>
`;

export const AsPicture = () => `
  <lui-image
    as="picture"
    src="${SAMPLE_SRC}"
    alt="Mountain landscape"
    width="400px"
    aspect-ratio="16 / 9"
    radius="md"
    fit="cover"
    loading="eager"
  ></lui-image>
`;
