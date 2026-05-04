---
name: chompute-shopify-order-analytics
description: >-
  Analyze Shopify orders over a time period and return a markdown business
  report with revenue, orders, AOV, repeat purchase rate, top products, and
  geographic breakdown.
---

# Chompute Shopify Order Analytics

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ report ready`

Only show technical details if something fails, and then only the relevant
error.

When you need the next piece of user input, combine the progress summary and
the next question into a single message.
Do not send one message with a status update and then another message asking
the same-step question.
Do not restate the same question twice in different wording.

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - `periodDays` such as `7`, `30`, or `90`
   - whether to compare with the previous period
   - optional `queryFilter`

   Defaults:
   - `periodDays = 30`
   - `compareWithPrevious = true`
   - `queryFilter = null`

   Ask only for what is missing.

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Construct exactly one JSON object for the skill payload with this shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "periodDays": 30,
     "compareWithPrevious": true,
     "queryFilter": "financial_status:paid"
   }
   ```

   Rules:
   - `store_domain` must be a string
   - `shopify_access_token` must be a string
   - `periodDays` must be a whole number between `1` and `365`
   - `compareWithPrevious` must be `true` or `false`
   - `queryFilter` is optional and must be a string if present
   - build exactly one payload object
   - serialize that object into exactly one `input_text`
   - do not split these fields across multiple `input_text` parts
   - do not print the token or Access Key into chat

   Use:

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request shape:

   ```json
   {
     "model": "shopify-order-analytics",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"periodDays\":30,\"compareWithPrevious\":true,\"queryFilter\":\"financial_status:paid\"}"
           }
         ]
       }
     ]
   }
   ```

   Recommended shell pattern:

   ```bash
   export SHOPIFY_ACCESS_TOKEN=$(node ../get-shopify-store-session.js <store>.myshopify.com)
   export CHOMPUTE_API_KEY=${CHOMPUTE_API_KEY:-${CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY:-$(tr -d '[:space:]' < ../chompute_key.txt)}}
   PAYLOAD=$(node -e 'const payload={model:"shopify-order-analytics",input:[{role:"user",content:[{type:"input_text",text:JSON.stringify({store_domain:process.argv[1],shopify_access_token:process.env.SHOPIFY_ACCESS_TOKEN,periodDays:Number(process.argv[2]),compareWithPrevious:process.argv[3]!=="false",queryFilter:process.argv[4]||undefined})}]}]}; process.stdout.write(JSON.stringify(payload));' "<store>.myshopify.com" "<periodDays>" "<compareWithPrevious>" "<queryFilter>")
   curl -sS -X POST https://chompute-services.dragonfruit.ai/openai/v1/responses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ${CHOMPUTE_API_KEY}" \
     -d "$PAYLOAD"
   ```

   Chompute will do the deterministic work:
   - fetch Shopify orders for the current period
   - optionally fetch the previous comparison period
   - compute revenue, order count, AOV, repeat purchase rate, top products, and geographic breakdown
   - return a markdown report plus a short summary object

5. **Report the result cleanly.**

   Response parsing rules:
   - expect an OpenAI Responses API envelope
   - read `output_text`
   - parse `output_text` as JSON
   - do not guess from `output[0]...` first if `output_text` is present

   Then:
   - tell the user the report is ready
   - mention the headline numbers:
     - revenue
     - orders
     - average order value
     - repeat purchase rate
   - if a comparison is present, mention the revenue and order change briefly
   - render `report_markdown` directly in the chat
   - preserve any fenced `text` blocks exactly
   - do not reformat the fixed-width tables inside those code fences
   - do not convert the report tables into bullets or prose
   - do not dump the raw JSON object to the user

   Use plain language such as:

   > ✅ report ready
   >
   > Revenue was `USD 1,240.00` across `18` orders with an AOV of `USD 68.89`.
   >
   > Here is the full report:

## Notes

- Never print the Shopify access token in chat.
- Never print the Chompute Access Key in chat.
- Keep the chat clean and do not paste raw API output.
- Do not split one skill request across multiple `input_text` items.
