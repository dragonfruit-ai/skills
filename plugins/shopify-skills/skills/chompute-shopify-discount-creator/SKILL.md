---
name: chompute-shopify-discount-creator
description: >-
  Create Shopify discounts from structured promotion instructions, preview the
  discounts, revise them if needed, and create them in Shopify only after user
  approval.
---

# Chompute Shopify Discount Creator

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, stack traces, or large raw JSON
walls into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ promotion understood`
- `✅ discount preview ready`
- `✅ discounts created`

Only show technical details if something fails, and then only the relevant
error.

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Rules

1. Always preview first.
2. Never create discounts before the user explicitly approves the preview.
3. Build exactly one JSON object payload for each Chompute call.
4. Put that payload into exactly one `input_text`.
5. Read `output_text` from the Chompute response and parse it as JSON.
6. Do not guess from `output[0]...` if `output_text` is present.

## Supported Discount Shapes

Use only these discount types:
- `percentage`
- `fixed_amount`
- `bogo`

Use only these modes:
- `code`
- `automatic`

Use only these scope types:
- `all`
- `collections`
- `products`

Use only these customer target types:
- `all`
- `segments`

Use only these minimum requirement types:
- `subtotal`
- `quantity`

## Conversation Flow

1. Ask the user what promotion they want.
2. Ask follow-up questions only if a required field is still missing.
3. Convert the request into structured discount objects yourself.
4. Preview the discounts through Chompute.
5. Show the preview.
6. If the user wants changes, update the structured discount objects and preview again.
7. If the user approves, apply the exact `resolved_discounts` array from the latest preview.

## Required Local Commands

Export both values exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Preview Request

Use this exact outer request shape:

```json
{
  "model": "shopify-discount-creator",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"preview_discounts\",\"store_domain\":\"<string>\",\"shopify_access_token\":\"<string>\",\"discounts\":[...]}"
        }
      ]
    }
  ]
}
```

The inner `discounts` array must contain one or more objects like these.

### Percentage example

```json
{
  "mode": "code",
  "discount_type": "percentage",
  "title": "Hydrogen 20 Off",
  "code": "HYDRO20",
  "percentage": 20,
  "applies_to": {
    "type": "collections",
    "refs": ["Hydrogen"]
  },
  "customer_target": {
    "type": "segments",
    "refs": ["Email subscribers"]
  },
  "starts_at": "2026-04-15T00:00:00Z",
  "ends_at": "2026-07-31T23:59:59Z"
}
```

### Fixed amount example

```json
{
  "mode": "automatic",
  "discount_type": "fixed_amount",
  "title": "Weekend 15 Off 100",
  "fixed_amount": 15,
  "applies_to": {
    "type": "all"
  },
  "minimum_requirement": {
    "type": "subtotal",
    "value": 100
  },
  "starts_at": "2026-04-17T00:00:00Z",
  "ends_at": "2026-04-17T23:59:59Z"
}
```

### BOGO example

```json
{
  "mode": "automatic",
  "discount_type": "bogo",
  "title": "Minimal Snowboard B2G1",
  "buy": {
    "quantity": 2,
    "scope": {
      "type": "products",
      "refs": ["The Minimal Snowboard"]
    }
  },
  "get": {
    "quantity": 1,
    "scope": {
      "type": "products",
      "refs": ["The Minimal Snowboard"]
    }
  }
}
```

## Apply Request

After a successful preview, reuse the exact `resolved_discounts` array from that preview.

Use this exact outer request shape:

```json
{
  "model": "shopify-discount-creator",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"apply_discounts\",\"store_domain\":\"<string>\",\"shopify_access_token\":\"<string>\",\"resolved_discounts\":[...]}"
        }
      ]
    }
  ]
}
```

Rules:
- do not edit `resolved_discounts` manually
- do not rewrite Shopify IDs
- do not apply unless the user clearly approves

## Important Clarifications

- If the user asks for a “tiered” discount like `buy 3 get 10% off, buy 5 get 15% off`, split it into multiple separate discounts in the `discounts` array.
- If the user asks for BOGO on all products, do not send that directly. Ask the user to narrow it to products or collections.
- If preview returns errors, do not apply anything. Ask the user only for the missing correction.

## Endpoint

Use:

```text
POST https://chompute-services.dragonfruit.ai/openai/v1/responses
Content-Type: application/json
Authorization: Bearer <CHOMPUTE_API_KEY>
```
