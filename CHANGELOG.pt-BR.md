# Changelog

<!-- Tradução do CHANGELOG.md, que é a fonte. Cada versão aqui segue a mesma do original; uma versão que faltar aparece em inglês no site. -->

## v1.13.1

### Adicionado

- Card aceita o atributo `actions-label` para o nome acessível do seu grupo de ações, para que ele possa ser traduzido. O padrão é o antigo texto fixo "Card actions".

### Corrigido

- Dropdown Menu deixava o foco no gatilho ao abrir, porque a transição de estado do item também animava a `visibility` que ele herda do painel e o mantinha oculto no quadro de abertura. Abrir o menu agora foca o primeiro item habilitado.
- Os itens do Dropdown Menu eram paradas de Tab, e Tab fechava o menu e mandava o foco para um item do painel que estava fechando, onde ele se perdia. Seguindo o padrão Menu Button do WAI-ARIA, os itens agora são alcançados só pelas setas. Tab fecha o menu e move o foco para depois do gatilho, e Shift+Tab para antes dele.
- Tooltip não atendia aos critérios 1.4.13 e 2.3.3 da WCAG, que só o tooltip do Code Block cumpria. Todo tooltip agora:
  - Fecha com Escape sem mover o ponteiro nem o foco, e volta a aparecer no próximo hover ou foco. Um Escape que fecha um tooltip é consumido, então um Modal ou Drawer ao redor só fecha no próximo. Um Escape que faz parte de uma composição de IME, ou uma tecla mantida pressionada, é ignorado.
  - Pode receber hover: o conteúdo aceita eventos de ponteiro enquanto está visível, com uma ponte sobre o espaço até o gatilho nas quatro posições.
  - Não tem transições sob `prefers-reduced-motion: reduce`.
  - O `.tooltip` CSS-only ganha o estado `.tooltip--dismissed`, que um pouco de script pode alternar no Escape.
- O tooltip do Code Block voltava assim que o ponteiro saía ou o foco se movia depois do Escape. Agora ele volta no próximo hover ou foco, como todos os outros tooltips.

## v1.13.0

### Adicionado

- Novo Web Component `lui-date-picker` e estilos CSS-only `.date-picker` para escolher uma data ou um intervalo de datas em um calendário.
  - `range` mostra dois meses lado a lado e escolhe o intervalo em dois passos, com prévia ao vivo. `min`, `max`, `locale` e `first-day-of-week` definem o calendário, e `isDateDisabled` marca dias como indisponíveis. O título do calendário abre uma grade de meses e anos.
  - `editable` transforma o campo em uma caixa de texto com um botão de calendário ao lado. Só dígitos são digitados, e a máscara adiciona os separadores na ordem do locale (`dd / mm / yyyy` em `pt-BR`, `mm / dd / yyyy` em `en-US`). `value` só muda quando o texto é uma data completa e real. Caso contrário, o campo informa `badInput` com `bad-input-text`. Colar uma data ISO também funciona.
  - `value` é ISO 8601 em todos os locales: `YYYY-MM-DD`, ou `YYYY-MM-DD/YYYY-MM-DD` para um intervalo.
  - É form-associated e informa `valueMissing`, `rangeUnderflow`, `rangeOverflow` e `badInput`. O calendário segue o padrão Date Picker Dialog do WAI-ARIA com suporte completo a teclado. O formato faz parte da descrição acessível do input, e a data escolhida faz parte do nome do botão de calendário.
- Novo Web Component `lui-progress-bar` e estilos CSS-only `.progress-bar` para mostrar quanto de uma tarefa já foi feito.
  - `value`, `max`, `variant` (`primary`, `success`, `caution`, `danger`), `size` (`sm`, `md`, `lg`), `label-placement` (`top`, `inline`), `label`, `caption`, `hide-label` e `hide-value`.
  - Sem `value` a barra é indeterminada: um segmento percorre o trilho, e sob `prefers-reduced-motion` a barra inteira pulsa no lugar.
  - `value-text` substitui a porcentagem calculada por um valor na sua própria unidade ("3.2 GB de 10 GB") e vira o `aria-valuetext`. Na versão CSS-only, `--lui-progress-bar-value` define a largura do preenchimento.
- Icon Button tem um estado visual de pressionado. Com `aria-pressed="true"` ele recebe o preenchimento neutro de container, e hover, foco e `disabled` continuam se aplicando por cima. No modo forced-colors um botão pressionado usa as cores de sistema `Highlight` e um anel interno, e `GrayText` quando desabilitado.
- Modal e Drawer fecham quando um elemento marcado com `data-modal-close` ou `data-drawer-close` dentro deles é clicado, como a documentação já mostrava. Um clique que chama `preventDefault()`, ou que vem de um `lui-button` em carregamento, mantém o diálogo aberto, e o foco volta como em todos os outros caminhos de fechamento.
- Nova função `tint($role)` (`foreground`, `background`), e um parâmetro `$tint` em `states()`, `state-layer()` e `state-base()`. Veja Alterado.

### Alterado

- As paletas primary, green e info (blue) foram reconstruídas em OKLCH, para que texto branco sobre os seus containers chegue a 4.5:1. No modo claro, `primary.4` passa de `#339bf0` (2.96:1) para `#0a7ac8`, `green.4` de `#23963b` (3.82:1) para `#0b892e`, e `blue.4` de `#339bf0` para `#0080a2`. O matiz de info sai do índigo do primary para um azul-ciano distinto, para que os dois não sejam mais lidos como a mesma cor. O modo escuro fica próximo dos valores anteriores. Os tokens são escritos com `colorSpace: "oklch"` e um fallback `hex`.
- Componentes preenchidos agora tingem os estados de hover e pressionado com a cor oposta ao seu rótulo, para que o rótulo ganhe contraste em vez de perder. Botões preenchidos escurecem no hover no modo claro e clareiam no escuro, e o botão neutro faz o oposto. Isso vale para Button, a página atual da Pagination, a Tab de card selecionada, o círculo do Stepper e Checkbox, Radio e Switch marcados. Componentes de superfície mantêm o tingimento pela cor do conteúdo. Antes, o botão danger caía para 4.40:1 no hover e o botão neutro escuro para 3.87:1 quando pressionado.
- Os hosts dos componentes não são mais expostos como nós `generic` extras na árvore de acessibilidade. Breadcrumb, Button, Card, Checkbox, Code Block, Icon Button, Input, Link, Radio, Select, Shortcut, Switch, Textarea e Tooltip leem os atributos `aria-*` que aceitam para uma propriedade e os removem do host.
  - Seletores de atributo no host, como `lui-button[aria-expanded="true"]`, e `getAttribute('aria-*')` no host não correspondem mais. Leia a propriedade (`el.ariaExpanded`), ou estilize a partir do dono do estado (`lui-modal[open]`).
  - Modal e Drawer definem o estado do seu gatilho por propriedades ARIA, e não adicionam mais um `aria-controls` que apontava para dentro do seu shadow root. Link agora aceita `aria-expanded` e `aria-haspopup`, então funciona como gatilho deles.
