---
name: chompute-shopify-customer-ltv
description: >-
  Calculate Shopify customer lifetime value (LTV/CLV), show customer groups
  based on the month of first order, and optionally generate a downloadable
  CSV report.
---

# Chompute Shopify Customer Lifetime Value

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ LTV report ready`

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

1. **Collect missing inputs conversationally.**

   You need:
   - store domain

   Optional inputs:
   - `predictionMonths`
   - `exportReport`

   Defaults:
   - `predictionMonths = 24`
   - `exportReport = true`

   Ask like this:
   - If the store domain is not already clear from context, ask:
     - "What’s your Shopify store domain? For example: `my-store.myshopify.com`"
   - If the user did not specify a prediction window, ask:
     - "How far into the future should I estimate customer value? If you're
       unsure, 24 months is a good default."
   - If the user did not say whether they want a CSV report, you may keep the
     default of yes without asking.

   Explain "customer groups based on the month of first order" in plain
   language instead of saying only "acquisition cohort".

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Construct exactly one JSON object for the skill payload with this shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "predictionMonths": 24,
     "exportReport": true
   }
   ```

   Rules:
   - `store_domain` must be a string
   - `shopify_access_token` must be a string
   - `predictionMonths` must be a whole number between `1` and `60`
   - `exportReport` must be `true` or `false`
   - build exactly one payload object
   - serialize that object into exactly one `input_text`
   - do not split these fields across multiple `input_text` parts
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
     "model": "shopify-customer-ltv",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"predictionMonths\":24,\"exportReport\":true}"
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
   PAYLOAD=$(node -e 'const payload={model:"shopify-customer-ltv",input:[{role:"user",content:[{type:"input_text",text:JSON.stringify({store_domain:process.argv[1],shopify_access_token:process.env.SHOPIFY_ACCESS_TOKEN,predictionMonths:Number(process.argv[2]),exportReport:process.argv[3]!=="false"})}]}]}; process.stdout.write(JSON.stringify(payload));' "<store>.myshopify.com" "<predictionMonths>" "<exportReport>")
   curl -sS -X POST https://chompute-services.dragonfruit.ai/openai/v1/responses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ${CHOMPUTE_API_KEY}" \
     -d "$PAYLOAD"
   ```

   Chompute will do the deterministic work:
   - fetch Shopify customers
   - fetch Shopify orders
   - compute historical and predicted customer value
   - group customers by the month of their first order
   - return a chat report and, if requested, a CSV download link

5. **Report the result cleanly.**

   Response parsing rules:
   - expect an OpenAI Responses API envelope
   - read `output_text`
   - parse `output_text` as JSON
   - do not guess from `output[0]...` first if `output_text` is present

   Then:
   - tell the user the report is ready
   - mention the headline numbers:
     - total historical customer value
     - predicted future value
     - total estimated customer value
     - average customer value
   - explain that the cohort section groups customers by the month of their
     first order
   - render `report_markdown` directly in the chat
   - preserve any fenced `text` blocks exactly
   - do not reformat the fixed-width tables inside those code fences
   - if `download_url` is present, include it after the report and tell the
     user the file is valid for 24 hours
   - do not dump the raw JSON object to the user

   Use plain language such as:

   > ✅ LTV report ready
   >
   > I analyzed how much customer value your store has created so far and how
   > much more it may generate over the next `24` months.
   >
   > Here is the full report:

## Notes

- Never print the Shopify access token in chat.
- Never print the Chompute API key in chat.
- Keep the chat clean and do not paste raw API output.
- Do not split one skill request across multiple `input_text` items.
