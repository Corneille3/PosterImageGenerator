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

# Region where Lambda + API Gateway live (us-east-2 for your setup)
variable "region" { type = string }

# S3 bucket name (bucket is also in us-east-2 for your setup)
variable "bucket_name" { type = string }

# Bedrock region where SD 3.5 Large is available (us-west-2 for your setup)
variable "bedrock_region" { type = string }

# Bedrock model ID
variable "model_id" { type = string }

# S3 key prefix (e.g., "generated/" OR "generated")
variable "key_prefix" { type = string }

# Path to your repo's /lambda directory (e.g., "${path.root}/../../lambda" or "./lambda" from env dir)
variable "lambda_src_dir" { type = string }

# Presigned URL expiry
variable "url_expires_seconds" { type = number }

# -------------------------
# Provider
# -------------------------
provider "aws" {
  region = var.region
}

locals {
  # Ensure the prefix always becomes "something/"
  key_prefix_normalized = trimsuffix(var.key_prefix, "/")
  s3_prefix_for_keys    = "${local.key_prefix_normalized}/"
}

# -------------------------
# Package Lambda (zip)
# -------------------------
# NOTE: Do NOT use a build/ folder unless you create it.
# This writes the zip in the module folder reliably (works in GitHub Actions too).
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.lambda_src_dir
  output_path = "${path.module}/lambda_${var.env}.zip"
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
        Sid    = "S3WriteReadGenerated",
        Effect = "Allow",
        Action = ["s3:PutObject", "s3:GetObject"],
        Resource = "arn:aws:s3:::${var.bucket_name}/${local.key_prefix_normalized}/*"
      },

      # CloudWatch logs
      {
        Sid    = "CloudWatchLogs",
        Effect = "Allow",
        Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Resource = "*"
      }
    ]
  })
}

# -------------------------
# Lambda function
# -------------------------
resource "aws_lambda_function" "fn" {
  function_name = "poster-image-generator-${var.env}"
  role          = aws_iam_role.lambda_exec.arn

  # Your repo contains lambda/lambda_function.py, and we're zipping the /lambda folder,
  # so handler is correct.
  handler = "lambda_function.lambda_handler"
  runtime  = "python3.11"

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
    }
  }
}

# -------------------------
# API Gateway v2 (HTTP API) -> Lambda proxy
# -------------------------
resource "aws_apigatewayv2_api" "api" {
  name          = "poster-api-${var.env}"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.fn.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /moviePosterImageGenerator"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "stage" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# Allow API Gateway to invoke the Lambda
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
  value = "${aws_apigatewayv2_api.api.api_endpoint}/moviePosterImageGenerator"
}
