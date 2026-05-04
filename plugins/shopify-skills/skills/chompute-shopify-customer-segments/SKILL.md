---
name: chompute-shopify-customer-segments
description: >-
  Segment Shopify customers using RFM (Recency, Frequency, Monetary) analysis,
  preview the segment distribution, download a CSV of all customer tags, and
  apply the tags back to Shopify only after user approval.
---

# Chompute Shopify Customer Segmenter

Guide the user like a concierge.

Be short, friendly, and step-by-step.
Ask one question at a time.
Do not paste raw command output, tokens, logs, stack traces, or large raw JSON
walls into the chat.
Summarize progress cleanly with short lines like:

- `✅ Shopify setup ready`
- `✅ RFM preview ready`
- `✅ CSV ready`
- `✅ customer tags updated`

Only show technical details if something fails, and then only the relevant
error.

## Shared Local Setup

First follow the shared Shopify local setup instructions in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Rules

1. Always preview first.
2. Never apply customer tags before the user explicitly approves the preview.
3. Build exactly one JSON object payload for each Chompute call.
4. Put that payload into exactly one `input_text`.
5. Read `output_text` from the Chompute response and parse it as JSON.
6. Do not guess from `output[0]...` if `output_text` is present.
7. Use the fixed tag prefix `chompute-rfm`.
8. Every customer should end up with exactly one `chompute-rfm:*` tag after apply.

## Supported Actions

Use only these actions:
- `preview_segments`
- `apply_segments`
- `status_apply_segments`

There is no custom tag prefix in v1.

## Conversation Flow

1. Preview the segmentation through Chompute.
2. Show:
   - total customers
   - count per segment
   - short plain-English meaning for each segment
   - a few sample customers
   - the CSV download link
3. Explain that applying will:
   - remove old `chompute-rfm:*` tags
   - keep all non-RFM tags
   - add exactly one fresh `chompute-rfm:<Segment>` tag
4. After showing the preview, ask whether the user wants you to apply the tags.
5. If the user approves, apply the exact `resolved_customers` array from the latest preview.
6. The apply request returns immediately with a `job_id` and `status: queued`.
   Poll `status_apply_segments` every few seconds until `status` is `completed`
   or `failed`, then show the final `updated_customers` / `failed_customers`.

## Segment Meanings

When presenting the preview, explain the segments in simple merchant language:

- `Champions`: your best customers who buy often, recently, and spend the most
- `Loyal Customers`: reliable repeat customers who keep coming back
- `Potential Loyalists`: good recent customers who could become loyal with the right push
- `Recent Customers`: new or newly active customers who bought very recently
- `Promising`: early-stage customers who look worth nurturing
- `Need Attention`: decent customers who are starting to cool off
- `About to Sleep`: customers who are slipping and may soon become inactive
- `At Risk`: once-valuable customers who have not purchased recently
- `Can't Lose Them`: high-value customers who have gone quiet and need urgent win-back
- `Hibernating`: older, low-activity customers with weak recent engagement
- `Lost`: customers who look unlikely to return without a strong reactivation effort

## Required Local Commands

Export both values exactly as described in:

[`../shared/LOCAL_SETUP.md`](../shared/LOCAL_SETUP.md)

## Preview Request

Use this exact outer request shape:

```json
{
  "model": "shopify-customer-segments",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"preview_segments\",\"store_domain\":\"<string>\",\"shopify_access_token\":\"<string>\"}"
        }
      ]
    }
  ]
}
```

Notes:
- This preview returns the summary and a CSV download link.
- It also returns `resolved_customers`, which must be reused exactly on apply.

## Apply Request

After a successful preview, reuse the exact `resolved_customers` array from that preview.

Use this exact outer request shape:

```json
{
  "model": "shopify-customer-segments",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"apply_segments\",\"store_domain\":\"<string>\",\"shopify_access_token\":\"<string>\",\"resolved_customers\":[...]}"
        }
      ]
    }
  ]
}
```

Rules:
- do not edit `resolved_customers` manually
- do not rewrite Shopify IDs
- do not apply unless the user clearly approves

Apply is asynchronous. The response returns immediately with:

```json
{
  "status": "queued",
  "job_id": "<uuid>",
  "total_customers": <int>,
  "next_action": "status_apply_segments",
  "poll_interval_seconds": 5
}
```

Save the `job_id` and poll `status_apply_segments` until the job is terminal.

## Status Request

Use this while a job is running and while you still need to show progress:

```json
{
  "model": "shopify-customer-segments",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{\"action\":\"status_apply_segments\",\"job_id\":\"<uuid>\"}"
        }
      ]
    }
  ]
}
```

Polling rules:
- Wait `poll_interval_seconds` (default 5) between polls.
- Keep polling while `status` is `queued` or `running`. On each poll, briefly
  show the running counts, e.g. `applying tags... 42/120 customers processed`.
- Stop polling when `status` is `completed` or `failed`.
- If you poll for more than 10 minutes without reaching a terminal status, stop
  and surface the `job_id` so the user can retry manually.
- `status_apply_segments` does not consume Chompute credits.

## Important Clarifications

- Applying updates customers one by one in Shopify on a background worker, so
  larger stores can take several minutes but will not time out the request.
- This skill keeps non-RFM tags and only replaces tags starting with `chompute-rfm:`.
- Customers with no orders still get exactly one RFM tag based on recency and zero purchase behavior.
- Credits are charged once when the apply is queued, not per customer and not per poll.

## Endpoint

Use:

```text
POST https://chompute-services.dragonfruit.ai/openai/v1/responses
Content-Type: application/json
Authorization: Bearer <CHOMPUTE_API_KEY>
```
