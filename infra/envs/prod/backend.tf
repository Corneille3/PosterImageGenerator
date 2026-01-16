terraform {
  backend "s3" {
    bucket         = "YOUR_STATE_BUCKET_NAME"
    key            = "poster-image/prod/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

