# Shopify Local Setup

Use this shared local setup for all Chompute Shopify skills.

## Where the local files live

- The Chompute API key can come from:
  - `CHOMPUTE_API_KEY`
  - `CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY`
  - `../chompute_key.txt` from a Shopify skill folder
- The legacy Chompute API key file is in the parent Shopify skills directory:
  - `../chompute_key.txt` from a Shopify skill folder
- The Shopify token helper script is also in the parent Shopify skills directory:
  - `../get-shopify-store-session.js` from a Shopify skill folder

Do not search other folders first.
Use these exact paths unless the user explicitly says otherwise.

## Required checks

1. Check that `CHOMPUTE_API_KEY`, `CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY`, or
   `../chompute_key.txt` exists and is non-empty.
2. Check that Shopify auth works for the store:

```bash
node ../get-shopify-store-session.js <store>.myshopify.com >/dev/null
```

If the key is missing, tell the user:

> You need a Chompute API key. Sign up and get one at:
> https://chompute.ai/signup
>
> Then set `CHOMPUTE_API_KEY`, configure the plugin's Chompute API key option,
> or save your key to: `<parent Shopify skills directory>/chompute_key.txt`

If the Shopify token helper fails, guide the user into running
`chompute-shopify-setup` first.

## Required exports

Before building a Chompute request, export both values exactly like this:

```bash
export SHOPIFY_ACCESS_TOKEN=$(node ../get-shopify-store-session.js <store>.myshopify.com)
export CHOMPUTE_API_KEY=${CHOMPUTE_API_KEY:-${CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY:-$(tr -d '[:space:]' < ../chompute_key.txt)}}
```

Rules:
- do not print or echo either token into the chat
- do not search for alternate key files
- do not search for alternate Shopify token helpers
- if either export fails, stop and explain the relevant missing setup
