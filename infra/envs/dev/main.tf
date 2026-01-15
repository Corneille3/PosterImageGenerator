terraform {
  required_version = ">= 1.5.0"
}

module "poster_api" {
  source = "../../modules/poster_api"

  env                = "dev"
  region             = "us-east-2"
  bucket_name         = "myovieostermageenerator03"

  bedrock_region      = "us-west-2"
  model_id            = "stability.sd3-5-large-v1:0"

  key_prefix          = "generated/dev/"
  url_expires_seconds = 3600

  lambda_src_dir      = "${path.module}/../../../lambda"
}

output "api_url" {
  value = module.poster_api.api_url
}
