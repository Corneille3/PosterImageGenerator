import os
import json
import uuid
import base64
import boto3
import secrets
import time
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr
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

DAILY_CREDITS = int(os.environ.get("DAILY_CREDITS", "10"))
CREDITS_RESET_SECONDS = int(os.environ.get("CREDITS_RESET_SECONDS", "86400"))

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
        "Access-Control-Allow-Methods": "GET,POST, DELETE, OPTIONS",
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


def get_history_item_by_sk(sub: str, target_sk: str):
    """
    Fetch a single history item for this user by exact sk.
    Returns the item dict or None.
    """
    if not table:
        return None

    resp = table.get_item(
        Key={"pk": _pk(sub), "sk": target_sk}
    )
    return resp.get("Item")


def get_credits(sub: str) -> int:
    if not table:
        return 0

    now = int(time.time())
    key = _credits_key(sub)

    resp = table.get_item(Key=key)
    item = resp.get("Item") or {}

    credits = item.get("credits")
    reset_at = item.get("resetAt")

    # If old record has no credits -> behave like lazy init (but now DAILY_CREDITS)
    if credits is None:
        # create/reset in-place best-effort
        try:
            table.update_item(
                Key=key,
                UpdateExpression="SET credits = if_not_exists(credits, :c), resetAt = if_not_exists(resetAt, :r), updatedAt = :u",
                ExpressionAttributeValues={
                    ":c": DAILY_CREDITS,
                    ":r": now + CREDITS_RESET_SECONDS,
                    ":u": datetime.now(timezone.utc).isoformat(),
                },
            )
        except Exception:
            pass
        return DAILY_CREDITS

    # If resetAt missing, treat it like expired and set one
    if reset_at is None:
        try:
            table.update_item(
                Key=key,
                UpdateExpression="SET resetAt = :r, updatedAt = :u",
                ExpressionAttributeValues={
                    ":r": now + CREDITS_RESET_SECONDS,
                    ":u": datetime.now(timezone.utc).isoformat(),
                },
            )
        except Exception:
            pass
        return int(credits)

    # Expired -> refill to DAILY_CREDITS
    if now >= int(reset_at):
        try:
            table.update_item(
                Key=key,
                UpdateExpression="SET credits = :c, resetAt = :r, updatedAt = :u",
                ExpressionAttributeValues={
                    ":c": DAILY_CREDITS,
                    ":r": now + CREDITS_RESET_SECONDS,
                    ":u": datetime.now(timezone.utc).isoformat(),
                },
            )
            return DAILY_CREDITS
        except Exception:
            return int(credits)

    return int(credits)

