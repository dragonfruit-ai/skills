# Testing Guide

## Validate the repository

```bash
python3 scripts/validate_repo.py
```

## Test Claude Code locally

From this repository root:

```bash
claude plugin validate .
claude plugin marketplace add . --scope local
claude plugin install image-background-remover@chompute-skills --scope local
claude plugin install license-plate-recognizer@chompute-skills --scope local
claude plugin install shopify-skills@chompute-skills --scope local
```

Restart Claude Code or run:

```text
/reload-plugins
```

Then test:

```text
/image-background-remover:chompute-bg-remover Remove the background from ./product-photo.jpg.
/license-plate-recognizer:chompute-lpr Read the plate from this authorized vehicle image.
/shopify-skills:chompute-shopify-setup Set up my Shopify store.
```

## Test Codex locally

From a shell:

```bash
codex plugin marketplace add ./path/to/skills
```

Then start Codex, run `/plugins`, choose **Chompute Skills**, and install
the plugin you want to test.

If your installed Codex CLI does not yet expose `codex plugin`, open a Codex
build with plugin support and use `/plugins`, or test the standalone skills
below.

For standalone skills:

```text
$skill-installer install https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-bg-remover
$skill-installer install https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-lpr
```

## Required runtime setup

Do not commit credentials. Use one of:

```bash
export CHOMPUTE_API_KEY="..."
```

Sign up at `https://chompute.ai/skills` to get your Access Key. For Claude
plugins, configure the plugin Access Key field when enabling the plugin. For
standalone skills and Codex, set `CHOMPUTE_API_KEY`.

Shopify workflows also require Shopify CLI authentication. Start with:

```text
/shopify-skills:chompute-shopify-setup Set up my Shopify store.
```
