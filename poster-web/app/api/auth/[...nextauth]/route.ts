import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

const handler = NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      issuer: process.env.COGNITO_ISSUER!,
      clientSecret: "unused", // ✅ only to satisfy types in this NextAuth version

      // ✅ public client: no client secret at /token
      client: { token_endpoint_auth_method: "none" },

      checks: ["pkce", "state"],
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) token.accessToken = account.access_token;
      if (account?.id_token) token.idToken = account.id_token;
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      session.accessToken = token.accessToken as string;
      // @ts-ignore
      session.idToken = token.idToken as string;
      return session;
    },
  },
  debug: true,
});

export { handler as GET, handler as POST };
