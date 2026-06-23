#!/usr/bin/env python3
"""
Detecta todos os pacotes de um workspace pnpm (ou npm/yarn workspaces),
lendo os globs de pnpm-workspace.yaml ou o campo "workspaces" do
package.json raiz, e depois abrindo o package.json de cada pacote
encontrado para extrair o nome real (campo "name").

Isso evita depender do prompt interativo de `pnpm changeset` e garante
que a lista de pacotes seja completa e auditável antes de gerar o
changeset.

Uso:
    python3 detect_packages.py [raiz_do_repo]

Saída (stdout), uma linha por pacote, formato "nome<TAB>caminho":
    @acme/ui	packages/ui
    @acme/utils	packages/utils

Se nenhum padrão de workspace for encontrado, sai com código 1 e
imprime um aviso em stderr — quem chamar o script deve tratar isso
como "não é um monorepo pnpm/workspaces conhecido" e perguntar ao
usuário em vez de adivinhar.
"""
import json
import os
import sys
import glob


def read_pnpm_workspace_patterns(root):
    path = os.path.join(root, "pnpm-workspace.yaml")
    if not os.path.exists(path):
        return None

    patterns = []
    in_packages = False
    with open(path, encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.rstrip("\n")
            stripped = line.strip()
            if not in_packages:
                if stripped.startswith("packages:"):
                    in_packages = True
                continue
            # Ainda dentro do bloco "packages:"?
            if stripped.startswith("-"):
                pat = stripped[1:].strip().strip("'\"")
                if pat:
                    patterns.append(pat)
            elif stripped == "" or stripped.startswith("#"):
                continue
            else:
                # Linha sem indentação de item de lista: bloco "packages" acabou.
                break
    return patterns


def read_npm_yarn_workspace_patterns(root):
    pkg_json = os.path.join(root, "package.json")
    if not os.path.exists(pkg_json):
        return None
    with open(pkg_json, encoding="utf-8") as f:
        data = json.load(f)
    workspaces = data.get("workspaces")
    if workspaces is None:
        return None
    # Pode ser lista direta ou {"packages": [...]}
    if isinstance(workspaces, dict):
        return workspaces.get("packages", [])
    return workspaces


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "."

    patterns = read_pnpm_workspace_patterns(root)
    if patterns is None:
        patterns = read_npm_yarn_workspace_patterns(root)

    if not patterns:
        print(
            "Nenhum padrão de workspace encontrado (sem pnpm-workspace.yaml "
            "e sem \"workspaces\" no package.json raiz). Não assuma a lista "
            "de pacotes — confirme a estrutura do monorepo com o usuário.",
            file=sys.stderr,
        )
        sys.exit(1)

    root_pkg_path = os.path.join(root, "package.json")
    root_name = None
    if os.path.exists(root_pkg_path):
        try:
            with open(root_pkg_path, encoding="utf-8") as f:
                root_name = json.load(f).get("name")
        except (json.JSONDecodeError, OSError):
            pass

    seen = {}
    for pattern in patterns:
        pattern = pattern.rstrip("/")
        # Exclusões estilo workspaces (ex: "!**/test-fixtures/**") são ignoradas
        if pattern.startswith("!"):
            continue
        for path in sorted(glob.glob(os.path.join(root, pattern, "package.json"))):
            pkg_dir = os.path.dirname(path)
            try:
                with open(path, encoding="utf-8") as f:
                    pkg = json.load(f)
            except (json.JSONDecodeError, OSError):
                continue
            name = pkg.get("name")
            if not name or name == root_name:
                continue
            rel_dir = os.path.relpath(pkg_dir, root)
            seen[name] = rel_dir

    if not seen:
        print(
            "Padrões de workspace encontrados, mas nenhum package.json "
            "correspondente foi localizado. Verifique se o script está "
            "sendo rodado na raiz correta do repositório.",
            file=sys.stderr,
        )
        sys.exit(1)

    for name, rel_dir in sorted(seen.items()):
        print(f"{name}\t{rel_dir}")


if __name__ == "__main__":
    main()
