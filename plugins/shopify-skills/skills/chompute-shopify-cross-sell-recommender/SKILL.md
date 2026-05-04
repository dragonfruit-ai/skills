---
name: chompute-shopify-cross-sell-recommender
description: >-
  Analyze recent Shopify orders to find products that are frequently bought
  together, preview cross-sell recommendations, and optionally save them back
  to Shopify as Related Products product-reference metafields.
---

# Chompute Shopify Cross-Sell Recommender

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, stack traces, or large raw JSON
walls into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ order analysis ready`
- `✅ cross-sell preview ready`
- `✅ related products saved`

Only show technical details if something fails, and then only the relevant
error.

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Rules

1. Always preview first.
2. Never save recommendations before the user explicitly approves the preview.
3. Build exactly one JSON object payload for each Chompute call.
4. Put that payload into exactly one `input_text`.
5. Read `output_text` from the Chompute response and parse it as JSON.
6. Do not guess from `output[0]...` if `output_text` is present.
7. Always keep the analysis window bounded to at most the last `365` days.

## Supported Inputs

Use only these actions:
- `preview_recommendations`
- `save_recommendations`

Optional inputs for preview:
- `lookback_days`
- `query_filter`
- `min_confidence`
- `min_lift`
- `max_recommendations`
- `export_csv`

Defaults:
- `lookback_days`: `365`
- `min_confidence`: `0.1`
- `min_lift`: `1.0`
- `max_recommendations`: `5`
- `export_csv`: `true`

## Conversation Flow

1. Ask whether the user wants:
   - report only
   - or report plus saving recommendations back to Shopify
2. Ask for a date/filter only if the user wants something different from the default last `365` days.
3. Ask for custom thresholds only if the user asks for stricter or looser recommendations.
4. Preview the recommendations through Chompute.
5. Show the summary, top pairs, and explain that saving writes Shopify Related Products product-reference metafields.
6. If the user approves, apply the exact `resolved_recommendations` array from the latest preview.

## Required Local Commands

Export both values exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Preview Request

Use this exact outer request shape:

```json
{
  "model": "shopify-cross-sell-recommender",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"preview_recommendations\",\"store_domain\":\"<string>\",\"shopify_access_token\":\"<string>\",\"lookback_days\":365,\"query_filter\":\"\",\"min_confidence\":0.1,\"min_lift\":1.0,\"max_recommendations\":5,\"export_csv\":true}"
        }
      ]
    }
  ]
}
```

Notes:
- If the user asks for “all orders”, still send `lookback_days: 365`.
- `query_filter` is optional.
- `export_csv` should normally stay `true`.

## Save Request

After a successful preview, reuse the exact `resolved_recommendations` array from that preview.

Use this exact outer request shape:

```json
{
  "model": "shopify-cross-sell-recommender",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"save_recommendations\",\"store_domain\":\"<string>\",\"shopify_access_token\":\"<string>\",\"resolved_recommendations\":[...]}"
        }
      ]
    }
  ]
}
```

Rules:
- do not edit `resolved_recommendations` manually
- do not rewrite Shopify IDs
- do not save unless the user clearly approves

## Important Clarifications

- This skill analyzes up to the last `365` days of orders for performance and relevance.
- Saving writes Shopify Related Products data as a `list.product_reference` metafield.
- Saving does not automatically change the storefront theme. It stores the related products on the products.
- After saving, tell the user where to find it in Shopify in simple language:
  `Open Shopify Admin -> Products -> choose a product that was updated -> scroll to Metafields -> Related products.`
- If preview says there is not enough order data, do not try to save anything.

## Endpoint

Use:

```text
POST https://chompute-services.dragonfruit.ai/openai/v1/responses
Content-Type: application/json
Authorization: Bearer <CHOMPUTE_API_KEY>
```
