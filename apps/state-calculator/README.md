# State Calculator

Shows the hover and pressed colours the Let's UI state layer derives from a
colour pair.

Let's UI does not pick state colours. A component mixes its content colour into
its resting colour with `color-mix()`: 8% (hover) and 16% (pressed) into a
background, 40% and 56% into a border. The calculator runs that mix for any
pair, shows the contrast each state keeps, and renders a sample you can hover
and press.

## Running it

```bash
cd apps/state-calculator
pnpm install --ignore-workspace
pnpm dev
```

The app runs at <http://localhost:4324>. The presets read the token values from
`packages/lets-ui-tokens/dist/`, so run `pnpm build` at the repository root
first.

## How it works

- **Applies to** picks the amounts. Background measures each state against the
  content colour (text must stay at 4.5:1). Border measures it against the
  surface behind it (a component boundary needs 3:1).
- **Start from** loads the tokens a real component uses, resolved in the theme
  selected at the top. Editing any colour switches back to custom colours.
- The amounts in `src/lib/state.js` mirror `$state-amounts` and
  `$state-border-amounts` in `packages/styles/src/utilities/_functions.scss`.
  Change both together.
