---
name: chompute-shopify-stock-alert
description: >-
  Check Shopify inventory, flag low-stock products using critical / low / watch
  thresholds, generate a downloadable CSV report, and update Shopify stock tags.
---

# Chompute Shopify Stock Alert

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ thresholds saved`
- `✅ stock report ready`

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

## Local Threshold Settings

Remember thresholds locally so the user does not need to enter them every time.

- Store them in `stock_thresholds.json` in this skill's directory.
- Key them by Shopify store domain.
- Save:
  - `critical`
  - `low`
  - `watch`

If thresholds are missing for the current store, ask one friendly question:

> What stock levels would you like me to use for `critical`, `low`, and `watch`?
> A good starting point is `critical = 5`, `low = 15`, and `watch = 30`.

After the user answers, save them locally and confirm:
`✅ thresholds saved`

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - thresholds for `critical`, `low`, and `watch`

   Reuse saved thresholds automatically if they already exist for the store.

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Construct exactly one JSON object for the skill payload with this shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "thresholds": {
       "critical": 5,
       "low": 15,
       "watch": 30
     }
   }
   ```

   Rules:
   - `store_domain` must be a string
   - `shopify_access_token` must be a string
   - `thresholds` must be one JSON object
   - `critical`, `low`, and `watch` must be numbers
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
     "model": "shopify-stock-alert",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"thresholds\":{\"critical\":5,\"low\":15,\"watch\":30}}"
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
   PAYLOAD=$(node -e 'const payload={model:"shopify-stock-alert",input:[{role:"user",content:[{type:"input_text",text:JSON.stringify({store_domain:process.argv[1],shopify_access_token:process.env.SHOPIFY_ACCESS_TOKEN,thresholds:{critical:Number(process.argv[2]),low:Number(process.argv[3]),watch:Number(process.argv[4])}})}]}]}; process.stdout.write(JSON.stringify(payload));' "<store>.myshopify.com" "<critical>" "<low>" "<watch>")
   curl -sS -X POST https://chompute-services.dragonfruit.ai/openai/v1/responses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ${CHOMPUTE_API_KEY}" \
     -d "$PAYLOAD"
   ```

   Chompute will do all of the deterministic work:
   - fetch Shopify inventory
   - sum available stock across locations
   - classify `critical`, `low`, and `watch`
   - generate the CSV
   - update Shopify product tags
   - host the CSV and return the final download URL

5. **Report the result cleanly.**

   Response parsing rules:
   - expect an OpenAI Responses API envelope
   - read `output_text`
   - parse `output_text` as JSON
   - do not guess from `output[0]...` first if `output_text` is present

   Then tell the user:
   - how many variants need attention
   - how many are `critical`, `low`, and `watch`
   - up to 5 example products, ordered by urgency:
     - first `critical`
     - then `low`
     - then `watch`
   - the download link
   - that the link is valid for 24 hours
   - that Shopify stock tags were updated successfully

   If there are already 5 or more `critical` products, list only `critical`
   products in the examples.

## Notes

- Never print the Shopify access token in chat.
- Never print the Chompute API key in chat.
- Keep the chat clean and do not paste raw API output.
- Do not split one skill request across multiple `input_text` items.
