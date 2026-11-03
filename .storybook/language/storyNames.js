/**
 * Story names for the sidebar, per language.
 *
 * Storybook builds the sidebar from `index.json`, so a story name (`storyName`
 * in the story file) is the same in both languages. This map translates the
 * names written in Portuguese; the manager applies it to the sidebar labels
 * whenever the language global changes.
 *
 * Every story name is in exactly one of `storyNamesEn`, `storyNamesPt` or
 * `untranslatedStoryNames` — `storyNames.test.js` checks it against the story
 * files, so a new story has to pick one.
 *
 * Keys are the exact `storyName` strings from the `*.stories.*` files.
 */
export const storyNamesEn = {
  'Ação destrutiva': 'Destructive action',
  'Botão alternável (aria-pressed)': 'Toggle button (aria-pressed)',
  Carregando: 'Loading',
  'Classe CSS': 'CSS class',
  'Classe CSS (sem Web Component)': 'CSS class (without Web Component)',
  'Colunas do breakpoint': 'Breakpoint columns',
  'Colunas responsivas': 'Responsive columns',
  'Com Tooltip': 'With Tooltip',
  'Com aba desabilitada': 'With a disabled tab',
  'Com aria-label': 'With aria-label',
  'Com avatar e link': 'With avatar and link',
  'Com descrição': 'With description',
  'Com lista de sugestões (slot padrão)': 'With suggestion list (default slot)',
  'Com rastreamento de visita': 'With visit tracking',
  'Com seleção': 'With selection',
  'Como link (href)': 'As a link (href)',
  Comprimentos: 'Lengths',
  'Controle por código': 'Programmatic control',
  Cores: 'Colors',
  'Decorativo, ao lado do nome': 'Decorative, next to the name',
  'Dentro do Alert (dismissible)': 'Inside the Alert (dismissible)',
  'Dentro do Modal': 'Inside the Modal',
  Desabilitado: 'Disabled',
  Divisor: 'Divider',
  'Em parágrafo': 'In a paragraph',
  'Em tabela': 'In a table',
  Erro: 'Error',
  'Erro de sistema (announce="assertive")':
    'System error (announce="assertive")',
  'Evento lui-complete': 'lui-complete event',
  'Evento lui-page-change': 'lui-page-change event',
  'Evento lui-step-change': 'lui-step-change event',
  'Evento lui-toggle': 'lui-toggle event',
  'Evento menu-select': 'menu-select event',
  'Fechado (interativo)': 'Closed (interactive)',
  Feedback: 'Feedback',
  Formatos: 'Shapes',
  Foto: 'Photo',
  'Foto que não carrega': 'Photo that fails to load',
  'Grid aninhado': 'Nested grid',
  Grupo: 'Group',
  'Grupo com status': 'Group with status',
  'Grupo em cada tamanho': 'Group in every size',
  'Header fixo': 'Sticky header',
  'Integração com formulários': 'Form integration',
  'Item aberto por padrão': 'Item open by default',
  'Item desabilitado': 'Disabled item',
  'Label (atributo)': 'Label (attribute)',
  'Link de download': 'Download link',
  'Link desabilitado e em loading': 'Disabled and loading link',
  'Link em nova aba': 'Link in a new tab',
  'Link externo': 'External link',
  'Link externo — i18n (external-label)':
    'External link — i18n (external-label)',
  'Link externo em parágrafo': 'External link in paragraph',
  'Loading com conteúdo': 'Loading with content',
  'Muitas páginas': 'Many pages',
  'Múltiplos abertos': 'Multiple open',
  'Nova aba (_blank)': 'New tab (_blank)',
  Numérico: 'Numeric',
  Ordenável: 'Sortable',
  'Outras unidades': 'Other units',
  'Poucas páginas': 'Few pages',
  Pulso: 'Pulse',
  'Quantidade de vizinhas': 'Sibling count',
  'Rótulo só para leitor de tela': 'Screen reader only label',
  'Rótulo visível': 'Visible label',
  'Rótulos abaixo do indicador': 'Labels below the indicator',
  'Sem ações': 'Without actions',
  'Sem caption': 'Without caption',
  'Sem foto e sem iniciais': 'No photo and no initials',
  'Sem ícone': 'Without icon',
  'Sem resultados (announce="polite")': 'No results (announce="polite")',
  'Sem subtítulo': 'Without subtitle',
  Separador: 'Separator',
  'Slot de descrição': 'Description slot',
  'Só a barra': 'Bar only',
  'Só o indicador': 'Indicator only',
  'Só texto, sem borda': 'Text only, no border',
  'Somente números': 'Numbers only',
  'Status em cada tamanho': 'Status in every size',
  Tamanhos: 'Sizes',
  'Texto do status': 'Status text',
  'Todos os tamanhos': 'All sizes',
  'Trigger customizado (slot)': 'Custom trigger (slot)',
  'Trigger de Dropdown Menu': 'Dropdown Menu trigger',
  'Trigger de Modal': 'Modal trigger',
  'Truncamento com reticências': 'Ellipsis truncation',
  'Um aberto por vez': 'One open at a time',
  'Valores e situação': 'Values and status',
  'Variante bordered': 'bordered variant',
  'Variante highlighted': 'highlighted variant',
};

