#!/usr/bin/env python3
"""Validate the Dragonfruit AI skills repository.

This intentionally avoids external dependencies so it can run in GitHub Actions
and on a fresh developer machine.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_JSON = [
    ROOT / ".claude-plugin" / "marketplace.json",
    ROOT / ".agents" / "plugins" / "marketplace.json",
    ROOT / "plugins" / "image-background-remover" / ".claude-plugin" / "plugin.json",
    ROOT / "plugins" / "image-background-remover" / ".codex-plugin" / "plugin.json",
    ROOT / "plugins" / "license-plate-recognizer" / ".claude-plugin" / "plugin.json",
    ROOT / "plugins" / "license-plate-recognizer" / ".codex-plugin" / "plugin.json",
    ROOT / "plugins" / "shopify-skills" / ".claude-plugin" / "plugin.json",
    ROOT / "plugins" / "shopify-skills" / ".codex-plugin" / "plugin.json",
]
REQUIRED_URLS = [
    "https://github.com/dragonfruit-ai/skills/tree/main/plugins/image-background-remover",
    "https://github.com/dragonfruit-ai/skills/tree/main/plugins/license-plate-recognizer",
    "https://github.com/dragonfruit-ai/skills/tree/main/plugins/shopify-skills",
]
SECRET_PATTERNS = [
    re.compile(r"dfak_[A-Za-z0-9_-]+"),
    re.compile(r"sk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"fw_[A-Za-z0-9_-]+"),
]


def fail(message: str) -> None:
    raise SystemExit(f"ERROR: {message}")


def validate_json() -> None:
    for path in EXPECTED_JSON:
        if not path.exists():
            fail(f"missing JSON file: {path.relative_to(ROOT)}")
        with path.open() as handle:
            json.load(handle)


def validate_skill_frontmatter() -> None:
    skills = sorted(ROOT.rglob("SKILL.md"))
    if not skills:
        fail("no SKILL.md files found")

    for path in skills:
        text = path.read_text()
        if not text.startswith("---\n"):
            fail(f"missing YAML frontmatter start: {path.relative_to(ROOT)}")
        try:
            _, frontmatter, _ = text.split("---", 2)
        except ValueError:
            fail(f"missing YAML frontmatter close: {path.relative_to(ROOT)}")
        if "description:" not in frontmatter:
            fail(f"missing description in frontmatter: {path.relative_to(ROOT)}")


def validate_package_shape() -> None:
    standalone = [
        ROOT / "skills" / "chompute-bg-remover" / "SKILL.md",
        ROOT / "skills" / "chompute-lpr" / "SKILL.md",
    ]
    for path in standalone:
        if not path.exists():
            fail(f"missing standalone skill: {path.relative_to(ROOT)}")

    plugin_dirs = [
        ROOT / "plugins" / "image-background-remover",
        ROOT / "plugins" / "license-plate-recognizer",
        ROOT / "plugins" / "shopify-skills",
    ]
    for plugin_dir in plugin_dirs:
        if not (plugin_dir / ".claude-plugin" / "plugin.json").exists():
            fail(f"missing Claude plugin manifest: {plugin_dir.relative_to(ROOT)}")
        if not (plugin_dir / ".codex-plugin" / "plugin.json").exists():
            fail(f"missing Codex plugin manifest: {plugin_dir.relative_to(ROOT)}")
        if not (plugin_dir / "skills").exists():
            fail(f"missing plugin skills folder: {plugin_dir.relative_to(ROOT)}")

    shopify_skill_names = {
        path.parent.name
        for path in (ROOT / "plugins" / "shopify-skills" / "skills").glob("*/SKILL.md")
    }
    if "chompute-shopify-setup" not in shopify_skill_names:
        fail("Shopify setup helper is missing")
    workflow_count = len(shopify_skill_names - {"chompute-shopify-setup"})
    if workflow_count != 27:
        fail(f"expected 27 Shopify workflow skills, found {workflow_count}")


def validate_docs() -> None:
    docs_text = "\n".join(
        path.read_text()
        for path in [
            ROOT / "README.md",
            ROOT / "docs" / "marketplace-listings.md",
            ROOT / "docs" / "testing.md",
        ]
    )
    for url in REQUIRED_URLS:
        if url not in docs_text:
            fail(f"missing listing URL in docs: {url}")


def validate_no_secrets() -> None:
    for path in ROOT.rglob("*"):
        if not path.is_file() or ".git" in path.parts:
            continue
        try:
            text = path.read_text()
        except UnicodeDecodeError:
            continue
        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                fail(f"possible secret found in {path.relative_to(ROOT)}")


def main() -> None:
    validate_json()
    validate_skill_frontmatter()
    validate_package_shape()
    validate_docs()
    validate_no_secrets()
    print("Repository validation passed.")


if __name__ == "__main__":
    main()

