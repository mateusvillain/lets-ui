/**
 * Makes everything on the page except `host` inert, and returns the function
 * that undoes it.
 *
 * `aria-modal="true"` asks assistive technology to stay inside a dialog, but a
 * dialog in a shadow root does not get that from Chrome: the page behind it
 * stays in the accessibility tree, reachable by a screen reader's virtual
 * cursor or by swiping. `inert` removes it for every engine, and from pointer
 * and focus too.
 *
 * Walks from `host` up to the body, crossing shadow boundaries, and marks the
 * siblings at each level. Elements that were already inert are left alone, so
 * undoing restores only what this call changed.
 */
export function inertOutside(host: Element): () => void {
  const marked: HTMLElement[] = [];
  let node: Element | null = host;

  while (node && node !== document.body && node !== document.documentElement) {
    // At the top of a shadow tree the siblings are the shadow root's children,
    // and the next level up is its host.
    const root = node.getRootNode();
    const container: ParentNode | null =
      node.parentElement ?? (root instanceof ShadowRoot ? root : null);
    if (!container) break;
    for (const sibling of Array.from(container.children)) {
      if (sibling === node || !(sibling instanceof HTMLElement)) continue;
      if (
        sibling.inert ||
        /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(sibling.tagName)
      )
        continue;
      sibling.inert = true;
      marked.push(sibling);
    }
    node =
      node.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
  }

  return () => {
    for (const el of marked) el.inert = false;
  };
}