- **Brand Studio** (`apps/brand-studio`) tem um novo layout. A prévia é um canvas com alças de arrastar para a largura e controles de zoom flutuantes. Todas as categorias ficam em uma única coluna com rolagem, cada rampa de cor é uma única faixa de passos, e o modo escuro é um switch em Colors. As famílias de fonte podem ser escolhidas em uma lista selecionada do Google Fonts, e a exportação inclui um `README.md` com os passos de registro e o fragmento do resolver. Restaurar padrões e os selects de largura e cena foram removidos. É um app independente, e nenhum pacote publicado muda.

### Corrigido

- Escape fechava todos os Modals e Drawers abertos de uma vez quando estavam empilhados. Um Escape agora fecha só o diálogo do topo, e só esse diálogo prende o foco. O foco volta para quem o abriu dentro do diálogo que continua aberto. Um Dropdown Menu, Toast ou tooltip do Code Block dentro de um diálogo mantém o seu próprio Escape, e o diálogo continua aberto.
- Tooltip descrevia um botão só com ícone com o próprio nome do botão, então leitores de tela o anunciavam duas vezes. Um tooltip cujo texto repete o nome do gatilho agora deixa a descrição do gatilho como está, e verifica de novo quando o nome muda. Enquanto o tooltip descreve um gatilho em slot, o seu texto visível fica oculto da árvore de acessibilidade, para que o modo de navegação não o leia de novo.

## v1.12.1

### Corrigido

- Button e Icon Button não anunciavam o estado do que abrem ou alternam. `aria-expanded`, `aria-haspopup` e `aria-pressed` definidos no host, seja pelo autor ou por um Modal, Drawer ou Dropdown Menu que eles acionam, ficavam em um elemento sem papel. Os dois agora repassam esses atributos para o seu controle interno.
- Button perdia o nome acessível durante `loading` quando o rótulo era passado como conteúdo em vez de `label`. O slot padrão agora continua renderizado durante o carregamento.
- O foco sumia no modo forced-colors (alto contraste) em todos os componentes construídos sobre os estilos de estado compartilhados, porque o anel de foco é um `box-shadow` que o modo remove. Um outline de sistema agora toma o seu lugar. Button também ganha uma borda nesse modo, já que o seu fundo, a sua única borda visível, é descartado.
- Icon Button era renderizado sem padding nem tamanho para valores de `size` diferentes de `lg` e `md`, um alvo de poucos pixels de largura. Esses valores agora caem para `md`. Ele também não renderiza mais um `aria-label` vazio nem um `aria-disabled` inválido.
- Dropdown Menu definia `aria-haspopup` e `aria-expanded` em um wrapper interno em vez do seu gatilho, então o estado aberto nunca era anunciado. Eles agora vão no gatilho em slot, `aria-haspopup="menu"`, e acompanham o gatilho quando ele é trocado. O foco volta para o gatilho no Escape e quando um item é escolhido.
- Modal e Drawer definiam `aria-controls` em um gatilho passado pelo slot `trigger`, apontando para um ID dentro do seu shadow root que o gatilho não consegue referenciar. O gatilho em slot agora mantém só `aria-haspopup` e `aria-expanded`, e o botão padrão de `trigger-label` mantém `aria-controls`. Os atributos passam para um gatilho trocado no slot e ignoram `tabindex="-1"` e descendentes desabilitados.
- Modal e Drawer não devolviam o foco depois de fechar, então ele caía para o topo do documento. O foco agora volta para o elemento que os abriu em todos os caminhos de fechamento (Escape, botão de fechar, backdrop, `closeModal()` / `closeDrawer()`, definir `open`, ou remover o elemento). Quando esse elemento não existe mais, o foco vai para o gatilho do componente. Um diálogo fechado antes do seu primeiro quadro não puxa mais o foco para o painel oculto.
- Modal só travava e destravava a rolagem da página por `openModal()` e `closeModal()`, então definir `open` diretamente podia deixar a página travada. A trava agora acompanha `open`.
- Tooltip com gatilho personalizado tornava o seu wrapper uma segunda parada de Tab e descrevia o wrapper em vez do controle focado. O gatilho em slot agora recebe o texto do tooltip como `aria-description`, e o wrapper só é focável quando o gatilho não tem nada focável ou está desabilitado. Button, Close Button, Icon Button e Link repassam essa descrição para o seu controle interno.

### Alterado

- **State Calculator** (`apps/state-calculator`) tem uma nova interface: uma barra lateral com chips de presets e troca do par de cores, uma amostra ao vivo que pode ser fixada em repouso, hover ou pressionado, medidores de contraste em cada estado, um slider de escala de mistura e um link compartilhável. É um app independente, e nenhum pacote publicado muda.

## v1.12.0

### Adicionado

- Novo Web Component `lui-status` e estilos CSS-only `.status` para mostrar um estado, com rótulo e descrição opcionais.
  - `variant` é `success`, `caution`, `danger` ou `info` (um ícone de 20px, ou um ponto de 8px com `dot`), ou `online`, `away`, `busy` ou `offline` (um ponto de 16px com as formas do Avatar dentro).
  - `size` (`md`, `lg`) define o tamanho do rótulo, e `pulse` adiciona um anel animado que fica parado sob `prefers-reduced-motion`.
  - Sem `label`, leitores de tela ouvem o nome da variante. `hide-label` mantém o rótulo só para leitores de tela.
- Novos Web Components `lui-stepper` e `lui-step` e estilos CSS-only `.stepper` para mostrar o progresso em um fluxo dividido em etapas.
  - `current-step`, `orientation` (`horizontal`, `vertical`) e `label-placement` (`end`, `bottom`). `linear` só deixa o usuário voltar para etapas concluídas.
  - `lui-step-change` é disparado com `{ step, previous }` antes de a etapa mudar, e cancelá-lo mantém a etapa atual. Um stepper horizontal que não cabe no seu container passa para vertical.
  - Cada etapa é um botão nativo cujo nome começa pela sua posição ("Step 2 of 4"), e uma live region anuncia cada mudança de etapa.
