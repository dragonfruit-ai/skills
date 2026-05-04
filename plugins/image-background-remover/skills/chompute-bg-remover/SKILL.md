---
name: chompute-bg-remover
description: >-
  Remove image backgrounds using Chompute's API, producing transparent PNG output.
  Use when the user asks to "remove background", "make background transparent",
  "extract subject from image", "cut out the background", "make a PNG with no background",
  or any task involving background removal from an image file or image URL.
  Do NOT use for general image editing, cropping, resizing, or format conversion.
---

# Chompute Background Remover

Removes the background from an image and produces a transparent PNG.

## Prerequisites

This skill requires a Chompute Access Key. Check for the key in this order:

1. Claude plugin configured Access Key: `${user_config.chompute_api_key}`
2. `CHOMPUTE_API_KEY`
3. `CLAUDE_PLUGIN_OPTION_chompute_api_key`
4. `CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY`
5. `chompute_key.txt` in this skill's directory (same folder as this SKILL.md)

If none of these exists or the value is empty, tell the user:

> You need a Chompute Access Key. Sign up and get one at:
> https://chompute.ai/skills
>
> Then configure the plugin's Chompute Access Key option, set
> `CHOMPUTE_API_KEY`, or save your key to:
> `<this skill's directory>/chompute_key.txt`

Stop and do not continue without a valid Access Key.

If a valid key is present, use it without printing it and tell the user:

> Valid Access Key present. Proceeding...

## Workflow

1. **Read the input image** attached or mentioned in the message. Do NOT
   automatically pick images from the folder. The image must be mentioned
   or attached by the user. The input may be either:
   - a local image file path, or
   - a direct HTTP(S) image URL

   If there is no image attached, mentioned, or linked, tell the user the
   following and then stop:

   > Please attach, mention, or provide an image URL whose background you want removed.

2. **Prepare the API input**:
   - If the input is a local file, base64-encode the file contents and send
     a `data:<MIME_TYPE>;base64,<BASE64_IMAGE>` value in `image_url`.
   - If the input is an HTTP(S) image URL, pass that URL directly in
     `image_url` without base64-encoding it yourself.

3. **Call the Chompute API** using the contract below. Use whatever HTTP
   method is available in the environment (curl, python, node, etc.).
   - When constructing the request, use the first non-empty Access Key from
     the prerequisite list above.
   - If you write shell commands, prefer this safe export pattern:

     ```bash
     PLUGIN_CHOMPUTE_ACCESS_KEY="${user_config.chompute_api_key}"
     if [ -n "$PLUGIN_CHOMPUTE_ACCESS_KEY" ] && [ "$PLUGIN_CHOMPUTE_ACCESS_KEY" != '${user_config.chompute_api_key}' ]; then
       export CHOMPUTE_API_KEY="$PLUGIN_CHOMPUTE_ACCESS_KEY"
     else
       export CHOMPUTE_API_KEY=${CHOMPUTE_API_KEY:-${CLAUDE_PLUGIN_OPTION_chompute_api_key:-${CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY:-$(tr -d '[:space:]' < "${CLAUDE_SKILL_DIR}/chompute_key.txt" 2>/dev/null)}}}
     fi
     ```

4. **Parse the response.** On success, extract the output image base64
   string and decode it to bytes.
   - If the input was a local file, save the output as `<input_stem>_output.png`
     in the same directory as the input image file.
   - If the input was an image URL, derive the file name from the URL path
     and save the output in the current working directory as `<url_stem>_output.png`.
     If the URL does not contain a usable file name, use `chompute_output.png`.

5. **On error**, show the error details to the user. If the API returns
   401, tell the user their Access Key may be invalid or expired and direct
   them to https://chompute.ai to check their account.

## API Contract

### Request

```
POST https://chompute-services.dragonfruit.ai/openai/v1/responses
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

Body:

```json
{
  "model": "apple_vision_bg_removal",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_image",
          "image_url": "<IMAGE_SOURCE>"
        }
      ]
    }
  ]
}
```

Where `<IMAGE_SOURCE>` is either:
- `data:<MIME_TYPE>;base64,<BASE64_IMAGE>` for a local file, or
- a direct HTTP(S) image URL

### Response

The response JSON contains an `output` array. Find the object where
`type` is `"image_generation_call"` — its `result` field holds the
base64-encoded PNG output.

Example (truncated):

```json
{
  "output": [
    {
      "type": "image_generation_call",
      "result": "iVBORw0KGgo..."
    }
  ]
}
```

Decode the `result` value from base64 to get the PNG bytes.
