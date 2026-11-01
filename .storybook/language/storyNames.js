/**
 * Story names for the sidebar, per language.
 *
 * Storybook builds the sidebar from `index.json`, so a story name (`storyName`
 * in the story file) is the same in both languages. This map translates the
 * names written in Portuguese; the manager applies it to the index whenever the
 * language global changes. Names that do not appear here stay as they are in
 * both languages — which is what most of them do, since they are API terms
 * (`Primary`, `Loading`, `compact`, `close-on-backdrop: false`, …).
 *
 * Keys are the exact `storyName` strings from the `*.stories.*` files.
 */
export const storyNamesEn = {
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
  Cores: 'Colors',
  'Decorativo, ao lado do nome': 'Decorative, next to the name',
  'Dentro do Alert (dismissible)': 'Inside the Alert (dismissible)',
  'Dentro do Modal': 'Inside the Modal',
  Desabilitado: 'Disabled',
  'Em parágrafo': 'In a paragraph',
  'Em tabela': 'In a table',
  Erro: 'Error',
  'Erro de sistema (announce="assertive")':
    'System error (announce="assertive")',
  'Evento lui-complete': 'lui-complete event',
  'Evento lui-page-change': 'lui-page-change event',
  'Evento lui-step-change': 'lui-step-change event',
  'Evento lui-toggle': 'lui-toggle event',
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
 * Returns the display name of a story in a given language.
 *
 * @param {string} name The name in the index (`storyName`, or the export key).
 * @param {string} language The active language (`pt-BR` or `en-US`).
 * @returns {string} The name to show in the sidebar.
 */
export function localizedStoryName(name, language) {
  if (language !== 'en-US') return name;
  return storyNamesEn[name] ?? name;
}
