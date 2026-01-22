import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";


function decodeJwtPayload(token: string): any {
  const payload = token.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(normalized, "base64").toString("utf8");
  return JSON.parse(json);
}


const handler = NextAuth({
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
      if (account?.id_token) {
      token.idToken = account.id_token;

      // Extract Cognito groups from id_token
      const payload = decodeJwtPayload(account.id_token);
      token.groups = payload["cognito:groups"] ?? [];
    }
    return token;
  },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.groups = token.groups ?? [];
      return session;
  },
},

  debug: true,
});

export { handler as GET, handler as POST };
