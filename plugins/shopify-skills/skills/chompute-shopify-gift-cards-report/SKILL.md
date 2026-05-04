---
name: chompute-shopify-gift-cards-report
description: >-
  Generate a CSV report of every gift card in a Shopify store, with balance,
  initial value, expiry, customer, and originating order. Optional filtering
  by enabled/disabled status. This skill is read-only - it does NOT create or
  modify any gift cards.
---

# Chompute Shopify Gift Cards Report

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ gift cards report ready`

Only show technical details if something fails, and then only the relevant
error.

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

The store must grant the `read_gift_cards` access scope.

## Workflow

1. **Collect missing inputs conversationally.**

   You need:
   - store domain

   Optional inputs:
   - `statusFilter`: `all`, `enabled`, or `disabled`

   Defaults:
   - `statusFilter = all`

   Ask plainly: do they want all gift cards, only currently enabled ones, or
   only disabled ones? If unsure, default to `all`.

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described
   in [`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md).

3. **Call the Chompute API once.**

   Construct exactly one JSON object for the skill payload with this shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "statusFilter": "all"
   }
   ```

   Rules:
   - `store_domain` must be a string
   - `shopify_access_token` must be a string
   - `statusFilter` must be one of `"all"`, `"enabled"`, `"disabled"`
   - build exactly one payload object
   - serialize that object into exactly one `input_text`

   Use:

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request shape:

   ```json
   {
     "model": "shopify-gift-cards-report",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"statusFilter\":\"all\"}"
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
   PAYLOAD=$(node -e 'process.stdout.write(JSON.stringify({model:"shopify-gift-cards-report",input:[{role:"user",content:[{type:"input_text",text:JSON.stringify({store_domain:process.argv[1],shopify_access_token:process.env.SHOPIFY_ACCESS_TOKEN,statusFilter:process.argv[2]||"all"})}]}]}))' "<store>.myshopify.com" "<statusFilter>")
   curl -sS -X POST https://chompute-services.dragonfruit.ai/openai/v1/responses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ${CHOMPUTE_API_KEY}" \
     -d "$PAYLOAD"
   ```

4. **Report the result cleanly.**

   Parse `output_text` as JSON. The response has the following shape:

   ```json
   {
     "status": "completed",
     "store_domain": "example.myshopify.com",
     "filename": "shopify-gift-cards-report.csv",
     "content_type": "text/csv",
     "size_bytes": 1234,
     "download_url": "https://...",
     "ttl_seconds": 86400,
     "ttl_human": "24 hours",
     "status_filter": "all",
     "summary": {
       "total_gift_cards_scanned": 48,
       "exported_count": 48,
       "enabled_count": 41,
       "disabled_count": 7,
       "currency_code": "USD",
       "total_outstanding_balance": 1420.50,
       "total_initial_value": 4670.50,
       "total_amount_redeemed": 3250.00
     }
   }
   ```

   Tell the user:
   - the report is ready
   - `summary.total_gift_cards_scanned` and `summary.exported_count`
   - `summary.total_outstanding_balance` and
     `summary.total_amount_redeemed` (with `summary.currency_code`)
   - the download link
   - that the link is valid for 24 hours

   Example:

   > ✅ gift cards report ready
   >
   > I scanned `48` gift cards (`41` enabled, `7` disabled). Outstanding
   > balance is `$1,420.50 USD`, redeemed `$3,250.00 USD`.
   >
   > Here is the download link: `<URL>`
   >
   > This file is valid for 24 hours.

## Notes

- This skill is read-only. It does NOT create, disable, or modify gift cards.
- Never print the Shopify access token or Chompute API key in chat.
- Do not split one skill request across multiple `input_text` items.