/**
 * Story names written in English, translated to Portuguese for the sidebar.
 *
 * The counterpart of `storyNamesEn`: many stories take their name from the export
 * key (`AllSizes` → "All Sizes"), which is English. Terms that are API or
 * component vocabulary are listed in `untranslatedStoryNames` instead.
 */
export const storyNamesPt = {
  Aligned: 'Alinhado',
  'All Icons': 'Todos os ícones',
  'All Placements': 'Todas as posições',
  'All Sizes': 'Todos os tamanhos',
  'All Variants': 'Todas as variantes',
  'All Variants Loading': 'Todas as variantes em loading',
  'As Picture': 'Como picture',
  'Aspect Ratios': 'Proporções',
  'Auto Dismiss': 'Fechamento automático',
  'Avatar with Status / Badge': 'Avatar com status / badge',
  'Block Title': 'Título de bloco',
  'Border Radii': 'Raios de borda',
  'Calendar open': 'Calendário aberto',
  'Card (semantic tokens)': 'Card (tokens semânticos)',
  'Card — expand': 'Card — expandir',
  'Center alignment': 'Alinhamento ao centro',
  Centered: 'Centralizado',
  Checked: 'Marcado',
  Circle: 'Círculo',
  'Color Variants': 'Variantes de cor',
  Column: 'Coluna',
  'Content via attribute (content="")': 'Conteúdo via atributo (content="")',
  'Copy Event': 'Evento de cópia',
  'Custom Icon': 'Ícone customizado',
  'Custom icon (icon slot)': 'Ícone customizado (slot icon)',
  'Custom trigger (slot)': 'Trigger customizado (slot)',
  'Danger never auto-dismisses': 'Danger nunca fecha sozinho',
  Default: 'Padrão',
  Disabled: 'Desabilitado',
  'Disabled Checked': 'Desabilitado e marcado',
  Dismissible: 'Dispensável',
  'Dismissible with actions': 'Dispensável com ações',
  'Dismissible — all variants': 'Dispensável — todas as variantes',
  End: 'Fim',
  Error: 'Erro',
  'Error State': 'Estado de erro',
  Events: 'Eventos',
  'Extra Large (xl)': 'Extra grande (xl)',
  'Fallback Color': 'Cor de fallback',
  'Fallback Src': 'Src de fallback',
  'Form Integration': 'Integração com formulários',
  Full: 'Completo',
  Group: 'Grupo',
  'Headline Variant': 'Variante headline',
  'In Context': 'Em contexto',
  Indeterminate: 'Indeterminado',
  'Input Mode': 'Modo de entrada',
  Italic: 'Itálico',
  'Italic Underline': 'Itálico sublinhado',
  Label: 'Rótulo',
  'Label Placement': 'Posição do rótulo',
  Large: 'Grande',
  'Left alignment': 'Alinhamento à esquerda',
  Line: 'Linha',
  'Line Numbers': 'Números de linha',
  'Line — expand': 'Linha — expandir',
  'List Item': 'Item de lista',
  Loading: 'Carregando',
  'Loading With Text': 'Carregando com texto',
  'Locale and first day of week': 'Idioma e primeiro dia da semana',
  'Long Lines': 'Linhas longas',
  'Min and max': 'Mínimo e máximo',
  'Multi Line': 'Várias linhas',
  'Multiple Keys': 'Várias teclas',
  'Narrow Sidebar': 'Sidebar estreita',
  'No Avatar': 'Sem avatar',
  'No Copy Button': 'Sem botão de copiar',
  'No Wrap': 'Sem quebra de linha',
  'Number Input': 'Input numérico',
  Password: 'Senha',
  'Pattern + Input Mode': 'Pattern + modo de entrada',
  'Persistent (duration="0")': 'Persistente (duration="0")',
  Positions: 'Posições',
  'Pre-selected': 'Pré-selecionado',
  Profile: 'Perfil',
  Range: 'Intervalo',
  'Range in two fields': 'Intervalo em dois campos',
  'Raw CSS fallback': 'Fallback com CSS bruto',
  Rectangle: 'Retângulo',
  Required: 'Obrigatório',
  'Resize: None': 'Redimensionar: nenhum',
  Scrollable: 'Rolável',
  'Single Key': 'Tecla única',
  'Single Line': 'Linha única',
  'Size Lg': 'Tamanho Lg',
  'Size Md': 'Tamanho Md',
  'Size Sm': 'Tamanho Sm',
  'Size: Large': 'Tamanho: grande',
  'Size: Medium': 'Tamanho: médio',
  'Size: Small': 'Tamanho: pequeno',
  Sizes: 'Tamanhos',
  'Slotted content with rich markup': 'Conteúdo em slot com markup rico',
  Small: 'Pequeno',
  'Small Gap': 'Espaçamento pequeno',
  'Space Between': 'Espaço entre',
  'Space Between (fixed height)': 'Espaço entre (altura fixa)',
  Square: 'Quadrado',
  'Stacked (collapsed, scales to 95%)': 'Empilhado (recolhido, escala a 95%)',
  Subtitle: 'Subtítulo',
  'Syntax Highlighting': 'Destaque de sintaxe',
  Text: 'Texto',
  Title: 'Título',
  'Title only': 'Somente título',
  'Typed entry': 'Entrada digitada',
  Underline: 'Sublinhado',
  'Unavailable dates': 'Datas indisponíveis',
  Variants: 'Variantes',
  'Vertical With Label': 'Vertical com rótulo',
  'Via label': 'Via label',
  'Via slot': 'Via slot',
  'Wide Threshold': 'Limite largo',
  'With Actions': 'Com ações',
  'With Caption': 'Com caption',
  'With Counter': 'Com contador',
  'With Cover': 'Com capa',
  'With Custom Trigger': 'Com trigger customizado',
  'With Grow': 'Com grow',
  'With Hint': 'Com dica',
  'With Icon': 'Com ícone',
  'With Label': 'Com rótulo',
  'With Line Clamp': 'Com line clamp',
  'With Max Width': 'Com largura máxima',
  'With Offset': 'Com deslocamento',
  'With action (replaces close button)':
    'Com ação (substitui o botão de fechar)',
  'With action — all variants': 'Com ação — todas as variantes',
  'Without actions': 'Sem ações',
  'Without cover': 'Sem capa',
  'XSS-safe content (content attribute)':
    'Conteúdo seguro contra XSS (atributo content)',
  'background — all semantic aliases':
    'background — todos os aliases semânticos',
  'border-color — semantic aliases': 'border-color — aliases semânticos',
  'border-radius — scale': 'border-radius — escala',
  'fade — directions': 'fade — direções',
};

