# License Plate Recognizer Plugin

Use this plugin when an AI agent needs to read a license plate from an
authorized vehicle image, run LPR/ALPR, or return plate text with confidence and
bounding box metadata.

## Included skills

- `chompute-lpr`

## Claude Code

```text
/plugin marketplace add dragonfruit-ai/skills
/plugin install license-plate-recognizer@chompute-skills
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

Then open `/plugins`, select **Chompute Skills**, and install **License
Plate Recognizer**.

## Responsible use

Only process vehicle images the user is authorized to use. Do not use this
plugin for unauthorized surveillance, stalking, tracking, or invasive profiling.

## Authentication

Sign up at `https://chompute.ai/skills` to get your Access Key. Then configure
the Claude Code plugin Access Key field, set `CHOMPUTE_API_KEY`, or use the
legacy `chompute_key.txt` file beside the skill.

Do not commit Access Keys.
