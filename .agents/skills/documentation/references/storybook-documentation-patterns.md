# Storybook Documentation Patterns

Use este guia como base para documentar componentes no Let\'s UI.

## Estrutura Esperada

- `docs/components/<ComponentName>/<ComponentName>.stories.js`
- `docs/components/<ComponentName>/<ComponentName>.docs.mdx`

## Template de Stories

```js
import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Components/<ComponentName>',
  argTypes: {
    // definir controles reais da API
  },
};

const Template = (args) => {
  // montar HTML de demonstração
  return `...`;
};

export const <ComponentName> = Template.bind({});
<ComponentName>.args = {
  // args padrão
};

export const <VariantA> = Template.bind({});
<VariantA>.args = {
  // args da variante
};
```

## Template de Docs MDX

```mdx
import { Meta, Canvas, Controls } from '@storybook/addon-docs/blocks';
import * as Stories from './<ComponentName>.stories';

<Meta of={Stories} />

# <ComponentName>

Descrição geral do componente e contexto de uso.

<Canvas of={Stories.<ComponentName>} />
<Controls of={Stories.<ComponentName>} />

## <VariantA>

Quando usar esta variante.

<Canvas of={Stories.<VariantA>} />
```

## Regra de Cobertura de Variantes

- Criar story dedicada para cada variante relevante.
- Se não houver variantes, manter apenas story principal.
- Não duplicar variantes visualmente idênticas sem justificativa.

## Regra de Texto de Caso de Uso

- Geral: "Use este componente para..."
- Variante: "Use esta variante quando..."

## Verificação Final

- `title` da story correto em `Components/...`.
- `Meta` apontando para stories corretas.
- `Canvas` e `Controls` funcionando para story principal.
- Seções de variantes com descrição de uso presentes.
