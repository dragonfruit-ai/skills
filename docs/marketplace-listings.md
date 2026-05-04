# Marketplace Listing URLs

Use these URLs when submitting separate listings from this repository.

## Image Background Remover

- Listing URL: `https://github.com/dragonfruit-ai/skills/tree/main/plugins/image-background-remover`
- Standalone skill URL: `https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-bg-remover`
- Category: Image Processing
- Short description: Remove image backgrounds and save transparent PNG outputs from an AI agent.

## License Plate Recognizer

- Listing URL: `https://github.com/dragonfruit-ai/skills/tree/main/plugins/license-plate-recognizer`
- Standalone skill URL: `https://github.com/dragonfruit-ai/skills/tree/main/skills/chompute-lpr`
- Category: Computer Vision
- Short description: Read license plates from authorized vehicle images and return structured recognition data.

## Shopify Skills

- Listing URL: `https://github.com/dragonfruit-ai/skills/tree/main/plugins/shopify-skills`
- Category: Ecommerce
- Short description: Run Shopify store operations from an AI agent: reports, segments, discounts, product copy, stock alerts, exports, SEO, and more.

Shopify should be submitted as one bundle. Public copy should say it contains 27
Shopify workflow skills. The repository package also includes a setup helper
skill that prepares Shopify CLI authentication.

## Official marketplace installs

Claude Code:

```text
/plugin marketplace add dragonfruit-ai/skills
/plugin install image-background-remover@dragonfruit-skills
/plugin install license-plate-recognizer@dragonfruit-skills
/plugin install shopify-skills@dragonfruit-skills
```

Codex:

```bash
codex plugin marketplace add dragonfruit-ai/skills --ref main
```

