---
name: chompute-shopify-blog-writer
description: >-
  Generate an SEO blog post HTML for a Shopify store with optional automatic
  product links embedded in the body.
---

# Chompute Shopify Blog Writer

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ blog post ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Workflow

1. **Collect missing inputs.**

   You need:
   - store domain
   - `topic` (required — what the post should be about)
   - optional `wordCount` (default 800, range 200–2500)
   - optional `tone`
   - optional `keywords` (array of strings or comma-separated string)
   - optional `productSearchQuery` (Shopify product search query to scope
     the context, e.g. "winter jackets")
   - optional `includeProductLinks` (default true)

2. **Follow the shared local setup instructions.**

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "topic": "5 gift ideas for new hikers",
     "wordCount": 900,
     "tone": "friendly and expert",
     "keywords": ["beginner hiker", "gift guide"],
     "productSearchQuery": "hiking"
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
     "model": "shopify-blog-writer",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"topic\":\"5 gift ideas for new hikers\"}"
           }
         ]
       }
     ]
   }
   ```

   Chompute will:
   - fetch the store's blogs list (for reference)
   - optionally fetch products matching `productSearchQuery`
   - generate title, meta description, and HTML body via the LLM
   - embed anchor tags to relevant product URLs (first mention wins)
   - return the full HTML plus an excerpt

4. **Report the result cleanly.**
   - read `output_text`, parse JSON
   - show the title, meta description, and excerpt to the user
   - offer the full HTML on request
   - tell the user which `available_blogs` they can publish under

## Notes

- Never print the Shopify access token or Chompute Access Key in chat.
- This skill is **preview-only**. The merchant copies the HTML into Shopify
  admin > Online Store > Blog posts. A future PR can add an apply action
  behind its own credit charge.
