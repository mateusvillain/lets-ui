import type { ReactiveElement } from 'lit';

type Constructor<T> = new (...args: any[]) => T;

// Per host, the attributes this mixin is removing.
const releasing = new WeakMap<Element, Set<string>>();

/**
 * Moves the ARIA a component takes on its host onto the control it renders.
 *
 * A Let's UI host is a custom element with no role. Any `aria-*` attribute left
 * on it makes the browser expose the host as an extra `generic` node next to
 * the real control — `generic "Fechar"` beside `button "Fechar"` — which axe
 * flags as `aria-allowed-attr` and some assistive technology announces twice.
 * `ElementInternals.role = 'none'` can't hide it: `aria-label`,
 * `aria-haspopup` and `aria-controls` are global, so the browser keeps the
 * node anyway.
 *
 * So the host attribute is consumed: every `aria-*` attribute the component
 * declares as a property is read into that property and then removed from the
 * host. The property is the source of truth and is never reflected; the
 * component renders it on its inner control. Writers outside the component —
 * an author, a Modal or Drawer setting the state of its trigger — can set
 * either the attribute or the property (`el.ariaExpanded = 'true'`), and the
 * attribute never stays on the host.
 *
 * Consequences for authors:
 * - Selectors on the host attribute (`lui-button[aria-expanded="true"]`) and
 *   `getAttribute('aria-*')` no longer match. Read the property instead.
 * - Removing an attribute that was already consumed does nothing, because the
 *   host no longer has it. Clear the state with the property (`null`) or with
 *   an explicit value (`aria-expanded="false"`).
 * - Only the `aria-*` attributes the component declares are consumed. Any
 *   other one stays on the host, as before.
 */
export const HostAriaMixin = <T extends Constructor<ReactiveElement>>(
  Base: T
) =>
  class extends Base {
    override attributeChangedCallback(
      name: string,
      old: string | null,
      value: string | null
    ) {
      // The `null` from our own removal must not overwrite the value just
      // read. It is matched by name, not by a per-host flag: while the removal
      // runs, the browser may first deliver other callbacks still queued for
      // this host — every attribute's, on upgrade — and those must go through.
      const pending = releasing.get(this);
      if (value === null && pending?.delete(name)) return;

      super.attributeChangedCallback(name, old, value);
      if (value === null || !name.startsWith('aria-')) return;

      if (pending) pending.add(name);
      else releasing.set(this, new Set([name]));
      this.removeAttribute(name);
    }
  };

/**
 * `HostAriaMixin` plus the state a trigger takes on its host: `aria-expanded`,
 * `aria-haspopup` and `aria-pressed`, set by the author or by a Modal or Drawer
 * the component triggers. The component renders them on its inner control with
 * `stateAria()`.
 *
 * Declared here, rather than in each trigger, so a component a Modal or Drawer
 * can take as trigger never falls back to the browser's own ARIA properties,
 * which would write the attribute back onto the role-less host.
 */
export const TriggerAriaMixin = <T extends Constructor<ReactiveElement>>(
  Base: T
) =>
  class extends HostAriaMixin(Base) {
    static properties = {
      ariaExpanded: { attribute: 'aria-expanded' },
      ariaHasPopup: { attribute: 'aria-haspopup' },
      ariaPressed: { attribute: 'aria-pressed' },
    };
  };

/**
 * A state value as an attribute binding: an empty or missing value is not a
 * valid ARIA token, so it renders no attribute (`ifDefined(stateAria(x))`).
 */
export const stateAria = (value: string | null | undefined) =>
  value || undefined;
