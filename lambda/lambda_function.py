import os
import json
import uuid
import base64
import boto3
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from botocore.config import Config
from botocore.exceptions import ClientError

# Regions
BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-west-2")
S3_REGION = os.environ.get("S3_REGION", "us-east-2")

# Config
MODEL_ID = os.environ.get("MODEL_ID", "stability.sd3-5-large-v1:0").strip()
BUCKET_NAME = os.environ["BUCKET_NAME"].strip()
KEY_PREFIX = os.environ.get("KEY_PREFIX", "generated/").strip()
URL_EXPIRES_SECONDS = int(os.environ.get("URL_EXPIRES_SECONDS", "3600"))

# DynamoDB (credits + history)
DDB_TABLE_NAME = os.environ.get("DDB_TABLE_NAME", "").strip()
INITIAL_CREDITS = int(os.environ.get("INITIAL_CREDITS", "25"))
HISTORY_TTL_DAYS = int(os.environ.get("HISTORY_TTL_DAYS", "30"))

# AWS clients
bedrock = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
s3 = boto3.client("s3", region_name=S3_REGION, config=Config(signature_version="s3v4"))

ddb = boto3.resource("dynamodb", region_name=S3_REGION) if DDB_TABLE_NAME else None
table = ddb.Table(DDB_TABLE_NAME) if ddb else None

ALLOWED_ASPECT_RATIOS = {"1:1", "16:9", "9:16", "4:3", "3:4"}
ALLOWED_OUTPUT_FORMATS = {"png", "jpg", "jpeg"}


def _headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    }


def _json_safe(obj):
    if isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    if isinstance(obj, dict):
        return {k: _json_safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_json_safe(v) for v in obj]
    return obj


def _resp(code: int, payload: dict):
    return {
        "statusCode": code,
        "headers": _headers(),
        "body": json.dumps(_json_safe(payload)),
    }


def _method(event: dict) -> str:
    return (event.get("requestContext", {}).get("http", {}).get("method") or "").upper()


def _json_body(event: dict) -> dict:
    body = event.get("body")
    if not body:
        return {}
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8")
    try:
        return json.loads(body)
    except Exception:
        return {}


def get_claims(event: dict) -> dict:
    auth = event.get("requestContext", {}).get("authorizer", {})
    jwt = auth.get("jwt", {})
    return jwt.get("claims", {}) or {}


def _user_sub(event: dict) -> str | None:
    claims = get_claims(event)
    return claims.get("sub")


def _pk(sub: str) -> str:
    return f"USER#{sub}"


def _credits_key(sub: str) -> dict:
    return {"pk": _pk(sub), "sk": "CREDITS"}


def _history_sk(ts_iso: str, req_id: str) -> str:
    return f"GEN#{ts_iso}#{req_id}"


def _ttl_epoch(days: int) -> int:
    dt = datetime.now(timezone.utc) + timedelta(days=days)
    return int(dt.timestamp())


def _path(event: dict) -> str:
    return (event.get("rawPath") or event.get("requestContext", {}).get("http", {}).get("path") or "")

def _json_response(status_code: int, body: dict | None = None):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": "" if body is None else json.dumps(body),
    }

def _read_json_body(event) -> dict:
    body = event.get("body")
    if not body:
        return {}
    # If you support isBase64Encoded, decode here (optional)
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON body")


def get_credits(sub: str) -> int:
    """
    Read credits without modifying them.
    If credits item doesn't exist yet, return INITIAL_CREDITS to match lazy-init behavior.
    """
    if not table:
        return 0

    resp = table.get_item(Key=_credits_key(sub))
    item = resp.get("Item") or {}

    credits = item.get("credits")
    if credits is None:
        return int(INITIAL_CREDITS)

    return int(credits)


def reserve_credit_or_fail(sub: str) -> int:
    """
    Atomically:
      - initializes credits if missing (INITIAL_CREDITS)
      - decrements by 1
      - blocks if credits == 0
    Returns remaining credits AFTER decrement.
    """
    if not table:
        return -1

    try:
        resp = table.update_item(
            Key=_credits_key(sub),
            UpdateExpression="SET credits = if_not_exists(credits, :init) - :one, updatedAt = :now",
            ConditionExpression="attribute_not_exists(credits) OR credits > :zero",
            ExpressionAttributeValues={
                ":init": INITIAL_CREDITS,
                ":one": 1,
                ":zero": 0,
                ":now": datetime.now(timezone.utc).isoformat(),
            },
            ReturnValues="UPDATED_NEW",
        )
        return int(resp["Attributes"]["credits"])
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise ValueError("OUT_OF_CREDITS")
        raise


def refund_credit_best_effort(sub: str):
    if not table:
        return
    try:
        table.update_item(
            Key=_credits_key(sub),
            UpdateExpression="SET credits = credits + :one, updatedAt = :now",
            ExpressionAttributeValues={
                ":one": 1,
                ":now": datetime.now(timezone.utc).isoformat(),
            },
            ConditionExpression="attribute_exists(credits)",
        )
    except Exception:
        return


def write_history_best_effort(
    sub: str,
    ts_iso: str,
    req_id: str,
    prompt: str,
    aspect_ratio: str,
    output_format: str,
    status: str,
    s3_key: str | None = None,
    error_message: str | None = None,
):
    if not table:
        return

    item = {
        "pk": _pk(sub),
        "sk": _history_sk(ts_iso, req_id),
        "createdAt": ts_iso,
        "status": status,
        "prompt": prompt,
        "aspect_ratio": aspect_ratio,
        "output_format": output_format,
    }
    if s3_key:
        item["s3Key"] = s3_key
    if error_message:
        item["errorMessage"] = error_message

    if HISTORY_TTL_DAYS > 0:
        item["ttl"] = _ttl_epoch(HISTORY_TTL_DAYS)

    try:
        table.put_item(Item=item)
    except Exception:
        return