def reserve_credit_or_fail(sub: str) -> int:
    if not table:
        return -1

    now = int(time.time())
    key = _credits_key(sub)
    now_iso = datetime.now(timezone.utc).isoformat()

    # Attempt A: expired (or missing) -> reset to DAILY_CREDITS then decrement (remaining = DAILY_CREDITS - 1)
    try:
        resp = table.update_item(
            Key=key,
            UpdateExpression="SET credits = :new, resetAt = :r, updatedAt = :u",
            ConditionExpression="attribute_not_exists(resetAt) OR resetAt <= :now",
            ExpressionAttributeValues={
                ":new": DAILY_CREDITS - 1,
                ":r": now + CREDITS_RESET_SECONDS,
                ":u": now_iso,
                ":now": now,
            },
            ReturnValues="UPDATED_NEW",
        )
        return int(resp["Attributes"]["credits"])
    except ClientError as e:
        if e.response["Error"]["Code"] != "ConditionalCheckFailedException":
            raise

    # Attempt B: not expired -> decrement if credits > 0 (and lazy init if missing credits/resetAt)
    try:
        resp = table.update_item(
            Key=key,
            UpdateExpression="SET credits = if_not_exists(credits, :init) - :one, resetAt = if_not_exists(resetAt, :r), updatedAt = :u",
            ConditionExpression="attribute_not_exists(credits) OR credits > :zero",
            ExpressionAttributeValues={
                ":init": DAILY_CREDITS,
                ":one": 1,
                ":zero": 0,
                ":r": now + CREDITS_RESET_SECONDS,
                ":u": now_iso,
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
            ":false": False,
        },
        "FilterExpression": "attribute_not_exists(deleted) OR deleted = :false",
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


def handle_delete_history(event):
    if not table:
        return _resp(500, {"error": "DynamoDB table not configured"})

    sub = _user_sub(event)
    if not sub:
        return _resp(401, {"error": "Unauthorized"})

    body = _json_body(event)
    sk = body.get("sk")

    if not sk or not isinstance(sk, str):
        return _resp(400, {"error": "Missing or invalid 'sk'."})

    if not sk.startswith("GEN#"):
        return _resp(400, {"error": "Invalid 'sk' format."})

    pk = _pk(sub)

    # Optional: ensure the item exists and belongs to this user
    try:
        got = table.get_item(Key={"pk": pk, "sk": sk})
        item = got.get("Item")
        if not item:
            return _resp(404, {"error": "History item not found."})
    except Exception as e:
        return _resp(500, {"error": f"Failed to read history item: {str(e)}"})

    # Soft delete
    try:
        table.update_item(
            Key={"pk": pk, "sk": sk},
            UpdateExpression="SET deleted = :d",
            ExpressionAttributeValues={":d": True},
            ConditionExpression="attribute_exists(sk)",
        )
        return {"statusCode": 204, "headers": _headers(), "body": ""}

    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code == "ConditionalCheckFailedException":
            return _resp(404, {"error": "History item not found."})
        return _resp(500, {"error": "Failed to delete history item."})

    except Exception as e:
        return _resp(500, {"error": f"Failed to delete history item: {str(e)}"})


def handle_set_featured_history(event):
    if not table:
        return _resp(500, {"error": "DynamoDB table not configured"})

    sub = _user_sub(event)
    if not sub:
        return _resp(401, {"error": "Unauthorized"})

    body = _json_body(event)
    sk = body.get("sk")

    if not sk or not isinstance(sk, str) or not sk.startswith("GEN#"):
        return _resp(400, {"error": "Missing or invalid 'sk'."})

    pk = _pk(sub)

    # 0) Ensure target exists and isn't deleted
    try:
        got = table.get_item(Key={"pk": pk, "sk": sk})
        item = got.get("Item")
        if not item:
            return _resp(404, {"error": "History item not found."})
        if item.get("deleted") is True:
            return _resp(400, {"error": "Cannot feature a deleted item."})
    except Exception as e:
        return _resp(500, {"error": f"Failed to read target item: {str(e)}"})

    # 1) Find all currently featured items (best-effort cleanup)
    try:
        featured_sks = []
        eks = None

        while True:
            params = {
                "KeyConditionExpression": Key("pk").eq(pk) & Key("sk").begins_with("GEN#"),
                # ignore deleted + only featured=true
                "FilterExpression": (Attr("featured").eq(True)) & (Attr("deleted").ne(True)),
                "ProjectionExpression": "sk",
            }
            if eks:
                params["ExclusiveStartKey"] = eks

            resp = table.query(**params)
            for x in (resp.get("Items", []) or []):
                old_sk = x.get("sk")
                if old_sk:
                    featured_sks.append(old_sk)

            eks = resp.get("LastEvaluatedKey")
            if not eks:
                break

    except Exception as e:
        return _resp(500, {"error": f"Failed to query featured items: {str(e)}"})

    # 2) Unfeature all other featured items (best-effort)
    for old_sk in featured_sks:
        if old_sk == sk:
            continue
        try:
            table.update_item(
                Key={"pk": pk, "sk": old_sk},
                UpdateExpression="SET featured = :f",
                ExpressionAttributeValues={":f": False},
                ConditionExpression="attribute_exists(sk)",
            )
        except Exception:
            pass

    # 3) Feature selected item
    try:
        table.update_item(
            Key={"pk": pk, "sk": sk},
            UpdateExpression="SET featured = :t",
            ExpressionAttributeValues={":t": True},
            ConditionExpression="attribute_exists(sk)",
        )
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code == "ConditionalCheckFailedException":
            return _resp(404, {"error": "History item not found."})
        return _resp(500, {"error": "Failed to set featured item."})
    except Exception as e:
        return _resp(500, {"error": f"Failed to set featured item: {str(e)}"})

    return {"statusCode": 204, "headers": _headers(), "body": ""}


def get_featured(sub: str):
    if not table:
        return {"presigned_url": None, "sk": None}

    pk = _pk(sub)

    # We may need to scan multiple pages because "featured" is not in the key,
    # and FilterExpression is applied AFTER reading items.
    eks = None
    page_limit = 50
    max_pages = 10  # safety cap: up to 500 items scanned worst-case

    for _ in range(max_pages):
        params = {
            "KeyConditionExpression": "pk = :pk AND begins_with(sk, :gen)",
            "ExpressionAttributeValues": {
                ":pk": pk,
                ":gen": "GEN#",
                ":false": False,
                ":true": True,
            },
            # Ignore soft-deleted, require featured=true
            "FilterExpression": "(attribute_not_exists(deleted) OR deleted = :false) AND featured = :true",
            "Limit": page_limit,
            "ScanIndexForward": False,  # newest-first
        }
        if eks:
            params["ExclusiveStartKey"] = eks

        resp = table.query(**params)
        items = resp.get("Items", []) or []

        if items:
            it = items[0]
            key = it.get("s3Key")
            if not key:
                return {"presigned_url": None, "sk": it.get("sk")}

            url = s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": BUCKET_NAME, "Key": key},
                ExpiresIn=URL_EXPIRES_SECONDS,
                HttpMethod="GET",
            )
            return {"presigned_url": url, "sk": it.get("sk")}

        eks = resp.get("LastEvaluatedKey")
        if not eks:
            break

    return {"presigned_url": None, "sk": None}


