function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NEXTAUTH_SECRET: required("NEXTAUTH_SECRET"),
  COGNITO_CLIENT_ID: required("COGNITO_CLIENT_ID"),
  COGNITO_CLIENT_SECRET: required("COGNITO_CLIENT_SECRET"),
  COGNITO_ISSUER: required("COGNITO_ISSUER"),
} as const;
