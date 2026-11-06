/**
 * Timeline behaviour: type filters, "Load earlier releases" and the status
 * announcements for both. A port of the reference changelog's `app.js`.
 *
 * Progressive enhancement: the server renders every release. Without
 * JavaScript the whole timeline is visible and the filters stay hidden. With
 * it, cards marked `data-deferred` stay out of view (see `changelog.css`)
 * until loaded, a page at a time. Paging counts only the releases that match
 * the active filter, so a type whose releases are all old still shows them.
 */

import { STRINGS } from '@/lib/i18n.js';

/** @param {Document} doc */
export function initTimeline(doc) {
  const timeline = doc.getElementById('timeline');
  const status = doc.getElementById('timeline-status');
  const history = doc.querySelector('.history');
  if (!timeline || !status || !history) return;

  const strings = STRINGS[doc.documentElement.dataset.locale] ?? STRINGS.en;
  const t = strings.timeline;
  const typeLabel = (filter) => (filter === 'all' ? '' : strings.types[filter]);

  const pageSize = Number(history.dataset.pageSize) || 5;
  const filterButtons = [...doc.querySelectorAll('[data-filter]')];
  const loadMoreButton = doc.querySelector('.load-more');
  const emptyMessage = doc.querySelector('.timeline__empty');
  const doneMessage = doc.querySelector('.timeline__done');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = () => [...timeline.querySelectorAll('.timeline__item')];
  const deferred = () =>
    items().filter((item) => item.hasAttribute('data-deferred'));
  let activeFilter = 'all';
  let limit = pageSize;

  // Controls that need JavaScript appear only when it runs.
  doc.querySelectorAll('[data-requires-js]').forEach((el) => {
    el.hidden = false;
  });
  updateEnd();

  // When the entrance animation ends, the first release goes back to the
  // scroll animation and does not replay the entrance after a filter.
  const entrance = doc
    .getAnimations()
    .filter((a) => a.animationName === 'enter');
  Promise.allSettled(entrance.map((a) => a.finished)).then(() => {
    doc.documentElement.dataset.entered = '';
  });

  /* Status: clearing first makes a repeated message announce again. */
  function announce(message) {
    status.textContent = '';
    window.setTimeout(() => {
      status.textContent = message;
    }, 100);
  }

  /* Filters --------------------------------------------------------------- */

  /* Shows the first `limit` releases that match the filter and defers the rest. */
  function applyFilter() {
    let visible = 0;
    for (const item of items()) {
      const match =
        activeFilter === 'all' || item.dataset.type === activeFilter;
      item.hidden = !match;
      const shown = match && visible < limit;
      item.toggleAttribute('data-deferred', match && !shown);
      if (shown) visible += 1;
    }

    emptyMessage.hidden = visible > 0;
    if (!visible) emptyMessage.textContent = t.empty;
    updateEnd();
    return visible;
  }

  /*
   * View Transitions: each release is named only during the transition, so
   * the browser animates what moves, enters or leaves. Without support, or
   * under reduced motion, the update applies at once.
   */
  let currentTransition = null;

  function withViewTransition(update) {
    if (!doc.startViewTransition || reducedMotion.matches) {
      update();
      return Promise.resolve();
    }

    const named = items().filter((item) => !item.hasAttribute('data-deferred'));
    named.forEach((item) => {
      item.style.viewTransitionName = `vt-${item.querySelector('.release__title').id}`;
    });

    const transition = doc.startViewTransition(update);
    currentTransition = transition;
    // A transition interrupted by another rejects `ready`; that is expected.
    transition.ready.catch(() => {});
    transition.finished.finally(() => {
      if (currentTransition !== transition) return;
      named.forEach((item) => {
        item.style.viewTransitionName = '';
      });
    });
    return transition.updateCallbackDone;
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.filter === filter)
      );
    });

    let visible = 0;
    withViewTransition(() => {
      visible = applyFilter();
    }).then(() => {
      announce(t.showing(visible, typeLabel(filter)));
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.filter !== activeFilter)
        setFilter(button.dataset.filter);
    });
  });

  /* Load earlier releases ------------------------------------------------- */

  // Marks new items for the staggered entry transition (@starting-style). The
  // mark goes when the transition ends, so a filter does not replay it.
  function animateEntry(entering) {
    entering.forEach((item, index) => {
      item.dataset.entering = '';
      item.style.setProperty('--stagger', index);

      const done = (event) => {
        if (event.target !== item || event.propertyName !== 'opacity') return;
        delete item.dataset.entering;
        item.style.removeProperty('--stagger');
        item.removeEventListener('transitionend', done);
        item.removeEventListener('transitioncancel', done);
      };
      item.addEventListener('transitionend', done);
      item.addEventListener('transitioncancel', done);
    });
  }

  function updateEnd() {
    const finished = deferred().length === 0;
    loadMoreButton.hidden = finished;
    doneMessage.hidden = !finished;
  }

  function loadMore() {
    const batch = deferred().slice(0, pageSize);
    if (!batch.length) return;

    limit += pageSize;
    applyFilter();

    if (!reducedMotion.matches) animateEntry(batch);
    const finished = deferred().length === 0;

    const message = t.loaded(batch.length, typeLabel(activeFilter), finished);

    // Focus the first new release, so keyboard and screen reader users carry
    // on reading where the new content appeared.
    batch[0].querySelector('.release__title').focus();

    announce(message);
  }

  loadMoreButton.addEventListener('click', loadMore);
}