def get_sub_from_event(event):
    rc = event.get("requestContext") or {}
    auth = rc.get("authorizer") or {}

    # HTTP API v2 JWT authorizer shape
    jwt = auth.get("jwt") or {}
    claims = jwt.get("claims") or {}

    # REST API / other shapes fallback
    if not claims:
        claims = auth.get("claims") or {}

    return claims.get("sub")


def get_http_path(event):
    # HTTP API v2
    if event.get("rawPath"):
        return event["rawPath"]

    rc = event.get("requestContext") or {}
    http = rc.get("http") or {}
    if http.get("path"):
        return http["path"]

    # Fallback (REST API / other)
    return event.get("path") or ""


def lambda_handler(event, context):
    event = event or {}

    # ✅ UPDATED: canonical method/path/sub parsing (as requested)
    method = (event.get("requestContext") or {}).get("http", {}).get("method") or event.get("httpMethod") or ""
    path = get_http_path(event)
    sub = get_sub_from_event(event)

     # CORS preflight (HTTP API v2)
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": _headers(), "body": json.dumps({"ok": True})}

    # ✅ PUBLIC: allow share fetch without auth
    if method == "GET" and "/share/" in path:
        return handle_get_share(event)

    # ✅ Everything else below requires auth
    if not sub:
        return _resp(401, {"error": "Unauthorized (missing JWT claims)"})
    # -------------------------
    # ROUTES (order matters)
    # -------------------------

    # 1) GET /moviePosterImageGenerator/history
    if method == "GET" and path.endswith("/history"):
        qsp = event.get("queryStringParameters") or {}
        try:
            limit = int(qsp.get("limit") or 20)
        except Exception:
            limit = 20

        cursor = qsp.get("cursor")
        data = get_history(sub=sub, limit=limit, cursor=cursor)
        return _resp(200, data)

    # 2) DELETE /moviePosterImageGenerator/history
    elif method == "DELETE" and path.endswith("/history"):
        return handle_delete_history(event)

    # 3) POST /moviePosterImageGenerator/history/featured
    elif method == "POST" and path.endswith("/history/featured"):
        return handle_set_featured_history(event)

    # 4) GET /moviePosterImageGenerator/featured
    elif method == "GET" and path.endswith("/featured"):
        data = get_featured(sub=sub)
        return _resp(200, data)

    # 5) GET /moviePosterImageGenerator/share/{id}  (public fetch share)

    # 6) POST /moviePosterImageGenerator/share  (create share link)
    elif method == "POST" and path.endswith("/share"):
        if not sub:
            return _resp(401, {"error": "Unauthorized"})
        return handle_create_share(event, sub=sub)

    # 7) GET /moviePosterImageGenerator  (credits)
    # Keep this LAST among GET routes, otherwise it could “catch” other GETs depending on path matching.
    elif method == "GET":
        credits = get_credits(sub)
        return _resp(200, {"credits": credits})

    # -------------------------
    # GENERATION (POST /moviePosterImageGenerator)
    # -------------------------
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

