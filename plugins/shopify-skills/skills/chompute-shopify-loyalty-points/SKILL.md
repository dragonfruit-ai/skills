---
name: chompute-shopify-loyalty-points
description: >-
  Compute Shopify customer loyalty points and tier assignments (Bronze / Silver
  / Gold / Platinum) from spend history.
---

# Chompute Shopify Loyalty Points Calculator

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ points calculated`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - optional `rules` object: `{ "pointsPerDollar": 1, "signupBonus": 50 }`
   - optional `tiers` array, each `{ "name": "Bronze", "threshold": 0, "multiplier": 1.0 }`
   - optional `topLimit` (top customers to include in the report; default 25)

   Defaults: Bronze (0 pts, 1x), Silver (500 pts, 1.25x), Gold (2000 pts, 1.5x),
   Platinum (5000 pts, 2x).

2. **Follow the shared local setup instructions.**

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "rules": { "pointsPerDollar": 1, "signupBonus": 50 },
     "tiers": [
       { "name": "Bronze", "threshold": 0, "multiplier": 1.0 },
       { "name": "Silver", "threshold": 500, "multiplier": 1.25 },
       { "name": "Gold", "threshold": 2000, "multiplier": 1.5 },
       { "name": "Platinum", "threshold": 5000, "multiplier": 2.0 }
     ]
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
     "model": "shopify-loyalty-points",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\"}"
           }
         ]
       }
     ]
   }
   ```

   Chompute will:
   - fetch all customers with their lifetime `amountSpent`
   - compute base points (floor of spend * pointsPerDollar)
   - apply the matching tier multiplier + signup bonus
   - assign a final tier
   - return a CSV with every customer and a markdown report with tier distribution
     and top customers

4. **Report the result cleanly.**
   - read `output_text`, parse JSON
   - render `report_markdown` directly
   - highlight tier distribution and the CSV download link

## Notes

- Never print the Shopify access token or Chompute API key in chat.
- This skill is **preview-only**. It does not write any metafields to Shopify.
  If the user wants to persist the points and tier to customer metafields,
  they can use the `chompute_loyalty.points` and `chompute_loyalty.tier`
  metafield keys suggested in the response `notes` field.
