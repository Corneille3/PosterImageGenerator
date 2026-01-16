terraform {
  backend "s3" {
    bucket         = "corneille3-terraform-state-734401619562"
    key            = "poster-image/dev/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
