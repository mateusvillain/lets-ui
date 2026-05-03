---
name: issue-creator
description: Criar issues no GitHub para o repositório Let's UI com labels corretas, assignee automático e adição ao projeto 'Let's UI Roadmap' no status 'Todo'. Usar quando o pedido for registrar uma tarefa, bug, melhoria, novo componente, documentação ou qualquer outra demanda rastreável no repositório.
---

# Issue Creator

Criar issues bem estruturadas no GitHub, com labels derivadas da análise do pedido, assignee automático e integração com o projeto Let's UI Roadmap.

## Fluxo Obrigatório

1. Analisar o pedido e extrair: tipo da issue, área afetada e componente específico (quando aplicável).
2. Montar a lista de labels a partir de `references/label-map.md`.
3. Verificar se a label `component: <nome>` já existe; criar se necessário.
4. Obter o username do GitHub do usuário atual.
5. Redigir o corpo da issue no formato estruturado.
6. Criar a issue via `gh`.
7. Adicionar ao projeto Let's UI Roadmap e definir status como **Todo**.

## Análise do Pedido

Identificar obrigatoriamente:

- **Tipo**: `feature`, `bug`, `improvement`, `refactor`, `documentation` — derivado da natureza da mudança.
- **Área**: `components`, `tokens`, `styles`, `utilities`, `icons` — derivado do que será afetado.
- **Componente específico** (quando a issue trata de um único componente): nome em kebab-case para a label `component: <nome>`.
- **Prioridade** (quando mencionada explicitamente no pedido ou claramente implícita): `priority: high`, `priority: medium`, `priority: low`. Omitir quando não houver indicação.

Quando o pedido for ambíguo, inferir pelo contexto. Não perguntar ao usuário antes de criar — criar com a melhor inferência e reportar as labels aplicadas.

## Construção das Labels

Consultar `references/label-map.md` para o mapeamento completo. Regra geral:

1. Sempre incluir a label de **tipo** (`feature`, `bug`, `improvement`, `refactor`, `documentation`).
2. Sempre incluir a label de **área** (`components`, `tokens`, `styles`, `utilities`, `icons`).
3. Incluir `component: <nome>` quando a issue tratar de um componente específico.
4. Incluir label de **prioridade** somente quando explicitamente indicada.

### Verificar e criar label de componente

Antes de criar a issue, verificar se a label `component: <nome>` existe:

```bash
gh label list --repo mateusvillain/lets-ui-css | grep "component: <nome>"
```

Se não existir, criar com cor `#f5be58`:

```bash
gh label create "component: <nome>" --color "f5be58" --repo mateusvillain/lets-ui-css
```

Após criar a label, executar obrigatoriamente o fluxo de **Atualização de Referências**.

## Atualização de Referências ao Criar Nova Label

Sempre que uma nova label `component: <nome>` for criada, atualizar `references/label-map.md` e persistir a mudança no repositório.

### 1. Atualizar `label-map.md`

Adicionar a nova entrada na tabela "Componentes existentes", em ordem alfabética:

```markdown
| `component: <nome>` | <NomeDisplay> |
```

### 2. Commitar e fazer push

```bash
git add .agent/skills/issue-creator/references/label-map.md
git commit -m "chore(issue-creator): add component: <nome> to label-map"
git push
```

Executar isso **antes** de criar a issue, para que o repositório fique sempre sincronizado com as labels reais do GitHub.

## Obter Assignee

Sempre usar o username do GitHub do usuário autenticado localmente:

```bash
gh api user --jq .login
```

## Corpo da Issue

Estruturar sempre com as três seções abaixo. Adaptar o conteúdo ao tipo de issue — omitir "Scope of changes" em bugs simples quando não for relevante.

```markdown
## Context

<1–3 frases descrevendo o problema, a necessidade ou o objetivo da issue.>

## Scope of changes

- **`<caminho/arquivo>`** — <o que deve ser criado ou alterado>
- ...

## Acceptance criteria

- [ ] <critério verificável>
- [ ] <critério verificável>
- [ ] ...
```

### Diretrizes de conteúdo

- **Context**: explicar o _porquê_, não apenas o _o quê_. Incluir impacto quando relevante.
- **Scope of changes**: listar arquivos e pastas reais do repositório (consultar estrutura em `references/label-map.md` quando for componente). Omitir para bugs onde o escopo ainda não é determinístico.
- **Acceptance criteria**: usar checkboxes (`- [ ]`). Cada item deve ser verificável por quem for implementar ou revisar.

## Título da Issue

Seguir o padrão Conventional Commits:

```markdown
<tipo>(<escopo>): <descrição imperativa em minúsculas>
```

Exemplos:

- `feat(toast): create Toast component`
- `fix(modal): correct focus trap on close`
- `docs(button): add accessibility usage examples`
- `improvement(input): add character counter support`

## Criar a Issue

```bash
gh issue create \
  --repo mateusvillain/lets-ui-css \
  --title "<título>" \
  --assignee <username> \
  --label "<label1>,<label2>,..." \
  --body "$(cat <<'EOF'
<corpo>
EOF
)"
```

## Adicionar ao Projeto e Definir Status

Após criar a issue, capturar a URL retornada e executar em sequência:

```bash
# 1. Adicionar ao projeto e capturar o item ID
item_id=$(gh project item-add 2 --owner mateusvillain \
  --url "<url-da-issue>" --format json | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

# 2. Definir status como Todo
gh project item-edit \
  --project-id PVT_kwHOAV-SJs4BBt1N \
  --id "$item_id" \
  --field-id PVTSSF_lAHOAV-SJs4BBt1Nzg0I_Aw \
  --single-select-option-id f75ad846
```

Consultar IDs completos em `references/project-config.md`.

## Formato de Saída

Ao final, reportar:

- URL da issue criada.
- Labels aplicadas e justificativa resumida.
- Confirmação de adição ao projeto Let's UI Roadmap com status **Todo**.
- Qualquer pendência (ex.: label criada do zero, prioridade não inferida).
