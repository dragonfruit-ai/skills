---
name: chompute-shopify-profit-calculator
description: >-
  Calculate true per-variant profit margins on a Shopify store after Shopify
  fees, payment processing, shipping, and refund rate.
---

# Chompute Shopify Profit Calculator

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ margins ready`

Only show technical details if something fails, and then only the relevant
error.

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - optional `periodDays` (how many days of order history to analyze; default 90)
   - optional `shopifyPlanRate` (Basic 0.02, Shopify 0.01, Advanced 0.005; default 0.02)
   - optional `paymentProcessingRate` (default 0.029 for Shopify Payments)
   - optional `paymentFixedFee` (default 0.30)
   - optional `refundRate` (fraction between 0 and 1; auto-calculated if omitted)
   - optional `includeShipping` (default true)

   Ask only for what is missing. Defaults are safe.

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Construct exactly one JSON object for the skill payload with this shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "periodDays": 90,
     "shopifyPlanRate": 0.02,
     "paymentProcessingRate": 0.029,
     "paymentFixedFee": 0.30,
     "includeShipping": true
   }
   ```

   Rules:
   - `store_domain` and `shopify_access_token` must be non-empty strings
   - numeric fields are optional; omit if you want defaults
   - serialize the object into exactly one `input_text`
   - do not split fields across multiple `input_text` parts
   - do not print the token or API key into chat

   Use:

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request shape:

   ```json
   {
     "model": "shopify-profit-calculator",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"periodDays\":90}"
           }
         ]
       }
     ]
   }
   ```

   Chompute will deterministically:
   - fetch the full product catalog with per-variant cost of goods (`inventoryItem.unitCost`)
   - fetch orders for the period and aggregate per-variant units sold and revenue
   - compute refund rate from actual refunds (unless `refundRate` overrides it)
   - compute per-variant net profit after Shopify fee, payment fee, shipping, and refund cost
   - return a store-level summary, top profitable variants, negative-margin variants,
     variants missing cost data, and a CSV download link

4. **Report the result cleanly.**

   Response parsing rules:
   - expect an OpenAI Responses API envelope
   - read `output_text`
   - parse `output_text` as JSON
   - render `report_markdown` directly in the chat
   - call out: total revenue, total profit, average margin, refund rate applied, 
     count of variants missing cost data, count of negative-margin variants
   - mention the CSV download link (`download_url`) so the user can audit line items
   - do not dump the raw JSON to the user

## Notes

- Never print the Shopify access token or Chompute API key in chat.
- This skill is read-only. It does not modify any Shopify data.
- Variants missing `inventoryItem.unitCost` will be flagged separately — tell the user
  they can fix the report by setting Cost per item on those variants in Shopify admin.
