import { LuiAlert } from './components/alert/alert.js';
import { LuiBody } from './components/body/body.js';
import { LuiImage } from './components/image/image.js';
import { LuiDrawer } from './components/drawer/drawer.js';
import { LuiHeading } from './components/heading/heading.js';
import { LuiTabs, LuiTab } from './components/tabs/tabs.js';
import { LuiDivider } from './components/divider/divider.js';
import {
  LuiDropdownMenu,
  LuiMenuItem,
  LuiMenuDivider,
} from './components/dropdown-menu/dropdown-menu.js';
import { LuiBreadcrumb } from './components/breadcrumb/breadcrumb.js';
import { LuiBreadcrumbItem } from './components/breadcrumb/breadcrumb-item.js';
import { LuiButton } from './components/button/button.js';
import { LuiCard } from './components/card/card.js';
import { LuiCheckbox } from './components/checkbox/checkbox.js';
import { LuiRadio } from './components/radio/radio.js';
import { LuiRadioGroup } from './components/radio-group/radio-group.js';
import { LuiSwitch } from './components/switch/switch.js';
import { LuiIconButton } from './components/icon-button/icon-button.js';
import { LuiInput } from './components/input/input.js';
import { LuiLink } from './components/link/link.js';
import { LuiModal } from './components/modal/modal.js';
import { LuiNativeSelect, LuiSelect } from './components/select/select.js';
import { LuiShortcut } from './components/shortcut/shortcut.js';
import { LuiTag } from './components/tag/tag.js';
import { LuiTextarea } from './components/textarea/textarea.js';
import { LuiTooltip } from './components/tooltip/tooltip.js';

function define(name: string, elementClass: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, elementClass);
  }
}

define('lui-alert', LuiAlert);
define('lui-body', LuiBody);
define('lui-heading', LuiHeading);
define('lui-image', LuiImage);
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
define('lui-radio-group', LuiRadioGroup);
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
  LuiRadioGroup,
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
