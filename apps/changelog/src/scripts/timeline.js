/**
 * Timeline behaviour: type filters, "Load earlier releases" and the status
 * announcements for both. A port of the reference changelog's `app.js`.
 *
 * Progressive enhancement: the server renders every release. Without
 * JavaScript the whole timeline is visible and the filters stay hidden. With
 * it, cards marked `data-deferred` stay out of view (see `changelog.css`)
 * until loaded, a page at a time.
 */

const TYPE_LABELS = { new: 'New', improvement: 'Improvement', fix: 'Fix' };

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

/** @param {Document} doc */
export function initTimeline(doc) {
  const timeline = doc.getElementById('timeline');
  const status = doc.getElementById('timeline-status');
  const history = doc.querySelector('.history');
  if (!timeline || !status || !history) return;

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

  // Controls that need JavaScript appear only when it runs.
  doc.querySelectorAll('[data-requires-js]').forEach((el) => {
    el.hidden = false;
  });
  if (!deferred().length) showDone();

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

  function applyFilter() {
    let visible = 0;
    for (const item of items()) {
      const show = activeFilter === 'all' || item.dataset.type === activeFilter;
      item.hidden = !show;
      if (show && !item.hasAttribute('data-deferred')) visible += 1;
    }

    emptyMessage.hidden = visible > 0;
    if (!visible) {
      emptyMessage.textContent = deferred().length
        ? `No ${TYPE_LABELS[activeFilter]} releases among the ones shown. Load earlier releases to see more.`
        : 'No releases of this type.';
    }
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
      const releases = plural(visible, 'release', 'releases');
      announce(
        filter === 'all'
          ? `Showing ${releases}.`
          : `Showing ${releases} of type ${TYPE_LABELS[filter]}.`
      );
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

  function showDone() {
    loadMoreButton.hidden = true;
    doneMessage.hidden = false;
  }

  function loadMore() {
    const batch = deferred().slice(0, pageSize);
    if (!batch.length) return;

    batch.forEach((item) => item.removeAttribute('data-deferred'));
    applyFilter();

    const shown = batch.filter((item) => !item.hidden);
    if (!reducedMotion.matches) animateEntry(shown);
    const finished = deferred().length === 0;

    let message =
      activeFilter === 'all'
        ? `${plural(batch.length, 'earlier release', 'earlier releases')} loaded.`
        : `${plural(batch.length, 'release', 'releases')} loaded, ${shown.length} of type ${TYPE_LABELS[activeFilter]}.`;
    if (finished) message += ' No more releases.';

    // Focus the first new release, so keyboard and screen reader users carry
    // on reading where the new content appeared.
    shown[0]?.querySelector('.release__title').focus();

    if (finished) {
      showDone();
      // The button is gone: with no new release to focus, focus what is left.
      if (!shown.length)
        (emptyMessage.hidden ? doneMessage : emptyMessage).focus();
    }

    announce(message);
  }

  loadMoreButton.addEventListener('click', loadMore);
}
