---
name: chompute-shopify-theme-backup
description: >-
  Snapshot every file in the live Shopify theme into a downloadable zip.
  Text-based files (Liquid, JSON, CSS, JS) are stored inline. CDN-only
  assets are recorded in a manifest with their remote URL. This skill is
  read-only - it does NOT modify or restore anything in the theme.
---

# Chompute Shopify Theme Backup

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ theme backup ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

The store must grant the `read_themes` access scope.

## Workflow

1. **Collect missing inputs conversationally.**

   You need:
   - store domain

   Optional inputs:
   - `themeId`: a specific theme GID (e.g.
     `gid://shopify/OnlineStoreTheme/123`) - defaults to the live (MAIN) theme

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described
   in [`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md).

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>"
   }
   ```

   Optional `themeId` if the merchant wants a non-live theme.

   Use:

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request shape:

   ```json
   {
     "model": "shopify-theme-backup",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\"}"
           }
         ]
       }
     ]
   }
   ```

4. **Report the result cleanly.**

   Parse `output_text` as JSON. Tell the user:
   - the backup is ready
   - the theme name and role
   - file counts (inline / url-only / skipped)
   - the download link, valid for 24 hours

   Example:

   > ✅ theme backup ready
   >
   > I snapshotted `Dawn Custom` (MAIN). `212` files inline, `8` CDN-only
   > assets recorded in `manifest.json`.
   >
   > Here is the download link: `<URL>`
   >
   > This file is valid for 24 hours.

   The zip layout:

   ```
   theme/...all theme files preserved at their original paths...
   manifest.json   # full file inventory + remote URLs for CDN-only assets
   ```

## Notes

- This skill is backup-only. It does NOT restore or write to the theme.
  Restore is a separate skill in a future release.
- Never print the Shopify access token or Chompute Access Key in chat.
- Do not split one skill request across multiple `input_text` items.
