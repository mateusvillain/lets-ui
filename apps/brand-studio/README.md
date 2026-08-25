# Brand Studio

Editor visual dos tokens de marca (`lui.brand.*`) do Let's UI.

Uma marca do Let's UI é definida por três arquivos DTCG em
`packages/lets-ui-tokens/tokens/brand/<marca>/`: `colors.light.json`,
`colors.dark.json` e `foundation.json`. Todo o resto do design system —
tokens semânticos, componentes SCSS e Web Components — deriva deles. O Brand
Studio é a interface para quem cuida da marca editar exatamente esse recorte
sem abrir um arquivo JSON.

## Como rodar

```bash
cd apps/brand-studio
pnpm install --ignore-workspace
pnpm dev
```

O app fica em <http://localhost:4323>. Ele consome os `dist/` dos pacotes, então
rode `pnpm build` na raiz do repositório antes se os tokens ou os componentes
tiverem mudado.

## Como funciona

O painel da esquerda monta seus controles a partir do schema em
`src/lib/schema.js`; os valores iniciais são lidos dos próprios arquivos da
marca de referência em tempo de build, então a interface nunca sai de sincronia
com o que está versionado. Os controles são componentes do próprio Let's UI —
`lui-tabs`, `lui-input`, `lui-native-select`, `lui-button` — de modo que o
studio é o primeiro consumidor daquilo que edita.

O preview da direita é um `<iframe>` isolado. A cada edição o studio escreve as
custom properties `--lui-brand-*` no `:root` daquele documento; como os tokens
semânticos são `var()` apontando para os tokens de marca, todos os componentes
reagem na hora. O isolamento é o que permite editar a marca sem que a própria
interface de edição mude junto.

Alterações ficam em `localStorage`, e o indicador no rodapé mostra quantos
tokens divergem do padrão.

O painel colapsa pela barra superior, deixando o preview ocupar a tela inteira.
O seletor de largura ao lado do tema não é uma lista fixa: ele é montado a
partir dos breakpoints da marca, então editar `sm` muda a largura que o preview
passa a simular — e a seleção acompanha o breakpoint, não o número.

Com a aba **Grid** aberta, uma régua de colunas aparece sobre o preview, com a
contagem de colunas, o gutter e a margem do breakpoint ativo. Breakpoints são
validados como estritamente crescentes: um `sm` menor ou igual ao `1xs`
produziria media queries que nunca casam, então o campo recusa o valor e explica
o limite em vez de aplicar.

### Tokens resolvidos no build

Breakpoints e contagem de colunas viram literais no CSS compilado — uma media
query não aceita `var()`. O preview reproduz esse comportamento em JavaScript,
lendo os tokens para decidir o breakpoint ativo, mas as media queries reais dos
componentes só mudam depois de um novo `pnpm build`.

## Publicando uma marca

1. **Exportar tokens** baixa os três arquivos DTCG já no formato do repositório.
2. Salve-os em `packages/lets-ui-tokens/tokens/brand/<identificador>/`.
3. Registre a marca em `packages/lets-ui-tokens/letsui.resolver.json` — o studio
   mostra o trecho pronto em "Como registrar a marca".
4. Adicione as permutações da nova marca em
   `packages/lets-ui-tokens/terrazzo.config.js`, espelhando as de `lets-ui`.
5. Rode `pnpm build` na raiz e aplique `data-brand="<identificador>"` na página.

O export é uma substituição de valores sobre o arquivo original: `$type`,
`description` e a ordem das chaves são preservados, e tokens que a interface
ainda não expõe atravessam intactos.

## Estrutura

| Arquivo                | Papel                                                      |
| ---------------------- | ---------------------------------------------------------- |
| `src/lib/schema.js`    | Quais tokens são editáveis e com que controle              |
| `src/lib/state.js`     | Estado da marca, persistência, import e export             |
| `src/lib/dtcg.js`      | Leitura e escrita do formato DTCG                          |
| `src/lib/color.js`     | Conversões de cor, geração de escala e contraste WCAG      |
| `src/lib/clamp.js`     | Escala tipográfica fluida (`clamp()`)                      |
| `src/lib/studio.js`    | Montagem da interface e aplicação no preview               |
| `src/pages/index.astro`| Shell do studio                                            |
| `src/pages/preview.astro`| Galeria de componentes renderizada no iframe             |
