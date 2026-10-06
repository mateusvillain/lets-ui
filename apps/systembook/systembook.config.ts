import type { SystemBookConfig } from '@systembook/cli';

// Content format: https://github.com/mateusvillain/systembook/blob/main/docs/static-format.md
export default {
  name: "Let's UI",
  statusTags: [
    { titulo: 'Stable', cor: '#2e7d32' },
    { titulo: 'Beta', cor: '#ed6c02' },
  ],
} satisfies SystemBookConfig;
