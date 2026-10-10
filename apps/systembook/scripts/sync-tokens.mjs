// Mirrors the design tokens into this project so `<TokenTable>` and the
// `/tokens` page can read them.
//
// SystemBook reads the `tokens` globs relative to the project root and refuses
// any pattern that climbs out with `..` or follows a symlink outside it. The
// source of truth lives in `packages/lets-ui-tokens/tokens/`, outside this app,
// so we mirror the DTCG JSON into `apps/systembook/tokens/` before every
// `docs:*` run. The copy is generated (git-ignored) and always current.
//
// One transform happens on the way in: tokens typed `"string"` are dropped.
// Terrazzo lets the design system store `clamp()` expressions (fluid spacing
// and the larger font sizes) and CSS keywords (text-transform, text-decoration)
// under `$type: "string"`, which is not a W3C DTCG type SystemBook can render.
// Nothing aliases these tokens, so dropping them keeps the token set valid; the
// fluid scales are documented with tables in the Foundations pages instead.
import { cp, readFile, rm, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const source = path.resolve(projectRoot, '../../packages/lets-ui-tokens/tokens');
const dest = path.resolve(projectRoot, 'tokens');

/**
 * Returns a copy of a DTCG node with every `string`-typed token removed, and
 * drops groups left without any token. `inherited` is the `$type` in force from
 * an ancestor group (DTCG lets a group set the type for its tokens).
 */
function prune(node, inherited) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return node;

  const type = typeof node.$type === 'string' ? node.$type : inherited;
  if ('$value' in node) return type === 'string' ? undefined : node;

  const out = {};
  let kept = 0;
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      out[key] = value;
      continue;
    }
    const cleaned = prune(value, type);
    if (cleaned !== undefined) {
      out[key] = cleaned;
      kept += 1;
    }
  }
  return kept > 0 ? out : undefined;
}

await rm(dest, { recursive: true, force: true });
await cp(source, dest, {
  recursive: true,
  filter: (entry) => entry.endsWith('.json') || !path.extname(entry),
});

for await (const file of glob('**/*.json', { cwd: dest })) {
  const full = path.join(dest, file);
  const pruned = prune(JSON.parse(await readFile(full, 'utf8')), undefined) ?? {};
  await writeFile(full, `${JSON.stringify(pruned, null, 2)}\n`);
}

console.log(`tokens synced → ${path.relative(projectRoot, dest)}/`);
