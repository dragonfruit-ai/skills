---
name: chompute-shopify-email-list
description: >-
  Export a Shopify customer email list in Mailchimp or Klaviyo CSV format,
  with optional consent filtering and optional segmentation by behavior or
  location.
---

# Chompute Shopify Email List

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ email list ready`

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
   - `espFormat`: `mailchimp` or `klaviyo`

   Optional inputs:
   - `consentOnly`: `true` or `false`
   - `segmentBy`: `behavior`, `location`, or `none`
   - `minOrders`
   - `minSpent`

   Defaults:
   - `consentOnly = true`
   - `segmentBy = behavior`
   - `minOrders = 0`
   - `minSpent = 0`

   Ask like this:
   - First ask which export target they want: Mailchimp or Klaviyo.
   - Then ask whether they want subscribed customers only. Explain this in
     plain language:
     - "Subscribed customers" means customers who have explicitly opted in to
       receive email marketing from the store.
     - "Everyone" means all customers with an email address, even if they did
       not opt in.
     - Default to subscribed customers only.
   - Then ask whether they want any extra filters like minimum orders or
     minimum spend. Explain the filters in simple language:
     - `minOrders` means only include customers who have placed at least that
       many orders.
     - `minSpent` means only include customers who have spent at least that
       amount in total.
     - If they do not want filters, do not ask for `minOrders` or `minSpent`.
   - Then ask whether they want segmentation by behavior, location, or none.
     Explain the choices:
     - `behavior` groups customers by how they shop, like Prospect,
       First-Time Buyer, Repeat Buyer, or VIP.
     - `location` groups customers by country.
     - `none` means a plain export with no segment grouping.

   Keep the questions simple and non-technical.

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Construct exactly one JSON object for the skill payload with this shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "espFormat": "mailchimp",
     "consentOnly": true,
     "segmentBy": "behavior",
     "minOrders": 0,
     "minSpent": 0
   }
   ```

   Rules:
   - `store_domain` must be a string
   - `shopify_access_token` must be a string
   - `espFormat` must be either `"mailchimp"` or `"klaviyo"`
   - `consentOnly` must be `true` or `false`
   - `segmentBy` must be `"behavior"`, `"location"`, or `"none"`
   - `minOrders` must be a non-negative whole number
   - `minSpent` must be a non-negative number
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
     "model": "shopify-email-list",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"espFormat\":\"mailchimp\",\"consentOnly\":true,\"segmentBy\":\"behavior\",\"minOrders\":0,\"minSpent\":0}"
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
   PAYLOAD=$(node -e 'const payload={model:"shopify-email-list",input:[{role:"user",content:[{type:"input_text",text:JSON.stringify({store_domain:process.argv[1],shopify_access_token:process.env.SHOPIFY_ACCESS_TOKEN,espFormat:process.argv[2],consentOnly:process.argv[3]!=="false",segmentBy:process.argv[4],minOrders:Number(process.argv[5]||0),minSpent:Number(process.argv[6]||0)})}]}]}; process.stdout.write(JSON.stringify(payload));' "<store>.myshopify.com" "<espFormat>" "<consentOnly>" "<segmentBy>" "<minOrders>" "<minSpent>")
   curl -sS -X POST https://chompute-services.dragonfruit.ai/openai/v1/responses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ${CHOMPUTE_API_KEY}" \
     -d "$PAYLOAD"
   ```

   Chompute will do the deterministic work:
   - fetch Shopify customers
   - filter by consent, minimum orders, and minimum spend
   - segment by behavior or location if requested
   - format the CSV for Mailchimp or Klaviyo
   - upload the CSV and return the final download URL

5. **Report the result cleanly.**

   Response parsing rules:
   - expect an OpenAI Responses API envelope
   - read `output_text`
   - parse `output_text` as JSON
   - do not guess from `output[0]...` first if `output_text` is present

   Then tell the user:
   - the export is ready
   - which target format was used
   - how many customers were scanned
   - how many were exported
   - whether subscribed-only filtering was applied
   - any segment breakdown if present
   - the download link
   - that the link is valid for 24 hours

   Use plain language such as:

   > ✅ email list ready
   >
   > I exported `248` customers for `Mailchimp`.
   >
   > Here is the download link: `<URL>`
   >
   > This file is valid for 24 hours.

## Notes

- Never print the Shopify access token in chat.
- Never print the Chompute Access Key in chat.
- Keep the chat clean and do not paste raw API output.
- Do not split one skill request across multiple `input_text` items.