/**
 * Story names that read the same in both languages.
 *
 * Component names, variants, attribute names and values, and other product or
 * API vocabulary. Listed so `storyNames.test.js` can tell a deliberate
 * "no translation" from a name nobody looked at.
 */
export const untranslatedStoryNames = new Set([
  // Components
  'Alert',
  'Button',
  'Card',
  'Checkbox',
  'Close Button',
  'Date Picker',
  'Divider',
  'Drawer',
  'Empty State',
  'Icon Button',
  'Input',
  'Native Select',
  'Progress Bar',
  'Radio',
  'Radio Group',
  'Skeleton',
  'Snippet',
  'Textarea',
  'Toast',
  'Tooltip',
  // Variants, parts and typography styles
  'Block',
  'Body',
  'Bordered',
  'Caution',
  'Danger',
  'Display',
  'Heading',
  'Info',
  'Neutral',
  'Overtitle',
  'Primary',
  'Secondary',
  'Shortcut',
  'Subheadline',
  'Submenu',
  'Success',
  'Trigger',
  // Words shared by both languages
  'Download',
  'Horizontal',
  'Linear',
  'Social',
  'Status',
  'Vertical',
  // Attributes, values and CSS terms
  'Autofocus',
  'Image',
  'Object Fit',
  'Pattern',
  'bottom-center',
  'bottom-start',
  'close-on-backdrop: false',
  'disabled',
  'fade (boolean)',
  'max-height',
  'middle-center',
  'middle-end',
  'middle-start',
  'orientation="both"',
  'orientation="horizontal"',
  'overscroll',
  'scroll-shadow',
  'scrollbar-visibility',
  'snap',
  'snap snap-align="center"',
  'top-center',
  'top-end',
  'top-start',
]);

