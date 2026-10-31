# Project Config — Let's UI Roadmap

IDs do projeto GitHub e campos necessários para adicionar issues e definir status.

## Repositório

```bash
mateusvillain/lets-ui-css
```

> Issues são criadas neste repo. As URLs retornadas pelo `gh` podem apontar para `mateusvillain/lets-ui` (redirect) — ambas funcionam para o `gh project item-add`.

## Projeto

| Campo      | Valor                  |
| ---------- | ---------------------- |
| Nome       | Let's UI Roadmap       |
| Número     | `2`                    |
| Project ID | `PVT_kwHOAV-SJs4BBt1N` |
| Owner      | `mateusvillain`        |

## Campo Status

| Campo    | Valor                            |
| -------- | -------------------------------- |
| Field ID | `PVTSSF_lAHOAV-SJs4BBt1Nzg0I_Aw` |

### Opções disponíveis

| Nome          | Option ID  |
| ------------- | ---------- |
| `Todo`        | `f75ad846` |
| `Planned`     | `f0bae734` |
| `In progress` | `47fc9ee4` |
| `Done`        | `98236657` |

## Comandos de Referência

### Adicionar issue ao projeto

```bash
item_id=$(gh project item-add 2 --owner mateusvillain \
  --url "<url-da-issue>" --format json \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
```

### Definir status

```bash
gh project item-edit \
  --project-id PVT_kwHOAV-SJs4BBt1N \
  --id "$item_id" \
  --field-id PVTSSF_lAHOAV-SJs4BBt1Nzg0I_Aw \
  --single-select-option-id f75ad846
```
