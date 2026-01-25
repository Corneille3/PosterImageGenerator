# PosterImageGenerator

A secure, credit-based AI poster generation web app using AWS Bedrock, Cognito, and Next.js.

Users authenticate via Cognito, generate AI images, consume credits per generation, and receive presigned S3 URLs for the results.

---

## Architecture Overview

**Frontend**
- Next.js (App Router, TypeScript)
- NextAuth with AWS Cognito (OIDC)
- Server-side API proxy for secure backend calls

**Backend**
- AWS Lambda (Python 3.11)
- AWS Bedrock (text-to-image)
- S3 (image storage + presigned URLs)
- DynamoDB (credits + generation history)
- API Gateway HTTP API + JWT authorizer

**Auth**
- Cognito Hosted UI
- JWT-based authorization
- Cognito groups (`admin`) for role-based access

---

## Repository Structure

cd infra/envs/dev
terraform init
terraform apply

## Authentication Notes

Frontend uses NextAuth + Cognito Hosted UI

Backend API is protected by API Gateway JWT authorizer

Access tokens are forwarded server-side (/api/generate)

Admin routes require Cognito group admin

##Credits System

Each user starts with a fixed number of credits

Each successful generation consumes 1 credit

Credits are stored per user in DynamoDB

When credits reach zero, generation is blocked (HTTP 402)
