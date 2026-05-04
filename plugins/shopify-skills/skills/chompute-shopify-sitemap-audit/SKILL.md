---
name: chompute-shopify-sitemap-audit
description: >-
  Audit a Shopify catalog for thin or missing-SEO content (products,
  collections, pages) and return a CSV report ranked by priority. Each row
  has a 0-100 quality score, a list of issues, and a high/medium/low
  priority. This skill is report-only - it does NOT modify any pages or set
  noindex.
---

# Chompute Shopify Sitemap Audit

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ sitemap audit ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

The store must grant the `read_products` and `read_content` access scopes
(content covers pages and collections).

## Workflow

1. **Collect missing inputs conversationally.**

   You need:
   - store domain

   Optional inputs:
   - `minWords`: word count threshold for pages (default `50`)
   - `minDescriptionWords`: word count threshold for product/collection
     descriptions (default `30`)

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described
   in [`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md).

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "minWords": 50,
     "minDescriptionWords": 30
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
     "model": "shopify-sitemap-audit",
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

   Parse `output_text` as JSON. The response has the following shape:

   ```json
   {
     "status": "completed",
     "store_domain": "example.myshopify.com",
     "filename": "shopify-sitemap-audit.csv",
     "download_url": "https://...",
     "ttl_seconds": 86400,
     "ttl_human": "24 hours",
     "thresholds": {"min_words": 50, "min_description_words": 30},
     "summary": {
       "products_scanned": 124,
       "collections_scanned": 18,
       "pages_scanned": 6,
       "total_resources": 148,
       "priority_breakdown": {"high": 14, "medium": 32, "low": 102},
       "by_resource_type": {"product": 124, "collection": 18, "page": 6},
       "top_issues": [
         {"issue": "thin_description", "count": 42},
         {"issue": "missing_seo_title", "count": 28}
       ]
     },
     "report_markdown": "<full markdown report>"
   }
   ```

   Show `summary.report_markdown` directly to the user (it has overview,
   priority breakdown, top issues, and the top-10 highest-priority
   resources). Then add:

   > Here is the full per-resource CSV: `<download_url>`
   >
   > This file is valid for 24 hours. Start with the rows scored `high`
   > priority.

## Notes

- This skill is report-only. It does NOT modify any product, collection,
  page, or metafield.
- Scoring is fully deterministic (word counts, missing SEO fields, missing
  images, empty collections). No LLM calls.
- Never print the Shopify access token or Chompute API key in chat.