def handle_create_share(event, sub: str):
    try:
        body = event.get("body") or "{}"
        if isinstance(body, str):
            body = json.loads(body or "{}")

        sk = body.get("sk")
        expires_in = body.get("expiresInSeconds")  # optional

        if not sk:
            return _resp(400, {"error": "Missing sk"})

        # 1) Find the history item (must belong to the user)
        gen = get_history_item_by_sk(sub=sub, target_sk=sk)
        if not gen:
            return _resp(404, {"error": "History item not found"})

        status = (gen.get("status") or "").upper()
        if status != "SUCCESS":
            return _resp(400, {"error": "Only SUCCESS items can be shared"})

        s3_key = gen.get("s3Key")
        if not s3_key:
            return _resp(400, {"error": "No image available for this item"})

        # 2) Create shareId (unguessable)
        share_id = secrets.token_urlsafe(16)  # ~22 chars

        created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # 3) Optional expiry -> stored in `ttl` (epoch seconds)
        ttl = None
        if isinstance(expires_in, (int, float)) and int(expires_in) > 0:
            ttl = int(time.time()) + int(expires_in)

        share_item = {
            "pk": f"SHARE#{share_id}",
            "sk": "META",
            "createdAt": created_at,
            "s3Key": s3_key,
            "prompt": gen.get("prompt"),
        }
        if ttl:
            share_item["ttl"] = ttl

        table.put_item(Item=share_item)

        return _resp(200, {"shareId": share_id, "shareUrl": f"/share/{share_id}"})
    except Exception as e:
        return _resp(500, {"error": str(e) or "Create share failed"})


def handle_get_share(event):
    try:
        path = get_http_path(event)

        # Expect: /moviePosterImageGenerator/share/<id>
        share_id = path.rsplit("/share/", 1)[-1].strip("/")
        if not share_id:
            return _resp(400, {"error": "Missing share id"})

        resp = table.get_item(Key={"pk": f"SHARE#{share_id}", "sk": "META"})
        item = resp.get("Item")
        if not item:
            return _resp(404, {"error": "Share link not found"})

        ttl = item.get("ttl")
        if isinstance(ttl, (int, float)) and int(ttl) <= int(time.time()):
            return _resp(410, {"error": "Share link expired"})

        s3_key = item.get("s3Key")
        if not s3_key:
            return _resp(500, {"error": "Share item missing s3Key"})

        url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": BUCKET_NAME, "Key": s3_key},
            ExpiresIn=URL_EXPIRES_SECONDS,
            HttpMethod="GET",
        )

        return _resp(
            200,
            {
                "presigned_url": url,
                "prompt": item.get("prompt"),
                "createdAt": item.get("createdAt"),
            },
        )
    except Exception as e:
        return _resp(500, {"error": str(e) or "Get share failed"})
