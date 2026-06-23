---
name: pr-changeset-finalize
description: >-
  Automatiza o fluxo de finalizar uma PR em um monorepo pnpm + Changesets —
  gera o arquivo de changeset perguntando major/minor/patch, aplica o bump em
  todos os pacotes do workspace, escreve o Summary analisando o diff real da
  branch, roda build/lint/test localmente, confere checks de CI e
  mergeabilidade da PR no GitHub, faz rebase na main, força o push, dá
  squash-merge e limpa as branches local e remota. Use sempre que o usuário
  pedir para 'finalizar a PR', 'fechar essa branch', 'fazer o changeset',
  'subir o changeset', 'mergear a PR', ou mencionar pnpm changeset, gh pr
  merge, force-with-lease ou 'feature branch' em um contexto de monorepo —
  mesmo que ele só peça uma parte do fluxo (ex: 'gera o changeset dessa
  branch pra mim') ou não use a palavra 'skill'.
---

# Finalizar PR com Changeset

## Por que esse fluxo existe

Esse é um workflow recorrente de fechamento de PR em monorepo: gerar o
changeset, sincronizar com a main, e mergear. As partes arriscadas são
justamente as que custam caro quando dão errado — um changeset com o
package errado vira changelog errado publicado pra sempre, um rebase
mal resolvido quebra a main, e um squash-merge de uma PR com CI
vermelho é o tipo de coisa que ninguém quer descobrir depois.

Por isso esse fluxo é construído em duas partes bem diferentes:

1. **Geração do changeset** — feita de forma direta (escrevendo o
   arquivo `.changeset/*.md` pelo script, em vez de tentar automatizar
   o prompt interativo do `pnpm changeset`, que depende de navegação
   por setas/espaço e não é controlável de forma confiável via
   terminal).
2. **Verificação antes de qualquer ação irreversível** — build, lint,
   testes, CI e mergeabilidade da PR são checados automaticamente
   _antes_ do force-push e do merge. Se algo falhar, o fluxo para e
   avisa — ele nunca tenta "resolver" um conflito de rebase ou ignorar
   um check vermelho por conta própria.

## Visão geral do fluxo

| #   | Etapa                                                       | Automático ou pergunta?                            |
| --- | ----------------------------------------------------------- | -------------------------------------------------- |
| 1   | Levantar estado atual (branch, PR, mudanças não commitadas) | Automático, mas para se algo estiver inconsistente |
| 2   | Perguntar major/minor/patch                                 | **Pergunta obrigatória**                           |
| 3   | Detectar todos os pacotes do workspace                      | Automático                                         |
| 4   | Analisar o diff e escrever o Summary                        | Automático                                         |
| 5   | Confirmar bump + pacotes + Summary com o usuário            | **Confirmação rápida**                             |
| 6   | Gerar `.changeset/*.md` e commitar                          | Automático                                         |
| 7   | Rodar build/lint/test locais                                | Automático (bloqueia se falhar)                    |
| 8   | Rebase na main (`git pull --rebase`)                        | Automático (bloqueia se houver conflito)           |
| 9   | Checar CI e mergeabilidade da PR                            | Automático (bloqueia se vermelho/pendente)         |
| 10  | Confirmação final antes do push forçado + merge             | **Confirmação obrigatória**                        |
| 11  | Push, squash-merge, limpeza de branches                     | Automático após confirmação                        |

As etapas 2, 5 e 10 são os únicos pontos onde você deve parar e
esperar uma resposta do usuário no chat. Todo o resto roda direto,
mas qualquer falha nas checagens automáticas (etapas 1, 7, 8, 9) é um
ponto de parada também — nunca prossiga "torcendo para dar certo".

## Pré-requisitos (confirme antes de começar)

Rode rapidamente:

```bash
git rev-parse --show-toplevel        # confirma que está dentro de um repo git
test -f pnpm-workspace.yaml || cat package.json | grep -q workspaces
test -d .changeset && cat .changeset/config.json
gh auth status
```

Se algum desses sinais não existir (não é monorepo pnpm/workspaces,
não tem Changesets configurado, ou o `gh` não está autenticado), pare
e pergunte ao usuário — não assuma que o projeto segue essa
convenção. Tudo abaixo assume que esses pré-requisitos existem.

## Passo a passo

### 1. Levantar o estado atual

- Confirme em qual branch trabalhar (se o usuário não disse, pergunte
  ou infira da branch atual). Se for preciso trocar de branch:
  `git fetch origin && git checkout <branch>`.
- Verifique se há mudanças não commitadas (`git status --porcelain`).
  Se houver, **pare e pergunte** o que fazer — nunca dê `stash` ou
  `commit` automaticamente em algo que você não gerou.
- Encontre a PR associada à branch:

  ```bash
  gh pr view <branch> --json number,title,baseRefName,headRefName,mergeable,mergeStateStatus
  ```

  Se não houver PR aberta, pare e avise o usuário — pergunte se ele
  quer só commitar/subir o changeset sem o merge, ou abrir a PR antes.

- Verifique se já existe um changeset pendente para essa branch
  (`git status .changeset/` ou comparar com a main). Se já existir,
  pergunte se é para reaproveitar, editar ou criar um adicional —
  changesets duplicados para o mesmo conjunto de pacotes costumam ser
  só ruído no changelog.

### 2. Perguntar o tipo de versão

Pergunte diretamente ao usuário, no chat, se a mudança é **major**,
**minor** ou **patch**. Não infira isso a partir do tamanho do diff —
versionamento semântico é uma decisão de produto/API, não uma medida
de quantas linhas mudaram.

### 3. Detectar todos os pacotes do workspace

Use o script incluso, que lê os globs do `pnpm-workspace.yaml` (ou o
campo `workspaces` do `package.json` raiz) e resolve o `name` real de
cada pacote:

```bash
python3 scripts/detect_packages.py <raiz_do_repo>
```

(o caminho é relativo à pasta desta skill — ajuste conforme onde ela
estiver instalada). A saída é uma lista `nome<TAB>caminho`, um pacote
por linha. Esses são
os pacotes que vão entrar no front-matter do changeset — o objetivo é
"todos os pacotes do projeto" sem precisar selecionar um por um na
CLI interativa.

Se o script falhar (sem padrões de workspace encontrados), não tente
adivinhar a lista de pacotes manualmente — pare e mostre o erro ao
usuário.

### 4. Analisar o diff e escrever o Summary

O Summary de um changeset se torna uma linha do changelog público, em
inglês (convenção do ecossistema). Para escrever um Summary que
reflita o que de fato mudou:

```bash
git fetch origin main
git log origin/main..HEAD --oneline
git diff origin/main...HEAD --stat
```

Leia os commits e o diff (não só os nomes de arquivo) e escreva 1-3
frases em inglês, no mesmo tom de uma entrada de changelog real:
descreva o efeito da mudança para quem consome o pacote, não a
implementação interna.

**Exemplo:**

- Diff toca em `Button.tsx`, `Card.tsx` e adiciona um hook de tema.
- Summary ruim: "Updated some components and added a hook."
- Summary bom: "Add dark mode support to Button and Card via the new `useTheme` hook."

Não apenas concatene as mensagens de commit — sintetize o que elas
significam em conjunto.

### 5. Confirmar com o usuário antes de gerar o arquivo

Mostre, em uma única mensagem curta, o bump escolhido, a lista de
pacotes detectados e o Summary que você escreveu. Peça um "ok" ou
ajustes. Esse é um gate rápido — o arquivo gerado aqui afeta o
versionamento de todos os pacotes do monorepo, então vale os
segundos de confirmação antes de escrever.

### 6. Gerar o changeset e commitar

```bash
python3 scripts/create_changeset.py \
  --bump <major|minor|patch> \
  --summary "<summary em inglês>" \
  --packages "<pkg-a,pkg-b,...>" \
  --root <raiz_do_repo>

git add .changeset
git commit -m "docs: add changeset"
```

### 7. Build, lint e testes locais

Inspecione o `package.json` raiz (`scripts`) e rode o que existir,
nessa ordem: `build`, `lint`, `test` (ex: `pnpm run build`,
`pnpm run lint`, `pnpm run test`). Pule silenciosamente os scripts que
não existirem — não invente comandos.

Se qualquer um falhar: **pare aqui**. Mostre a saída do erro e não
avance para o rebase/push/merge. O usuário precisa corrigir o
problema (ou pedir explicitamente para ignorar) antes de continuar.

### 8. Atualizar a branch com a main

```bash
git pull origin main --rebase
```

Se houver conflito: **pare**, liste os arquivos em conflito
(`git status`) e explique ao usuário que ele precisa resolver
manualmente. Nunca use `--strategy-option ours/theirs` ou edite os
arquivos em conflito por conta própria — um merge "resolvido" errado
silenciosamente é exatamente o tipo de quebra que esse fluxo existe
para evitar.

### 9. Checar CI e mergeabilidade da PR

```bash
gh pr checks <numero-da-pr>
gh pr view <numero-da-pr> --json mergeable,mergeStateStatus,statusCheckRollup
```

- Se algum check estiver falhando: pare e mostre quais.
- Se os checks ainda estiverem rodando (pendente): informe o status
  ao usuário e pergunte se ele quer esperar (você pode checar de novo
  depois de um tempo) ou parar aqui.
- Se `mergeable` for `CONFLICTING` ou `mergeStateStatus` indicar
  problema: pare — isso normalmente significa que algo mudou na main
  depois do seu rebase, ou que há um problema de branch protection.

Só avance para a próxima etapa se tudo estiver verde.

### 10. Confirmação final antes de ações irreversíveis

Antes do force-push e do merge, mostre um resumo curto do que está
prestes a acontecer e peça confirmação explícita. Por exemplo:

> Tudo certo: build/lint/test passaram, CI verde, PR #123 mergeable.
> Vou fazer push forçado da branch, squash-merge na PR #123 e deletar
> a branch local e remota. Confirma?

Esse é o único ponto de confirmação "pesado" do fluxo — depois dele,
push --force-with-lease reescreve o histórico remoto da branch e o
merge+delete não tem desfazer trivial.

### 11. Subir, mergear e limpar

```bash
git push --force-with-lease
gh pr merge <numero-da-pr> --squash --delete-branch
git checkout main
git pull origin main
```

Confira ao final que a branch local foi removida
(`git branch --list <branch>` deve voltar vazio); se por algum motivo
não foi, remova com `git branch -d <branch>`.

## Quando parar e perguntar (não seguir sozinho)

- Mudanças não commitadas inesperadas na branch.
- Nenhuma PR aberta encontrada para a branch.
- Já existe um changeset pendente para essa branch.
- Build, lint ou testes falhando.
- Conflito no `git pull --rebase`.
- Checks de CI falhando, ou pendentes por muito tempo.
- `mergeable: CONFLICTING` ou `mergeStateStatus` problemático.
- Workspace pnpm/Changesets não detectado nos pré-requisitos.

Em todos esses casos, descreva o que encontrou e pergunte como
proceder — não tente "seguir o roteiro" ignorando o sinal de alerta.

## Scripts inclusos

- `scripts/detect_packages.py` — lê `pnpm-workspace.yaml` (ou
  `workspaces` do `package.json`) e lista nome + caminho de cada
  pacote do monorepo. Use isso em vez de listar pacotes manualmente.
- `scripts/create_changeset.py` — escreve o arquivo
  `.changeset/<slug-aleatório>.md` no formato esperado pelo
  `@changesets/cli` (front-matter YAML com `"pacote": bump` por
  pacote, seguido do Summary). Substitui o prompt interativo do
  `pnpm changeset`.

## Convenções assumidas (ajuste se o projeto for diferente)

- Gerenciador de pacotes: **pnpm**.
- Branch base: **main**.
- Mensagem de commit do changeset: `docs: add changeset` (igual ao
  workflow original do usuário).
- `gh` CLI autenticado com permissão de squash-merge no repositório.
- Changesets configurado em `.changeset/config.json`.
- O bump escolhido (major/minor/patch) se aplica igualmente a todos
  os pacotes detectados — o fluxo não pede bumps diferentes por
  pacote. Se o usuário precisar disso, trate como um caso especial e
  pergunte explicitamente.
