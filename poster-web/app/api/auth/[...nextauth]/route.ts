import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

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
      if (account?.id_token) token.idToken = account.id_token;
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore (typed later)
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.idToken = token.idToken;
      return session;
    },
  },
  debug: true,
});

export { handler as GET, handler as POST };
