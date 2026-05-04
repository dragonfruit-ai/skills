---
name: chompute-shopify-shipping-analyzer
description: >-
  Analyze Shopify shipping costs by carrier and region, flag high-shipping
  orders, and generate cost-optimization recommendations.
---

# Chompute Shopify Shipping Analyzer

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ shipping analysis ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - optional `periodDays` (days of orders to analyze; default 90)
   - optional `marginThreshold` (fraction of subtotal above which to flag an
     order as high-shipping; default 0.15 = 15%)

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "periodDays": 90,
     "marginThreshold": 0.15
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
     "model": "shopify-shipping-analyzer",
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

   Chompute will:
   - fetch orders for the period with shipping lines and shipping addresses
   - aggregate total shipping spend, average shipping per order, shipping % of
     subtotal, free-shipping count
   - build a carrier breakdown (orders / total / avg / avg-% per carrier)
   - build a region breakdown (orders / total / avg / avg-% per country)
   - flag orders where shipping is above `marginThreshold` of subtotal
   - generate concrete optimization recommendations
   - return a CSV download link plus a markdown report

4. **Report the result cleanly.**
   - read `output_text`, parse JSON
   - render `report_markdown` directly
   - call out the headline numbers (total spend, avg per order, high-shipping count)
   - mention the CSV for line-level detail

## Notes

- Never print the Shopify access token or Chompute Access Key in chat.
- This skill is read-only. It does not modify any Shopify data.
- Orders with no shipping address (digital goods) still show up with
  country `Unknown` and zero shipping — they do not distort averages because
  they have subtotal > 0 and shipping = 0.
