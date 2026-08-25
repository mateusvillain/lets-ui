# Brand Studio

Visual editor for the Let's UI brand tokens (`lui.brand.*`).

A Let's UI brand is defined by three DTCG files in
`packages/lets-ui-tokens/tokens/brand/<brand>/`: `colors.light.json`,
`colors.dark.json` and `foundation.json`. Everything else in the design system —
semantic tokens, SCSS components and Web Components — derives from them. Brand
Studio is the interface for whoever owns the brand to edit exactly that slice
without opening a JSON file.

## Running it

```bash
cd apps/brand-studio
pnpm install --ignore-workspace
pnpm dev
```

The app runs at <http://localhost:4323>. It consumes the packages' `dist/`
output, so run `pnpm build` at the repository root first if the tokens or the
components have changed.

## How it works

The left-hand panel builds its controls from the schema in `src/lib/schema.js`;
the initial values are read from the reference brand's own files at build time,
so the interface never drifts out of sync with what is versioned. The controls
are Let's UI components themselves — `lui-tabs`, `lui-input`,
`lui-native-select`, `lui-button` — which makes the studio the first consumer of
what it edits.

The preview on the right is an isolated `<iframe>`. On every edit the studio
writes the `--lui-brand-*` custom properties onto that document's `:root`; since
the semantic tokens are `var()`s pointing at the brand tokens, every component
reacts immediately. That isolation is what lets you edit the brand without the
editing interface changing along with it.

Changes are kept in `localStorage`, and the indicator in the footer shows how
many tokens diverge from the defaults.

**Identifier** follows **Brand name** — "Material Design" becomes
`material-design` — until you edit it by hand, at which point it stops being
overwritten. Clearing the field makes it follow the name again.

### The preview

The preview bar switches between two scenes:

| Scene       | What it is for                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| **Landing** | The brand in a real composition, laid out on the brand's own grid, with the whole type scale in use      |
| **Tokens**  | A specimen sheet: color ramps with hex values, the type scale, the radii and the column ruler           |

The panel collapses from its own header, letting the preview take the whole
screen; the button to bring it back sits at the start of the preview bar. The
width selector is not a fixed list: it is built from the brand's breakpoints, so
editing `sm` changes the width the preview then simulates — and the selection
follows the breakpoint, not the number.

With the **Grid** tab open, a column ruler appears over the preview along with
the column count, gutter and margin of the active breakpoint. The landing scene
is laid out on those same columns, so content edges land on real column lines.
Breakpoints are validated as strictly ascending: an `sm` at or below `1xs` would
produce media queries that never match, so the field refuses the value and
explains the limit instead of applying it.

### Randomize brand

**Randomize brand** draws a complete brand at once. It does not roll each token
independently — that produces junk, not a brand. What gets rolled are the
parameters each scale is born from (a hue, a modular ratio, a base radius, a set
of column counts), and the scales are derived from them by the same rules the
reference brand follows. The type scale stays a geometric progression, the
breakpoints stay ascending, the gutter keeps fitting inside the margin. The
brand name and identifier stay untouched. See `src/lib/random.js`.

### Tokens resolved at build time

Breakpoints and column counts become literals in the compiled CSS — a media
query cannot take `var()`. The preview reproduces that behavior in JavaScript,
reading the tokens to decide the active breakpoint, but the components' real
media queries only change after a fresh `pnpm build`.

## Publishing a brand

1. **Export tokens** downloads the three DTCG files already in the repository's
   format.
2. Save them under `packages/lets-ui-tokens/tokens/brand/<identifier>/`.
3. Register the brand in `packages/lets-ui-tokens/letsui.resolver.json` — the
   studio shows the ready-made fragment under "How to register the brand".
4. Add the new brand's permutations to
   `packages/lets-ui-tokens/terrazzo.config.js`, mirroring those of `lets-ui`.
5. Run `pnpm build` at the root and set `data-brand="<identifier>"` on the page.

The export is a value substitution over the original file: `$type`,
`description` and key order are preserved, and tokens the interface does not
expose yet pass through intact.

## Structure

| File                      | Role                                                     |
| ------------------------- | -------------------------------------------------------- |
| `src/lib/schema.js`       | Which tokens are editable and with which control          |
| `src/lib/state.js`        | Brand state, persistence, import and export               |
| `src/lib/dtcg.js`         | Reading and writing the DTCG format                       |
| `src/lib/color.js`        | Color conversions, ramp generation and WCAG contrast     |
| `src/lib/clamp.js`        | The fluid type scale (`clamp()`)                          |
| `src/lib/random.js`       | Drawing a complete, coherent brand                        |
| `src/lib/studio.js`       | Building the interface and applying it to the preview     |
| `src/pages/index.astro`   | The studio shell                                          |
| `src/pages/preview.astro` | The scenes rendered inside the iframe                     |
