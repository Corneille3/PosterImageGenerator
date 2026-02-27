const loginUrl = process.env.NEXT_PUBLIC_COGNITO_LOGIN_URL;

if (!loginUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_COGNITO_LOGIN_URL");
}

export const COGNITO_LOGIN_URL = loginUrl;
