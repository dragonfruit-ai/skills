# Chompute License Plate Recognizer Standalone Skill

Standalone `SKILL.md` package for reading license plates from authorized
vehicle images and returning structured recognition data.

## Codex direct install

```text
$skill-installer install https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-lpr
```

## Claude Code

For Claude Code, prefer the plugin package:

```text
/plugin marketplace add dragonfruit-ai/skills
/plugin install license-plate-recognizer@dragonfruit-skills
```

## Responsible use

Only process vehicle images the user is authorized to use.

## Authentication

Sign up at `https://chompute.ai/skills` to get your API key. Then set
`CHOMPUTE_API_KEY`, configure the Claude Code plugin API key field, or save the
key as `chompute_key.txt` next to `SKILL.md`.