- Novo Web Component `lui-otp-input` e estilos CSS-only `.otp-input` para senhas de uso único e códigos de verificação, com uma caixa por caractere.
  - `length`, `type` (`text`, `number`), `separator`, `hint`, `error` e `show-label`.
  - Digitar avança para a próxima caixa, e um código colado preenche todas as caixas. `lui-complete` é disparado quando o código está completo.
  - É uma única parada de Tab e oferece `autocomplete="one-time-code"`. É form-associated, e tanto `required` quanto um código parcialmente preenchido bloqueiam o envio.
- Novo Web Component `lui-code-block` e estilos CSS-only `.code-block` para trechos de código, nas variantes `default` e `snippet`.
  - `show-line-numbers`, e um botão de copiar com tooltip que emite `lui-copy` (ou `lui-copy-error` quando a área de transferência é recusada).
  - Syntax highlighting opcional por `LuiCodeBlock.highlighter` e `language`. O pacote não inclui nenhum parser.
  - Novo token de marca `lui.brand.typography.font-family.code`, lido por `font(code)` e editável no Brand Studio.
- Novo Web Component `lui-skeleton` e estilos CSS-only `.skeleton` que ocupam o lugar do conteúdo enquanto ele carrega. `shape` é `text`, `circle` ou `rectangle`, com `width` e `height`. O brilho para sob `prefers-reduced-motion`. Um skeleton é decorativo a menos que tenha um `label`, que o torna `role="status"`.
- **State Calculator** (`apps/state-calculator`), que mostra as cores de hover e pressionado que a camada de estado deriva de um par de cores. É um app independente, e nenhum pacote publicado muda.

### Alterado

- A borda de hover dos campos agora vem da cor do conteúdo em vez de um token de traço, o mesmo modelo que o Button usa para o seu fundo. No hover, Input, Select e Textarea misturam 40% da cor do conteúdo na sua borda em repouso. Checkbox, Radio e Switch desmarcados fazem o mesmo no hover, e misturam 56% ao pressionar. Campos em estado de erro agora também reagem ao hover.
- O ponto de status do Avatar agora usa as cores e formas dos status sociais do Status. A sua API e aparência não mudam.

### Removido

- Os tokens não usados `lui.color.black.alpha.1`–`8`, sobras do antigo modelo de interação com tingimento fixo.
- Os tokens `border.hover` e `border.pressed` de `danger` e `neutral`. A nova função `state-border()` os substitui.

## v1.11.0

### Adicionado

- Novos Web Components `lui-avatar` e `lui-avatar-group`, mais os estilos CSS-only `.avatar` / `.avatar-group`, para representar uma pessoa ou entidade com uma foto ou iniciais. Uma foto que não carrega cai para as iniciais, que vêm de `name` (a primeira letra da primeira e da última palavra) a menos que `initials` as defina. Sem nenhum dos dois, um ícone de pessoa na cor das iniciais toma o seu lugar.
  - `size` (`sm`, `md`, `lg`), `radius` (`circle`, `rounded`, `square`) e `variant` (`gray`, `blue`, `green`, `orange`, `red`, `violet`), cada variante mantendo contraste de 4.5 : 1 para as iniciais.
  - `status` (`online`, `away`, `busy`, `offline`) adiciona um ponto com uma forma própria dentro (sólido, ponteiros de relógio, uma barra, um centro vazado) para não depender só da cor.
  - `lui-avatar-group` empilha avatares com 30% de sobreposição e um anel na cor da superfície, repassa o seu `size` e move o ponto de status para o canto inferior esquerdo. `label` dá nome ao grupo.
  - Com `name` ou `status` o avatar é `role="img"` com um `aria-label` que lê os dois ("Maria Villain, Online"); `status-label` substitui o texto em inglês. Sem nenhum dos dois ele é decorativo e fica oculto da árvore de acessibilidade.
- Novo Web Component `lui-table`, mais os estilos CSS-only `.table` / `.table-wrapper`, para dados em linhas e colunas. O autor escreve uma `<table>` nativa e o componente não adiciona markup próprio.
  - `bordered` adiciona uma borda externa com cantos arredondados, e uma `<caption>` é estilizada como o título dentro dela. Os divisores de linha (nenhum sob a última linha), o cabeçalho em negrito e o hover de linha vêm de tokens existentes.
  - `.table__cell--end` alinha uma coluna ao final e `.table__cell--fit` a deixa só da largura do seu conteúdo. Coloque qualquer das duas classes no cabeçalho e em cada célula da coluna.
  - `sticky-header` com `max-height` mantém o cabeçalho visível enquanto as linhas rolam. Ele também define `scroll-padding-top`, para que uma linha focada não fique atrás do cabeçalho.
  - Colunas ordenáveis: coloque um `<button class="table__sort">` no `<th>`. `lui-table` mantém `aria-sort` nos cabeçalhos, ordena uma coluna por vez entre crescente, decrescente e nenhuma, desenha uma seta a partir de `aria-sort` e emite `lui-sort` com `{ column, direction }`. Ele não reordena as linhas.
  - Toda tabela precisa de um nome, de uma `<caption>`, `aria-label` ou `aria-labelledby`. Quando a tabela rola, a sua área vira uma `role="region"` com nome que pode receber foco. O nome vem de `label` ou do próprio nome da tabela.
- `close-label` em `lui-modal` e `lui-drawer`, o `aria-label` do botão de fechar (padrões `Close modal` e `Close drawer`).
- `show-password-label`, `hide-password-label`, `increment-label` e `decrement-label` em `lui-input`, o `aria-label` do botão de mostrar senha e dos botões de incremento numérico.
- Novo Web Component `lui-pagination` e estilos CSS-only `.pagination` para navegar entre as páginas de um conjunto longo de conteúdo. A primeira e a última página sempre aparecem, a página atual mantém as suas vizinhas de cada lado, e uma reticência ocupa cada lacuna. Quando a lista é truncada ela mantém o mesmo comprimento, para que a linha não mude de largura ao paginar.
  - `current-page` e `total-pages` controlam a lista; `sibling-count` define quantas vizinhas aparecem ao lado da página atual. Abaixo do breakpoint `sm` (768px) `compact-sibling-count` assume, `0` por padrão, para que a linha encolha sem esconder a primeira, a última ou a página atual.
  - Navegar dispara `lui-page-change` com a nova página em `detail.page`.
  - Renderizado como um `<nav>` com uma lista de botões nativos. A página atual leva `aria-current="page"`, cada página se chama `"{page-label} N"`, as reticências são decorativas, e anterior e próxima ficam desabilitadas nos limites. Depois de uma mudança, o foco fica no controle usado, ou vai para a página atual quando esse controle some ou fica desabilitado. Uma região `role="status"` visualmente oculta anuncia a nova página.
  - Todo texto é uma prop, então o componente pode ser traduzido: `label` (o nome do `<nav>`), `previous-label`, `next-label`, `page-label` e `status-label`, onde `status-label` aceita os marcadores `{current}` e `{total}` (`"Page {current} of {total}"` por padrão).
  - O nome do `<nav>` é `label` em vez de `aria-label`, para que o atributo de quem consome não fique no elemento host, que não tem papel, e o mesmo nome não seja exposto duas vezes.
