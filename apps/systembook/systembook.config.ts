import type { SystemBookConfig } from '@systembook/cli';

// Content format: https://github.com/mateusvillain/systembook/blob/main/docs/static-format.md
export default {
  name: "Let's UI",
  statusTags: [
    { titulo: 'Stable', cor: '#2e7d32' },
    { titulo: 'Beta', cor: '#ed6c02' },
  ],
  // Design tokens for the `/tokens` page and the `<TokenTable>` block. The
  // files are mirrored from packages/lets-ui-tokens by scripts/sync-tokens.mjs
  // (the `docs:*` scripts run it first). Base files are shared by every mode;
  // the color themes are split into light and dark, matching the Terrazzo
  // resolver (letsui.resolver.json).
  tokens: {
    files: [
      'tokens/global/primitive.json',
      'tokens/global/semantic.json',
      'tokens/global/component.json',
      'tokens/brand/lets-ui/foundation.json',
    ],
    modes: {
      light: [
        'tokens/global/theme/colors.light.json',
        'tokens/brand/lets-ui/colors.light.json',
      ],
      dark: [
        'tokens/global/theme/colors.dark.json',
        'tokens/brand/lets-ui/colors.dark.json',
      ],
    },
  },
} satisfies SystemBookConfig;
