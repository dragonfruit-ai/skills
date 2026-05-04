---
name: chompute-shopify-product-feed
description: >-
  Generate Google Shopping (XML), Meta/Facebook (CSV), and TikTok (CSV) product
  feeds from a Shopify catalog. The feeds are bundled into a single zip and
  delivered as a download link. This skill is read-only - it does NOT modify
  any products or storefront data.
---

# Chompute Shopify Product Feed

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ product feeds ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

The store must grant the `read_products` access scope.

## Workflow

1. **Collect missing inputs conversationally.**

   You need:
   - store domain

   Optional inputs:
   - `platforms`: any subset of `google`, `meta`, `tiktok` (defaults to all)
   - `activeOnly`: `true` or `false` (default `true`)
   - `inStockOnly`: `true` or `false` (default `false`)
   - `brand`: default brand name for products without a `vendor`

   Ask plainly which platforms they want feeds for, and whether they want
   only active/in-stock products. Defaults are usually fine.

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described
   in [`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md).

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "platforms": ["google", "meta", "tiktok"],
     "activeOnly": true,
     "inStockOnly": false
   }
   ```

   Rules:
   - `platforms` must be a list containing only `google`, `meta`, `tiktok`
   - `activeOnly` and `inStockOnly` must be `true` or `false`

   Use:

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request shape:

   ```json
   {
     "model": "shopify-product-feed",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"platforms\":[\"google\",\"meta\",\"tiktok\"],\"activeOnly\":true,\"inStockOnly\":false}"
           }
         ]
       }
     ]
   }
   ```

4. **Report the result cleanly.**

   Parse `output_text` as JSON. Tell the user:
   - the product feed bundle is ready
   - which platforms were generated
   - how many products and feed items
   - any validation issues (missing images, descriptions, prices)
   - the download link, valid for 24 hours

   Example:

   > ✅ product feeds ready
   >
   > I generated feeds for `Google, Meta, TikTok` covering `124` products
   > (`248` variants).
   >
   > Validation: `2` products are missing images.
   >
   > Here is the download link: `<URL>`
   >
   > This file is valid for 24 hours.

## Notes

- This skill is read-only - it does NOT modify any product, variant, or
  storefront resource.
- The zip contains: `google-shopping-feed.xml`, `meta-product-feed.csv`,
  `tiktok-product-feed.csv` (depending on selected platforms).
- Never print the Shopify access token or Chompute Access Key in chat.
- Do not split one skill request across multiple `input_text` items.