- Novos Web Components `lui-accordion` e `lui-accordion-item` e estilos CSS-only `.accordion` para uma lista de seções recolhíveis. O chevron gira quando um item abre, e a animação é removida sob `prefers-reduced-motion`.
  - Abrir um item fecha o que estava aberto; `multiple` deixa vários ficarem abertos. `lui-accordion-item` aceita `label`, `subtitle`, `open` e `disabled`, um slot `icon` e um slot padrão para a descrição.
  - `variant` é `default` (divisores), `bordered` (a lista envolvida por uma borda arredondada) ou `highlighted` (sem divisores; o item aberto ganha contorno).
  - Cada item emite `lui-toggle` com `{ open }` em `detail` sempre que o seu estado muda. O atributo `open` inicial não o emite.
  - Cada cabeçalho é um `<button>` nativo com `aria-expanded` e `aria-controls`, dentro de um elemento com `role="heading"` cujo nível `heading-level` define (1–6, padrão 3). Enter e Espaço o alternam, e as setas, `Home` e `End` movem o foco entre os cabeçalhos, pulando os desabilitados.
  - Um painel fechado é `visibility: hidden`, então o seu conteúdo sai da ordem de tabulação e da árvore de acessibilidade. O painel não tem `role="region"`, que o padrão ARIA desaconselha para accordions com muitos painéis.
- Testes de navegador para os Web Components: um projeto `components` na configuração do Vitest roda arquivos `*.test.js` no Chromium pelo Playwright, começando pelo Accordion. `pnpm test` o executa, e o CI instala o Chromium antes.

### Alterado

- Os textos que os componentes geram agora são em inglês por padrão. Eles eram fixos e divididos entre português e inglês, então um leitor de tela anunciava `Fechar modal` em uma página em inglês, e nenhum projeto era consistente de saída. Cada um é uma prop, então um projeto define o seu próprio idioma por componente em vez de herdar o nosso.
  - Padrões em português que passam para inglês: `Campo obrigatório.` → `This field is required.` (`lui-input`, `lui-textarea`, `lui-select`, `lui-checkbox`, `lui-switch`), `(opcional)` → `(optional)` (`lui-input`, `lui-textarea`, `lui-select`), `Selecione uma opção.` → `Select an option.` (`lui-radio-group`), `Mostrar tooltip` → `Show tooltip` (`lui-tooltip`), `Abrir drawer` → `Open drawer` (gatilho do `lui-drawer`), e os rótulos de senha e de incremento do `lui-input`.
  - Projetos que dependiam do texto em português agora precisam passá-lo explicitamente.
- Os tamanhos de fonte `3xs`, `2xs` e `1xs` são valores fixos em rem em vez de `clamp()` fluido. Eles ficam no piso da faixa legível, então um clamp só os encolhia mais em telas estreitas. Agora são `0.694rem`, `0.833rem` e `1rem`, a ponta mais larga das faixas antigas, que desciam até `0.691rem`, `0.778rem` e `0.875rem`.
  - Os três tokens passam de `$type: string` para `dimension`, com valores `{ value, unit }`. Uma marca que os sobrescreve com uma string `clamp()` precisa trocar para uma dimensão.
  - O mínimo de `sm` sobe de `0.984rem` para `1.05rem`, para que o passo fique claramente acima do novo `1xs`.
  - O Brand Studio edita os três passos como um único valor, e o gerador aleatório os sorteia como tamanhos fixos.

### Corrigido

- `lui-checkbox` e `lui-switch` informavam um `Campo obrigatório.` fixo como mensagem de validação e ignoravam `error-text`. Agora eles usam `error-text`.
- Os anéis de foco eram invisíveis em fundos claros. Os tokens de cor `focus-ring` apontavam para os passos mais claros das suas escalas (`primary.1`, `secondary.2`, `red.1`, `green.1`, `gray.3`), que medem entre 1.1:1 e 1.8:1 contra o branco, bem abaixo dos 3:1 que a WCAG 2.4.11 pede de um indicador de foco. Os cinco agora apontam para o passo 5 da sua escala: 3.65:1 para primary em fundo claro, e acima de 5:1 para as outras variantes nos dois temas. O passo 4 não bastava para a marca padrão, onde `primary.4` mede 2.96:1.

## v1.10.0

### Adicionado

- O grid agora vem de tokens de marca. `lui.brand.grid.*` declara os breakpoints, as quantidades de colunas, os gutters, as margens e a largura do container `1xl`, para que uma marca reestilize o grid por `data-brand` em vez de um fork da folha de estilos. A marca de referência mantém os valores que o antigo mapa fixo usava.
- Novos acessores `grid($category, $name)` e `step-above($name)`. `grid()` retorna `null` onde uma categoria não tem valor para um passo: `margin` para em `lg`, e `container` só existe em `1xl`.
- Novo export `@lets-ui/tokens/static`, com breakpoints e quantidades de colunas como literais para os dois lugares aonde um `var()` não chega: o prelúdio de uma media query e um `@for` do Sass. Todo o resto continua resolvendo em tempo de execução, então mudar os breakpoints ou as quantidades de colunas de uma marca é a única edição de grid que exige recompilar a partir do código-fonte.
- **Brand Studio** (`apps/brand-studio`), um editor visual para `lui.brand.*` com prévia ao vivo, que exporta os três arquivos DTCG como um único `<identifier>.zip`. Um app independente fora do workspace do pnpm; nenhum pacote publicado muda.

### Alterado

- `media-down($breakpoint)` agora para em `width < breakpoint` em vez de um teto inclusivo um pixel abaixo, voltando a ser o complemento exato de `media-up`. O limite antigo pulava larguras fracionárias: em 767.5px, que o zoom e a escala de tela produzem, nenhum dos lados correspondia.
- `.container` e `lui-container` tiram as suas larguras máximas dos tokens de breakpoint, para que um container pare exatamente onde o passo que lhe dá nome começa.

### Removido

