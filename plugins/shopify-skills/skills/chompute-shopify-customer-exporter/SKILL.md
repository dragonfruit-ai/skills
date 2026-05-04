---
name: chompute-shopify-customer-exporter
description: >-
  Export all data held about a specific Shopify customer into a downloadable
  JSON file or zipped CSV export for GDPR data subject access requests (DSAR).
---

# Chompute Shopify Customer Data Exporter

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ export ready`

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
   - customer email
   - export format: `json` or `csv`

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
     "customer_email": "<string>",
     "format": "json"
   }
   ```

   Rules:
   - `store_domain` must be a string
   - `shopify_access_token` must be a string
   - `customer_email` must be a string
   - `format` must be either `"json"` or `"csv"`
   - build exactly one payload object
   - serialize that object into exactly one `input_text`
   - do not split these fields across multiple `input_text` parts
   - do not hand-write large inline JSON if you can avoid it
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
     "model": "shopify-customer-exporter",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"customer_email\":\"jane@example.com\",\"format\":\"json\"}"
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
   PAYLOAD=$(node -e 'const payload={model:"shopify-customer-exporter",input:[{role:"user",content:[{type:"input_text",text:JSON.stringify({store_domain:process.argv[1],shopify_access_token:process.env.SHOPIFY_ACCESS_TOKEN,customer_email:process.argv[2],format:process.argv[3]})}]}]}; process.stdout.write(JSON.stringify(payload));' "<store>.myshopify.com" "<customer_email>" "<format>")
   curl -sS -X POST https://chompute-services.dragonfruit.ai/openai/v1/responses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ${CHOMPUTE_API_KEY}" \
     -d "$PAYLOAD"
   ```

   Chompute will do the Shopify API reads, assemble the export, upload the file,
   and return the final download URL.

5. **Report the result cleanly.**

   Response parsing rules:
   - expect an OpenAI Responses API envelope
   - read `output_text`
   - parse `output_text` as JSON
   - do not guess from `output[0]...` first if `output_text` is present

   Then tell the user:
   - the export is ready
   - the customer email
   - how many orders, addresses, and metafields were included
   - the download link
   - whether the output is JSON or a zip of CSV files
   - that the link is valid for 24 hours

   Use plain language such as:

   > ✅ export ready
   >
   > I exported data for `jane@example.com`.
   >
   > Here is the download link: `<URL>`
   >
   > This file is valid for 24 hours.

## Notes

- Never print the Shopify access token in chat.
- Never print the Chompute API key in chat.
- Keep the chat clean and do not paste raw API output.
- Do not split one skill request across multiple `input_text` items.
