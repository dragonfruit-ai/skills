---
name: chompute-shopify-win-back-campaign
description: >-
  Find lapsed Shopify customers, preview a win-back campaign with a customer
  list CSV and one reusable email template, and create a single customer-
  restricted discount code only after user approval.
---

# Chompute Shopify Win-Back Campaign

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, stack traces, or large raw JSON
walls into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ lapsed customers found`
- `✅ preview CSV ready`
- `✅ win-back campaign created`

Only show technical details if something fails, and then only the relevant
error.

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Rules

1. Always preview first.
2. Never create the discount code before the user explicitly approves the preview.
3. Ask the user for `lapsedDays` if they have not already provided it.
4. Ask the user for `discountPercentage` if they have not already provided it.
5. Ask the user for `discountPrefix` if they have not already provided it.
6. Always keep `maxCustomers` fixed at `100` sorted by highest historical spend.
7. Build exactly one JSON object payload for each Chompute call.
8. Put that payload into exactly one `input_text`.
9. Read `output_text` from the Chompute response and parse it as JSON.
10. Do not guess from `output[0]...` if `output_text` is present.

## Supported Actions

Use only these actions:
- `preview_campaign`
- `apply_campaign`

## Conversation Flow

1. If missing, ask:
   - how many days since last purchase should count as lapsed
   - what discount percentage to offer
   - what discount prefix to use
2. Preview the campaign through Chompute.
3. Show:
   - total targeted customers
   - that the top `100` highest-spend lapsed customers were selected
   - the CSV download link
   - the preview email subject from `preview_email_subject`
   - the preview email body from `preview_email_plain_text`
   - that the discount code will only be created on apply
4. After showing the preview, ask in one sentence whether the user wants you to create one Shopify discount code restricted to the selected customers and generate the final customer email CSV with that code filled in.
5. If the user approves, apply the exact `selected_customers` array and exact `email_template` object from the latest preview.

## Required Local Commands

Export both values exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Preview Request

Use this exact outer request shape:

```json
{
  "model": "shopify-win-back-campaign",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"preview_campaign\",\"store_domain\":\"<string>\",\"shopify_access_token\":\"<string>\",\"lapsedDays\":60,\"discountPercentage\":15,\"discountPrefix\":\"COMEBACK\"}"
        }
      ]
    }
  ]
}
```

Notes:
- `lapsedDays` is required.
- `discountPercentage` is required.
- `discountPrefix` is required.
- Show the email preview from the top-level fields:
  - `preview_email_subject`
  - `preview_email_plain_text`
- Do not say the email preview is missing if those fields are present.
- The preview returns:
  - `selected_customers`
  - `email_template`
  - a customer CSV download link

## Apply Request

After a successful preview, reuse the exact `selected_customers` array and `email_template` object from that preview.

Use this exact outer request shape:

```json
{
  "model": "shopify-win-back-campaign",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"apply_campaign\",\"store_domain\":\"<string>\",\"shopify_access_token\":\"<string>\",\"discountPercentage\":15,\"discountPrefix\":\"COMEBACK\",\"selected_customers\":[...],\"email_template\":{...}}"
        }
      ]
    }
  ]
}
```

Rules:
- do not edit `selected_customers` manually
- do not rewrite Shopify IDs
- do not recreate the email template yourself
- do not apply unless the user clearly approves

## Important Clarifications

- The preview does not create any Shopify discount code.
- Apply creates one shared discount code and restricts it to the selected customer list.
- The code is single-use per customer.
- The final apply step returns a CSV with one customer per row and the final plain-text email content.
- This skill creates the campaign assets but does not send the emails.

## Endpoint

Use:

```text
POST https://chompute-services.dragonfruit.ai/openai/v1/responses
Content-Type: application/json
Authorization: Bearer <CHOMPUTE_API_KEY>
```
