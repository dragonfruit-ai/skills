---
name: chompute-lpr
description: >-
  Detect and read license plates using Chompute's API, returning structured JSON
  with bounding boxes, OCR text, confidence, and per-character confidence values.
  Use when the user asks to detect license plates, read a plate from an image,
  run ALPR/LPR on an image, or extract plate text and bounding boxes from a local
  image file or image URL.
---

# Chompute License Plate Recognition

Detects license plates in an image and returns structured JSON with detection
and OCR results.

## Prerequisites

This skill requires a Chompute Access Key. Check for the key in this order:

1. `CHOMPUTE_API_KEY`
2. `CLAUDE_PLUGIN_OPTION_CHOMPUTE_API_KEY`
3. `chompute_key.txt` in this skill's directory (same folder as this SKILL.md)

If none of these exists or the value is empty, tell the user:

> You need a Chompute Access Key. Sign up and get one at:
> https://chompute.ai/skills
>
> Then set `CHOMPUTE_API_KEY`, configure the plugin's Chompute Access Key option,
> or save your key to: `<this skill's directory>/chompute_key.txt`

Stop and do not continue without a valid key file.

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

   > Please attach, mention, or provide an image URL for license plate recognition.

2. **Prepare the API input**:
   - If the input is a local file, base64-encode the file contents and send
     a `data:<MIME_TYPE>;base64,<BASE64_IMAGE>` value in `image_url`.
   - If the input is an HTTP(S) image URL, pass that URL directly in
     `image_url` without base64-encoding it yourself.

3. **Call the Chompute API** using the contract below. Use whatever HTTP
   method is available in the environment (curl, python, node, etc.).

4. **Parse the response.** On success, read the JSON in `output_text`
   and extract the LPR results.
   - `results` is a list of detections
   - each result can include:
     - `detection.bbox`
     - `detection.confidence`
     - `detection.label`
     - `ocr.text`
     - `ocr.confidence`
     - `ocr.char_confidences`
   - `lpr_model_config` contains model metadata

5. **Present the result clearly** to the user:
   - Do NOT say things like "the chompute-lpr skill found..." or otherwise
     make the summary sound like a tool log
   - Start with a natural summary in plain English
   - If one plate is found, say: `I found 1 license plate in the image. The
     plate reads <TEXT>.`
   - If multiple plates are found, say how many were detected and list the
     detected plate texts that have non-empty OCR values
   - If OCR text is missing for a detection, mention that a plate was detected
     but the text could not be read confidently
   - If `results` is empty, say: `I did not detect any license plate in this
     image.`
   - After the short summary, add a short non-technical explanation section
     called `What this means:`
   - In `What this means:`, include 2-4 short bullets, depending on what is
     available:
     - `Plate text: <TEXT>`
     - `OCR confidence: <PERCENT>%`
     - `Detection confidence: <PERCENT>%`
     - `Location in image: <plain English location if it can be inferred from the bbox, such as center-right or lower-left>`
   - Round confidence values to a friendly percentage format before showing
     them to the user
   - Keep the explanation concise and user-friendly; assume the reader is not
     technical
   - Then add a short label: `Technical details (JSON):`
   - Only after that label, provide the structured JSON result in a code block
   - Do NOT put the raw JSON immediately after the first sentence with no
     explanation

6. **On error**, show the error details to the user. If the API returns
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
  "model": "license-plate-recognition",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Use the license plate recognition skill on this image."
        },
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

The response JSON contains `output_text`, which is a JSON string representing
the LPR result.

Example (truncated):

```json
{
  "output_text": "{\n  \"lpr_model_config\": {\"detector_size\": 384},\n  \"results\": [{\"detection\": {\"bbox\": [787, 383, 863, 440], \"confidence\": 0.30, \"label\": \"license_plate\"}, \"ocr\": {\"text\": \"AXWV973\", \"confidence\": 0.99, \"char_confidences\": [0.99, 0.99]}}]\n}"
}
```

Parse `output_text` as JSON before presenting the final result.
