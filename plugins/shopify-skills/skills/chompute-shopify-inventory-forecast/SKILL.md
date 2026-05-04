---
name: chompute-shopify-inventory-forecast
description: >-
  Forecast Shopify stockout timing and reorder recommendations from 12 months
  of order history.
---

# Chompute Shopify Inventory Forecast

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ forecast ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - optional `leadTimeDays` (supplier lead time, default 14)
   - optional `safetyStockDays` (buffer days, default 7)
   - optional `historyDays` (order history window, default 365)
   - optional `locationId` (narrow to one warehouse; format `gid://shopify/Location/<id>`)

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "leadTimeDays": 14,
     "safetyStockDays": 7,
     "historyDays": 365
   }
   ```

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request:

   ```json
   {
     "model": "shopify-inventory-forecast",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"leadTimeDays\":14}"
           }
         ]
       }
     ]
   }
   ```

   Chompute will deterministically:
   - fetch every tracked inventory item with per-location `available`,
     `incoming`, `committed`, `reserved` quantities
   - fetch orders for the history window and aggregate units sold per variant
   - compute daily sales rate, days until stockout, reorder-by date, and
     suggested reorder quantity
   - classify each item as CRITICAL / WARNING / OK
   - return a CSV download link plus a markdown report

4. **Report the result cleanly.**
   - read `output_text`, parse JSON
   - call out summary counts (CRITICAL / WARNING / OK, items without sales)
   - render `report_markdown` directly
   - mention the CSV download link so the user can act on the full list
   - do not dump raw JSON

## Notes

- Never print the Shopify access token or Chompute API key in chat.
- This skill is read-only. It does not modify any Shopify data.
- Items whose `tracked` flag is false in Shopify are skipped.
- Items with no sales in the history window are classified as OK (stockout
  horizon is unknown, not imminent).
