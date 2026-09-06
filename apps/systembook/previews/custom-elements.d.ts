import type React from 'react';

// The Let's UI components are custom elements, so React has no built-in typing
// for their tags. Their props are the element's attributes: strings, plus the
// booleans `elementProps` normalises before handing them over.
type LuiElement = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Record<string, unknown>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lui-alert': LuiElement;
      'lui-body': LuiElement;
      'lui-box': LuiElement;
      'lui-breadcrumb': LuiElement;
      'lui-breadcrumb-item': LuiElement;
      'lui-button': LuiElement;
      'lui-card': LuiElement;
      'lui-center': LuiElement;
      'lui-checkbox': LuiElement;
      'lui-close-button': LuiElement;
      'lui-container': LuiElement;
      'lui-divider': LuiElement;
      'lui-drawer': LuiElement;
      'lui-dropdown-menu': LuiElement;
      'lui-empty-state': LuiElement;
      'lui-flex': LuiElement;
      'lui-flex-item': LuiElement;
      'lui-float': LuiElement;
      'lui-grid': LuiElement;
      'lui-grid-item': LuiElement;
      'lui-heading': LuiElement;
      'lui-icon-button': LuiElement;
      'lui-image': LuiElement;
      'lui-inline': LuiElement;
      'lui-input': LuiElement;
      'lui-link': LuiElement;
      'lui-menu-divider': LuiElement;
      'lui-menu-item': LuiElement;
      'lui-modal': LuiElement;
      'lui-radio': LuiElement;
      'lui-radio-group': LuiElement;
      'lui-scroll-area': LuiElement;
      'lui-select': LuiElement;
      'lui-shortcut': LuiElement;
      'lui-sidebar': LuiElement;
      'lui-stack': LuiElement;
      'lui-switch': LuiElement;
      'lui-switcher': LuiElement;
      'lui-tab': LuiElement;
      'lui-tabs': LuiElement;
      'lui-tag': LuiElement;
      'lui-textarea': LuiElement;
      'lui-toast': LuiElement;
      'lui-tooltip': LuiElement;
    }
  }
}
