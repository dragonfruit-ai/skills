---
name: chompute-shopify-broken-links-report
description: >-
  Audit every URL redirect on a Shopify store via the Admin API and flag the
  ones whose target points at a product, collection, or page handle that no
  longer exists. Returns a CSV report with suggested replacement paths
  matched against live handles. This skill is report-only and uses ONLY the
  Shopify Admin API - no outbound HTTP probes, no scraping.
---

# Chompute Shopify Broken Links Report

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ broken links report ready`

## What this skill does

It compares every URL redirect on the store against the live catalog:

- For each redirect, it parses the `target` (the destination path).
- If the target is `/products/<handle>`, `/collections/<handle>`, or
  `/pages/<handle>`, it checks whether `<handle>` still exists in the live
  store via the Admin API.
- If the live handle is missing, the redirect is flagged `broken` and a
  fuzzy-matched live handle is suggested in the `suggested_target` column.
- Circular redirects (path == target) are flagged separately.
- External targets and other internal paths are reported as `_unchecked` so
  the merchant can review them manually.

The skill does NOT make any HTTP requests to the storefront. Everything is
done through the Shopify Admin GraphQL API.

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

The store must grant the following access scopes:

- `read_products` (live product handles)
- `read_content` (collections, pages)
- `read_online_store_pages` (pages, on some plans)
- `read_url_redirects` (the existing URL redirects to audit)

If `read_url_redirects` is missing, the skill will fail with
`Access denied for urlRedirects field. Required access: 'read_url_redirects' access scope.`
Add it to your store's auth scopes and re-run `shopify store auth`.

## Workflow

1. **Collect missing inputs conversationally.**

   You need:
   - store domain

   No optional inputs - the skill always scans every redirect.

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

   Use:

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request shape:

   ```json
   {
     "model": "shopify-broken-links-report",
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
   - the report is ready
   - how many redirects were scanned
   - how many came back ok / broken / circular / external_unchecked /
     internal_unchecked
   - the download link, valid for 24 hours
   - that they should review the `suggested_target` column before updating
     any redirect in Shopify admin

   Example:

   > ✅ broken links report ready
   >
   > I scanned `124` URL redirects on `linky.shop`. Broken: `7`, circular:
   > `1`, external: `4`, internal-unchecked: `2`, ok: `110`.
   >
   > Here is the download link: `<URL>`
   >
   > Review the `suggested_target` column before updating any redirect in
   > the Shopify admin (Online Store -> Navigation -> URL Redirects).

## Notes

- This skill is report-only. It does NOT create, modify, or delete any URL
  redirect.
- It uses only the Shopify Admin API. No outbound HTTP, no storefront
  scraping, no probes.
- Never print the Shopify access token or Chompute API key in chat.
