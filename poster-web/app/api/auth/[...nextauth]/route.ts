import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
import { env } from "@/env";

const handler = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  providers: [
    Cognito({
      clientId: env.COGNITO_CLIENT_ID,
      clientSecret: env.COGNITO_CLIENT_SECRET,
      issuer: env.COGNITO_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.idToken = token.idToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
