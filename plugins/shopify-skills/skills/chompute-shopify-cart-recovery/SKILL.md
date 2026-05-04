---
name: chompute-shopify-cart-recovery
description: >-
  Generate a branded abandoned-cart recovery email template + pull the most
  recent abandoned checkouts so the merchant can send personalized emails
  via their ESP.
---

# Chompute Shopify Abandoned Cart Recovery

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ recovery email ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - optional `hoursAgo` (window for abandoned checkouts; default 24)
   - optional `discountPercent` (default 10)
   - optional `discountDays` (default 7)
   - optional `maxEmails` (max checkouts to include; default 10, max 50)
   - optional `tone`

2. **Follow the shared local setup instructions.**

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "hoursAgo": 24,
     "discountPercent": 10,
     "discountDays": 7,
     "maxEmails": 10
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
     "model": "shopify-cart-recovery",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"hoursAgo\":24}"
           }
         ]
       }
     ]
   }
   ```

   Chompute will:
   - pull abandoned checkouts from the last `hoursAgo` hours
   - generate a reusable HTML template + subject line (one LLM call) with
     handlebars-style `{{placeholder}}` variables
   - return the template plus a list of checkouts with all the context
     needed to merge + send

4. **Report the result cleanly.**
   - read `output_text`, parse JSON
   - tell the user how many checkouts were found vs. how many emails they
     can send
   - share the template subject line
   - share the suggested `suggested_discount_code`
   - walk through `apply_instructions` — create the discount code in Shopify,
     merge the template with each checkout row, send via their ESP

## Notes

- Never print the Shopify access token or Chompute API key in chat.
- This skill is **preview-only** — Chompute does not send emails or create
  discount codes. The merchant uses the output to send via their own ESP
  (Klaviyo, Mailchimp, Omnisend, etc.) and create the code manually or
  via the `chompute-shopify-discount-creator` skill.