def get_history(sub: str, limit: int = 20, cursor: str | None = None):
    if not table:
        return {"items": [], "nextCursor": None}

    limit = max(1, min(limit, 50))

    eks = None
    if cursor:
        try:
            eks = json.loads(base64.urlsafe_b64decode(cursor + "==").decode("utf-8"))
        except Exception:
            eks = None

    params = {
        "KeyConditionExpression": "pk = :pk AND begins_with(sk, :gen)",
        "ExpressionAttributeValues": {
            ":pk": _pk(sub),
            ":gen": "GEN#",
        },
        "Limit": limit,
        "ScanIndexForward": False,
    }
    if eks:
        params["ExclusiveStartKey"] = eks

    resp = table.query(**params)
    items = resp.get("Items", [])

    for it in items:
        key = it.get("s3Key")
        if key:
            it["presigned_url"] = s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": BUCKET_NAME, "Key": key},
                ExpiresIn=URL_EXPIRES_SECONDS,
                HttpMethod="GET",
            )

    lek = resp.get("LastEvaluatedKey")
    next_cursor = None
    if lek:
        next_cursor = (
            base64.urlsafe_b64encode(json.dumps(lek).encode("utf-8"))
            .decode("utf-8")
            .rstrip("=")
        )

    return {"items": items, "nextCursor": next_cursor}


def lambda_handler(event, context):
    event = event or {}
    method = _method(event)

    # CORS preflight (HTTP API v2)
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": _headers(), "body": json.dumps({"ok": True})}

    # Identity (JWT authorizer must be enabled on the route)
    sub = _user_sub(event)
    if not sub:
        return _resp(401, {"error": "Unauthorized (missing JWT claims)"})

    path = _path(event)

    # --- HISTORY ENDPOINT ---
    if method == "GET" and path.endswith("/history"):
        qsp = event.get("queryStringParameters") or {}
        limit = int(qsp.get("limit") or 20)
        cursor = qsp.get("cursor")
        data = get_history(sub=sub, limit=limit, cursor=cursor)
        return _resp(200, data)

    # --- CREDITS ENDPOINT ---
    # GET /moviePosterImageGenerator -> return current credits (no prompt needed)
    if method == "GET":
        credits = get_credits(sub)
        return _resp(200, {"credits": credits})

    # Everything below here is generation
    qsp = event.get("queryStringParameters") or {}
    body = _json_body(event)

    prompt = (body.get("prompt") or qsp.get("prompt") or "").strip()
    if not prompt:
        return _resp(400, {"error": "Missing required parameter: prompt"})

    negative_prompt = (body.get("negative_prompt") or qsp.get("negative_prompt") or "").strip()

    aspect_ratio = (body.get("aspect_ratio") or qsp.get("aspect_ratio") or "1:1").strip()
    if aspect_ratio not in ALLOWED_ASPECT_RATIOS:
        return _resp(400, {"error": f"Invalid aspect_ratio. Allowed: {sorted(ALLOWED_ASPECT_RATIOS)}"})

    output_format = (body.get("output_format") or qsp.get("output_format") or "png").strip().lower()
    if output_format == "jpeg":
        output_format = "jpg"
    if output_format not in ALLOWED_OUTPUT_FORMATS:
        return _resp(400, {"error": f"Invalid output_format. Allowed: {sorted(ALLOWED_OUTPUT_FORMATS)}"})

    ts_iso = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    req_id = uuid.uuid4().hex

    try:
        remaining = reserve_credit_or_fail(sub)
    except ValueError as e:
        if str(e) == "OUT_OF_CREDITS":
            write_history_best_effort(
                sub=sub,
                ts_iso=ts_iso,
                req_id=req_id,
                prompt=prompt,
                aspect_ratio=aspect_ratio,
                output_format=output_format,
                status="FAILED",
                error_message="Out of credits",
            )
            return _resp(402, {"error": "Out of credits"})
        raise

    try:
        request_body = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "mode": "text-to-image",
            "seed": 0,
            "output_format": output_format,
            "aspect_ratio": aspect_ratio,
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
            raise RuntimeError(f"No image in Bedrock response: {data}")

        image_bytes = base64.b64decode(image_b64)

        ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        prefix = KEY_PREFIX if KEY_PREFIX.endswith("/") else f"{KEY_PREFIX}/"
        key = f"{prefix}{ts}-{req_id}.{output_format}"

        content_type = "image/png" if output_format == "png" else "image/jpeg"
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=image_bytes,
            ContentType=content_type,
        )

        presigned_url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": BUCKET_NAME, "Key": key},
            ExpiresIn=URL_EXPIRES_SECONDS,
            HttpMethod="GET",
        )

        write_history_best_effort(
            sub=sub,
            ts_iso=ts_iso,
            req_id=req_id,
            prompt=prompt,
            aspect_ratio=aspect_ratio,
            output_format=output_format,
            status="SUCCESS",
            s3_key=key,
        )

        payload = {"presigned_url": presigned_url}
        if remaining >= 0:
            payload["credits_remaining"] = remaining

        return _resp(200, payload)

    except Exception as e:
        refund_credit_best_effort(sub)

        write_history_best_effort(
            sub=sub,
            ts_iso=ts_iso,
            req_id=req_id,
            prompt=prompt,
            aspect_ratio=aspect_ratio,
            output_format=output_format,
            status="FAILED",
            error_message=str(e),
        )
        return _resp(502, {"error": "Generation failed"})
