---
name: chompute-shopify-schema-markup
description: >-
  Generate JSON-LD structured data (Product, Organization, BreadcrumbList) for
  every active product in a Shopify store, package it as a Liquid snippet
  ready to drop into the theme, and bundle the raw JSON for inspection. This
  skill is generation-only - it does NOT modify the theme. The merchant
  applies the snippet manually.
---

# Chompute Shopify Schema Markup

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ schema snippet ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

The store must grant the `read_products` access scope.

## Workflow

1. **Collect missing inputs conversationally.**

   You need:
   - store domain

   Optional inputs:
   - `includeOrganization`: `true` or `false` (default `true`)
   - `includeBreadcrumbs`: `true` or `false` (default `true`)
   - `activeOnly`: `true` or `false` (default `true`)

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described
   in [`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md).

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "includeOrganization": true,
     "includeBreadcrumbs": true,
     "activeOnly": true
   }
   ```

   Use:

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request shape:

   ```json
   {
     "model": "shopify-schema-markup",
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
   - the snippet bundle is ready
   - how many products got schema
   - whether organization + breadcrumb schemas are included
   - the download link, valid for 24 hours
   - the apply steps (below)

   Apply steps the merchant must follow themselves:

   1. Download and unzip the bundle.
   2. In Shopify admin, go to Online Store -> Themes -> Edit code.
   3. Upload `snippets/chompute-schema-markup.liquid` into the theme's
      `snippets/` folder.
   4. Open `layout/theme.liquid` and add this just before `</head>`:

      ```liquid
      {% render 'chompute-schema-markup' %}
      ```

   5. Validate at https://search.google.com/test/rich-results.

   Example chat reply:

   > ✅ schema snippet ready
   >
   > Generated JSON-LD for `124` products + Organization + BreadcrumbList.
   >
   > Here is the download link: `<URL>`
   >
   > Drop `snippets/chompute-schema-markup.liquid` into your theme and add
   > `{% render 'chompute-schema-markup' %}` before `</head>` in
   > `layout/theme.liquid`. Then validate with Google's Rich Results test.
   >
   > This file is valid for 24 hours.

## Notes

- This skill is generation-only. It does NOT call `themeFilesUpsert` or
  modify the theme in any way - the merchant applies the snippet manually.
- All JSON-LD is built deterministically from product data. No LLM calls.
- Never print the Shopify access token or Chompute API key in chat.
