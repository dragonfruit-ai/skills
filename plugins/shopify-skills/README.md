# Shopify Skills Plugin

This is one installable Shopify operations bundle for AI agents. It contains 27
Shopify workflow skills plus a setup helper.

Use it when a merchant or operator wants Claude Code, Codex, Cursor, or a
similar agent to run Shopify store operations directly inside their workflow.

## Included workflow skills

- Abandoned cart recovery
- Announcement bar writer
- Blog post writer
- Broken links report
- Bulk discount creator
- Cross-sell recommender
- Customer data exporter
- Customer lifetime value
- Customer segmentation
- Email list export
- Email template designer
- Gift cards report
- Inventory forecast
- Loyalty points calculator
- Low stock alert
- Order analytics
- Packing slips generator
- Product description writer
- Product feed generator
- Profit calculator
- Schema markup generator
- Shipping analyzer
- Sitemap and SEO audit
- Smart collection builder
- Store health dashboard
- Theme backup
- Win-back campaign

The package also includes `chompute-shopify-setup`, a setup helper skill.

## Claude Code

```text
/plugin marketplace add dragonfruit-ai/skills
/plugin install shopify-skills@chompute-skills
/reload-plugins
```

Start with:

```text
/shopify-skills:chompute-shopify-setup Set up my Shopify store.
```

Then try:

```text
/shopify-skills:chompute-shopify-order-analytics Show me order analytics for the last 30 days.
```

## Codex

```bash
codex plugin marketplace add dragonfruit-ai/skills --ref main
```

Then open `/plugins`, select **Chompute Skills**, and install **Shopify
Skills**.

## Shopify permissions and approval

Shopify Skills are preview-first. Reports, drafts, previews, and exports can be
generated directly. Before applying write actions such as discounts, tags,
product description updates, metafields, or collection changes, the agent should
show a preview and ask for user approval.

Only connect stores the user owns, manages, or is authorized to operate.

## Authentication

Sign up at `https://chompute.ai/skills` to get your Access Key. Then configure
the Claude Code plugin Access Key field, set `CHOMPUTE_API_KEY`, or use the
legacy `chompute_key.txt` file in the parent Shopify skills directory.

The setup helper also uses Shopify CLI authentication to obtain a local Shopify
store session. Do not commit Shopify tokens or Access Keys.
