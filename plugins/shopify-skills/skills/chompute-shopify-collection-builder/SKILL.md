---
name: chompute-shopify-collection-builder
description: >-
  Analyze a Shopify catalog + sales history and propose smart-collection rules
  (bestsellers, new arrivals, by tag/type/vendor, price band, theme).
---

# Chompute Shopify Smart Collection Builder

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ collections proposed`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - optional `numCollections` (how many to propose; default 5, max 15)
   - optional `bestsellerDays` (days of sales to analyze for bestsellers; default 90)

2. **Follow the shared local setup instructions.**

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "numCollections": 5
   }
   ```

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request:

   ```json
   {
     "model": "shopify-collection-builder",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"numCollections\":5}"
           }
         ]
       }
     ]
   }
   ```

   Chompute will:
   - fetch the catalog and summarize top tags, product types, vendors, price range
   - pull recent orders and compute bestsellers
   - ask the LLM to propose `numCollections` smart collections with title, description,
     strategy, rules (Shopify-compatible column/relation/condition), match_policy,
     and rationale
   - return the proposals as JSON

4. **Report the result cleanly.**
   - read `output_text`, parse JSON
   - present each proposal: title, 1-sentence rationale, and rules summary
   - tell the user to create each as a Smart Collection in Shopify admin

## Notes

- Never print the Shopify access token or Chompute Access Key in chat.
- This skill is **preview-only**. Chompute does not create collections. It
  proposes rules that the merchant applies in Shopify admin manually (or in
  a future PR we'll add an `apply` action behind its own credit charge).
