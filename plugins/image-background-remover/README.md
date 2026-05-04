# Image Background Remover Plugin

Use this plugin when an AI agent needs to remove an image background, isolate a
subject, cut out a product or person, or create a transparent PNG from a local
image file or image URL.

## Included skills

- `chompute-bg-remover`

## Claude Code

```text
/plugin marketplace add dragonfruit-ai/skills
/plugin install image-background-remover@chompute-skills
/reload-plugins
```

Run:

```text
/image-background-remover:chompute-bg-remover Remove the background from ./product-photo.jpg and save a transparent PNG.
```

## Codex

```bash
codex plugin marketplace add dragonfruit-ai/skills --ref main
```

Then open `/plugins`, select **Chompute Skills**, and install **Image
Background Remover**.

## Authentication

Sign up at `https://chompute.ai/skills` to get your Access Key. Then set
`CHOMPUTE_API_KEY`, configure the Claude Code plugin Access Key field, or use the
legacy `chompute_key.txt` file beside the skill.

Do not commit Access Keys.