/**
 * Menu labels (groups and non-component pages) in Portuguese.
 *
 * The titles in the story files are written in English because the sidebar
 * hierarchy comes from them. Component names (`Button`, `Dropdown Menu`,
 * `Radio Group`, …), API terms (`Heading`, `Body`, `Mixins`, …) and `Layout` are
 * product vocabulary and stay in English in both languages, so they are simply
 * absent from this map. Keys are single title segments, not full paths.
 */
export const titleSegmentsPt = {
  'Get started': 'Primeiros passos',
  Introduction: 'Introdução',
  Localization: 'Localização',
  Foundations: 'Fundamentos',
  Border: 'Bordas',
  Color: 'Cores',
  Elevation: 'Elevação',
  Spacing: 'Espaçamento',
  Typography: 'Tipografia',
  Actionable: 'Ações',
  Navigation: 'Navegação',
  'Form and options': 'Formulários e opções',
  Content: 'Conteúdo',
  Utilities: 'Utilitários',
  Functions: 'Funções',
};

/** Name of the auto-generated documentation entry, per language. */
const docsEntryName = { 'pt-BR': 'Documentação', 'en-US': 'Docs' };

/**
 * Returns the display title (the sidebar hierarchy) of an entry.
 *
 * @param {string} title The `/`-separated title in the index.
 * @param {string} language The active language (`pt-BR` or `en-US`).
 * @returns {string} The title to show in the sidebar.
 */
export function localizedTitle(title, language) {
  if (language !== 'pt-BR') return title;
  return title
    .split('/')
    .map((segment) => titleSegmentsPt[segment] ?? segment)
    .join('/');
}

/**
 * Returns the display name of an entry in a given language.
 *
 * @param {string} name The name in the index (`storyName`, the export key, or `Docs`).
 * @param {string} language The active language (`pt-BR` or `en-US`).
 * @param {string} [type] The entry type (`story` or `docs`).
 * @returns {string} The name to show in the sidebar.
 */
export function localizedStoryName(name, language, type = 'story') {
  if (type === 'docs' && name === 'Docs') {
    return docsEntryName[language] ?? name;
  }
  const names = language === 'en-US' ? storyNamesEn : storyNamesPt;
  return names[name] ?? name;
}
