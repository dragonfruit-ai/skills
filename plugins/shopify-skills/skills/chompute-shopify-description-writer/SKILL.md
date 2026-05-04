---
name: chompute-shopify-description-writer
description: >-
  Find a Shopify product, generate a better product description draft with
  Chompute, revise it with the user, and apply the approved description back
  to Shopify.
---

# Chompute Shopify Description Writer

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, stack traces, or raw HTML walls
into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ product found`
- `✅ draft ready`
- `✅ description updated`

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

## User Flow

This skill is intentionally multi-turn.

Always follow this order:

1. Resolve the product.
2. Generate a preview draft.
3. Revise the draft if the user asks for changes.
4. Apply the description only after the user explicitly approves it.

Never update Shopify before the user clearly says yes.

## Workflow

1. **Collect missing inputs conversationally.**

   You need:
   - store domain
   - which product to work on

   Ask for the product in plain language:

   > Which product should I work on? You can give me the product title, handle,
   > SKU, or Shopify product ID.

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Resolve the product first.**

   Construct exactly one JSON payload object with this shape:

   ```json
   {
     "action": "resolve_product",
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "product_query": "<string>"
   }
   ```

   Use exactly one `input_text`.

   If the response says:
   - `match_status = "resolved"`:
     - confirm the product briefly with the user
   - `match_status = "ambiguous"`:
     - show the short candidate list and ask which one they mean
   - `match_status = "not_found"`:
     - ask them to try the title, handle, SKU, or product ID again

5. **Ask how the description should sound.**

   Once the product is resolved, ask one short follow-up:

   > How should I write it? For example: premium, playful, technical,
   > SEO-friendly, or you can describe your brand voice in your own words.

   Treat the answer as free text.

6. **Generate a preview draft.**

   Use the exact `internal_id` returned by the resolve step.

   Construct exactly one JSON payload object with this shape:

   ```json
   {
     "action": "preview_description",
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "product_internal_id": "<string>",
     "style_request": "<string>"
   }
   ```

   Response parsing rules:
   - expect an OpenAI Responses API envelope
   - read `output_text`
   - parse `output_text` as JSON
   - do not guess from `output[0]...` first if `output_text` is present

   Then:
   - tell the user the draft is ready
   - show the `description_preview_text`
   - ask whether they want:
     - changes to the draft
     - or to apply it to Shopify

7. **Revise the draft if the user wants changes.**

   If the user asks for edits, call Chompute again with:

   ```json
   {
     "action": "revise_description",
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "product_internal_id": "<string>",
     "draft_description_html": "<string>",
     "revision_request": "<string>",
     "style_request": "<string>"
   }
   ```

   Rules:
   - reuse the exact `description_html` from the latest successful preview or
     revise response
   - do not rewrite or prettify the HTML yourself
   - use the user’s latest feedback as `revision_request`

   Then show the new `description_preview_text` and ask again whether they want
   more changes or want to apply it.

8. **Apply the description only after approval.**

   If the user explicitly approves it, call Chompute with:

   ```json
   {
     "action": "apply_description",
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "product_internal_id": "<string>",
     "description_html": "<string>"
   }
   ```

   Rules:
   - reuse the exact latest `description_html`
   - do not modify it before sending
   - never apply automatically without approval

   Chompute will update Shopify directly and charge credits only on this final
   apply step.

9. **Report the final result cleanly.**

   After a successful apply, tell the user:
   - the product title
   - that the description was updated
   - that the approved draft is now live in Shopify

## Canonical Request Shape

Use:

```text
POST https://chompute-services.dragonfruit.ai/openai/v1/responses
Content-Type: application/json
Authorization: Bearer <CHOMPUTE_API_KEY>
```

Wrap the skill payload into exactly one `input_text`:

```json
{
  "model": "shopify-description-writer",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"resolve_product\",\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"product_query\":\"Minimal Snowboard\"}"
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
PAYLOAD=$(node -e 'const skillPayload=JSON.parse(process.argv[1]); const payload={model:"shopify-description-writer",input:[{role:"user",content:[{type:"input_text",text:JSON.stringify(skillPayload)}]}]}; process.stdout.write(JSON.stringify(payload));' '<SKILL_PAYLOAD_JSON>')
curl -sS -X POST https://chompute-services.dragonfruit.ai/openai/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CHOMPUTE_API_KEY}" \
  -d "$PAYLOAD"
```

## Notes

- Never print the Shopify access token in chat.
- Never print the Chompute API key in chat.
- Keep the chat clean and do not paste raw API output.
- Always preview first.
- Always reuse the exact latest `description_html` for revise/apply.
