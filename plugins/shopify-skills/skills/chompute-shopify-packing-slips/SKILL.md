---
name: chompute-shopify-packing-slips
description: >-
  Generate a printable HTML packing slip bundle for one or more Shopify orders.
  Each order becomes its own page in a single self-contained HTML file with a
  CSS print break, ready to print or save as PDF from any browser. This skill
  is read-only - it does NOT modify orders, fulfillments, or anything else in
  Shopify.
---

# Chompute Shopify Packing Slips

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, or stack traces into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ Shopify token ready`
- `✅ packing slips ready`

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

The store must grant `read_orders` and `read_products` access scopes.

## Workflow

1. **Collect missing inputs conversationally.**

   **Required** inputs:
   - store domain
   - `orderIds` - one or more Shopify order GIDs

   Order GIDs look like `gid://shopify/Order/12345`. The user usually does
   NOT have these on hand - they have order names like `#1001` or admin
   URLs like `https://store.myshopify.com/admin/orders/12345`.

   How to help the user produce GIDs:
   - If the user gives an admin URL `.../admin/orders/12345`, convert it
     to `gid://shopify/Order/12345`.
   - If the user gives an order name like `#1001`, look it up via the
     Shopify Admin GraphQL API:

     ```graphql
     query {
       orders(first: 1, query: "name:#1001") {
         edges { node { id name } }
       }
     }
     ```

     and use the returned `id` as the GID.
   - If the user wants the most recent N orders, query
     `orders(first: N, sortKey: CREATED_AT, reverse: true)` and use each
     `id`.

   Always confirm which orders the user wants before generating the slips.

   **Optional** inputs:
   - `includePrices`: `true` or `false` (default `true`)
   - `customMessage`: short thank-you note to print on each slip
   - `logoUrl`: a public `https://` URL to a logo image

   Up to `100` orders per run.

2. **Follow the shared local setup instructions.**

   Export `SHOPIFY_ACCESS_TOKEN` and `CHOMPUTE_API_KEY` exactly as described
   in [`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md).

3. **Call the Chompute API once.**

   Payload shape:

   ```json
   {
     "store_domain": "<string>",
     "shopify_access_token": "<string>",
     "orderIds": ["gid://shopify/Order/12345"],
     "includePrices": true,
     "customMessage": "Thanks for your order!"
   }
   ```

   Rules:
   - `orderIds` must be a list of one or more Shopify order GIDs
   - `includePrices` must be `true` or `false`
   - `customMessage` must be a short string if provided
   - `logoUrl`, if provided, must be an `https://` URL

   Use:

   ```
   POST https://chompute-services.dragonfruit.ai/openai/v1/responses
   Content-Type: application/json
   Authorization: Bearer <CHOMPUTE_API_KEY>
   ```

   Canonical request shape:

   ```json
   {
     "model": "shopify-packing-slips",
     "input": [
       {
         "role": "user",
         "content": [
           {
             "type": "input_text",
             "text": "{\"store_domain\":\"example.myshopify.com\",\"shopify_access_token\":\"<SHOPIFY_ACCESS_TOKEN>\",\"orderIds\":[\"gid://shopify/Order/12345\"],\"includePrices\":true}"
           }
         ]
       }
     ]
   }
   ```

4. **Report the result cleanly.**

   Parse `output_text` as JSON. Tell the user:
   - the packing slips file is ready
   - how many orders are included
   - the download link
   - that the link is valid for 24 hours
   - to open the HTML in a browser and use Print -> Save as PDF

   Example:

   > ✅ packing slips ready
   >
   > I generated `5` packing slips into one HTML file.
   >
   > Here is the download link: `<URL>`
   >
   > Open it in any browser and print or Save as PDF. Each order is on its
   > own page.
   >
   > This file is valid for 24 hours.

## Notes

- This skill is read-only - it does NOT modify orders, fulfillments, or any
  other Shopify resource.
- Never print the Shopify access token or Chompute API key in chat.
- Do not split one skill request across multiple `input_text` items.
