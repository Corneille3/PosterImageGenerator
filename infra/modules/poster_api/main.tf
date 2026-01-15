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

variable "env" { type = string }
variable "region" { type = string }
variable "bucket_name" { type = string }
variable "bedrock_region" { type = string }
variable "model_id" { type = string }
variable "key_prefix" { type = string }
variable "lambda_src_dir" { type = string } # path to /lambda
variable "url_expires_seconds" { type = number }

provider "aws" {
  region = var.region
}

# Zip lambda from repo source
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.lambda_src_dir
  output_path = "${path.module}/build/lambda_${var.env}.zip"
}

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
      # Bedrock invoke (model is in us-west-2; permission is account-wide; region is in SDK client)
      {
        Effect = "Allow",
        Action = ["bedrock:InvokeModel"],
        Resource = "*"
      },

      # S3 write + read for presigning (limit to prefix)
      {
        Effect = "Allow",
        Action = ["s3:PutObject", "s3:GetObject"],
        Resource = "arn:aws:s3:::${var.bucket_name}/${var.key_prefix}*"
      },

      # Logs
      {
        Effect = "Allow",
        Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "fn" {
  function_name = "poster-image-generator-${var.env}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  filename      = data.archive_file.lambda_zip.output_path

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 60
  memory_size      = 256

  environment {
    variables = {
      BUCKET_NAME         = var.bucket_name
      KEY_PREFIX          = var.key_prefix
      URL_EXPIRES_SECONDS = tostring(var.url_expires_seconds)
      BEDROCK_REGION      = var.bedrock_region
      S3_REGION           = var.region
      MODEL_ID            = var.model_id
    }
  }
}

# HTTP API (API Gateway v2)
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

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-${var.env}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fn.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

output "api_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}