- `media-up('1xs')`. `1xs` é o topo da faixa mobile, não um piso, então não tem largura a partir da qual abrir. O mixin agora gera um erro, apontando para as duas opções reais: escrever a regra sem condição, ou limitá-la com `media-down('1xs')`.

### Corrigido

- As escalas de títulos ignoravam os pesos de fonte por variante da marca. O mapa `scales` em `_tokens.map.scss` repetia uma chave de peso primitiva (`title: bold`) em vez de apontar para `lui.brand.typography.weight.title`, então toda escala compilava para o `--lui-typography-weight-*` global e os tokens de peso da marca não tinham nenhum consumidor: editar um deles não mudava nada. Cada escala de título agora resolve o seu próprio token de marca; as escalas de corpo mantêm o peso global, já que `lui.brand` não define nenhum para elas.
  - Três padrões passam para o peso que o arquivo da marca já declarava: `display` 400 → 300, `title` 700 → 600, `overtitle` 500 → 600. `headline`, `subtitle`, `block-title` e `subheadline` já concordavam com os seus tokens e não são afetados.
  - `font-scale()` agora pega o valor resolvido direto da escala. `weight()` e os utilitários `.text--weight-*` não mudam e continuam operando sobre os pesos primitivos.

## v1.9.0

### Adicionado

- Novo Web Component `lui-empty-state` e estilos CSS-only `.empty-state` para o estado que uma lista, tabela ou página assume quando não tem nada para mostrar. `title` é o único conteúdo obrigatório; `description`, um slot `cover` para uma imagem ou ilustração decorativa, um slot `actions` e um slot padrão para conteúdo extra são todos opcionais e se recolhem quando vazios.
  - `title-level` (1–6) define a tag de título renderizada, para que um Empty State reutilizável acompanhe a hierarquia de títulos da página onde aparece.
  - `align` alterna entre `center` (padrão) e `left`.
  - `announce` ativa um anúncio ao vivo da região quando o Empty State aparece depois de uma ação do usuário, como uma busca ou um filtro: `polite` renderiza `role="status"` e `assertive` renderiza `role="alert"`. Ele fica `off` por padrão, já que anunciar um estado que já estava lá no carregamento é redundante.
  - O grupo de ações é um `role="group"` com rótulo; `actions-label` define o rótulo. As ações empilham com largura total abaixo de `md` e voltam a ficar em linha acima disso.

### Alterado

- A camada de estado de interação agora mistura a própria cor de conteúdo do componente em vez de um tingimento por tema. Hover e active continuam misturando 8% e 16% no fundo em repouso do componente, mas a cor misturada é `currentColor`, a cor de conteúdo daquele fundo, em vez de preto nos temas claros e branco nos escuros.
  - Um único tingimento por tema não servia para dois componentes do mesmo tema que precisam de direções opostas: 8% de preto sobre um botão quase preto é imperceptível, enquanto um botão transparente com texto escuro nesse mesmo tema precisa escurecer. Como o conteúdo e o fundo de um componente já precisam ter contraste entre si, o tingimento é sempre o oposto luminoso da superfície, então a camada clareia o que é escuro e escurece o que é claro, sem teste de luminância, sem limite a cruzar e sem precisar saber sobre qual superfície um componente transparente está. O requisito de contraste também garante que a mudança é visível, o que um tingimento fixo não garantia.
  - Componentes que recebem a camada de estado precisam declarar `color` no mesmo elemento que a recebe; um que herda a cor do texto agora tinge com o que um ancestral definiu. `checkbox`, `radio` e `switch` marcados declaram a cor com que a sua marca é pintada, e `icon-button` declara a cor do seu ícone em slot.
  - O novo mixin `state-tint($tint)` define `--lui-state-tint` para os casos em que a `color` de um elemento não é a cor de conteúdo que os seus estados devem usar.

### Removido

- O token `--lui-color-interaction-tint`. Não existe mais token de interação: o tingimento é uma cor que o componente já declara, e as quantidades de 8% / 16% continuam como constantes SCSS em `_functions.scss`.
- A função SCSS `state-tint()`, substituída pelo mixin `state-tint($tint)`.

## v1.8.0

### Adicionado

- Novo Web Component `lui-toast` para notificações temporárias, mais os estilos CSS-only `.toast` / `.toast-region`: variantes `default`, `success` e `danger`, `duration` de fechamento automático que pausa no hover e no foco, fechamento com Escape, slots de ícone e de ação, e um evento `lui-close`.
- Novas props `href`, `target`, `rel` e `download` em `lui-button`, que renderiza um `<a>` em vez de um `<button>`, mantendo `variant`, `size` e `block` idênticos. `target="_blank"` adiciona `noopener noreferrer`, juntando com qualquer `rel` informado em vez de substituí-lo.
- As classes CSS-only `.btn` agora também se aplicam a `<a>`.
- Como link, `disabled` e `loading` removem o `href`; `disabled` sai da ordem de tabulação com `tabindex="-1"`, e `loading` mantém o foco com `tabindex="0"`.

### Alterado

- Três sistemas de grid sobrepostos foram substituídos por um só, guiado pelo breakpoint: 4 colunas abaixo de 768px, 8 em `sm` e `md`, 12 em `lg` e `1xl`, com o gap e a margem lateral acompanhando. A configuração em `_grid.map.scss` é compartilhada por `.grid` e `<lui-grid>`.
- Os spans de coluna são utilitários `col-*` simples (`col-full`, `col-sm-4`) em vez de modificadores BEM `grid-item`. `.grid > *` carrega o padrão de uma coluna, então um filho de uma coluna não precisa de classe.
- Hover e active são um único tingimento independente de marca (preto nos temas claros, branco nos escuros) misturado no próprio fundo do componente a 8% e 16%, substituindo as cores de hover/pressionado por variante. Os componentes declaram o seu fundo em repouso por `--lui-bg`.
- Os links da `navbar` usam a mesma camada de estado, abandonando `filter: brightness()`.

### Corrigido

- `lui-heading` e `lui-body` ignoravam `margin`, `padding`, `border` e tamanho no host: o `display: contents` do documento vencia o `:host { display: block }` dos próprios componentes. Os dois agora declaram `display: block`, e `[hidden]` é respeitado.
- `name` não chegava ao `FormData` nos componentes form-associated (`lui-input`, `lui-textarea`, `lui-select`, `lui-checkbox`, `lui-switch`, `lui-radio-group`, `lui-button`) quando definido como propriedade, como o React faz. Agora ele é refletido em um atributo.
- `lui-input` e `lui-textarea` não escreviam o valor digitado de volta no `value` do host, então `event.target.value` retornava o valor inicial nos eventos `input` / `change` reemitidos.
- Valores corrigidos por quem consome dentro do seu próprio handler de `input` nunca chegavam ao DOM, e o texto rejeitado era enviado mesmo assim. Os bindings de `.value` agora usam `live()`.
- Inputs numéricos informavam valores que ninguém digitou: limpar um campo `required` enviava `0` enquanto `checkValidity()` passava, `form.reset()` deixava um `1` que a propriedade não informava, e limitar o valor a cada tecla tornava campos com limites impossíveis de preencher. A limitação passou para a confirmação do valor.

