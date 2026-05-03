import { LuiAlert } from './components/alert.js';
import { LuiBody } from './components/body.js';
import { LuiImage } from './components/image.js';
import { LuiDrawer } from './components/drawer.js';
import { LuiHeading } from './components/heading.js';
import { LuiTabs, LuiTab } from './components/tabs.js';
import { LuiDivider } from './components/divider.js';
import {
  LuiDropdownMenu,
  LuiMenuItem,
  LuiMenuDivider,
} from './components/dropdown-menu.js';
import { LuiBreadcrumb } from './components/breadcrumb.js';
import { LuiBreadcrumbItem } from './components/breadcrumb-item.js';
import { LuiButton } from './components/button.js';
import { LuiCard } from './components/card.js';
import { LuiCheckbox } from './components/checkbox.js';
import { LuiRadio } from './components/radio.js';
import { LuiSwitch } from './components/switch.js';
import { LuiIconButton } from './components/icon-button.js';
import { LuiInput } from './components/input.js';
import { LuiLink } from './components/link.js';
import { LuiModal } from './components/modal.js';
import { LuiNativeSelect, LuiSelect } from './components/select.js';
import { LuiShortcut } from './components/shortcut.js';
import { LuiTag } from './components/tag.js';
import { LuiTextarea } from './components/textarea.js';
import { LuiTooltip } from './components/tooltip.js';

function define(name, elementClass) {
  if (!customElements.get(name)) {
    customElements.define(name, elementClass);
  }
}

define('lui-alert', LuiAlert);
define('lui-body', LuiBody);
define('lui-heading', LuiHeading);
<<<<<<< HEAD
define('lui-image', LuiImage);
=======
>>>>>>> 190150c (refactor(typography): rename lui-headline to lui-heading)
define('lui-drawer', LuiDrawer);
define('lui-tabs', LuiTabs);
define('lui-tab', LuiTab);
define('lui-divider', LuiDivider);
define('lui-dropdown-menu', LuiDropdownMenu);
define('lui-menu-item', LuiMenuItem);
define('lui-menu-divider', LuiMenuDivider);
define('lui-breadcrumb', LuiBreadcrumb);
define('lui-breadcrumb-item', LuiBreadcrumbItem);
define('lui-button', LuiButton);
define('lui-card', LuiCard);
define('lui-checkbox', LuiCheckbox);
define('lui-radio', LuiRadio);
define('lui-switch', LuiSwitch);
define('lui-icon-button', LuiIconButton);
define('lui-input', LuiInput);
define('lui-link', LuiLink);
define('lui-modal', LuiModal);
define('lui-select', LuiSelect);
define('lui-native-select', LuiNativeSelect);
define('lui-shortcut', LuiShortcut);
define('lui-tag', LuiTag);
define('lui-textarea', LuiTextarea);
define('lui-tooltip', LuiTooltip);

export {
  LuiAlert,
  LuiBody,
  LuiHeading,
  LuiImage,
  LuiDrawer,
  LuiTabs,
  LuiTab,
  LuiDivider,
  LuiDropdownMenu,
  LuiMenuItem,
  LuiMenuDivider,
  LuiBreadcrumb,
  LuiBreadcrumbItem,
  LuiButton,
  LuiCard,
  LuiCheckbox,
  LuiRadio,
  LuiSwitch,
  LuiIconButton,
  LuiInput,
  LuiLink,
  LuiModal,
  LuiNativeSelect,
  LuiSelect,
  LuiShortcut,
  LuiTag,
  LuiTextarea,
  LuiTooltip,
};
