---
name: chompute-shopify-setup
description: >-
  Fully set up Shopify for Chompute Shopify skills by checking whether Shopify
  CLI is available, installing the Shopify AI Toolkit skills, authenticating a
  store, and verifying that a local Shopify token can be read for Chompute
  Shopify skills.
---

# Chompute Shopify Setup

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, logs, or stack traces into the chat.
Summarize each completed step in one short line like:

- `✅ Shopify CLI ready`
- `✅ Shopify AI Toolkit installed`
- `✅ connected to my-store.myshopify.com`
- `✅ Shopify token ready`

Only show technical details if something fails, and then only the relevant
error.

When you need the next piece of user input, combine the progress summary and
the next question into a single message.
Do not send one message with a status update and then another message asking
the same-step question.
Do not restate the same question twice in different wording.

## Workflow

1. **Start with a short setup message.**

   Tell the user you are about to:
   - verify their Chompute/Juvant API key
   - check Shopify CLI
   - install the Shopify AI Toolkit skills
   - connect their store
   - verify the local Shopify token helper

2. **Check whether the Chompute/Juvant API key is available.**

   Check for the key in this order:
   - `CHOMPUTE_API_KEY`
   - `CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY`
   - `../chompute_key.txt` from this skill folder

   Do not print the key. If a key is present, summarize:
   `✅ API key ready`

   If no key is present, tell the user:

   > You need an API key from your Chompute or Juvant account. Set
   > `CHOMPUTE_API_KEY`, configure the plugin's Chompute API key option,
   > or save your key to the parent Shopify skills directory as
   > `chompute_key.txt`.

   Then stop.

3. **Check whether Shopify CLI is available.**

   Run quietly:

   ```bash
   shopify version
   ```

   If it fails, try:

   ```bash
   npm install -g @shopify/cli @shopify/theme
   shopify version
   ```

   If it succeeds, summarize:
   `✅ Shopify CLI ready`

4. **Install the Shopify AI Toolkit skills.**

   Run quietly:

   ```bash
   npx skills add Shopify/shopify-ai-toolkit
   ```

   If it succeeds, summarize:
   `✅ Shopify AI Toolkit installed`

5. **Ask for the store domain if it is not already known.**

   Ask one short question:

   > What’s your Shopify store domain? For example: `my-store.myshopify.com`

6. **Authenticate the store.**

   Always use the full default scope set below:

   ```text
   read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_inventory,write_inventory,read_locations,read_discounts,write_discounts,read_fulfillments,write_fulfillments,read_returns,write_returns,read_price_rules,write_price_rules,read_publications,write_publications,read_shopify_payments_payouts
   ```

   Run quietly:

   ```bash
   shopify store auth --store <store>.myshopify.com --scopes read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_inventory,write_inventory,read_locations,read_discounts,write_discounts,read_fulfillments,write_fulfillments,read_returns,write_returns,read_price_rules,write_price_rules,read_publications,write_publications,read_shopify_payments_payouts
   ```

   If it succeeds, summarize:
   `✅ connected to <store>.myshopify.com`

7. **Verify that the local Shopify token helper works.**

   Quietly run the helper script from the parent Shopify skills directory:

   ```bash
   node ../get-shopify-store-session.js <store>.myshopify.com >/dev/null
   ```

   If it succeeds, summarize:
   `✅ Shopify token ready`

   If it fails, show only the relevant error and stop.

8. **Finish with a short next-step menu.**

   Offer 3-5 next actions, for example:
   - Export customer data for a GDPR request
   - Find products that are running low on stock
   - Audit products missing SEO fields
   - Show abandoned checkouts from the last 7 days

   Ask the user to pick one or describe their goal.

## Notes

- Do not ask for the user's password or MFA code.
- The goal is to complete setup, not just inspect setup.
- Keep the chat clean and do not paste raw command output.
- This skill is safe to run multiple times.
