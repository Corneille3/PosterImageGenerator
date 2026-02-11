terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

# -------------------------
# Variables
# -------------------------
variable "env" { type = string }
variable "region" { type = string }

variable "bucket_name" { type = string }
variable "bedrock_region" { type = string }
variable "model_id" { type = string }
variable "key_prefix" { type = string }
variable "lambda_src_dir" { type = string }
variable "url_expires_seconds" { type = number }

# This is Optional in case customization is needed.
variable "api_route_path" {
  type    = string
  default = "/moviePosterImageGenerator"
}

#Add variables for credits/history
variable "initial_credits" {
  type    = number
  default = 25
}

variable "history_ttl_days" {
  type    = number
  default = 30
}


# -------------------------
# Provider
# -------------------------
provider "aws" {
  region = var.region
}

locals {
  key_prefix_normalized = trimsuffix(var.key_prefix, "/")
  s3_prefix_for_keys    = "${local.key_prefix_normalized}/"
}

# -------------------------
# Package Lambda (zip)
# -------------------------
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.lambda_src_dir
  output_path = "${path.module}/lambda_${var.env}.zip"
}

resource "aws_dynamodb_table" "app" {
  name         = "poster-app-${var.env}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Project = "PosterImageGenerator"
    Env     = var.env
  }
}

# -------------------------
# IAM: Lambda execution role + inline policy
# -------------------------
resource "aws_iam_role" "lambda_exec" {
  name = "poster-image-${var.env}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "poster-image-${var.env}-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      # Bedrock invoke
      {
        Sid      = "BedrockInvoke",
        Effect   = "Allow",
        Action   = ["bedrock:InvokeModel"],
        Resource = "*"
      },

      # S3 Put/Get limited to the prefix
      {
        Sid      = "S3WriteReadGenerated",
        Effect   = "Allow",
        Action   = ["s3:PutObject", "s3:GetObject"],
        Resource = "arn:aws:s3:::${var.bucket_name}/${local.key_prefix_normalized}/*"
      },

      # CloudWatch logs
      {
        Sid      = "CloudWatchLogs",
        Effect   = "Allow",
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Resource = "*"
      },
            # DynamoDB (credits + history)
      {
        Sid    = "DynamoDBCreditsHistory",
        Effect = "Allow",
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ],
        Resource = [
          aws_dynamodb_table.app.arn,
          "${aws_dynamodb_table.app.arn}/index/*"
        ]
      },

    ]
  })
}

# -------------------------
# Lambda function
# -------------------------
resource "aws_lambda_function" "fn" {
  function_name = "poster-image-generator-${var.env}"
  role          = aws_iam_role.lambda_exec.arn

  handler = "lambda_function.lambda_handler"
  runtime = "python3.11"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  timeout     = 60
  memory_size = 256

  environment {
    variables = {
      BUCKET_NAME         = var.bucket_name
      KEY_PREFIX          = local.s3_prefix_for_keys
      URL_EXPIRES_SECONDS = tostring(var.url_expires_seconds)

      BEDROCK_REGION = var.bedrock_region
      S3_REGION      = var.region
      MODEL_ID       = var.model_id

      DDB_TABLE_NAME        = aws_dynamodb_table.app.name
      INITIAL_CREDITS       = tostring(var.initial_credits)
      HISTORY_TTL_DAYS      = tostring(var.history_ttl_days)

      # New environment variables for daily credits and reset
      DAILY_CREDITS         = "10"      # You can change this value
      CREDITS_RESET_SECONDS = "86400"   # 86400 seconds = 24 hours
    }
  }
}

# -------------------------
# API Gateway v2 (HTTP API)
# -------------------------
resource "aws_apigatewayv2_api" "api" {
  name          = "poster-api-${var.env}"
  protocol_type = "HTTP"

#cors configuration
  cors_configuration {
  allow_origins = ["http://localhost:3000"]  # tighten later for prod
  allow_methods = ["GET", "POST", "DELETE", "OPTIONS"]
  allow_headers = ["Content-Type", "Authorization"]
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.fn.arn
  payload_format_version = "2.0"
}

# -------------------------
# Cognito (User Pool + App Client)
# -------------------------
resource "aws_cognito_user_pool" "pool" {
  name = "poster-users-${var.env}"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "poster-client-${var.env}"
  user_pool_id = aws_cognito_user_pool.pool.id

  # Valid ranges:
  # - minutes: access/id token validity: 5..1440
  # - days: refresh token validity: 1..3650
  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  generate_secret = false
}

# -------------------------
# API Gateway JWT Authorizer
# -------------------------
resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id          = aws_apigatewayv2_api.api.id
  name            = "cognito-jwt-${var.env}-${aws_cognito_user_pool.pool.id}"
  authorizer_type = "JWT"

  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    issuer   = "https://cognito-idp.${var.region}.amazonaws.com/${aws_cognito_user_pool.pool.id}"
    audience = [aws_cognito_user_pool_client.client.id]
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -------------------------
# Protected route (requires JWT)
# -------------------------
# GET /moviePosterImageGenerator  (credits read)
resource "aws_apigatewayv2_route" "poster_get" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET ${var.api_route_path}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# POST /moviePosterImageGenerator (generate)
resource "aws_apigatewayv2_route" "poster_post" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST ${var.api_route_path}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# GET /moviePosterImageGenerator/history
resource "aws_apigatewayv2_route" "history_get" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET ${var.api_route_path}/history"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# DELETE /moviePosterImageGenerator/history
resource "aws_apigatewayv2_route" "history_delete" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "DELETE ${var.api_route_path}/history"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# POST /moviePosterImageGenerator/history/featured  (pin)
resource "aws_apigatewayv2_route" "history_featured_post" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST ${var.api_route_path}/history/featured"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# GET /moviePosterImageGenerator/featured  (optional hero-only endpoint)
resource "aws_apigatewayv2_route" "featured_get" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET ${var.api_route_path}/featured"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# POST /moviePosterImageGenerator/share  (create share link)
resource "aws_apigatewayv2_route" "share_post" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST ${var.api_route_path}/share"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}
# GET /moviePosterImageGenerator/share/{id}  (public share view)
resource "aws_apigatewayv2_route" "share_get" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET ${var.api_route_path}/share/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  # Public endpoint by design (no JWT)
  authorization_type = "NONE"
}

resource "aws_apigatewayv2_stage" "stage" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-${var.env}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fn.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# -------------------------
# Outputs
# -------------------------
output "api_base_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

output "invoke_url" {
  value = "${aws_apigatewayv2_api.api.api_endpoint}${var.api_route_path}"
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "cognito_app_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "ddb_table_name" {
  value = aws_dynamodb_table.app.name
}

output "cognito_issuer" {
  value = "https://cognito-idp.${var.region}.amazonaws.com/${aws_cognito_user_pool.pool.id}"
}