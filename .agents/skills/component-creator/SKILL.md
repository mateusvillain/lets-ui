---
name: component-creator
description: Criar ou evoluir componentes do design system Let’s UI no mesmo padrão do repositório atual. Usar esta skill quando for necessário adicionar componente novo, completar formato faltante (SCSS/HTML-CSS base ou Web Component), ou alinhar implementação com Figma e tokens existentes. Aplicar quando o pedido envolver componentes em `packages/styles/src/components` e `packages/lets-ui-components/src/components`, exigindo uso de tokens/functions/mixins, sem valores brutos, com semântica HTML e acessibilidade.
---

# Component Creator

Criar componentes novos ou completar formatos faltantes seguindo o padrão técnico do Let’s UI, com foco em consistência entre SCSS, Web Components, tokens e acessibilidade.

## Fluxo Obrigatório

1. Identificar o componente solicitado e normalizar o nome para kebab-case quando for SCSS e PascalCase quando for Web Component.
2. Verificar cobertura de formato no design system atual.
3. Decidir se é necessário Figma MCP.
4. Implementar somente o que estiver faltando.
5. Validar semântica, acessibilidade e uso de tokens.
6. Reportar gaps e pendências encontradas.

## Verificar Cobertura de Formato

Consultar primeiro:

- `references/component-map.md`
- `packages/styles/src/components`
- `packages/lets-ui-components/src/components`

Tratar formatos como:

- `scss`: arquivo `packages/styles/src/components/_<nome>.scss` (ou mapeamento equivalente em `references/lets-ui-component-map.md`)
- `web-component`: arquivo `packages/lets-ui-components/src/components/<nome>.js`

Concluir:

- Se os dois formatos já existirem: apenas evoluir o componente solicitado.
- Se apenas um formato existir: criar somente o formato faltante.
- Se nenhum formato existir: solicitar link do componente no Figma e seguir com Figma MCP.

## Regra de Uso do Figma

Aplicar obrigatoriamente:

- Solicitar link/nó do componente no Figma quando o componente não existir no repositório.
- Dispensar Figma quando o componente já existir e o pedido for apenas completar formato faltante.

Ao usar Figma MCP:

- Inspecionar estrutura, estados e variáveis do componente.
- Mapear variáveis do Figma para tokens existentes no design system.
- Bloquear criação de token novo.
- Reportar explicitamente qualquer variável do Figma sem correspondência em token existente.

## Regra de Tokens (Sem Valores Brutos)

Nunca usar valores crus em SCSS:

- Proibir `#hex`, `rgb()`, `hsl()`, `lch()`, `px` literal para escala/tamanho de design token, e valores hardcoded equivalentes quando existir função de token.
- Usar funções utilitárias existentes em `packages/utilities/src/_functions.scss` e mixins em `packages/utilities/src/_mixins.scss`.
- Priorizar padrões já praticados nos componentes existentes.

Nunca criar token novo neste fluxo:

- Usar apenas tokens já disponíveis em `packages/lets-ui-tokens` e no mapa `packages/utilities/src/_tokens.map.scss`.
- Se faltar token para representar requisito do Figma, reportar como pendência e não inventar fallback bruto.

## Implementação por Formato

Para SCSS:

- Criar/editar em `packages/styles/src/components`.
- Importar o componente em `packages/styles/src/components/_components.scss` quando aplicável.
- Reutilizar functions/mixins/tokens como os demais componentes do sistema.

Para Web Component:

- Criar/editar em `packages/lets-ui-components/src/components`.
- Registrar/exportar em `packages/lets-ui-components/src/index.js` quando for novo componente.
- Seguir padrões internos de `packages/lets-ui-components/src/internal.js`.

## Semântica e Acessibilidade

Garantir durante implementação:

- Usar elemento HTML semanticamente correto para a função do componente.
- Expor atributos ARIA quando necessário (`aria-label`, `aria-disabled`, relação `label/for`, etc.).
- Garantir navegação por teclado e estado de foco visível.
- Evitar markup que quebre leitura por tecnologia assistiva.
- Preservar comportamento acessível em estados (`disabled`, erro, seleção, expansão, etc.).

## Formato do Relato de Saída

Sempre reportar:

- Cobertura encontrada (`scss`, `web-component`).
- O que foi criado e o que foi reaproveitado.
- Como variáveis do Figma foram mapeadas para tokens existentes.
- Quais gaps permaneceram bloqueando entrega total (ex.: token inexistente, estado não especificado, ausência de link Figma).

Não encerrar silenciosamente quando houver lacuna. Explicitar a pendência.
