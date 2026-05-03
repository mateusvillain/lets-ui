# Label Map — Let's UI

Referência para seleção de labels ao criar issues. Todas as labels abaixo existem no repositório `mateusvillain/lets-ui-css`.

## Labels de Tipo

| Label           | Quando usar                                                     |
| --------------- | --------------------------------------------------------------- |
| `feature`       | Nova funcionalidade ou componente inexistente                   |
| `bug`           | Comportamento incorreto, regressão, erro visual ou de lógica    |
| `improvement`   | Melhoria em funcionalidade já existente                         |
| `refactor`      | Mudança de código sem alteração de comportamento externo        |
| `documentation` | Criação ou atualização de docs, stories MDX, ou exemplos de uso |

## Labels de Área

| Label        | Quando usar                                                                    |
| ------------ | ------------------------------------------------------------------------------ |
| `components` | Issue afeta um ou mais componentes (`packages/styles` ou `lets-ui-components`) |
| `tokens`     | Issue afeta tokens de design (`packages/lets-ui-tokens`)                       |
| `styles`     | Issue afeta estilos globais, reset, base CSS (`packages/styles/src/base`)      |
| `utilities`  | Issue afeta funções, mixins ou o mapa de tokens (`packages/utilities`)         |
| `icons`      | Issue afeta o sistema de ícones ou SVGs                                        |

## Labels de Prioridade

Usar somente quando indicado explicitamente no pedido ou claramente implícito (ex.: regressão em produção = `priority: high`).

| Label              | Quando usar                                          |
| ------------------ | ---------------------------------------------------- |
| `priority: high`   | Crítico, bloqueia outras tarefas ou está em produção |
| `priority: medium` | Importante mas não urgente                           |
| `priority: low`    | Nice-to-have, pode ser postergado                    |

## Labels de Componente

Formato: `component: <nome-em-kebab-case>`. Cor padrão: `#f5be58`.

### Componentes existentes

| Label                        | Componente      |
| ---------------------------- | --------------- |
| `component: accordion`       | Accordion       |
| `component: alert`           | Alert           |
| `component: avatar`          | Avatar          |
| `component: breadcrumb`      | Breadcrumb      |
| `component: breadcrumb-item` | Breadcrumb Item |
| `component: button`          | Button          |
| `component: card`            | Card            |
| `component: checkbox`        | Checkbox        |
| `component: close-button`    | Close Button    |
| `component: code-block`      | Code Block      |
| `component: command-palette` | Command Palette |
| `component: date-picker`     | Date Picker     |
| `component: divider`         | Divider         |
| `component: drawer`          | Drawer          |
| `component: dropdown-menu`   | Dropdown Menu   |
| `component: empty-state`     | Empty State     |
| `component: field`           | Field           |
| `component: heading`         | Heading         |
| `component: file-upload`     | File Upload     |
| `component: icon-button`     | Icon Button     |
| `component: image`           | Image           |
| `component: input`           | Input           |
| `component: link`            | Link            |
| `component: modal`           | Modal           |
| `component: navbar`          | Navbar          |
| `component: otp-input`       | OTP Input       |
| `component: pagination`      | Pagination      |
| `component: progress`        | Progress        |
| `component: radio`           | Radio           |
| `component: select`          | Select          |
| `component: selection`       | Selection       |
| `component: shortcut`        | Shortcut        |
| `component: sidenav`         | Sidenav         |
| `component: skeleton`        | Skeleton        |
| `component: status`          | Status          |
| `component: stepper`         | Stepper         |
| `component: switch`          | Switch          |
| `component: table`           | Table           |
| `component: tabs`            | Tabs            |
| `component: tag`             | Tag             |
| `component: text`            | Text            |
| `component: textarea`        | Textarea        |
| `component: toast`           | Toast           |
| `component: tooltip`         | Tooltip         |

Se o componente não constar nesta lista, criar a label antes de criar a issue (ver SKILL.md).

## Combinações Comuns

| Cenário                          | Labels sugeridas                                   |
| -------------------------------- | -------------------------------------------------- |
| Novo componente                  | `feature`, `components`, `component: <nome>`       |
| Bug em componente específico     | `bug`, `components`, `component: <nome>`           |
| Melhoria em componente existente | `improvement`, `components`, `component: <nome>`   |
| Atualização de token             | `improvement` ou `feature`, `tokens`               |
| Novo ícone                       | `feature`, `icons`                                 |
| Docs/stories faltando            | `documentation`, `components`, `component: <nome>` |
| Refactor de utilitário SCSS      | `refactor`, `utilities`                            |
| Bug de estilo global             | `bug`, `styles`                                    |
