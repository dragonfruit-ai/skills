# License Plate Recognizer Plugin

Use this plugin when an AI agent needs to read a license plate from an
authorized vehicle image, run LPR/ALPR, or return plate text with confidence and
bounding box metadata.

## Included skills

- `chompute-lpr`

## Claude Code

```text
/plugin marketplace add dragonfruit-ai/skills
/plugin install license-plate-recognizer@dragonfruit-skills
/reload-plugins
```

Run:

```text
/license-plate-recognizer:chompute-lpr Read the license plate from this authorized vehicle image and return JSON.
```

## Codex

```bash
codex plugin marketplace add dragonfruit-ai/skills --ref main
```

Then open `/plugins`, select **Dragonfruit AI Skills**, and install **License
Plate Recognizer**.

## Responsible use

Only process vehicle images the user is authorized to use. Do not use this
plugin for unauthorized surveillance, stalking, tracking, or invasive profiling.

## Authentication

Set `CHOMPUTE_API_KEY`, configure the Claude Code plugin API key field, or use
the legacy `chompute_key.txt` file beside the skill.

Do not commit API keys.

