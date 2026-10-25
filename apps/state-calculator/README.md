# State Calculator

Shows the hover and pressed colours the Let's UI state layer derives from a
colour pair.

Let's UI does not pick state colours. A component mixes a tint into its resting
colour with `color-mix()`: 8% (hover) and 16% (pressed) into a background, 40%
and 56% into a border. The tint depends on the component:

- **Surface components** (a menu item, a line tab, a field border) tint with
  their own content colour.
- **Filled components** (a button, the current page, a checked box) tint with
  the colour opposite their label — `filled-state-tint` in
  `packages/styles/src/utilities/_mixins.scss` — so the fill moves away from the
  label and the label gains contrast on hover and press.

The calculator runs that mix for any colours, shows the contrast the label (or
the border) keeps in each state, and renders a sample you can hover and press.

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
  label colour (text must stay at 4.5:1). Border measures it against the
  surface behind it (a component boundary needs 3:1).
- **Label colour** and **State tint** are separate: on a filled component they
  are opposites, on a surface component the same colour.
- **Start from** loads the tokens a real component uses, resolved in the theme
  selected at the top. Editing any colour switches back to custom colours.
- **Live sample** can be pinned to rest, hover or pressed; while it is live,
  the card for the state it is in lights up.
- **Mix scale** is a slider across every amount of tint, with hover and
  pressed marked on it.
- Hex values and the CSS copy on click. **Copy link** shares the exact view:
  the theme, the preset or the custom colours live in the query string.
- The amounts in `src/lib/state.js` mirror `$state-amounts` and
  `$state-border-amounts` in `packages/styles/src/utilities/_functions.scss`.
  Change both together.
