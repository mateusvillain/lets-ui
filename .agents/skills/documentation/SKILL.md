---
name: documentation
description: Documentar componentes no Storybook imediatamente após criação ou atualização no Let’s UI. Usar esta skill quando for necessário criar/atualizar arquivos `*.stories.js` e `*.docs.mdx` em `docs/components/*`, adicionar stories de variantes existentes e descrever o caso de uso geral do componente e de cada variante. Aplicar em pedidos de documentação de componente, cobertura de variants no Storybook ou manutenção de docs alinhada com o código.
---

# Documentation

Garantir que todo componente novo ou alterado tenha documentação no Storybook no mesmo ciclo de entrega.

## Fluxo Obrigatório

1. Identificar nome do componente e pasta de docs em `docs/components/<ComponentName>/`.
2. Criar ou atualizar `*.stories.js` do componente.
3. Criar stories para variantes existentes (quando houver variants).
4. Criar ou atualizar `*.docs.mdx`.
5. Descrever caso de uso geral do componente e caso de uso por variante.
6. Validar consistência entre stories e implementação real.

## Regras para Stories

Aplicar em `docs/components/<ComponentName>/<ComponentName>.stories.js`:

- Definir `title: 'Components/<ComponentName>'`.
- Incluir import de CSS base usado no projeto:
  - `packages/lets-ui-tokens/dist/letsui.tokens.css`
  - `packages/styles/dist/letsui.css`
- Criar story principal com `Template.bind({})` e `args` padrão.
- Se o componente tiver variantes (`variant`, `size`, `state` etc.), criar uma story por variante relevante.
- Não inventar variantes que não existam no componente.

## Regras para Docs MDX

Aplicar em `docs/components/<ComponentName>/<ComponentName>.docs.mdx`:

- Incluir `Meta` apontando para o arquivo de stories.
- Documentar uma seção inicial com o caso de uso geral do componente.
- Para cada variante com story dedicada, incluir:
  - título da variante
  - descrição curta de quando usar
  - `Canvas` da story correspondente
- Incluir `Controls` da story principal quando fizer sentido.

## Caso de Uso (Obrigatório)

Escrever duas camadas de descrição:

- Componente (geral): para que serve e em que contexto usar.
- Variante (story): quando escolher aquela opção em vez das demais.

Manter descrição objetiva, orientada a decisão de uso.

## Critérios Adicionais Recomendados

Além dos critérios solicitados, aplicar:

- Cobrir estados críticos em stories (ex.: `disabled`, `error`, `loading`) quando existirem.
- Garantir que nomes de stories sejam claros e consistentes com o design system.
- Evitar divergência entre `argTypes`, `args` e API real do componente.
- Remover stories obsoletas quando variantes forem removidas do componente.
- Preservar acessibilidade básica nas demos (semântica e atributos ARIA quando aplicável).

## Checklist de Entrega

- Arquivo de stories criado/atualizado.
- Stories de variants existentes criadas.
- Arquivo MDX criado/atualizado.
- Caso de uso geral documentado.
- Caso de uso por variante documentado.
- Sem inconsistência entre documentação e implementação.

## Referências

- Ler `references/storybook-documentation-patterns.md` para template de stories/docs.
