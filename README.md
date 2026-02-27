🎨 AI Poster Generator — Full-Stack Serverless Application


![AWS](https://img.shields.io/badge/AWS-Cloud-orange?logo=amazonaws&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform&logoColor=white)
![Serverless](https://img.shields.io/badge/Serverless-Architecture-red?logo=serverless&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-Lambda-blue?logo=python&logoColor=white)
![DynamoDB](https://img.shields.io/badge/DynamoDB-NoSQL-4053D6?logo=amazondynamodb&logoColor=white)
![S3](https://img.shields.io/badge/S3-Object_Storage-569A31?logo=amazons3&logoColor=white)
![Cognito](https://img.shields.io/badge/Auth-Cognito-FF9900?logo=amazonaws&logoColor=white)

A production-oriented, full-stack AI image generation platform built with Next.js and AWS, featuring secure authentication, credit enforcement, generation history, and serverless scalability.

This project demonstrates end-to-end system design, not just AI integration — from frontend UX to backend enforcement and cloud infrastructure.

------------Features-----------------------

Text-to-Image Generation powered by Amazon Bedrock

Secure Authentication using Amazon Cognito + NextAuth

Credit Enforcement System (atomic, server-side, abuse-safe)

Generation History API with pagination & TTL cleanup

Secure Image Delivery via S3 pre-signed URLs

Serverless & Scalable Architecture

Infrastructure as Code using Terraform

-------Architecture Overview---------------

---High-level flow---:

User submits a prompt via the Next.js frontend

Frontend calls Next.js API routes (/api/generate, /api/history)

Requests are forwarded to AWS API Gateway (HTTP API)

JWT authorizer (Cognito) validates the request

-------------------AWS Lambda (Python):------------------------------

Enforces user credits (DynamoDB)

Calls Amazon Bedrock for image generation

Stores results in Amazon S3

Records history with TTL in DynamoDB

Client receives a pre-signed S3 URL for secure access

All credit enforcement and authorization happen server-side — never in the browser.

-----------------Tech Stack------------------------------------------------
------------------Frontend---------------------------------------

Next.js (App Router)

TypeScript

NextAuth

--------------Backend-------------------------------------------------

AWS Lambda (Python 3.11)

AWS API Gateway (HTTP API)

Amazon Bedrock (Text-to-Image)

-----------Data & Storage--------------------------------------

Amazon DynamoDB

Credits tracking

Generation history (with TTL)

Amazon S3 (generated images)

-------------Auth & Security-------------------------------------

Amazon Cognito (User Pool + JWT)

API Gateway JWT Authorizer

Pre-signed S3 URLs

--------------Infrastructure------------------------------------------

Terraform (IaC)

Fully reproducible environments

------------------- Credit Enforcement (Key Design Detail)-----------------------

Credits are enforced atomically in DynamoDB using conditional updates:

Credits are initialized automatically on first use

Each generation:

Atomically decrements credits

Fails safely if credits = 0

Failed generations trigger best-effort refunds

Prevents:

Race conditions

Client-side tampering

Abuse via concurrent requests

This design mirrors real SaaS billing enforcement patterns.

---------------------------History API--------------------------------------------

GET /api/history

Returns:

Prompt

Status (SUCCESS / FAILED)

Timestamp

Pre-signed image URL (for successful runs)

Supports:

Pagination via cursor

Automatic expiry via DynamoDB TTL

Used by the dashboard UI to display past generations

📂 Project Structure
MoviePosterProject/
├── infra/
│   └── terraform/
│       ├── lambda
│       ├── api-gateway
│       ├── cognito
│       ├── dynamodb
│       └── s3
│
├── poster-web/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/
│   │   │   └── history/
│   │   ├── dashboard/
│   │   └── components/
│   └── auth/
│
└── lambda_function.py

🛠️ Local Development
Prerequisites

Node.js 18+

AWS account

Terraform ≥ 1.5

AWS credentials configured

Frontend
cd poster-web
npm install
npm run dev

Environment Variables (.env.local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

COGNITO_CLIENT_ID=xxxx
COGNITO_DOMAIN=https://xxxx.auth.us-east-2.amazoncognito.com
COGNITO_ISSUER=https://cognito-idp.us-east-2.amazonaws.com/xxxx
NEXT_PUBLIC_COGNITO_LOGIN_URL=https://xxxx.auth.us-east-2.amazoncognito.com/login?response_type=code&client_id=xxxx&redirect_uri=https%3A%2F%2Fkornea-poster-ai.com%2Fapi%2Fauth%2Fcallback%2Fcognito

API_BASE_URL=https://<api-id>.execute-api.us-east-2.amazonaws.com

🧪 Example API Usage
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  "https://<api-id>.execute-api.us-east-2.amazonaws.com/history?limit=5"
