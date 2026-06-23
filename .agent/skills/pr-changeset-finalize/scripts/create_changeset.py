#!/usr/bin/env python3
"""
Gera um arquivo de changeset (.changeset/<slug>.md) no formato esperado
pelo @changesets/cli, sem depender do prompt interativo de `pnpm changeset`.

O formato gerado é exatamente o que o changesets lê:

    ---
    "@acme/ui": minor
    "@acme/utils": minor
    ---

    Add dark mode support to the Button and Card components.

Uso:
    python3 create_changeset.py \\
        --bump minor \\
        --summary "Add dark mode support to the Button component." \\
        --packages "@acme/ui,@acme/utils" \\
        --root .

Imprime o caminho do arquivo criado em stdout.
"""
import argparse
import os
import random
import sys

ADJECTIVES = [
    "quiet", "brave", "swift", "gentle", "bold", "calm", "lively", "sharp",
    "wild", "warm", "lucky", "tidy", "proud", "shy", "eager", "kind",
]
NOUNS = [
    "otter", "falcon", "river", "ember", "comet", "willow", "harbor",
    "meadow", "spark", "ridge", "heron", "cedar", "lagoon", "finch",
]
VERBS = [
    "jump", "drift", "glow", "race", "soar", "shine", "roam", "flow",
    "rise", "spin", "dash", "wander",
]


def random_slug():
    return (
        f"{random.choice(ADJECTIVES)}-{random.choice(NOUNS)}-{random.choice(VERBS)}"
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bump", required=True, choices=["major", "minor", "patch"])
    parser.add_argument("--summary", required=True, help="Texto do Summary (changelog)")
    parser.add_argument(
        "--packages",
        required=True,
        help="Nomes de pacotes separados por vírgula, ex: '@acme/ui,@acme/utils'",
    )
    parser.add_argument("--root", default=".", help="Raiz do repositório")
    args = parser.parse_args()

    packages = [p.strip() for p in args.packages.split(",") if p.strip()]
    if not packages:
        print("ERRO: nenhum pacote informado em --packages", file=sys.stderr)
        sys.exit(1)

    summary = args.summary.strip()
    if not summary:
        print("ERRO: --summary não pode ser vazio", file=sys.stderr)
        sys.exit(1)

    changeset_dir = os.path.join(args.root, ".changeset")
    os.makedirs(changeset_dir, exist_ok=True)

    frontmatter_lines = [f'"{pkg}": {args.bump}' for pkg in packages]
    content = "---\n" + "\n".join(frontmatter_lines) + "\n---\n\n" + summary + "\n"

    filepath = None
    for _ in range(20):
        candidate = os.path.join(changeset_dir, f"{random_slug()}.md")
        if not os.path.exists(candidate):
            filepath = candidate
            break
    if filepath is None:
        print("ERRO: não foi possível gerar um nome de arquivo único", file=sys.stderr)
        sys.exit(1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print(filepath)


if __name__ == "__main__":
    main()
