export function initUI() {
  const events = document.getElementById('events');

  function log(message) {
    const time = new Date().toLocaleTimeString('pt-BR');
    events.textContent = `[${time}] ${message}\n${events.textContent}`;
  }

  // Dropdown Menu
  const dropdownTrigger = document.getElementById('dropdown-trigger');
  const dropdownPanel = document.getElementById('dropdown-panel');

  function openDropdown() {
    dropdownPanel.classList.add('is-open');
    dropdownTrigger.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    dropdownPanel.classList.remove('is-open');
    dropdownTrigger.setAttribute('aria-expanded', 'false');
  }

  dropdownTrigger.addEventListener('click', () => {
    const isOpen = dropdownPanel.classList.contains('is-open');
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
      const first = dropdownPanel.querySelector(
        '.menu-item:not([disabled]):not([aria-disabled="true"])'
      );
      requestAnimationFrame(() => first?.focus());
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#dropdown')) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dropdownPanel.classList.contains('is-open')) {
      closeDropdown();
      dropdownTrigger.focus();
    }
  });

  dropdownPanel.addEventListener('keydown', (event) => {
    const activePanel = event.target.closest('.dropdown-menu__panel');
    if (!activePanel) return;

    const items = Array.from(
      activePanel.querySelectorAll(
        ':scope > li > .menu-item:not([disabled]):not([aria-disabled="true"])'
      )
    );
    const focused = event.target.closest('.menu-item');
    const currentIndex = items.indexOf(focused);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    } else if (event.key === 'ArrowRight') {
      const li = focused?.parentElement;
      if (li?.classList.contains('menu-item--has-submenu')) {
        event.preventDefault();
        li.querySelector(
          '.dropdown-menu__panel .menu-item:not([disabled])'
        )?.focus();
      }
    } else if (event.key === 'ArrowLeft') {
      const parentLi = activePanel.closest('.menu-item--has-submenu');
      if (parentLi) {
        event.preventDefault();
        parentLi.querySelector(':scope > .menu-item')?.focus();
      }
    } else if (event.key === 'Tab') {
      closeDropdown();
    }
  });

  dropdownPanel.addEventListener('click', (event) => {
    const item = event.target.closest('.menu-item');
    if (!item) return;
    const li = item.parentElement;
    if (li?.classList.contains('menu-item--has-submenu')) return;
    const label = item.querySelector('.menu-item__label')?.textContent?.trim();
    log(`dropdown menu-select -> label="${label}"`);
    closeDropdown();
  });

  const checkbox = document.getElementById('check');
  const select = document.getElementById('select');
  const field = document.getElementById('field');
  const buttonPrimary = document.getElementById('btnPrimary');
  const buttonDanger = document.getElementById('btnDanger');
  const openInternalModalButton = document.getElementById('openInternalModal');
  const openExternalModalButton = document.getElementById('openExternalModal');
  const closeAllModalsButton = document.getElementById('closeAllModals');
  const modalInternal = document.getElementById('modalInternal');
  const modalExternal = document.getElementById('modalExternal');

  function showModal(modal) {
    modal.classList.remove('is-hidden');
    log(`${modal.id} aberto`);
  }

  function hideModal(modal) {
    modal.classList.add('is-hidden');
    log(`${modal.id} fechado`);
  }

  checkbox.addEventListener('change', () => {
    log(`checkbox changed -> checked=${checkbox.checked}`);
  });

  select.addEventListener('change', () => {
    log(`select changed -> selected=${select.selectedIndex}`);
  });

  field.addEventListener('input', () => {
    log(`input-field input -> value="${field.value}"`);
  });

  buttonPrimary.addEventListener('click', () => {
    log('button primary click');
  });

  buttonDanger.addEventListener('click', () => {
    log('button danger click');
  });

  openInternalModalButton.addEventListener('click', () => {
    showModal(modalInternal);
  });

  openExternalModalButton.addEventListener('click', () => {
    showModal(modalExternal);
  });

  closeAllModalsButton.addEventListener('click', () => {
    [modalInternal, modalExternal].forEach((modal) => hideModal(modal));
  });

  document.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const modal = event.currentTarget.closest('.modal');
      if (modal) {
        hideModal(modal);
      }
    });
  });

  // Drawer
  const drawerTrigger = document.getElementById('drawer-trigger');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerPanel = document.getElementById('drawer-panel');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerCancel = document.getElementById('drawer-cancel');

  function openDrawer() {
    drawerPanel.removeAttribute('inert');
    drawerPanel.setAttribute('aria-hidden', 'false');
    drawerTrigger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      drawerBackdrop.classList.add('is-open');
      drawerPanel.classList.add('is-open');
    });
    requestAnimationFrame(() => drawerPanel.focus());
    log('drawer aberto');
  }

  function closeDrawer() {
    drawerBackdrop.classList.remove('is-open');
    drawerPanel.classList.remove('is-open');
    drawerTrigger.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      drawerPanel.setAttribute('inert', '');
      drawerPanel.setAttribute('aria-hidden', 'true');
      drawerTrigger.focus();
    }, 300);
    log('drawer fechado');
  }

  drawerTrigger.addEventListener('click', openDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  drawerCloseBtn.addEventListener('click', closeDrawer);
  drawerCancel.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawerPanel.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  console.log('UI initialized');
}
