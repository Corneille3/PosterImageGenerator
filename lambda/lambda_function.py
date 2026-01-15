import os
import json
import uuid
import base64
import boto3
from datetime import datetime, timezone
from botocore.config import Config

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-west-2")
S3_REGION = os.environ.get("S3_REGION", "us-east-2")

MODEL_ID = os.environ.get("MODEL_ID", "stability.sd3-5-large-v1:0")
BUCKET_NAME = os.environ["BUCKET_NAME"]
KEY_PREFIX = os.environ.get("KEY_PREFIX", "generated/").strip()
URL_EXPIRES_SECONDS = int(os.environ.get("URL_EXPIRES_SECONDS", "3600"))

bedrock = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)

# Force SigV4 (important for consistent presigned URLs)
s3 = boto3.client(
    "s3",
    region_name=S3_REGION,
    config=Config(signature_version="s3v4"),
)

def _headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
    }

def _resp(code: int, payload: dict):
    return {"statusCode": code, "headers": _headers(), "body": json.dumps(payload)}

def lambda_handler(event, context):
    # CORS preflight
    if (event or {}).get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": _headers(), "body": json.dumps({"ok": True})}

    qsp = (event or {}).get("queryStringParameters") or {}

    # Supports Lambda test events {"prompt":"..."} and API GW proxy GET ?prompt=...
    prompt = (event or {}).get("prompt") or qsp.get("prompt") or ""
    prompt = str(prompt).strip()
    if not prompt:
        return _resp(400, {"error": "Missing required parameter: prompt"})

    negative_prompt = str((event or {}).get("negative_prompt") or qsp.get("negative_prompt") or "").strip()
    aspect_ratio = str((event or {}).get("aspect_ratio") or qsp.get("aspect_ratio") or "1:1").strip()
    output_format = str((event or {}).get("output_format") or qsp.get("output_format") or "png").strip()

    # SD3.5 allowed fields: prompt, negative_prompt, mode, strength, seed, output_format, image, aspect_ratio
    request_body = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "mode": "text-to-image",
        "seed": 0,
        "output_format": output_format,
        "aspect_ratio": aspect_ratio
    }

    br = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(request_body),
    )

    data = json.loads(br["body"].read())

    if "images" in data and data["images"]:
        image_b64 = data["images"][0]
    elif "artifacts" in data and data["artifacts"]:
        image_b64 = data["artifacts"][0].get("base64")
    else:
        return _resp(502, {"error": "No image in Bedrock response", "raw": data})

    image_bytes = base64.b64decode(image_b64)

    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    prefix = KEY_PREFIX if KEY_PREFIX.endswith("/") else f"{KEY_PREFIX}/"
    key = f"{prefix}{ts}-{uuid.uuid4().hex}.{output_format}"

    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=image_bytes,
        ContentType=f"image/{output_format}",
    )

    presigned_url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": BUCKET_NAME, "Key": key},
        ExpiresIn=URL_EXPIRES_SECONDS,
        HttpMethod="GET",
    )

    # Return only the presigned URL (clean)
    return _resp(200, {"presigned_url": presigned_url})