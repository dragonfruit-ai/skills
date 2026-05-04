---
name: chompute-shopify-email-templates
description: >-
  Generate branded HTML notification email templates for a Shopify store
  (order confirmation, shipping, refund, abandoned cart, welcome, etc.).
---

# Chompute Shopify Notification Email Customizer

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ template ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Supported actions

| Action | Description |
|--------|-------------|
| `list_types` | Return the 9 notification types the skill supports. Free. |
| `generate` | Generate one branded HTML email template. Charges once. |
| `preview` | Same as `generate` but annotates where Liquid vars will render. Charges once. |

Supported notification types: `order_confirmation`, `shipping_confirmation`,
`shipping_update`, `delivery_confirmation`, `refund_notification`,
`abandoned_cart`, `welcome`, `password_reset`, `gift_card`.

## Workflow

1. **Collect missing inputs.**

   For `generate` and `preview`:
   - store domain
   - `notificationType` (required — one of the keys above)
   - optional `tone` (e.g. "warm and professional", "playful and modern")
   - optional `extras` (free-form extra instructions for the LLM)

   For `list_types`: no inputs beyond auth.

2. **Follow the shared local setup instructions.**

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

3. **Call the Chompute API once.**

   Payload shape (generate):

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "action": "generate",
     "notificationType": "order_confirmation",
     "tone": "warm and professional"
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
     "model": "shopify-email-templates",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"action\":\"generate\",\"notificationType\":\"order_confirmation\"}"
           }
         ]
       }
     ]
   }
   ```

   Chompute will:
   - fetch `shop.brand` (logo, colors, slogan)
   - generate a mobile-responsive HTML template with inline CSS and the right
     Liquid placeholders for the chosen notification type
   - return the suggested `subject` (Liquid-templated), the full `html` body,
     a short `html_preview_excerpt`, and `apply_instructions`

4. **Report the result cleanly.**
   - read `output_text`, parse JSON
   - tell the user which template was generated
   - show the suggested `subject` (it contains Liquid placeholders like
     `{{ order.name }}` that Shopify renders at send time)
   - paste `apply_instructions` to explain where in Shopify admin to apply it
   - do NOT dump the full `html` to chat unless the user asks — offer to show
     a preview excerpt or the full HTML on request

## Notes

- Never print the Shopify access token or Chompute Access Key in chat.
- This skill is read-only. The merchant pastes the generated HTML into
  **Shopify admin > Settings > Notifications**. Chompute does not modify any
  theme or notification template automatically in this release.
- `list_types` is free (0 credits). `generate` and `preview` each charge
  150 credits once.
