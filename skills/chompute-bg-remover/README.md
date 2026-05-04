# Chompute Background Remover Standalone Skill

Standalone `SKILL.md` package for removing image backgrounds and creating
transparent PNG files.

## Codex direct install

```text
$skill-installer install https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-bg-remover
```

## Claude Code

For Claude Code, prefer the plugin package:

```text
/plugin marketplace add dragonfruit-ai/skills
/plugin install image-background-remover@dragonfruit-skills
```

## Authentication

Sign up at `https://chompute.ai/skills` to get your API key. Then set
`CHOMPUTE_API_KEY`, configure the Claude Code plugin API key field, or save the
key as `chompute_key.txt` next to `SKILL.md`.
