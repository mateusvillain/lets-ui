# Let\'s UI Component Map

Usar este mapa para decidir se o componente já existe e em qual formato.

## Pastas Fonte

- SCSS: `packages/styles/src/components`
- Web Components: `packages/lets-ui-components/src/components`

## Componentes Mapeados

| Base name     | SCSS                  | Web Component      | Observação                                                    |
| ------------- | --------------------- | ------------------ | ------------------------------------------------------------- |
| alert         | `_alert.scss`         | `alert.js`         | cobertura completa                                            |
| breadcrumb    | `_breadcrumb.scss`    | `breadcrumb.js`    | `breadcrumb-item.js` existe como suporte                      |
| button        | `_button.scss`        | `button.js`        | cobertura completa                                            |
| card          | `_card.scss`          | `card.js`          | cobertura completa                                            |
| checkbox      | `_checkbox.scss`      | `checkbox.js`      | cobertura completa                                            |
| divider       | `_divider.scss`       | `divider.js`       | cobertura completa                                            |
| drawer        | `_drawer.scss`        | `drawer.js`        | cobertura completa; slide-in da direita; backdrop animado     |
| dropdown-menu | `_dropdown-menu.scss` | `dropdown-menu.js` | inclui `lui-menu-item`; suporte a shortcut, submenu e divisor |
| icon-button   | `_icon-button.scss`   | `icon-button.js`   | cobertura completa                                            |
| input         | `_input.scss`         | `input.js`         | cobertura completa                                            |
| link          | `_link.scss`          | `link.js`          | cobertura completa                                            |
| modal         | `_modal.scss`         | `modal.js`         | cobertura completa                                            |
| navbar        | `_navbar.scss`        | não existe         | formato web component ausente                                 |
| pagination    | `_pagination.scss`    | `pagination.js`    | cobertura completa; truncamento com reticências               |
| radio         | `_radio.scss`         | `radio.js`         | cobertura completa                                            |
| switch        | `_switch.scss`        | `switch.js`        | cobertura completa; tamanhos lg e md; role="switch"           |
| select        | `_select.scss`        | `select.js`        | cobertura completa                                            |
| shortcut      | `_shortcut.scss`      | `shortcut.js`      | cobertura completa                                            |
| tag           | `_tag.scss`           | `tag.js`           | cobertura completa                                            |
| tabs          | `_tabs.scss`          | `tabs.js`          | inclui `lui-tab`; suporta Line, Card e prop expand            |
| textarea      | `_textarea.scss`      | `textarea.js`      | cobertura completa                                            |
| tooltip       | `_tooltip.scss`       | `tooltip.js`       | cobertura completa                                            |

## Arquivos de Apoio Obrigatórios

- Agregador SCSS: `packages/styles/src/components/_components.scss`
- Registro/export Web Components: `packages/lets-ui-components/src/index.js`
- Helpers Web Components: `packages/lets-ui-components/src/internal.js`
- Functions de token: `packages/utilities/src/_functions.scss`
- Mixins utilitários: `packages/utilities/src/_mixins.scss`
- Mapa de tokens SCSS: `packages/utilities/src/_tokens.map.scss`

## Checklist Rápido

1. Confirmar cobertura atual do componente (SCSS/Web Component).
2. Confirmar se precisa pedir link Figma (somente quando não existir no repositório).
3. Confirmar que não há valor bruto no SCSS e que há apenas tokens/functions/mixins.
4. Confirmar semântica HTML e acessibilidade.
5. Reportar pendências, se houver.
