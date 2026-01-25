import NextAuth, { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

function decodeJwtPayload(token: string): any {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + (4 - (normalized.length % 4)) % 4,
      "="
    );

    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: "unused",
      issuer: process.env.COGNITO_ISSUER!,
      client: { token_endpoint_auth_method: "none" },
      checks: ["pkce", "state"],
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) token.accessToken = account.access_token;
      if (account?.id_token) token.idToken = account.id_token;

      const source =
        (account?.id_token as string | undefined) ||
        (token.idToken as string | undefined) ||
        (account?.access_token as string | undefined) ||
        (token.accessToken as string | undefined);

      if (source) {
        const payload = decodeJwtPayload(source);
        token.groups = payload?.["cognito:groups"] ?? [];
      } else {
        token.groups = (token.groups as string[] | undefined) ?? [];
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.idToken = token.idToken as string | undefined;
      session.groups = (token.groups as string[] | undefined) ?? [];
      return session;
    },
  },
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
