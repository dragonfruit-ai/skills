---
name: chompute-shopify-announcement-bar
description: >-
  Generate on-brand announcement-bar copy variants for a Shopify store with a
  preview HTML snippet styled to the store's brand colors.
---

# Chompute Shopify Announcement Bar Writer

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ announcement ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - `occasion` (required — e.g. "Black Friday 30% off", "Free shipping over $75")
   - optional `tone` (default "punchy and urgent")
   - optional `linkUrl` (where clicking the bar should lead)
   - optional `variantCount` (default 5, max 10)
   - optional `startsAt` / `endsAt` (ISO timestamps for campaign window)

2. **Follow the shared local setup instructions.**

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "occasion": "Black Friday 30% off",
     "tone": "urgent but warm",
     "linkUrl": "https://example.com/sale",
     "variantCount": 5
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
     "model": "shopify-announcement-bar",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"occasion\":\"Black Friday 30% off\"}"
           }
         ]
       }
     ]
   }
   ```

   Chompute will:
   - fetch the store's brand (colors, slogan)
   - generate N announcement bar copy variants via the LLM
   - return each with text, emphasis angle, rationale, and character count
   - include a `preview_html_example` styled to the store's primary brand colors

4. **Report the result cleanly.**
   - read `output_text`, parse JSON
   - present each variant as a numbered list with the text and rationale
   - ask the user to pick one, then walk through `apply_instructions`

## Notes

- Never print the Shopify access token or Chompute Access Key in chat.
- This skill is **preview-only**. It does not modify the theme. The merchant
  pastes the chosen variant into their theme's announcement bar section.