### Removido

- `.columns`, `.column`, `<lui-columns>` e `<lui-column>`: use `.grid` / `<lui-grid>` com spans de coluna.
- Os utilitários de 12 colunas `.col-{bp}-{n}`, `.grid--gap-{n}` e `.grid-item`. `<lui-grid>` não aceita mais `columns`, `rows`, `gap`, `gap-x`, `gap-y` nem `justify`; `<lui-grid-item>` usa `col`, `col-sm`, `col-md`, `col-lg`, `col-1xl`.
- Os tokens `background.hover` e `background.pressed` por variante e as funções SCSS `hover()` / `pressed()`, substituídos por `--lui-color-interaction-tint` e `state()`.

## v1.7.0

### Alterado

- As props de espaçamento de todos os componentes de layout (`lui-box`, `lui-columns`, `lui-container`, `lui-flex`, `lui-grid`, `lui-inline`, `lui-sidebar`, `lui-stack`, `lui-switcher`) agora aceitam valores numéricos diretos de tokens fluidos (`gap="16"`, `padding="24"` etc.) que mapeiam para as custom properties CSS `--lui-spacing-fluid-{n}`. Os aliases nomeados (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`) continuam suportados por compatibilidade.
- As classes modificadoras SCSS CSS-only dos componentes de layout agora são geradas a partir da escala de tokens fluidos (`--padding-2`, `--padding-4`, … `--padding-80`), substituindo as variantes nomeadas anteriores (`--padding-xs`, `--padding-sm` etc.).

### Corrigido

- O padrão glob do `markdownlint` foi atualizado para `!**/node_modules/**`. Antes, só o `node_modules/` da raiz era excluído, o que causava mais de 26 000 falsos erros dos READMEs de dependências nos `node_modules/` dos pacotes aninhados.

## v1.6.0

### Adicionado

- Novo Web Component `lui-close-button`, um botão dedicado de fechar/dispensar com as props `size` (`sm` | `md` | `lg`), `disabled` e `label`; também registrado em `letsui.min.css` como componente CSS-only.
- Novas props `pattern` e `inputmode` em `lui-input` para validação nativa de inputs HTML e dicas de teclado virtual.
- Nova prop booleana `dismissible` em `lui-alert`, que renderiza um `lui-close-button` e emite um evento personalizado `lui-dismiss` ao ser clicado; a prop `close-label` personaliza o rótulo acessível do botão.

### Alterado

- `lui-drawer` e `lui-modal` agora usam `lui-close-button` internamente, substituindo o markup do botão de fechar embutido anterior.

### Corrigido

- Adiciona os atributos `aria-invalid` e `aria-required` aos controles de formulário (`lui-input`, `lui-select`, `lui-textarea`, `lui-checkbox`, `lui-switch`) para melhor compatibilidade com leitores de tela.
- Corrige atributos ARIA ausentes em componentes interativos (`lui-modal`, `lui-drawer`, `lui-tabs`, `lui-dropdown-menu`, `lui-tooltip`).

## v1.5.1

### Corrigido

- Remove o reset `display: contents` de `_host.scss`, que era aplicado globalmente a todas as tags de web components.
- Remove a regra `.dropdown-menu__trigger { display: contents }`.

## v1.5.0

### Adicionado

- Novos componentes primitivos de layout: `lui-box`, `lui-stack`, `lui-inline`, `lui-center`, `lui-sidebar`, `lui-switcher`, `lui-columns` (+ `lui-column`), `lui-flex` (+ `lui-flex-item`), `lui-grid` (+ `lui-grid-item`), `lui-container`, `lui-float` e `lui-scroll-area`.
- Implementações CSS-only de `lui-box`, `lui-stack`, `lui-inline`, `lui-center`, `lui-sidebar`, `lui-switcher`, `lui-columns`, `lui-flex`, `lui-grid` e `lui-container` adicionadas a `packages/styles/src/` e compiladas em `letsui.min.css`; `lui-float` e `lui-scroll-area` dependem de JS e ficam intencionalmente fora da folha de estilos global.

## v1.4.0

### Adicionado

- Amplia `lui-link` com cobertura completa dos atributos de âncora: `target` (padrão `_self`), `rel` (`noopener noreferrer` automático quando `target="_blank"`), `download`, `hreflang` e `referrerpolicy`.
- Nova prop booleana `external` em `lui-link`, que renderiza um ícone SVG inline e define automaticamente `target="_blank"` e `rel="noopener noreferrer"`.
- Nova prop `size` em `lui-link` com os valores `lg`, `md` e `sm`, seguindo a mesma escala tipográfica de `lui-body`; omiti-la herda o `font-size` do contexto.
- Nova prop booleana `disabled` em `lui-link`, que remove o `href`, define `aria-disabled="true"` e mantém o elemento focável com `tabindex="0"`.
- Nova prop booleana `visited` em `lui-link`, um estilo `:visited` opcional, desligado por padrão para evitar a exposição involuntária do histórico de navegação.
- Nova prop `type` em `lui-button` (`button` | `submit` | `reset`, padrão `button`) para a semântica nativa de formulários.
- Nova prop booleana `block` em `lui-button`, que estica o botão até a largura total do container.
- Nova prop booleana `loading` em `lui-button`, que mostra um spinner animado, define `aria-busy="true"` e bloqueia a interação com `cursor: wait`.
- Nova prop `loading-text` em `lui-button`, o rótulo exibido enquanto `loading` está ativo; cai para `label` quando omitida.
- Novos slots nomeados `prefix` e `suffix` em `lui-button` para ícones no início e no fim; o slot padrão cai para o atributo `label`.
- Nova prop booleana `autofocus` em `lui-button`.
- Integração com formulários (`ElementInternals`) para `lui-button`: adiciona as props `name` e `value`; submit e reset são tratados por um listener de clique para que o `<button type="button">` interno nunca envie por acidente; `formDisabledCallback` mantém `disabled` em sincronia com o `<form>` que o contém.
- Integração com formulários para `lui-checkbox`: adiciona as props `name`, `value` e `required`; a validade é gerenciada por `ElementInternals`; as novas props `error` e `error-text` renderizam uma mensagem de erro inline abaixo do controle; o suporte a slot substitui o `<span>` de rótulo fixo.
- Integração com formulários para `lui-input`: adiciona as props `name` e `required`; `formDisabledCallback` e `formResetCallback` mantêm o estado consistente com o `<form>` que o contém.
- Integração com formulários para `lui-radio`: adiciona suporte a `ElementInternals`; a desmarcação dos irmãos agora é coordenada pelo `lui-radio-group` que os envolve; o suporte a slot substitui o `<span>` de rótulo fixo.
- Novo componente `lui-radio-group`, que envolve elementos `lui-radio` com um `name` compartilhado; gerencia `label`, `size`, `hint`, `required`, `disabled`, `error` e `error-text`; o valor e a validade no formulário são tratados por `ElementInternals`.
- Integração com formulários para `lui-select`: adiciona as props `name` e `required`; `formDisabledCallback` e `formResetCallback` mantêm o estado consistente com o `<form>` que o contém.
- Integração com formulários para `lui-switch`: adiciona as props `name`, `value` e `required`; as novas props `error` e `error-text` renderizam uma mensagem de erro inline; o suporte a slot substitui o `<span>` de rótulo fixo.
- Integração com formulários para `lui-textarea`: adiciona as props `name` e `required`; `formDisabledCallback` e `formResetCallback` mantêm o estado consistente com o `<form>` que o contém.

### Corrigido

- Remove o espaço em branco no fim do atributo `class` de `lui-link` quando `size` não está definido.
- Resolve o estado `disabled` de `lui-link`, que não aplicava `cursor: not-allowed` porque `pointer-events: none` bloqueava o cursor; a navegação agora é impedida removendo o `href`.
- Corrige o binding de `aria-disabled` em `lui-link`: o atributo booleano do Lit (`?`) renderizava `aria-disabled=""` em vez de `aria-disabled="true"`, impedindo que o seletor CSS correspondesse.
- Impede que o sublinhado de hover apareça em `lui-link` enquanto `disabled` está ativo, limitando `:hover` a `:not([aria-disabled="true"])`.
- Recorta o `viewBox` do SVG do ícone externo de `lui-link` para acompanhar o tamanho do texto ao redor.

## v1.3.0

### Adicionado

- Adiciona suporte a slot em `lui-link`, mantendo o atributo `label` como fallback por @mateusvillain em [PR #51](https://github.com/mateusvillain/lets-ui/pull/51)
- Extrai o partial `_typography-reset.scss`, voltado só para `h1`–`h6`, `p` e `div`, que substitui o `_reset.scss` global dentro dos componentes com Shadow DOM, reduzindo regras de reset desnecessárias por @mateusvillain em [PR #49](https://github.com/mateusvillain/lets-ui/pull/49)

### Corrigido

- Corrige `lui-heading` para renderizar a tag HTML semântica correta de acordo com a variante escolhida (`title` → `<h1>`, `subtitle` → `<h2>`, `headline` → `<h3>`, `subheadline` → `<h4>`, `block-title` → `<h5>`, `overtitle` → `<h6>`); a prop `as` continua disponível para substituições manuais por @mateusvillain em [PR #48](https://github.com/mateusvillain/lets-ui/pull/48)
- Corrige `lui-body` para usar `<p>` por padrão em vez de `<div>`, ainda respeitando a prop `as` por @mateusvillain em [PR #48](https://github.com/mateusvillain/lets-ui/pull/48)
- Corrige a ordem de importação do reset CSS dentro do Shadow DOM de `lui-heading` e `lui-body`, garantindo que os estilos tipográficos não sejam sobrescritos sem querer pelo reset por @mateusvillain em [PR #48](https://github.com/mateusvillain/lets-ui/pull/48)

## v1.2.0

### Adicionado

- Migra todos os Web Components de Vanilla JS para Lit + TypeScript, com estilos de shadow DOM por componente por @mateusvillain em [PR #43](https://github.com/mateusvillain/lets-ui/pull/43)
- Adiciona suporte a slot e a prop `bold` a `lui-heading` e `lui-body` para uma renderização de texto flexível por @mateusvillain em [PR #47](https://github.com/mateusvillain/lets-ui/pull/47)
- Adiciona suporte a slot a `lui-icon-button`, permitindo conteúdo personalizado dentro do componente por @mateusvillain em [PR #45](https://github.com/mateusvillain/lets-ui/pull/45)

### Alterado

- Adiciona a configuração do Renovate por @mateusvillain em [PR #10](https://github.com/mateusvillain/lets-ui/pull/10)
- Centraliza o utilitário `display: contents;` em `_host.scss` por @mateusvillain em [PR #32](https://github.com/mateusvillain/lets-ui/pull/32)

### Corrigido

- Corrige as stories do Tooltip no Storybook por @mateusvillain em [PR #34](https://github.com/mateusvillain/lets-ui/pull/34)
- Corrige as stories e a página de documentação do Modal no Storybook por @mateusvillain em [PR #36](https://github.com/mateusvillain/lets-ui/pull/36)
- Remove marcadores de conflito de merge por @mateusvillain em [PR #38](https://github.com/mateusvillain/lets-ui/pull/38)

## v1.1.1

### Corrigido

- Corrige a troca de modo de cor em [PR #40](https://github.com/mateusvillain/lets-ui/pull/40)
- Corrige o contraste de cor nos modos claro e escuro em [PR #40](https://github.com/mateusvillain/lets-ui/pull/40)

## v1.1.0

### Adicionado

- Adiciona o web component `lui-image` por @mateusvillain em [PR #33](https://github.com/mateusvillain/lets-ui/pull/33)
- Adiciona os web components `lui-heading` e `lui-body` por @mateusvillain em [PR #30](https://github.com/mateusvillain/lets-ui/pull/30)

### Alterado

- Adiciona a configuração do Renovate por @mateusvillain em [PR #10](https://github.com/mateusvillain/lets-ui/pull/10)
- Centraliza o utilitário `display: contents;` em `_host.scss` por @mateusvillain em [PR #32](https://github.com/mateusvillain/lets-ui/pull/32)

### Corrigido

- Corrige as stories do Tooltip no Storybook por @mateusvillain em [PR #34](https://github.com/mateusvillain/lets-ui/pull/34)
- Corrige as stories e a página de documentação do Modal no Storybook por @mateusvillain em [PR #36](https://github.com/mateusvillain/lets-ui/pull/36)
- Remove marcadores de conflito de merge por @mateusvillain em [PR #38](https://github.com/mateusvillain/lets-ui/pull/38)

## v1.0.0

### Adicionado

- `@lets-ui/tokens`: design tokens como custom properties CSS e variáveis SCSS, com suporte a temas claro/escuro e multimarca pelos atributos `data-theme` / `data-brand`.
- `@lets-ui/styles`: SCSS dos componentes compilado em `letsui.min.css`, cobrindo todos os componentes do design system.
- `@lets-ui/components`: Web Components em Vanilla JS (custom elements, sem framework) para todos os componentes do design system: Alert, Breadcrumb, Button, Card, Checkbox, Divider, Drawer, Dropdown Menu, Icon Button, Input, Link, Modal, Radio, Select, Shortcut, Switch, Tabs, Tag, Textarea, Tooltip.

### Alterado

- O monorepo passou para versionamento fixo com Changesets: todos os pacotes compartilham um único número de versão.
- O fluxo de release baseado em tags foi substituído pela GitHub Action do Changesets (fluxo automatizado de PR "Version Packages").

---

<!-- As entradas históricas abaixo são da era anterior ao monorepo (pacote único, versões 0.x). -->

## 0.19.0

### Adicionado

- Adicionado o token de border-radius `xl`
- Adicionados tokens de cor globais para os modos claro e escuro
- Adicionados tokens de cor de marca para os modos claro e escuro
- Adicionados tokens de fundação da marca
- Adicionada à configuração a separação das fundações por marca
- Arquivos Sass incluídos na distribuição do pacote

### Alterado

- Esquemas de cor claro e escuro atualizados
- Estrutura de tokens reorganizada para os temas
- Estrutura do arquivo resolver atualizada

## 0.18.0

### Alterado

- `terrazzo.config.mjs` atualizado para suportar data-theme e data-brand
- `letsui.resolver.json` atualizado para suportar data-theme e data-brand
- `colors.json` atualizado para suportar data-theme e data-brand

## 0.17.2

### Corrigido

- Corrigida a geração das variáveis de espaçamento

## 0.17.1

### Alterado

- A semântica dos componentes foi atualizada para seguir a metodologia BEM (`Alert`, `Button`, `Card`, `Checkbox`, `Text Field`, `Modal`, `Select` e `Tag`).
- Os estilos de texto de corpo no mapa SCSS de tipografia foram atualizados para seguir a convenção de nomes do BEM.
- A documentação foi atualizada para refletir a nova semântica dos componentes e da tipografia.

## 0.17.0

### Adicionado

- Componente `Modal`
- Documentação do `Modal`

## 0.16.0

### Alterado

- Token `accent` renomeado para `primary`
- Token `border-radius-1xs` renomeado para `border-radius-xs`

## 0.15.0

### Adicionado

- Criado o componente `Tooltip`.
- Adicionada ao mapa de cores a cor de overlay para sobreposições da interface.
- Criado um novo mixin de estado para padronizar os estados dos componentes.
- O mixin de estado foi aplicado aos componentes `Link` e `Icon Button`.

### Removido

- Removido o componente `Header`.

## 0.14.0

### Adicionado

- Criado um **mixin** de estado `disabled` para estilos de desabilitado consistentes.
- Adicionadas as variantes `surface` e `container` ao componente `Tag`.

### Alterado

- Os componentes `Checkbox` e `Select` foram movidos para arquivos próprios.
- O padding do `Button` nos tamanhos `large` e `medium` foi atualizado para usar espaçamento **fluido**.
- A estrutura e as regras Sass de `form.scss` foram melhoradas para facilitar a manutenção.

## 0.13.2

### Alterado

- Ajustados os estados de hover e active do componente `Navbar`.

## 0.13.1

### Alterado

- Ajustado o mixin `font` no componente `Tag` e nos componentes de formulário.
- O mapa `scales` foi removido de `typography.scss` e movido para `tokens.map`.
- A altura da `navbar` foi reduzida para acompanhar o tamanho do `header`.

## 0.13.0

### Alterado

- Migração do Style Dictionary para o Terrazzo
- Definidos novos breakpoints e aumentado o tamanho do grid

### Adicionado

- Criado um arquivo resolver para suportar temas e marcas
- Adicionados os diretórios `functions`, `maps` e `mixins`

### Removido

- Removidos os tokens de grid

## 0.12.0

### Adicionado

- Criados os arquivos `border.scss` e `spacing.scss` com classes utilitárias para bordas e espaçamento
- Adicionadas as novas opções de espaçamento `fluid` e `scale`

### Alterado

- O código de `flexbox.scss` foi melhorado para facilitar a leitura e a manutenção
- As escalas tipográficas foram atualizadas para usar `clamp()` e responder melhor ao tamanho da tela

### Removido

- Removidos os tokens de `border-width` com valores de `8px`, `12px` e `16px`, pelo pouco uso ou pela inconsistência com o resto da escala

## 0.11.0

### Adicionado

- Novo sistema de escala modular usando [modularscale-sass](https://github.com/modularscale/modularscale-sass)

### Corrigido

- Corrigido o caminho para variables.css nos arquivos de estilo

## 0.10.0

### Adicionado

- Tokens de elevação (Base, Floating, Overlay)
- Componente Card

## 0.9.0

### Adicionado

- Novas variantes para a tag: Primary, Danger, Success, Neutral

## 0.8.2

### Adicionado

- O Button agora tem um arquivo `.scss`

## 0.8.1

### Adicionado

- Estrutura de design tokens da marca: cores primária e secundária (claro/escuro), font-family para títulos e corpo, font-size para desktop e mobile, border-radius padrão.

### Removido

- Classes de cor da marca e de font-family em `baseline.css`.

## 0.8.0

### Adicionado

- Conexões entre Style Dictionary, Tokens Studio e GitHub
- Todos os tokens em arquivos `.json`
- Componente Header

## 0.7.0

### Alterado

- A estrutura do grid agora tem 12 colunas por padrão, com novas classes para dispositivos grandes, médios e pequenos.

## 0.6.0

### Alterado

- Microinteração de hover, active e foco

## 0.5.0

### Adicionado

- Arquivo baseline para importar todos os estilos e componentes

## 0.4.0

### Adicionado

- Navbar
- Grid para telas grandes e pequenas

## 0.3.0

### Adicionado

- Icon Button
- font-family de ícones para testes

## 0.2.0

### Adicionado

- Breadcrumb, Checkbox, Radio Button, Text field, Select

## 0.1.0

### Adicionado

- Estrutura inicial do projeto: componentes Button, Link e Tag; tokens primitivos de espaçamento, cor, borda e tipografia; reset CSS e estilos de flexbox.
