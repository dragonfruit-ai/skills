---
name: chompute-shopify-store-health
description: >-
  Run a comprehensive health audit on a Shopify store, scoring products,
  collections, SEO metadata, and policies on a 0-100 scale with prioritized
  action items.
---

# Chompute Shopify Store Health Dashboard

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ audit ready`

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
   - optional `topIssuesLimit` (how many example issues to include per category)

   Defaults:
   - `topIssuesLimit = 10`

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
     "topIssuesLimit": 10
   }
   ```

   Rules:
   - `store_domain` must be a string
   - `shopify_access_token` must be a string
   - `topIssuesLimit` is optional and must be a whole number between `1` and `50` if present
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
     "model": "shopify-store-health",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"topIssuesLimit\":10}"
           }
         ]
       }
     ]
   }
   ```

   Recommended shell pattern:

   ```bash
   export SHOPIFY_ACCESS_TOKEN=$(node ../get-shopify-store-session.js <store>.myshopify.com)
   PLUGIN_CHOMPUTE_ACCESS_KEY="${user_config.chompute_api_key}"
   if [ -n "$PLUGIN_CHOMPUTE_ACCESS_KEY" ] && [ "$PLUGIN_CHOMPUTE_ACCESS_KEY" != '${user_config.chompute_api_key}' ]; then
     export CHOMPUTE_API_KEY="$PLUGIN_CHOMPUTE_ACCESS_KEY"
   else
     export CHOMPUTE_API_KEY=${CHOMPUTE_API_KEY:-${CLAUDE_PLUGIN_OPTION_chompute_api_key:-${CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY:-$(tr -d '[:space:]' < ../chompute_key.txt)}}}
   fi
   PAYLOAD=$(node -e 'const payload={model:"shopify-store-health",input:[{role:"user",content:[{type:"input_text",text:JSON.stringify({store_domain:process.argv[1],shopify_access_token:process.env.SHOPIFY_ACCESS_TOKEN,topIssuesLimit:Number(process.argv[2])||10})}]}]}; process.stdout.write(JSON.stringify(payload));' "<store>.myshopify.com" "<topIssuesLimit>")
   curl -sS -X POST https://chompute-services.dragonfruit.ai/openai/v1/responses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ${CHOMPUTE_API_KEY}" \
     -d "$PAYLOAD"
   ```

   Chompute will do the deterministic work:
   - fetch the shop overview, all products, and all collections
   - score product data quality, SEO completeness, accessibility (alt text), collection coverage, and store policies
   - compute a weighted overall score on a 0-100 scale
   - generate a prioritized list of recommendations
   - return a markdown report plus a short summary object

4. **Report the result cleanly.**

   Response parsing rules:
   - expect an OpenAI Responses API envelope
   - read `output_text`
   - parse `output_text` as JSON
   - do not guess from `output[0]...` first if `output_text` is present

   Then:
   - tell the user the audit is ready
   - mention the headline numbers:
     - overall health score and grade
     - number of products audited
     - number of collections audited
     - how many of the 4 expected policies are present
   - render `report_markdown` directly in the chat
   - preserve any fenced `text` blocks exactly
   - do not reformat the fixed-width tables inside those code fences
   - do not convert the report tables into bullets or prose
   - do not dump the raw JSON object to the user

   Use plain language such as:

   > ✅ audit ready
   >
   > Overall health score: `82.50 / 100` (grade `B`) across `42` products and `7` collections.
   >
   > Here is the full report:

## Notes

- Never print the Shopify access token in chat.
- Never print the Chompute Access Key in chat.
- Keep the chat clean and do not paste raw API output.
- Do not split one skill request across multiple `input_text` items.
- This skill is read-only. It does not modify any Shopify data.
