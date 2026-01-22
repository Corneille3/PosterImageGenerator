import NextAuth, { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

function decodeJwtPayload(token: string): any {
  const payload = token.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(normalized, "base64").toString("utf8");
  return JSON.parse(json);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: "unused", // required by NextAuth types (public client)
      issuer: process.env.COGNITO_ISSUER!,

      // Public client: no client authentication at token endpoint
      client: { token_endpoint_auth_method: "none" },
      checks: ["pkce", "state"],
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) token.accessToken = account.access_token;
      if (account?.id_token) token.idToken = account.id_token;

      // Extract Cognito groups from id_token (preferred) or access_token (fallback)
      const idPayload = account?.id_token ? decodeJwtPayload(account.id_token) : null;
      const accessPayload = account?.access_token ? decodeJwtPayload(account.access_token) : null;

      token.groups =
        idPayload?.["cognito:groups"] ??
        accessPayload?.["cognito:groups"] ??
        [];

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.idToken = token.idToken as string | undefined;
      session.groups = (token.groups as string[]) ?? [];
      return session;
    },
  },

  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
