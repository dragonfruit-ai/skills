# Dragonfruit AI Skills

Installable AI-agent skills for practical workflows across ecommerce, image
processing, operations, and more. The repository is structured for Claude Code,
Codex, Cursor, and other tools that understand `SKILL.md` style agent skills.

## Packages

| Package | Type | Best listing URL | What it does |
| --- | --- | --- | --- |
| Image Background Remover | Standalone skill and plugin | `https://github.com/dragonfruit-ai/skills/tree/main/plugins/image-background-remover` | Removes an image background and saves a transparent PNG. |
| License Plate Recognizer | Standalone skill and plugin | `https://github.com/dragonfruit-ai/skills/tree/main/plugins/license-plate-recognizer` | Reads license plates from authorized vehicle images and returns structured results. |
| Shopify Skills | Plugin bundle | `https://github.com/dragonfruit-ai/skills/tree/main/plugins/shopify-skills` | Installs one Shopify operations bundle with 27 workflow skills plus a setup helper. |

Standalone skill folders are also available at:

- `https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-bg-remover`
- `https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-lpr`

## Repository layout

```text
.
├── .agents/plugins/marketplace.json      # Codex marketplace
├── .claude-plugin/marketplace.json       # Claude Code marketplace
├── plugins/
│   ├── image-background-remover/         # Plugin with one background-removal skill
│   ├── license-plate-recognizer/         # Plugin with one LPR skill
│   └── shopify-skills/                   # Plugin with 27 Shopify workflow skills
├── skills/
│   ├── chompute-bg-remover/              # Raw standalone skill
│   └── chompute-lpr/                     # Raw standalone skill
└── docs/
    ├── marketplace-listings.md
    └── testing.md
```

## Claude Code install

From inside Claude Code:

```text
/plugin marketplace add dragonfruit-ai/skills
/plugin install image-background-remover@dragonfruit-skills
/plugin install license-plate-recognizer@dragonfruit-skills
/plugin install shopify-skills@dragonfruit-skills
/reload-plugins
```

From a shell:

```bash
claude plugin marketplace add dragonfruit-ai/skills
claude plugin install image-background-remover@dragonfruit-skills
claude plugin install license-plate-recognizer@dragonfruit-skills
claude plugin install shopify-skills@dragonfruit-skills
```

Claude Code plugin skills are namespaced by plugin. Example prompts:

```text
/image-background-remover:chompute-bg-remover Remove the background from ./product.jpg.
/license-plate-recognizer:chompute-lpr Read the license plate from this authorized vehicle image.
/shopify-skills:chompute-shopify-setup Set up my Shopify store.
```

## Codex install

Codex can read this repository as a plugin marketplace:

```bash
codex plugin marketplace add dragonfruit-ai/skills --ref main
```

Then open Codex, run `/plugins`, select **Dragonfruit AI Skills**, and install
the package you want.

If your local Codex CLI does not yet expose the `codex plugin` subcommands, use
the `/plugins` UI in a Codex build that supports plugins, or install the raw
standalone skills below for local testing.

For raw standalone skills in Codex, you can also install directly from the
GitHub skill directory:

```text
$skill-installer install https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-bg-remover
$skill-installer install https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-lpr
```

## Access Key setup

These skills require an Access Key. Sign up at `https://chompute.ai/skills` to get
your Access Key. The skills check for the key in this order:

1. `CHOMPUTE_API_KEY`
2. `CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY` when installed as a Claude Code plugin
3. `chompute_key.txt` in the legacy skill-specific location

Do not commit Access Keys to this repository or any user project. For public
install pages, show package information only and direct users to
`https://chompute.ai/skills` to get their Access Key.

## Safety notes

- Use Image Background Remover only for background removal and transparent PNG generation.
- Use License Plate Recognizer only on vehicle images the user is authorized to process.
- Use Shopify Skills only with stores the user owns, manages, or is authorized to operate.
- Shopify write-capable workflows should be preview-first and require user approval before applying changes.

## Validation

Run:

```bash
python3 scripts/validate_repo.py
```

This validates JSON manifests, parses skill frontmatter, checks required package
URLs, and confirms the Shopify bundle contains 27 workflow skills plus the setup
helper.
